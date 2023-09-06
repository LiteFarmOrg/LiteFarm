/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (farm.test.js) is part of LiteFarm.
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
import saleModel from '../src/models/saleModel.js';
import cropVarietySaleModel from '../src/models/cropVarietySaleModel.js';
import generalSaleModel from '../src/models/generalSaleModel.js';

describe('Sale Tests', () => {
  let token;
  let owner;
  let farm;
  let ownerFarm;
  let crop;
  let cropVariety;

  beforeAll(() => {
    token = global.token;
  });

  function postSaleRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .post(`/sale`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function getRequest(
    { user_id = owner.user_id, farm_id = farm.farm_id, farm_id_in_params = farm.farm_id },
    callback,
  ) {
    chai
      .request(server)
      .get(`/sale/${farm_id_in_params}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function deleteRequest({ user_id = owner.user_id, farm_id = farm.farm_id, sale_id }, callback) {
    chai
      .request(server)
      .delete(`/sale/${sale_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function patchRequest(
    data,
    sale_id,
    { user_id = owner.user_id, farm_id = farm.farm_id },
    callback,
  ) {
    chai
      .request(server)
      .patch(`/sale/${sale_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [ownerFarm] = await mocks.userFarmFactory(
      {
        promisedUser: [owner],
        promisedFarm: [farm],
      },
      fakeUserFarm(1),
    );
    [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
    [cropVariety] = await mocks.crop_varietyFactory({ promisedFarm: [farm], promisedCrop: [crop] });
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Get && delete sale', () => {
    let sale;
    let crop1;
    let cropVariety1;
    beforeEach(async () => {
      [sale] = await mocks.saleFactory({ promisedUserFarm: [ownerFarm] });
      let [cropSale] = await mocks.crop_variety_saleFactory({
        promisedCropVariety: [cropVariety],
        promisedSale: [sale],
      });
      [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
      [cropVariety1] = await mocks.crop_varietyFactory({
        promisedFarm: [farm],
        promisedCrop: [crop1],
      });
      [cropSale] = await mocks.crop_variety_saleFactory({
        promisedCropVariety: [cropVariety1],
        promisedSale: [sale],
      });
    });

    test('Should filter out deleted sale', async (done) => {
      await saleModel.query().context(owner).findById(sale.sale_id).delete();
      getRequest({ user_id: owner.user_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
        done();
      });
    });

    describe('Get sale authorization tests', () => {
      let newWorker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async () => {
        [newWorker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [newWorker],
            promisedFarm: [farm],
          },
          fakeUserFarm(3),
        );
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [manager],
            promisedFarm: [farm],
          },
          fakeUserFarm(2),
        );

        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
          {
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser],
          },
          fakeUserFarm(1),
        );
      });

      test('Owner should get sale by farm id', async (done) => {
        getRequest({ user_id: owner.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].sale_id).toBe(sale.sale_id);
          expect(res.body[0].crop_variety_sale.length).toBe(2);
          expect(res.body[0].crop_variety_sale[1].crop_variety_id).toBe(
            cropVariety1.crop_variety_id,
          );
          done();
        });
      });

      test('Manager should get sale by farm id', async (done) => {
        getRequest({ user_id: manager.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].sale_id).toBe(sale.sale_id);
          expect(res.body[0].crop_variety_sale.length).toBe(2);
          expect(res.body[0].crop_variety_sale[1].crop_variety_id).toBe(
            cropVariety1.crop_variety_id,
          );
          done();
        });
      });

      test('Worker should get sale by farm id', async (done) => {
        getRequest({ user_id: newWorker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].sale_id).toBe(sale.sale_id);
          expect(res.body[0].crop_variety_sale.length).toBe(2);
          expect(res.body[0].crop_variety_sale[1].crop_variety_id).toBe(
            cropVariety1.crop_variety_id,
          );
          done();
        });
      });

      test('Should get status 403 if an unauthorizedUser tries to get sale by farm id', async (done) => {
        getRequest({ user_id: unAuthorizedUser.user_id }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Circumvent authorization by modifying farm_id', async (done) => {
        getRequest(
          {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
            farm_id_in_params: farm.farm_id,
          },
          (err, res) => {
            expect(res.status).toBe(403);
            done();
          },
        );
      });
    });

    describe('Delete sale', function () {
      describe('Delete sale authorization tests', () => {
        let newWorker;
        let workerFarm;
        let manager;
        let managerFarm;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
          [newWorker] = await mocks.usersFactory();
          [workerFarm] = await mocks.userFarmFactory(
            {
              promisedUser: [newWorker],
              promisedFarm: [farm],
            },
            fakeUserFarm(3),
          );
          [manager] = await mocks.usersFactory();
          [managerFarm] = await mocks.userFarmFactory(
            {
              promisedUser: [manager],
              promisedFarm: [farm],
            },
            fakeUserFarm(2),
          );

          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
            {
              promisedUser: [unAuthorizedUser],
              promisedFarm: [farmunAuthorizedUser],
            },
            fakeUserFarm(1),
          );
        });

        test('Owner should delete a sale', async (done) => {
          deleteRequest({ sale_id: sale.sale_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const saleRes = await saleModel
              .query()
              .context({ showHidden: true })
              .where('sale_id', sale.sale_id);
            expect(saleRes.length).toBe(1);
            expect(saleRes[0].deleted).toBe(true);
            // const saleRes = await saleModel.query().whereNotDeleted().where('sale_id', sale.sale_id);
            // expect(saleRes.length).toBe(0);
            done();
          });
        });

        test('Manager should delete a sale', async (done) => {
          deleteRequest({ user_id: manager.user_id, sale_id: sale.sale_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const saleRes = await saleModel
              .query()
              .context({ showHidden: true })
              .where('sale_id', sale.sale_id);
            expect(saleRes.length).toBe(1);
            expect(saleRes[0].deleted).toBe(true);
            done();
          });
        });

        test('Worker should delete their own sale', async (done) => {
          let [workersSale] = await mocks.saleFactory({ promisedUserFarm: [workerFarm] });
          let [workersCropVarietySale] = await mocks.crop_variety_saleFactory({
            promisedVarietyCrop: [cropVariety],
            promisedSale: [workersSale],
          });
          deleteRequest(
            { user_id: newWorker.user_id, sale_id: workersSale.sale_id },
            async (err, res) => {
              expect(res.status).toBe(200);
              const saleRes = await saleModel
                .query()
                .context({ showHidden: true })
                .where('sale_id', workersSale.sale_id);
              expect(saleRes.length).toBe(1);
              expect(saleRes[0].deleted).toBe(true);
              // const saleRes = await saleModel.query().whereNotDeleted().where('sale_id', sale.sale_id);
              // expect(saleRes.length).toBe(0);
              done();
            },
          );
        });

        test('should return 403 if an unauthorized user tries to delete a sale', async (done) => {
          deleteRequest(
            {
              user_id: unAuthorizedUser.user_id,
              sale_id: sale.sale_id,
            },
            async (err, res) => {
              expect(res.status).toBe(403);
              done();
            },
          );
        });

        test('should return 403 if a worker tries to delete a sale', async (done) => {
          deleteRequest({ user_id: newWorker.user_id, sale_id: sale.sale_id }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          deleteRequest(
            {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              sale_id: sale.sale_id,
            },
            async (err, res) => {
              expect(res.status).toBe(403);
              done();
            },
          );
        });
      });
    });
  });

  describe.only('Post sale', () => {
    let sampleReqBody;
    let crop2;
    let cropVariety2;
    let someoneElsecrop;
    let someoneElseVariety;
    beforeEach(async () => {
      [crop2] = await mocks.cropFactory({ promisedFarm: [farm] });
      [cropVariety2] = await mocks.crop_varietyFactory({ promisedCrop: [crop2] });
      [someoneElsecrop] = await mocks.cropFactory();
      [someoneElseVariety] = await mocks.crop_varietyFactory({ promisedCrop: [someoneElsecrop] });
      sampleReqBody = {
        ...mocks.fakeSale(),
        farm_id: farm.farm_id,
        crop_variety_sale: [
          {
            ...mocks.fakeCropVarietySale(),
            crop_variety_id: cropVariety.crop_variety_id,
          },
          {
            ...mocks.fakeCropVarietySale(),
            crop_variety_id: cropVariety2.crop_variety_id,
          },
        ],
        revenue_type_id: 1,
      };
    });

    test('Should return 400 if crop_variety_sale is undefined without general_type', async (done) => {
      sampleReqBody.crop_variety_sale = undefined;
      postSaleRequest(sampleReqBody, {}, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('Should return 400 if crop_variety_sale is empty[] without general_type', async (done) => {
      sampleReqBody.crop_variety_sale = [];
      postSaleRequest(sampleReqBody, {}, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('Should return 400 if crop_variety_sale is empty[{}] without general_type', async (done) => {
      sampleReqBody.crop_variety_sale = [{}];
      postSaleRequest(sampleReqBody, {}, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('Should return 400 if crop_variety_id is invalid', async (done) => {
      sampleReqBody.crop_variety_sale[0].crop_variety_id = 9999999;
      postSaleRequest(sampleReqBody, {}, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    // TODO: Edge case.
    // test('Should return 403 if crop_id references a crop that the user does not have access to', async (done) => {
    //   sampleReqBody.cropSale[0].crop_id = someoneElsecrop.crop_id;
    //   postSaleRequest(sampleReqBody, {}, async (err, res) => {
    //     expect(res.status).toBe(403);
    //     done();
    //   })
    // });

    test('Should return 400 if body.crop_variety_sale[i].crop exist', async (done) => {
      delete sampleReqBody.crop_variety_sale[0].crop_variety_id;
      sampleReqBody.crop_variety_sale[0].crop_variety = {
        ...mocks.fakeCropVariety(),
        farm_id: farm.farm_id,
      };
      // Should not allow upsertGraph to post new farm/crop/managementPlan through post sale request
      postSaleRequest(sampleReqBody, {}, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    describe('Post sale authorization tests', () => {
      let worker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async () => {
        [worker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [worker],
            promisedFarm: [farm],
          },
          fakeUserFarm(3),
        );
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [manager],
            promisedFarm: [farm],
          },
          fakeUserFarm(2),
        );

        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
          {
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser],
          },
          fakeUserFarm(1),
        );
      });

      test('Owner should post and get a valid crop', async (done) => {
        postSaleRequest(sampleReqBody, {}, async (err, res) => {
          expect(res.status).toBe(201);
          const sales = await saleModel.query().where('farm_id', farm.farm_id);
          expect(sales.length).toBe(1);
          expect(sales[0].customer_name).toBe(sampleReqBody.customer_name);
          const cropVarietySales = await cropVarietySaleModel
            .query()
            .where('sale_id', sales[0].sale_id);
          expect(cropVarietySales.length).toBe(2);
          expect(cropVarietySales[1].crop_variety_id).toBe(
            sampleReqBody.crop_variety_sale[1].crop_variety_id,
          );
          done();
        });
      });

      test('Manager should post and get a valid crop', async (done) => {
        postSaleRequest(sampleReqBody, { user_id: manager.user_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const sales = await saleModel.query().where('farm_id', farm.farm_id);
          expect(sales.length).toBe(1);
          expect(sales[0].customer_name).toBe(sampleReqBody.customer_name);
          const cropVarietySales = await cropVarietySaleModel
            .query()
            .where('sale_id', sales[0].sale_id);
          expect(cropVarietySales.length).toBe(2);
          expect(cropVarietySales[1].crop_variety_id).toBe(
            sampleReqBody.crop_variety_sale[1].crop_variety_id,
          );
          done();
        });
      });

      test('Worker should post and get a valid crop', async (done) => {
        postSaleRequest(sampleReqBody, { user_id: worker.user_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const sales = await saleModel.query().where('farm_id', farm.farm_id);
          expect(sales.length).toBe(1);
          expect(sales[0].customer_name).toBe(sampleReqBody.customer_name);
          const cropVarietySales = await cropVarietySaleModel
            .query()
            .where('sale_id', sales[0].sale_id);
          expect(cropVarietySales.length).toBe(2);
          expect(cropVarietySales[1].crop_variety_id).toBe(
            sampleReqBody.crop_variety_sale[1].crop_variety_id,
          );
          done();
        });
      });

      const testGeneralSale = (done, userId) => {
        delete sampleReqBody.crop_variety_sale;
        sampleReqBody.general_sale = { sale_value: 50.5, notes: 'notes' };

        postSaleRequest(sampleReqBody, { user_id: userId }, async (err, res) => {
          expect(res.status).toBe(201);
          const sales = await saleModel.query().where('farm_id', farm.farm_id);
          expect(sales.length).toBe(1);
          expect(sales[0].customer_name).toBe(sampleReqBody.customer_name);
          const generalSale = await generalSaleModel.query().where('sale_id', sales[0].sale_id);
          expect(generalSale.length).toBe(1);
          expect(generalSale[0].sale_value).toBe(sampleReqBody.general_sale.sale_value);
          expect(generalSale[0].notes).toBe(sampleReqBody.general_sale.notes);
          done();
        });
      };

      test(`Owner should post and get a general sale`, async (done) => {
        testGeneralSale(done, owner.userId);
      });

      test(`Manager should post and get a general sale`, async (done) => {
        testGeneralSale(done, manager.userId);
      });

      test(`Worker should post and get a general sale`, async (done) => {
        testGeneralSale(done, worker.userId);
      });

      test('should return 403 status if sale is posted by unauthorized user', async (done) => {
        postSaleRequest(sampleReqBody, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe('User does not have the following permission(s): add:sales');
          done();
        });
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        postSaleRequest(
          sampleReqBody,
          {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          },
          async (err, res) => {
            expect(res.status).toBe(403);
            done();
          },
        );
      });
    });
  });

  describe('Patch sale', () => {
    let patchData;
    let sale;
    let cropVariety2;
    let cropVarietySale1;
    let cropVarietySale2;
    let newCrop;
    let newCropVariety;

    beforeEach(async () => {
      [sale] = await mocks.saleFactory({ promisedUserFarm: [ownerFarm] });
      [cropVariety2] = await mocks.crop_varietyFactory({ promisedCrop: [crop] });
      [cropVarietySale1] = await mocks.crop_variety_saleFactory({
        promisedCropVariety: [cropVariety],
        promisedSale: [sale],
      });
      [cropVarietySale2] = await mocks.crop_variety_saleFactory({
        promisedCropVariety: [cropVariety2],
        promisedSale: [sale],
      });
      [newCrop] = await mocks.cropFactory({ promisedFarm: [farm], createdUser: [owner] });
      [newCropVariety] = await mocks.crop_varietyFactory({ promisedCrop: [newCrop] });

      patchData = {
        customer_name: 'patched customer name',
        // sale_date: Date.now().toString(),
        crop_variety_sale: [
          {
            crop_variety_id: cropVariety.crop_variety_id,
            quantity: cropVarietySale1.quantity + 5,
            quantity_unit: 'lb',
            sale_value: cropVarietySale1.sale_value + 5,
          },
          {
            crop_variety_id: cropVariety2.crop_variety_id,
            quantity: cropVarietySale1.quantity + 5,
            quantity_unit: 'lb',
            sale_value: cropVarietySale1.sale_value + 5,
          },
          {
            crop_variety_id: newCropVariety.crop_variety_id,
            quantity: 777,
            quantity_unit: 'lb',
            sale_value: 7777,
          },
        ],
      };
    });

    test('Should return 400 if more than one crop_variety_sale with duplicate sale_id and crop_variety_id pair (pkey violation)', async (done) => {
      patchData.crop_variety_sale = [
        {
          crop_variety_id: cropVariety2.crop_variety_id,
          quantity: cropVarietySale1.quantity + 5,
          quantity_unit: cropVarietySale1.quantity_unit,
          sale_value: cropVarietySale1.sale_value + 5,
        },
        {
          crop_variety_id: cropVariety2.crop_variety_id,
          quantity: cropVarietySale1.quantity + 5,
          quantity_unit: cropVarietySale1.quantity_unit,
          sale_value: cropVarietySale1.sale_value + 5,
        },
      ];
      patchRequest(patchData, sale.sale_id, {}, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('Should return 400 if there are no crop variety sales in patch data', async (done) => {
      patchData.crop_variety_sale = [];
      patchRequest(patchData, sale.sale_id, {}, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    describe('Patch sale authorization tests', () => {
      let worker;
      let workerFarm;
      let manager;
      let managerFarm;
      let unauthorizedUser;
      let otherFarm;
      let unauthorizedUserFarm;

      beforeEach(async () => {
        [worker] = await mocks.usersFactory();
        [workerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [worker],
            promisedFarm: [farm],
          },
          fakeUserFarm(3),
        );
        [manager] = await mocks.usersFactory();
        [managerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [manager],
            promisedFarm: [farm],
          },
          fakeUserFarm(2),
        );

        [unauthorizedUser] = await mocks.usersFactory();
        [otherFarm] = await mocks.farmFactory();
        [unauthorizedUserFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [unauthorizedUser],
            promisedFarm: [otherFarm],
          },
          fakeUserFarm(1),
        );
      });

      test('Owner should patch a sale', async (done) => {
        patchRequest(patchData, sale.sale_id, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const saleRes = await saleModel.query().where('sale_id', sale.sale_id).first();
          expect(saleRes.customer_name).toBe(patchData.customer_name);

          const cropVarietySaleRes = await cropVarietySaleModel
            .query()
            .where('sale_id', sale.sale_id);
          expect(cropVarietySaleRes.length).toBe(patchData.crop_variety_sale.length);
          for (var i = 0; i < cropVarietySaleRes.length; i++) {
            expect(cropVarietySaleRes[i].quantity).toBe(patchData.crop_variety_sale[i].quantity);
            expect(cropVarietySaleRes[i].sale_value).toBe(
              patchData.crop_variety_sale[i].sale_value,
            );
          }
          done();
        });
      });

      test('Manager should patch a sale', async (done) => {
        patchRequest(patchData, sale.sale_id, { user_id: manager.user_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const saleRes = await saleModel.query().where('sale_id', sale.sale_id).first();
          expect(saleRes.customer_name).toBe(patchData.customer_name);

          const cropVarietySaleRes = await cropVarietySaleModel
            .query()
            .where('sale_id', sale.sale_id);
          expect(cropVarietySaleRes.length).toBe(patchData.crop_variety_sale.length);
          for (var i = 0; i < cropVarietySaleRes.length; i++) {
            expect(cropVarietySaleRes[i].quantity).toBe(patchData.crop_variety_sale[i].quantity);
            expect(cropVarietySaleRes[i].sale_value).toBe(
              patchData.crop_variety_sale[i].sale_value,
            );
          }
          done();
        });
      });

      test('Worker should patch a sale that they created', async (done) => {
        let [workersSale] = await mocks.saleFactory({ promisedUserFarm: [workerFarm] });
        let [workersCropVarietySale] = await mocks.crop_variety_saleFactory({
          promisedCropVariety: [cropVariety],
          promisedSale: [workersSale],
        });

        patchRequest(
          patchData,
          workersSale.sale_id,
          { user_id: worker.user_id },
          async (err, res) => {
            expect(res.status).toBe(200);
            const saleRes = await saleModel.query().where('sale_id', workersSale.sale_id).first();
            expect(saleRes.customer_name).toBe(patchData.customer_name);

            const cropVarietySaleRes = await cropVarietySaleModel
              .query()
              .where('sale_id', workersSale.sale_id);
            expect(cropVarietySaleRes.length).toBe(patchData.crop_variety_sale.length);
            for (var i = 0; i < cropVarietySaleRes.length; i++) {
              expect(cropVarietySaleRes[i].quantity).toBe(patchData.crop_variety_sale[i].quantity);
              expect(cropVarietySaleRes[i].sale_value).toBe(
                patchData.crop_variety_sale[i].sale_value,
              );
            }
            done();
          },
        );
      });

      test("Should return 403 if worker tries to patch another member's sale", async (done) => {
        patchRequest(patchData, sale.sale_id, { user_id: worker.user_id }, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Should return 403 if unauthorized user tries to patch sale', async (done) => {
        patchRequest(
          patchData,
          sale.sale_id,
          { user_id: unauthorizedUser.user_id },
          async (err, res) => {
            expect(res.status).toBe(403);
            done();
          },
        );
      });
    });
  });
});
