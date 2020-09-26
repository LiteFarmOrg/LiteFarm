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
const Knex = require('knex')
const environment = process.env.TEAMCITY_DOCKER_NETWORK ? 'pipeline': 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks  = require('./mock.factories');
const { tableCleanup } = require('./testEnvironment')
const cropModel = require('../src/models/cropModel');

describe('Crop Tests', () => {
  let middleware;
  let newOwner;
  let farm;

  beforeAll(() => {
    token = global.token;
  });

  function postCropRequest( data, {user_id = newOwner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).post('/crop')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getRequest(url, {user_id = newOwner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function putCropRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id}, callback) {
    const {crop_id} = data;
    chai.request(server).put(`/crop/${crop_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback)
  }

  function deleteRequest(url, {user_id = newOwner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).delete(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function fakeUserFarm(role=1){
    return ({...mocks.fakeUserFarm(),role_id:role});
  }

  function fakeCrop(farm_id = farm.farm_id){
    const crop = mocks.fakeCrop();
    return ({...crop, farm_id});
  }


  beforeEach(async () => {
    [newOwner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({promisedUser:[newOwner], promisedFarm:[farm]},fakeUserFarm(1));

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next()
    });
  })

  afterEach (async () => {
    await tableCleanup(knex);
  });

  describe('Get && delete && put crop', ()=>{
    let crop;
    let newWorker;
    let workerFarm;

    beforeEach(async()=>{
      [crop] = await mocks.cropFactory({promisedFarm:[farm]},{...mocks.fakeCrop(), crop_common_name: "crop", user_added: true});
      [newWorker] = await mocks.usersFactory();
      [workerFarm] = await mocks.userFarmFactory({promisedUser:[newWorker], promisedFarm:[farm]},fakeUserFarm(3));
    })

    describe('Get crop', ()=>{

      test('Workers should get crop by farm id', async (done)=>{
        getRequest(`/crop/farm/${farm.farm_id}`,{user_id: newWorker.user_id},(err,res)=>{
          expect(res.status).toBe(200);
          expect(res.body[0].crop_id).toBe(crop.crop_id);
          done();
        });
      })

      test('Workers should get crop by id', async (done)=>{
        getRequest(`/crop/${crop.crop_id}`,{user_id: newWorker.user_id}, (err,res)=>{
          expect(res.status).toBe(200);
          expect(res.body[0].crop_id).toBe(crop.crop_id);
          done();
        });
      })

      test('Should filter out deleted crop', async (done)=>{
        await cropModel.query().findById(crop.crop_id).del();
        getRequest(`/crop/${crop.crop_id}`,{user_id: newWorker.user_id}, (err,res)=>{
          expect(res.status).toBe(404);
          done();
        });
      })

      describe('Get crop authorization tests',()=>{
        let newWorker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async()=>{
          [newWorker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory({promisedUser:[newWorker], promisedFarm:[farm]},fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory({promisedUser:[manager], promisedFarm:[farm]},fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({promisedUser:[unAuthorizedUser], promisedFarm:[farmunAuthorizedUser]},fakeUserFarm(1));
        })

        test('Owner should get crop by farm id', async (done)=>{
          getRequest(`/crop/${crop.crop_id}`,{user_id: newOwner.user_id},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].crop_id).toBe(crop.crop_id);
            done();
          });
        })

        test('Manager should get crop by farm id', async (done)=>{
          getRequest(`/crop/${crop.crop_id}`,{user_id: manager.user_id},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].crop_id).toBe(crop.crop_id);
            done();
          });
        })

        test('Should get status 403 if an unauthorizedUser tries to get crop by farm id', async (done)=>{
          getRequest(`/crop/${crop.crop_id}`,{user_id: unAuthorizedUser.user_id},(err,res)=>{
            expect(res.status).toBe(403);
            done();
          });
        })

        // TODO switch to JWT
        test('Circumvent authorization by modifying farm_id', async (done)=>{
          getRequest(`/crop/${crop.crop_id}`,{user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id},(err,res)=>{
            expect(res.status).toBe(403);
            done();
          });
        })


      })

    })

    describe('Delete crop', function () {
      let cropNotInUse;


      beforeEach(async()=>{
        [cropNotInUse] = await mocks.cropFactory({promisedFarm:[farm]},{...mocks.fakeCrop(), crop_common_name: "cropNotInUse", user_added: true});
          })

      test('Owner should delete a crop that is referenced by a crop', async (done) => {
        deleteRequest(`/crop/${crop.crop_id}`,{}, async (err, res) => {
          expect(res.status).toBe(200);
          const crops = await cropModel.query().whereDeleted().where('farm_id',farm.farm_id);
          expect(crops.length).toBe(1);
          expect(crops[0].deleted).toBe(true);
          expect(crops[0].crop_genus).toBe(crop.crop_genus);
          done();
        })
      });


      test('should delete a crop that is not in use', async (done) => {
        deleteRequest(`/crop/${cropNotInUse.crop_id}`,{}, async (err, res) => {
          expect(res.status).toBe(200);
          const cropsDeleted = await cropModel.query().whereDeleted().where('farm_id',farm.farm_id);
          expect(cropsDeleted.length).toBe(1);
          expect(cropsDeleted[0].deleted).toBe(true);
          expect(cropsDeleted[0].crop_genus).toBe(cropNotInUse.crop_genus);
          done();
        })
      });

      describe('Delete crop Authorization test', ()=>{
        let newWorker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async()=>{
          [newWorker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory({promisedUser:[newWorker], promisedFarm:[farm]},fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory({promisedUser:[manager], promisedFarm:[farm]},fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({promisedUser:[unAuthorizedUser], promisedFarm:[farmunAuthorizedUser]},fakeUserFarm(1));
        })

        test('Manager should delete a crop that is not in use', async (done) => {
          deleteRequest(`/crop/${cropNotInUse.crop_id}`, {user_id: manager.user_id}, async (err, res) => {
            expect(res.status).toBe(200);
            const cropsDeleted = await cropModel.query().whereDeleted().where('farm_id',farm.farm_id);
            expect(cropsDeleted.length).toBe(1);
            expect(cropsDeleted[0].deleted).toBe(true);
            expect(cropsDeleted[0].crop_genus).toBe(cropNotInUse.crop_genus);
            done();
          })
        });

        test('should return 403 if unauthorized user tries to delete a crop that is not in use', async (done) => {
          deleteRequest(`/crop/${cropNotInUse.crop_id}`,{user_id: unAuthorizedUser.user_id}, (err, res) => {
            expect(res.status).toBe(403);
            done();
          } )
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          deleteRequest(`/crop/${cropNotInUse.crop_id}`,{user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id}, (err, res) => {
            expect(res.status).toBe(403);
            done();
          } )
        });

        test('should return 403 if a worker tries to delete a crop that is not in use', async (done) => {
          deleteRequest(`/crop/${cropNotInUse.crop_id}`, {user_id: newWorker.user_id}, (err, res) => {
            expect(res.status).toBe(403);
            done();
          })
        });
      })


      describe('Put crop', ()=>{

        test('Owner should be able to edit a crop', async (done) => {
          let newCrop = {...crop, ...mocks.fakeCrop()}
          putCropRequest(newCrop,{}, async (err, res) => {
            expect(res.status).toBe(200);
            const cropRes = await cropModel.query().where('crop_id',crop.crop_id).first();
            expect(cropRes.crop_genus).toBe(newCrop.crop_genus);
            done();
          })
        });

        describe('Put crop authorization tests',()=>{
          let newWorker;
          let manager;
          let unAuthorizedUser;
          let farmunAuthorizedUser;

          beforeEach(async()=>{
            [newWorker] = await mocks.usersFactory();
            const [workerFarm] = await mocks.userFarmFactory({promisedUser:[newWorker], promisedFarm:[farm]},fakeUserFarm(3));
            [manager] = await mocks.usersFactory();
            const [managerFarm] = await mocks.userFarmFactory({promisedUser:[manager], promisedFarm:[farm]},fakeUserFarm(2));


            [unAuthorizedUser] = await mocks.usersFactory();
            [farmunAuthorizedUser] = await mocks.farmFactory();
            const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({promisedUser:[unAuthorizedUser], promisedFarm:[farmunAuthorizedUser]},fakeUserFarm(1));
          })

          test('Manager should be able to edit a crop', async (done) => {
            let newCrop = {...crop, ...mocks.fakeCrop()}
            putCropRequest(newCrop,{user_id: manager.user_id}, async (err, res) => {
              expect(res.status).toBe(200);
              const cropRes = await cropModel.query().where('crop_id',crop.crop_id).first();
              expect(cropRes.crop_genus).toBe(newCrop.crop_genus);
              done();
            })
          });

          test('should return 403 when a worker tries to edit crop', async (done) => {
            let newCrop = {...crop, ...mocks.fakeCrop()}
            putCropRequest(newCrop,{user_id: newWorker.user_id}, async (err, res) => {
              expect(res.status).toBe(403);
              const cropRes = await cropModel.query().where('crop_id',crop.crop_id).first();
              expect(cropRes.crop_genus).toBe(crop.crop_genus);
              done();
            })
          });

          test('should return 403 when an unauthorized tries to edit crop', async (done) => {
            let newCrop = {...crop, ...mocks.fakeCrop()}
            putCropRequest(newCrop,{user_id: unAuthorizedUser.user_id}, async (err, res) => {
              expect(res.status).toBe(403);
              const cropRes = await cropModel.query().where('crop_id',crop.crop_id).first();
              expect(cropRes.crop_genus).toBe(crop.crop_genus);
              done();
            })
          });

          test('Circumvent authorization by modifying farm_id', async (done) => {
            let newCrop = {...crop, ...mocks.fakeCrop()}
            putCropRequest(newCrop,{user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id}, async (err, res) => {
              expect(res.status).toBe(403);
              const cropRes = await cropModel.query().where('crop_id',crop.crop_id).first();
              expect(cropRes.crop_genus).toBe(crop.crop_genus);
              done();
            })
          });

        })
      });


    });
  })

  describe('Post crop', () => {

    test('should return 400 status if crop is posted w/o crop_common_name', async (done) => {
      let crop = fakeCrop();
      delete crop.crop_common_name;
      postCropRequest(crop, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.crop_common_name[0].keyword).toBe("required");
        done()
      })
    });

    test('should post and get a valid crop', async (done) => {
      let crop = fakeCrop();
      crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
      postCropRequest(crop, {}, async (err, res) => {
        expect(res.status).toBe(201);
        const crops = await cropModel.query().where('farm_id',farm.farm_id);
        expect(crops.length).toBe(1);
        expect(crops[0].crop_common_name).toBe(crop.crop_common_name);
        done();
      })
    });

    describe('crop_common_name + genus + species uniqueness tests', function(){
      test('should return 400 status if crop is posted w/o variety name', async (done) => {
        let crop = fakeCrop();
        crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
        [crop] = await mocks.cropFactory({promisedFarm:[farm]},crop);
        postCropRequest(crop, {}, (err, res) => {
          expect(res.status).toBe(400);
          expect(JSON.parse(res.error.text).error.routine).toBe("_bt_check_unique");
          done();
        })
      });

      test('should post a crop and its variety', async (done) => {
        let crop = fakeCrop();
        crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
        const [crop1] = await mocks.cropFactory({promisedFarm:[farm]},crop);
        crop.crop_common_name += ' - 1';
        postCropRequest(crop, {}, async (err, res) => {
          expect(res.status).toBe(201);
          const crops = await cropModel.query().where('farm_id',farm.farm_id);
          expect(crops.length).toBe(2);
          expect(crops[0].crop_common_name).toBe(crop1.crop_common_name);
          expect(crops[1].crop_common_name).toBe(crop.crop_common_name);
          done();
        })
      });
    })

    describe('Post crop authorization', ()=>{
      let newWorker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async()=>{
        [newWorker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory({promisedUser:[newWorker], promisedFarm:[farm]},fakeUserFarm(3));
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory({promisedUser:[manager], promisedFarm:[farm]},fakeUserFarm(2));


        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({promisedUser:[unAuthorizedUser], promisedFarm:[farmunAuthorizedUser]},fakeUserFarm(1));
      })


      test('owner should return 403 status if crop is posted by unauthorized user', async (done) => {
        let crop = fakeCrop();
        crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
        postCropRequest(crop, {user_id: unAuthorizedUser.user_id}, (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe("User does not have the following permission(s): add:crops");
          done()
        })
      });

      test('should return 403 status if crop is posted by newWorker', async (done) => {
        let crop = fakeCrop();
        crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
        postCropRequest(crop, {user_id: newWorker.user_id}, (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe("User does not have the following permission(s): add:crops");
          done()
        })
      });

      test('manager should post and get a valid crop', async (done) => {
        let crop = fakeCrop();
        crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
        postCropRequest(crop, {user_id: manager.user_id}, async (err, res) => {
          expect(res.status).toBe(201);
          const crops = await cropModel.query().where('farm_id',farm.farm_id);
          expect(crops.length).toBe(1);
          expect(crops[0].crop_common_name).toBe(crop.crop_common_name);
          done();
        })
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        let crop = fakeCrop();
        crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
        postCropRequest(crop, {user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id}, (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe("user not authorized to access farm");
          done()
        })
      });

    })





  });
});
