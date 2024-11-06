/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (product.test.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import chai from 'chai';

import chaiHttp from 'chai-http';
import moment from 'moment';
chai.use(chaiHttp);
import server from './../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';
import productModel from '../src/models/productModel.js';
import soilAmendmentProductModel from '../src/models/soilAmendmentProductModel.js';

describe('Product Tests', () => {
  // let middleware;

  function postProductRequest(data, { user_id, farm_id }) {
    return chai
      .request(server)
      .post(`/product`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function getRequest({ user_id, farm_id }) {
    return chai
      .request(server)
      .get(`/product/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  async function patchRequest(data, product_id, { user_id, farm_id }) {
    return await chai
      .request(server)
      .patch(`/product/${product_id}`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  async function createProductInDatabase(mainFarm, properties) {
    if (properties?.type === 'soil_amendment_task') {
      const [product] = await mocks.productFactory(
        {
          promisedFarm: [mainFarm],
        },
        properties,
      );
      const [soilAmendmentProduct] = await mocks.soil_amendment_productFactory({
        promisedProduct: [product],
      });
      return soilAmendmentProduct;
    } else {
      const [product] = await mocks.productFactory(
        {
          promisedFarm: [mainFarm],
        },
        properties,
      );
      return product;
    }
  }

  afterAll(async () => {
    await tableCleanup(knex);
  });

  describe('Get products ', () => {
    let userFarmToTest;
    beforeEach(async () => {
      await knex('product').del();
      [userFarmToTest] = await mocks.userFarmFactory({}, fakeUserFarm());
    });

    test('Should get products on my farm', async () => {
      await Promise.all(
        [...Array(10)].map(() =>
          mocks.productFactory({ promisedFarm: [{ farm_id: userFarmToTest.farm_id }] }),
        ),
      );
      const res = await getRequest({
        user_id: userFarmToTest.user_id,
        farm_id: userFarmToTest.farm_id,
      });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(10);
    });

    test('Should get products on my farm but not default products', async () => {
      await Promise.all(
        [...Array(10)].map(() =>
          mocks.productFactory({ promisedFarm: [{ farm_id: userFarmToTest.farm_id }] }),
        ),
      );
      await Promise.all(
        [...Array(10)].map(() => mocks.productFactory({ promisedFarm: [{ farm_id: null }] })),
      );
      const res = await getRequest({
        user_id: userFarmToTest.user_id,
        farm_id: userFarmToTest.farm_id,
      });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(10);
    });

    test('should get products on my farm, but not my other farms or defaults', async () => {
      const [otherUserFarm] = await mocks.userFarmFactory({
        promisedUser: [{ user_id: userFarmToTest.user_id }],
      });
      await Promise.all(
        [...Array(10)].map(() =>
          mocks.productFactory({ promisedFarm: [{ farm_id: userFarmToTest.farm_id }] }),
        ),
      );
      await Promise.all(
        [...Array(10)].map(() => mocks.productFactory({ promisedFarm: [{ farm_id: null }] })),
      );
      const otherFarmProducts = await Promise.all(
        [...Array(10)].map(() =>
          mocks.productFactory({ promisedFarm: [{ farm_id: otherUserFarm.farm_id }] }),
        ),
      );
      const res = await getRequest({
        user_id: userFarmToTest.user_id,
        farm_id: userFarmToTest.farm_id,
      });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(10);
      const ids = res.body.map(({ product_id }) => product_id);
      expect(otherFarmProducts.some(({ product_id }) => ids.includes(product_id))).toBe(false);
    });
  });

  describe('Post product', () => {
    let prod;

    beforeEach(async () => {
      prod = mocks.fakeProduct();
    });

    test('should return 403 status if headers.farm_id is set to null', async () => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());
      const res = await postProductRequest(prod, { user_id: userFarm.user_id, farm_id: null });
      expect(res.status).toBe(403);
    });

    test('should successfully create a product with minimal data', async () => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());
      prod.farm_id = userFarm.farm_id;
      const res = await postProductRequest(prod, userFarm);
      expect(res.status).toBe(201);
    });

    test('All users should be able to post and get a product', async () => {
      const allUserRoles = [1, 2, 3, 5];
      for (const role of allUserRoles) {
        const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm(role));
        prod.farm_id = userFarm.farm_id;
        const res = await postProductRequest(prod, userFarm);
        expect(res.status).toBe(201);
        const productsSaved = await productModel
          .query()
          .context({ showHidden: true })
          .where('farm_id', userFarm.farm_id);
        expect(productsSaved.length).toBe(1);
      }
    });

    test('should return 400 if elemental value is provided without elemental_unit', async () => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());

      const npkProduct = mocks.fakeProduct({
        farm_id: userFarm.farm_id,
        soil_amendment_product: {
          n: 70,
          p: 30,
          k: 20,
        },
      });

      const res = await postProductRequest(npkProduct, userFarm);
      expect(res.status).toBe(400);
    });

    test('should return 400 if elemental_unit is percent and n + p + k > 100', async () => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());

      const npkProduct = mocks.fakeProduct({
        farm_id: userFarm.farm_id,
        soil_amendment_product: {
          n: 70,
          p: 30,
          k: 20,
          elemental_unit: 'percent',
        },
      });

      const res = await postProductRequest(npkProduct, userFarm);
      expect(res.status).toBe(400);
    });

    test('should return 409 conflict if a product is created with the same name as an existing product', async () => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());

      const fertiliserProductA = mocks.fakeProduct({
        name: 'Fertiliser Product A',
        type: 'soil_amendment_task',
      });

      const soilAmendmentProductDetails = {
        soil_amendment_product: mocks.fakeProductDetails('soil_amendment_task'),
      };

      await createProductInDatabase(userFarm, fertiliserProductA);

      const res = await postProductRequest(
        { ...fertiliserProductA, ...soilAmendmentProductDetails },
        userFarm,
      );
      expect(res.status).toBe(409);
    });

    test('should successfully populate soil_amendment_product table', async () => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());

      const soilAmendmentProduct = mocks.fakeProduct({
        farm_id: userFarm.farm_id,
        type: 'soil_amendment_task',
        soil_amendment_product: {
          n: 1,
          p: 2,
          k: 1,
          elemental_unit: 'ratio',
        },
      });

      const res = await postProductRequest(soilAmendmentProduct, userFarm);
      expect(res.status).toBe(201);

      const [productRecord] = await productModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', userFarm.farm_id);

      const [soilAmendmentProductRecord] = await soilAmendmentProductModel
        .query()
        .where({ product_id: productRecord.product_id });

      expect(soilAmendmentProductRecord.n).toBe(1);
      expect(soilAmendmentProductRecord.p).toBe(2);
      expect(soilAmendmentProductRecord.k).toBe(1);
      expect(soilAmendmentProductRecord.elemental_unit).toBe('ratio');
    });
  });

  describe('Update product', () => {
    test('All users should be able to patch product', async () => {
      const allUserRoles = [1, 2, 3, 5];

      for (const role of allUserRoles) {
        const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm(role));

        const origProduct = await createProductInDatabase(userFarm);

        const res = await patchRequest(
          {
            supplier: 'UBC Botanical Garden',
          },
          origProduct.product_id,
          userFarm,
        );

        expect(res.status).toBe(204);

        const [updatedProduct] = await productModel
          .query()
          .where({ product_id: origProduct.product_id });

        expect(updatedProduct.supplier).toBe('UBC Botanical Garden');
      }
    });

    test('should return 400 if n, p, or k value is patched without elemental_unit', async () => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());

      const origProduct = await createProductInDatabase(userFarm);

      const res = await patchRequest(
        {
          soil_amendment_product: {
            n: 70,
            p: 30,
            k: 30,
          },
        },
        origProduct.product_id,
        userFarm,
      );
      expect(res.status).toBe(400);
    });

    test('should return 400 if patched elemental_unit is percent and patched n + p + k > 100', async () => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());

      const origProduct = await createProductInDatabase(userFarm);

      const res = await patchRequest(
        {
          soil_amendment_product: {
            n: 70,
            p: 30,
            k: 30,
            elemental_unit: 'percent',
          },
        },
        origProduct.product_id,
        userFarm,
      );
      expect(res.status).toBe(400);
    });

    test('should return 409 conflict if a product is patched to a name that conflicts with an existing product', async () => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());

      const fertiliserProductA = mocks.fakeProduct({
        name: 'Fertiliser Product A',
        type: 'soil_amendment_task',
      });

      await createProductInDatabase(userFarm, fertiliserProductA);

      const soilAmendmentProductDetailsA = {
        soil_amendment_product: mocks.fakeProductDetails('soil_amendment_task'),
      };

      const fertiliserProductB = mocks.fakeProduct({
        name: 'Fertiliser Product B',
        type: 'soil_amendment_task',
      });

      const soilAmendmentProductDetailsB = {
        soil_amendment_product: mocks.fakeProductDetails('soil_amendment_task'),
      };

      const origProduct = await createProductInDatabase(userFarm, fertiliserProductB);

      const res = await patchRequest(
        {
          name: 'Fertiliser Product A',
        },
        origProduct.product_id,
        userFarm,
      );
      expect(res.status).toBe(409);
    });

    test('should successfully patch soil_amendment_product table values', async () => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());

      const fertiliserProduct = mocks.fakeProduct({
        name: 'Fertiliser Product',
        type: 'soil_amendment_task',
      });

      // Note: this is a direct knex insert (not via model) so creating a record in the soil_amendment_product table cannot be done like this
      const origProduct = await createProductInDatabase(userFarm, fertiliserProduct);

      const res = await patchRequest(
        {
          soil_amendment_product: {
            ammonium: 78,
            nitrate: 112,
            molecular_compounds_unit: 'ppm',
          },
        },
        origProduct.product_id,
        userFarm,
      );

      expect(res.status).toBe(204);

      const [updatedSoilAmendmentProduct] = await soilAmendmentProductModel
        .query()
        .where({ product_id: origProduct.product_id });

      expect(updatedSoilAmendmentProduct.ammonium).toBe(78);
      expect(updatedSoilAmendmentProduct.nitrate).toBe(112);
      expect(updatedSoilAmendmentProduct.molecular_compounds_unit).toBe('ppm');
    });
  });
});
