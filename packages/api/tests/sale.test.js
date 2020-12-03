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


const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require('./../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment')
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks = require('./mock.factories');


const saleModel = require('../src/models/saleModel');
const cropSaleModel = require('../src/models/cropSaleModel');

describe('Sale Tests', () => {
  let middleware;
  let owner;
  let farm;
  let crop;
  let field;
  let fieldCrop;

  beforeAll(() => {
    token = global.token;
  });

  afterAll((done) => {
    server.close(() =>{
      done();
    });
  })

  function postSaleRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).post(`/sale`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getRequest({ user_id = owner.user_id, farm_id = farm.farm_id, farm_id_in_params = farm.farm_id }, callback) {
    chai.request(server).get(`/sale/${farm_id_in_params}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function deleteRequest({ user_id = owner.user_id, farm_id = farm.farm_id, sale_id }, callback) {
    chai.request(server).delete(`/sale/${sale_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({
      promisedUser: [owner],
      promisedFarm: [farm],
    }, fakeUserFarm(1));
    [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
    let [weatherStation] = await mocks.weather_stationFactory();
    [field] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
    [fieldCrop] = await mocks.fieldCropFactory({ promisedCrop: [crop], promisedField: [field] });

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next()
    });
  })

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Get && delete sale', () => {
    let sale;
    let crop1;
    beforeEach(async () => {
      [sale] = await mocks.saleFactory({ promisedFarm: [farm] });
      [cropSale] = await mocks.cropSaleFactory({ promisedFieldCrop: [fieldCrop], promisedSale: [sale] });
      [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
      [fieldCrop1] = await mocks.fieldCropFactory({ promisedCrop: [crop1], promisedField: [field] });
      [cropSale] = await mocks.cropSaleFactory({ promisedFieldCrop: [fieldCrop1], promisedSale: [sale] });
    })

    test('Should filter out deleted sale', async (done) => {
      await saleModel.query().findById(sale.sale_id).delete();
      getRequest({ user_id: owner.user_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
        done();
      });
    })

    describe('Get sale authorization tests', () => {
      let newWorker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async () => {
        [newWorker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory({
          promisedUser: [newWorker],
          promisedFarm: [farm],
        }, fakeUserFarm(3));
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory({
          promisedUser: [manager],
          promisedFarm: [farm],
        }, fakeUserFarm(2));


        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
          promisedUser: [unAuthorizedUser],
          promisedFarm: [farmunAuthorizedUser],
        }, fakeUserFarm(1));
      })

      test('Owner should get sale by farm id', async (done) => {
        getRequest({ user_id: owner.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].sale_id).toBe(sale.sale_id);
          expect(res.body[0].cropSale.length).toBe(2);
          expect(res.body[0].cropSale[1].crop_id).toBe(crop1.crop_id);
          done();
        });
      })

      test('Manager should get sale by farm id', async (done) => {
        getRequest({ user_id: manager.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].sale_id).toBe(sale.sale_id);
          expect(res.body[0].cropSale.length).toBe(2);
          expect(res.body[0].cropSale[1].crop_id).toBe(crop1.crop_id);
          done();
        });
      })

      test('Worker should get sale by farm id', async (done) => {
        getRequest({ user_id: newWorker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].sale_id).toBe(sale.sale_id);
          expect(res.body[0].cropSale.length).toBe(2);
          expect(res.body[0].cropSale[1].crop_id).toBe(crop1.crop_id);
          done();
        });
      })


      test('Should get status 403 if an unauthorizedUser tries to get sale by farm id', async (done) => {
        getRequest({ user_id: unAuthorizedUser.user_id }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      })

      test('Circumvent authorization by modifying farm_id', async (done) => {
        getRequest({
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id,
          farm_id_in_params: farm.farm_id,
        }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });


    })

    describe('Delete sale', function () {

      describe('Delete sale authorization tests', () => {
        let newWorker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
          [newWorker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory({
            promisedUser: [newWorker],
            promisedFarm: [farm],
          }, fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory({
            promisedUser: [manager],
            promisedFarm: [farm],
          }, fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser],
          }, fakeUserFarm(1));
        })

        test('Owner should delete a sale', async (done) => {
          deleteRequest({ sale_id: sale.sale_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const saleRes = await saleModel.query().where('sale_id', sale.sale_id);
            expect(saleRes.length).toBe(1);
            expect(saleRes[0].deleted).toBe(true);
            done();
          })
        });

        test('Manager should delete a sale', async (done) => {
          deleteRequest({ user_id: manager.user_id, sale_id: sale.sale_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const saleRes = await saleModel.query().where('sale_id', sale.sale_id);
            expect(saleRes.length).toBe(1);
            expect(saleRes[0].deleted).toBe(true);
            done();
          })
        });

        test('should return 403 if an unauthorized user tries to delete a sale', async (done) => {
          deleteRequest({
            user_id: unAuthorizedUser.user_id,
            sale_id: sale.sale_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          })
        });

        test('should return 403 if a worker tries to delete a sale', async (done) => {
          deleteRequest({ user_id: newWorker.user_id, sale_id: sale.sale_id }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          })
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          deleteRequest({
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
            sale_id: sale.sale_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          })
        });


      })


    })


  })


  describe('Post sale', () => {
    let sampleReqBody;
    let crop2;
    let fieldCrop2;
    let someoneElsecrop;
    beforeEach(async () => {
      [crop2] = await mocks.cropFactory({ promisedFarm: [farm] });
      [fieldCrop2] = await mocks.fieldCropFactory({ promisedCrop: [crop2], promisedField: [field] });
      [someoneElsecrop] = await mocks.cropFactory();
      sampleReqBody = {
        ...mocks.fakeSale(),
        'farm_id': farm.farm_id,
        'cropSale': [{ ...mocks.fakeCropSale(), 'crop_id': fieldCrop.crop_id }, {
          ...mocks.fakeCropSale(),
          'crop_id': fieldCrop2.crop_id,
        }],
      }
    })

    test('Should return 400 if cropSale is undefined', async (done) => {
      sampleReqBody.cropSale = undefined;
      postSaleRequest(sampleReqBody, {}, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      })
    });

    test('Should return 400 if cropSale is empty[]', async (done) => {
      sampleReqBody.cropSale = [];
      postSaleRequest(sampleReqBody, {}, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      })
    });

    test('Should return 400 if cropSale is empty[{}]', async (done) => {
      sampleReqBody.cropSale = [{}];
      postSaleRequest(sampleReqBody, {}, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      })
    });

    test('Should return 400 if crop_id is invalid', async (done) => {
      sampleReqBody.cropSale[0].crop_id = 9999999;
      postSaleRequest(sampleReqBody, {}, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      })
    });

    // TODO: Edge case.
    // test('Should return 403 if crop_id references a crop that the user does not have access to', async (done) => {
    //   sampleReqBody.cropSale[0].crop_id = someoneElsecrop.crop_id;
    //   postSaleRequest(sampleReqBody, {}, async (err, res) => {
    //     expect(res.status).toBe(403);
    //     done();
    //   })
    // });

    test('Should return 400 if body.cropSale[i].crop exist', async (done) => {
      delete sampleReqBody.cropSale[0].crop_id;
      sampleReqBody.cropSale[0].crop={...mocks.fakeCrop(), farm_id: farm.farm_id};
      // Should not allow upsertGraph to post new farm/crop/fieldCrop through post sale request
      postSaleRequest(sampleReqBody, {}, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      })
    });


    describe('Post sale authorization tests', () => {

      let worker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async () => {
        [worker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory({
          promisedUser: [worker],
          promisedFarm: [farm],
        }, fakeUserFarm(3));
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory({
          promisedUser: [manager],
          promisedFarm: [farm],
        }, fakeUserFarm(2));


        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
          promisedUser: [unAuthorizedUser],
          promisedFarm: [farmunAuthorizedUser],
        }, fakeUserFarm(1));
      })

      test('Owner should post and get a valid crop', async (done) => {
        postSaleRequest(sampleReqBody, {}, async (err, res) => {
          expect(res.status).toBe(201);
          const sales = await saleModel.query().where('farm_id', farm.farm_id);
          expect(sales.length).toBe(1);
          expect(sales[0].customer_name).toBe(sampleReqBody.customer_name);
          const cropSales = await cropSaleModel.query().where('sale_id', sales[0].sale_id);
          expect(cropSales.length).toBe(2);
          expect(cropSales[1].crop_id).toBe(sampleReqBody.cropSale[1].crop_id);
          done();
        })
      });

      test('Manager should post and get a valid crop', async (done) => {
        postSaleRequest(sampleReqBody, { user_id: manager.user_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const sales = await saleModel.query().where('farm_id', farm.farm_id);
          expect(sales.length).toBe(1);
          expect(sales[0].customer_name).toBe(sampleReqBody.customer_name);
          const cropSales = await cropSaleModel.query().where('sale_id', sales[0].sale_id);
          expect(cropSales.length).toBe(2);
          expect(cropSales[1].crop_id).toBe(sampleReqBody.cropSale[1].crop_id);
          done();
        })
      });

      test('Worker should post and get a valid crop', async (done) => {
        postSaleRequest(sampleReqBody, { user_id: worker.user_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const sales = await saleModel.query().where('farm_id', farm.farm_id);
          expect(sales.length).toBe(1);
          expect(sales[0].customer_name).toBe(sampleReqBody.customer_name);
          const cropSales = await cropSaleModel.query().where('sale_id', sales[0].sale_id);
          expect(cropSales.length).toBe(2);
          expect(cropSales[1].crop_id).toBe(sampleReqBody.cropSale[1].crop_id);
          done();
        })
      });

      test('should return 403 status if sale is posted by unauthorized user', async (done) => {
        postSaleRequest(sampleReqBody, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe('User does not have the following permission(s): add:sales');
          done()
        })
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        postSaleRequest(sampleReqBody, {
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id,
        }, async (err, res) => {
          expect(res.status).toBe(403);
          done()
        })
      });

    })


  });
});
