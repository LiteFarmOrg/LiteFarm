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

describe('Product Tests', () => {
  // let middleware;

  function postProductRequest(data, { user_id, farm_id }, callback) {
    chai
      .request(server)
      .post(`/product`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function getRequest({ user_id, farm_id }, callback) {
    chai
      .request(server)
      .get(`/product/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
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
    const [product] = await mocks.productFactory(
      {
        promisedFarm: [mainFarm],
      },
      properties,
    );
    return product;
  }

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Get products ', () => {
    let userFarmToTest;
    beforeEach(async () => {
      await knex('product').del();
      [userFarmToTest] = await mocks.userFarmFactory({}, fakeUserFarm());
    });

    test('Should get products on my farm', async (done) => {
      await Promise.all(
        [...Array(10)].map(() =>
          mocks.productFactory({ promisedFarm: [{ farm_id: userFarmToTest.farm_id }] }),
        ),
      );
      getRequest(
        { user_id: userFarmToTest.user_id, farm_id: userFarmToTest.farm_id },
        (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(10);
          done();
        },
      );
    });

    test('Should get products on my farm but not default products', async (done) => {
      await Promise.all(
        [...Array(10)].map(() =>
          mocks.productFactory({ promisedFarm: [{ farm_id: userFarmToTest.farm_id }] }),
        ),
      );
      await Promise.all(
        [...Array(10)].map(() => mocks.productFactory({ promisedFarm: [{ farm_id: null }] })),
      );
      getRequest(
        { user_id: userFarmToTest.user_id, farm_id: userFarmToTest.farm_id },
        (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(10);
          done();
        },
      );
    });

    test('should get products on my farm, but not my other farms or defaults', async (done) => {
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
      getRequest(
        { user_id: userFarmToTest.user_id, farm_id: userFarmToTest.farm_id },
        (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(10);
          const ids = res.body.map(({ product_id }) => product_id);
          expect(otherFarmProducts.some(({ product_id }) => ids.includes(product_id))).toBe(false);
          done();
        },
      );
    });
  });

  describe('Post product', () => {
    let prod;

    beforeEach(async () => {
      prod = mocks.fakeProduct();
    });

    test('should return 403 status if headers.farm_id is set to null', async (done) => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());
      postProductRequest(prod, { user_id: userFarm.user_id, farm_id: null }, (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

    test('should successfully create a product with minimal data', async (done) => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());
      prod.farm_id = userFarm.farm_id;
      postProductRequest(prod, userFarm, (err, res) => {
        expect(res.status).toBe(201);
        done();
      });
    });

    test('All users should be able to post and get a product', async (done) => {
      const allUserRoles = [1, 2, 3, 5];
      for (const role of allUserRoles) {
        const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm(role));
        prod.farm_id = userFarm.farm_id;
        postProductRequest(prod, userFarm, async (err, res) => {
          expect(res.status).toBe(201);
          const productsSaved = await productModel
            .query()
            .context({ showHidden: true })
            .where('farm_id', userFarm.farm_id);
          expect(productsSaved.length).toBe(1);
          done();
        });
      }
    });

    test('should return 400 if n, p, or k value is provided without npk_unit', async (done) => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());

      const npkProduct = mocks.fakeProduct({ farm_id: userFarm.farm_id, n: 70, p: 30, k: 30 });

      postProductRequest(npkProduct, userFarm, (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('should return 400 if npk_unit is percent and n + p + k > 100', async (done) => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());

      const npkProduct = mocks.fakeProduct({
        farm_id: userFarm.farm_id,
        n: 70,
        p: 30,
        k: 20,
        npk_unit: 'percent',
      });

      postProductRequest(npkProduct, userFarm, (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('should return 409 conflict if a product is created with the same name as an existing product', async (done) => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());

      const fertilizerProductA = mocks.fakeProduct({
        name: 'Fertilizer Product A',
        type: 'soil_amendment_task',
      });

      await createProductInDatabase(userFarm, fertilizerProductA);

      postProductRequest(fertilizerProductA, userFarm, (err, res) => {
        expect(res.status).toBe(409);
        done();
      });
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

    test('should return 400 if n, p, or k value is patched without npk_unit', async () => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());

      const origProduct = await createProductInDatabase(userFarm);

      const res = await patchRequest(
        {
          n: 70,
          p: 30,
          k: 30,
        },
        origProduct.product_id,
        userFarm,
      );
      expect(res.status).toBe(400);
    });

    test('should return 400 if patched npk_unit is percent and patched n + p + k > 100', async () => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());

      const origProduct = await createProductInDatabase(userFarm);

      const res = await patchRequest(
        {
          n: 70,
          p: 30,
          k: 30,
          npk_unit: 'percent',
        },
        origProduct.product_id,
        userFarm,
      );
      expect(res.status).toBe(400);
    });

    test('should return 409 conflict if a product is patched to a name that conflicts with an existing product', async () => {
      const [userFarm] = await mocks.userFarmFactory({}, fakeUserFarm());

      const fertilizerProductA = mocks.fakeProduct({
        name: 'Fertilizer Product A',
        type: 'soil_amendment_task',
      });

      await createProductInDatabase(userFarm, fertilizerProductA);

      const fertilizerProductB = mocks.fakeProduct({
        name: 'Fertilizer Product B',
        type: 'soil_amendment_task',
      });

      const origProduct = await createProductInDatabase(userFarm, fertilizerProductB);

      const res = await patchRequest(
        {
          name: 'Fertilizer Product A',
        },
        origProduct.product_id,
        userFarm,
      );
      expect(res.status).toBe(409);
    });
  });
});
