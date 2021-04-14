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
const moment =require('moment')
chai.use(chaiHttp);
const server = require('./../src/server');
const knex = require('../src/util/knex');
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks  = require('./mock.factories');
const { tableCleanup } = require('./testEnvironment');

const pesiticideModel = require('../src/models/pesiticideModel');

describe('Pesticide Tests', () => {
  let middleware;
  let owner;
  let farm;

  beforeAll(() => {
    token = global.token;
  });


  function postRequest( data, {user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).post(`/pesticide`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getRequest({user_id = owner.user_id, farm_id = farm.farm_id, header_farm_id = farm.farm_id}, callback) {
    chai.request(server).get(`/pesticide/farm/${header_farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function deleteRequest({user_id = owner.user_id, farm_id = farm.farm_id, pesticide_id}, callback) {
    chai.request(server).delete(`/pesticide/${pesticide_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function fakeUserFarm(role=1){
    return ({...mocks.fakeUserFarm(),role_id:role});
  }

  function getfakePesticide(farm_id = farm.farm_id){
    const pesticide = mocks.fakePesticide();
    return ({...pesticide, farm_id});
  }

  beforeEach(async () => {
    await knex.raw('DELETE from pesticide');
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({promisedUser:[owner], promisedFarm:[farm]},fakeUserFarm(1));

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

  describe('Get && delete pesticide',()=>{
    let pesticide;
    beforeEach(async()=>{
      [pesticide] = await mocks.pesticideFactory({promisedFarm: [farm]});
    })

    test('Should filter out deleted pesticides', async (done)=>{
      await pesiticideModel.query().context({
        showHidden: true,
        user_id: owner.user_id,
      }).findById(pesticide.pesticide_id).delete();
      getRequest({ user_id: owner.user_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
        done();
      });
    })

    test('Workers should get seeded pesticide', async (done)=>{
      let [seedPesticide] = await mocks.pesticideFactory( {promisedFarm: [{farm_id: null}]}, mocks.fakePesticide());
      getRequest({user_id: owner.user_id},(err,res)=>{
        expect(res.status).toBe(200);
        expect(res.body[1].pesticide_id).toBe(seedPesticide.pesticide_id);
        done();
      });
    })

      describe('Get pesticide authorization tests',()=>{
        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async()=>{
          [worker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory({promisedUser:[worker], promisedFarm:[farm]},fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory({promisedUser:[manager], promisedFarm:[farm]},fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({promisedUser:[unAuthorizedUser], promisedFarm:[farmunAuthorizedUser]},fakeUserFarm(1));
        })

        test('Owner should get pesticide by farm id', async (done)=>{
          getRequest({user_id: owner.user_id},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].pesticide_id).toBe(pesticide.pesticide_id);
            done();
          });
        })

        test('Manager should get pesticide by farm id', async (done)=>{
          getRequest({user_id: manager.user_id},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].pesticide_id).toBe(pesticide.pesticide_id);
            done();
          });
        })

        test('Worker should get pesticide by farm id', async (done)=>{
          getRequest({user_id: worker.user_id},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].pesticide_id).toBe(pesticide.pesticide_id);
            done();
          });
        })


        test('Should get status 403 if an unauthorizedUser tries to get pesticide by farm id', async (done)=>{
          getRequest({user_id: unAuthorizedUser.user_id},(err,res)=>{
            expect(res.status).toBe(403);
            done();
          });
        })

        test('Circumvent authorization by modifying farm_id', async (done) => {
          getRequest({user_id: unAuthorizedUser.user_id, header_farm_id: farmunAuthorizedUser.farm_id},(err,res)=>{
            expect(res.status).toBe(403);
            done();
          });
        })


      })

    describe('Delete fertlizer', function () {

      test('should return 403 if user tries to delete a seeded pesticide', async (done) => {
        let [seedPesticide] = await mocks.pesticideFactory( {promisedFarm: [{farm_id: null}]}, mocks.fakePesticide());
        deleteRequest({pesticide_id: seedPesticide.pesticide_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      });

      describe('Delete fertlizer authorization tests',()=>{
        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async()=>{
          [worker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory({promisedUser:[worker], promisedFarm:[farm]},fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory({promisedUser:[manager], promisedFarm:[farm]},fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({promisedUser:[unAuthorizedUser], promisedFarm:[farmunAuthorizedUser]},fakeUserFarm(1));
        })

        test('Owner should delete a fertlizer', async (done) => {
          deleteRequest({pesticide_id: pesticide.pesticide_id}, async (err, res) => {
            expect(res.status).toBe(200);
            const pesticideRes = await pesiticideModel.query().context({showHidden: true}).where('pesticide_id',pesticide.pesticide_id);
            expect(pesticideRes.length).toBe(1);
            expect(pesticideRes[0].deleted).toBe(true);
            done();
          })
        });

        test('Manager should delete a pesticide', async (done) => {
          deleteRequest({user_id:manager.user_id, pesticide_id: pesticide.pesticide_id}, async (err, res) => {
            expect(res.status).toBe(200);
            const pesticideRes = await pesiticideModel.query().context({showHidden: true}).where('pesticide_id',pesticide.pesticide_id);
            expect(pesticideRes.length).toBe(1);
            expect(pesticideRes[0].deleted).toBe(true);
            done();
          })
        });

        test('should return 403 if an unauthorized user tries to delete a pesticide', async (done) => {
          deleteRequest({user_id:unAuthorizedUser.user_id, pesticide_id: pesticide.pesticide_id}, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          })
        });

        test('should return 403 if a worker tries to delete a pesticide', async (done) => {
          deleteRequest({user_id: worker.user_id, pesticide_id: pesticide.pesticide_id}, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          })
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          deleteRequest({user_id:unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id, pesticide_id: pesticide.pesticide_id}, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          })
        });


      })


  })


  })






  describe('Post pesticide', () => {
    let fakePesticide;

    beforeEach(async()=>{
        fakePesticide = getfakePesticide();
    })

    test('should return 403 status if headers.farm_id is set to null', async (done) => {
      fakePesticide.farm_id = null;
      postRequest(fakePesticide, {}, (err, res) => {
        expect(res.status).toBe(403);
        done()
      })
    });

    describe('Post pesticide authorization tests', ()=>{

      let worker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async()=>{
        [worker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory({promisedUser:[worker], promisedFarm:[farm]},fakeUserFarm(3));
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory({promisedUser:[manager], promisedFarm:[farm]},fakeUserFarm(2));


        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({promisedUser:[unAuthorizedUser], promisedFarm:[farmunAuthorizedUser]},fakeUserFarm(1));
      })

      test('Owner should post and get a valid pesticide', async (done) => {
        postRequest(fakePesticide, {}, async (err, res) => {
          expect(res.status).toBe(201);
          const pesticides = await pesiticideModel.query().context({showHidden: true}).where('farm_id',farm.farm_id);
          expect(pesticides.length).toBe(1);
          expect(pesticides[0].pesticide_name).toBe(fakePesticide.pesticide_name);
          done();
        })
      });

      test('Manager should post and get a valid pesticide', async (done) => {
        postRequest(fakePesticide, {user_id: manager.user_id}, async (err, res) => {
          expect(res.status).toBe(201);
          const pesticides = await pesiticideModel.query().context({showHidden: true}).where('farm_id',farm.farm_id);
          expect(pesticides.length).toBe(1);
          expect(pesticides[0].pesticide_name).toBe(fakePesticide.pesticide_name);
          done();
        })
      });

      test('should return 403 status if pesticide is posted by worker', async (done) => {
        postRequest(fakePesticide, {user_id: worker.user_id}, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe("User does not have the following permission(s): add:pesticides");
          done()
        })
      });

      test('should return 403 status if pesticide is posted by unauthorized user', async (done) => {
        postRequest(fakePesticide, {user_id: unAuthorizedUser.user_id}, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe("User does not have the following permission(s): add:pesticides");
          done()
        })
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        postRequest(fakePesticide, {user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done()
        })
      });

    })


  });
});
