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
  let ownerFarm;
  let crop;

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
      .end(callback);
  }

  function patchRequest(data, sale_id, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).patch(`/sale/${sale_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [ownerFarm] = await mocks.userFarmFactory({
      promisedUser: [owner],
      promisedFarm: [farm],
    }, fakeUserFarm(1));
    [crop] = await mocks.cropFactory({ promisedFarm: [farm] });

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
      [sale] = await mocks.saleFactory({ promisedUserFarm: [ownerFarm] });
      let [cropSale] = await mocks.cropSaleFactory({ promisedCrop: [crop], promisedSale: [sale] });
      [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
      [cropSale] = await mocks.cropSaleFactory({ promisedCrop: [crop1], promisedSale: [sale] });
    })

    test('Should filter out deleted sale', async (done) => {
      await saleModel.query().context(owner).findById(sale.sale_id).delete();
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
        let workerFarm;
        let manager;
        let managerFarm;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
          [newWorker] = await mocks.usersFactory();
          [workerFarm] = await mocks.userFarmFactory({
            promisedUser: [newWorker],
            promisedFarm: [farm],
          }, fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          [managerFarm] = await mocks.userFarmFactory({
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
            const saleRes = await saleModel.query().context({ showHidden: true }).where('sale_id', sale.sale_id);
            expect(saleRes.length).toBe(1);
            expect(saleRes[0].deleted).toBe(true);
            // const saleRes = await saleModel.query().whereNotDeleted().where('sale_id', sale.sale_id);
            // expect(saleRes.length).toBe(0);
            done();
          })
        });

        test('Manager should delete a sale', async (done) => {
          deleteRequest({ user_id: manager.user_id, sale_id: sale.sale_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const saleRes = await saleModel.query().context({ showHidden: true }).where('sale_id', sale.sale_id);
            expect(saleRes.length).toBe(1);
            expect(saleRes[0].deleted).toBe(true);
            done();
          });
        });

        test('Worker should delete their own sale', async (done) => {
          let [workersSale] = await mocks.saleFactory({ promisedUserFarm: [workerFarm] });
          let [workersCropSale] = await mocks.cropSaleFactory({ promisedCrop: [crop], promisedSale: [workersSale] });
          deleteRequest({ user_id: newWorker.user_id, sale_id: workersSale.sale_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const saleRes = await saleModel.query().context({ showHidden: true }).where('sale_id', workersSale.sale_id);
            expect(saleRes.length).toBe(1);
            expect(saleRes[0].deleted).toBe(true);
            // const saleRes = await saleModel.query().whereNotDeleted().where('sale_id', sale.sale_id);
            // expect(saleRes.length).toBe(0);
            done();
          });
        });

        test('should return 403 if an unauthorized user tries to delete a sale', async (done) => {
          deleteRequest({
            user_id: unAuthorizedUser.user_id,
            sale_id: sale.sale_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
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
    let someoneElsecrop;
    beforeEach(async () => {
      [crop2] = await mocks.cropFactory({ promisedFarm: [farm] });
      [someoneElsecrop] = await mocks.cropFactory();
      sampleReqBody = {
        ...mocks.fakeSale(),
        'farm_id': farm.farm_id,
        'cropSale': [{ ...mocks.fakeCropSale(), 'crop_id': crop.crop_id }, {
          ...mocks.fakeCropSale(),
          'crop_id': crop2.crop_id,
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
          done();
        })
      });

    })


  });

  describe('Patch sale authorization tests', () => {
    let worker;
    let workerFarm;
    let manager;
    let managerFarm;
    let unauthorizedUser;
    let otherFarm;
    let unauthorizedUserFarm;

    let sale;
    let cropSale1;
    let cropSale2;
    let newCrop;

    beforeEach(async () => {
      [worker] = await mocks.usersFactory();
      [workerFarm] = await mocks.userFarmFactory({
        promisedUser: [worker],
        promisedFarm: [farm],
      }, fakeUserFarm(3));
      [manager] = await mocks.usersFactory();
      [managerFarm] = await mocks.userFarmFactory({
        promisedUser: [manager],
        promisedFarm: [farm],
      }, fakeUserFarm(2));


      [unauthorizedUser] = await mocks.usersFactory();
      [otherFarm] = await mocks.farmFactory();
      [unauthorizedUserFarm] = await mocks.userFarmFactory({
        promisedUser: [unauthorizedUser],
        promisedFarm: [otherFarm],
      }, fakeUserFarm(1));

      [sale] = await mocks.saleFactory({ promisedUserFarm: [ownerFarm] });
      [cropSale1] = await mocks.cropSaleFactory({ promisedCrop: [crop], promisedSale: [sale] });
      [cropSale2] = await mocks.cropSaleFactory({ promisedCrop: [crop], promisedSale: [sale] });
      [newCrop] = await mocks.cropFactory({ promisedFarm: [farm], createdUser: [owner] });
    });

    test('Owner should patch a sale', async (done) => {
      const patchData = {
        customer_name: 'patched customer name',
        // sale_date: Date.now().toString(),
        cropSale: [
          {
            crop_id: cropSale1.crop_id,
            quantity_kg: cropSale1.quantity_kg + 5,
            sale_value: cropSale1.sale_value + 5,
          },
          {
            crop_id: cropSale2.crop_id,
            quantity_kg: cropSale2.quantity_kg + 5,
            sale_value: cropSale2.sale_value + 5,
          },
          {
            crop_id: newCrop.crop_id,
            quantity_kg: 777,
            sale_value: 7777,
          },
        ],
      };

      patchRequest(patchData, sale.sale_id, {}, async (err, res) => {
        expect(res.status).toBe(200);
        const saleRes = await saleModel.query().where('sale_id', sale.sale_id).first();
        expect(saleRes.customer_name).toBe(patchData.customer_name);

        const cropSaleRes = await cropSaleModel.query().where('sale_id', sale.sale_id);
        expect(cropSaleRes.length).toBe(patchData.cropSale.length);
        for (i = 0; i < cropSaleRes.length; i++) {
          expect(cropSaleRes[i].quantity_kg).toBe(patchData.cropSale[i].quantity_kg);
          expect(cropSaleRes[i].sale_value).toBe(patchData.cropSale[i].sale_value);
        }
        done();
      });
    });

    test('Manager should patch a sale', async (done) => {
      const patchData = {
        customer_name: 'patched customer name',
        // sale_date: Date.now().toString(),
        cropSale: [
          {
            crop_id: cropSale1.crop_id,
            quantity_kg: cropSale1.quantity_kg + 5,
            sale_value: cropSale1.sale_value + 5,
          },
          {
            crop_id: cropSale2.crop_id,
            quantity_kg: cropSale2.quantity_kg + 5,
            sale_value: cropSale2.sale_value + 5,
          },
          {
            crop_id: newCrop.crop_id,
            quantity_kg: 777,
            sale_value: 7777,
          },
        ],
      };

      patchRequest(patchData, sale.sale_id, { user_id: manager.user_id }, async (err, res) => {
        expect(res.status).toBe(200);
        const saleRes = await saleModel.query().where('sale_id', sale.sale_id).first();
        expect(saleRes.customer_name).toBe(patchData.customer_name);

        const cropSaleRes = await cropSaleModel.query().where('sale_id', sale.sale_id);
        expect(cropSaleRes.length).toBe(patchData.cropSale.length);
        for (i = 0; i < cropSaleRes.length; i++) {
          expect(cropSaleRes[i].quantity_kg).toBe(patchData.cropSale[i].quantity_kg);
          expect(cropSaleRes[i].sale_value).toBe(patchData.cropSale[i].sale_value);
        }
        done();
      });
    });

    test('Worker should patch a sale that they created', async (done) => {
      let [workersSale] = await mocks.saleFactory({ promisedUserFarm: [workerFarm] });
      let [workersCropSale] = await mocks.cropSaleFactory({ promisedCrop: [crop], promisedSale: [workersSale] });

      const patchData = {
        customer_name: 'patched customer name',
        // sale_date: Date.now().toString(),
        cropSale: [
          {
            crop_id: cropSale1.crop_id,
            quantity_kg: cropSale1.quantity_kg + 5,
            sale_value: cropSale1.sale_value + 5,
          },
          {
            crop_id: cropSale2.crop_id,
            quantity_kg: cropSale2.quantity_kg + 5,
            sale_value: cropSale2.sale_value + 5,
          },
          {
            crop_id: newCrop.crop_id,
            quantity_kg: 777,
            sale_value: 7777,
          },
        ],
      };

      patchRequest(patchData, workersSale.sale_id, { user_id: worker.user_id }, async (err, res) => {
        expect(res.status).toBe(200);
        const saleRes = await saleModel.query().where('sale_id', workersSale.sale_id).first();
        expect(saleRes.customer_name).toBe(patchData.customer_name);

        const cropSaleRes = await cropSaleModel.query().where('sale_id', workersSale.sale_id);
        expect(cropSaleRes.length).toBe(patchData.cropSale.length);
        for (i = 0; i < cropSaleRes.length; i++) {
          expect(cropSaleRes[i].quantity_kg).toBe(patchData.cropSale[i].quantity_kg);
          expect(cropSaleRes[i].sale_value).toBe(patchData.cropSale[i].sale_value);
        }
        done();
      });
    });

    test('Should return 403 if worker tries to patch another member\'s sale', async (done) => {
      const patchData = {
        customer_name: 'patched customer name',
        // sale_date: Date.now().toString(),
        cropSale: [
          {
            crop_id: cropSale1.crop_id,
            quantity_kg: cropSale1.quantity_kg + 5,
            sale_value: cropSale1.sale_value + 5,
          },
          {
            crop_id: cropSale2.crop_id,
            quantity_kg: cropSale2.quantity_kg + 5,
            sale_value: cropSale2.sale_value + 5,
          },
          {
            crop_id: newCrop.crop_id,
            quantity_kg: 777,
            sale_value: 7777,
          },
        ],
      };

      patchRequest(patchData, sale.sale_id, { user_id: worker.user_id }, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

    test('Should return 403 if unauthorized user tries to patch sale', async (done) => {
      const patchData = {
        customer_name: 'patched customer name',
        // sale_date: Date.now().toString(),
        cropSale: [
          {
            crop_id: cropSale1.crop_id,
            quantity_kg: cropSale1.quantity_kg + 5,
            sale_value: cropSale1.sale_value + 5,
          },
          {
            crop_id: cropSale2.crop_id,
            quantity_kg: cropSale2.quantity_kg + 5,
            sale_value: cropSale2.sale_value + 5,
          },
          {
            crop_id: newCrop.crop_id,
            quantity_kg: 777,
            sale_value: 7777,
          },
        ],
      };

      patchRequest(patchData, sale.sale_id, { user_id: unauthorizedUser.user_id }, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });
  });
});
