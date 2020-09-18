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
const Knex = require('knex')
const environment = 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks  = require('./mock.factories');


const pesiticideModel = require('../src/models/pesiticideModel');

describe('Authorization Tests', () => {
  let middleware;
  let newOwner;
  let farm;

  beforeAll(() => {
    token = global.token;
  });

  function postRequest( data, {user_id = newOwner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).post(`/pesticide`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getRequest({user_id = newOwner.user_id, farm_id = farm.farm_id, header_farm_id = farm.farm_id}, callback) {
    chai.request(server).get(`/pesticide/farm/${header_farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function deleteRequest({user_id = newOwner.user_id, farm_id = farm.farm_id, pesticide_id, data={}}, callback) {
    chai.request(server).delete(`/pesticide/${pesticide_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function fakeUserFarm(role=1){
    return ({...mocks.fakeUserFarm(),role_id:role});
  }

  function getFakePesticide(farm_id = farm.farm_id){
    const pesticide = mocks.fakePesticide();
    return ({...pesticide, farm_id});
  }

  function getFakeField(farm_id = farm.farm_id){
    const field = mocks.fakeFieldForTests();
    return ({...field, farm_id});
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
    // await knex.raw(`
    // DELETE FROM "field";
    // DELETE FROM "pesticide";
    // DELETE FROM "userFarm";
    // DELETE FROM "farm";
    // DELETE FROM "users";
    // DELETE FROM "weather_station";
    // `);
  });

  describe('Get && delete pesticide',()=>{
    let pesticide;
    beforeEach(async()=>{
      [pesticide] = await mocks.pesticideFactory({promisedFarm: [farm]});
    })

    describe('Delete fertlizer', function () {

      describe('Delete fertlizer authorization tests',()=>{
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

        test('Owner should delete a fertlizer', async (done) => {
          deleteRequest({pesticide_id: pesticide.pesticide_id}, async (err, res) => {
            expect(res.status).toBe(200);
            const pesticideRes = await pesiticideModel.query().where('pesticide_id',pesticide.pesticide_id);
            expect(pesticideRes.length).toBe(1);
            expect(pesticideRes[0].deleted).toBe(true);
            done();
          })
        });

        test('Manager should delete a pesticide', async (done) => {
          deleteRequest({user_id:manager.user_id, pesticide_id: pesticide.pesticide_id}, async (err, res) => {
            expect(res.status).toBe(200);
            const pesticideRes = await pesiticideModel.query().where('pesticide_id',pesticide.pesticide_id);
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
          deleteRequest({user_id: newWorker.user_id, pesticide_id: pesticide.pesticide_id}, async (err, res) => {
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

        test('Circumvent authorization by modifying farm_id in body', async (done) => {
          deleteRequest({user_id:unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id, pesticide_id: pesticide.pesticide_id, data:{farm_id: farmunAuthorizedUser.farm_id }}, async (err, res) => {
            expect(res.status).toBeGreaterThan(399);
            done();
          })
        });

        test('Circumvent authorization by modifying field_id in body', async (done) => {
          const [fieldunauthorizaed] = await mocks.fieldFactory({promisedFarm: [farmunAuthorizedUser]});
          deleteRequest({user_id:unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id, pesticide_id: pesticide.pesticide_id, data:{field_id: fieldunauthorizaed.field_id, farm_id: farmunAuthorizedUser.farm_id }}, async (err, res) => {
            expect(res.status).toBeGreaterThan(399);
            done();
          })
        });

      })
  })
  })






  describe('Post pesticide', () => {
    let fakepesticide;

    beforeEach(async()=>{
        fakepesticide = getFakePesticide();
    })

    describe('Post pesticide authorization tests', ()=>{

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

      test('Owner should post and get a valid crop', async (done) => {
        postRequest(fakepesticide, {}, async (err, res) => {
          expect(res.status).toBe(201);
          const pesticides = await pesiticideModel.query().where('farm_id',farm.farm_id);
          expect(pesticides.length).toBe(1);
          expect(pesticides[0].pesticide_name).toBe(fakepesticide.pesticide_name);
          done();
        })
      });

      test('Manager should post and get a valid crop', async (done) => {
        postRequest(fakepesticide, {user_id: manager.user_id}, async (err, res) => {
          expect(res.status).toBe(201);
          const pesticides = await pesiticideModel.query().where('farm_id',farm.farm_id);
          expect(pesticides.length).toBe(1);
          expect(pesticides[0].pesticide_name).toBe(fakepesticide.pesticide_name);
          done();
        })
      });

      test('should return 403 status if pesticide is posted by worker', async (done) => {
        postRequest(fakepesticide, {user_id: newWorker.user_id}, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe("User does not have the following permission(s): add:pesticides");
          done()
        })
      });

      test('should return 403 status if pesticide is posted by unauthorized user', async (done) => {
        postRequest(fakepesticide, {user_id: unAuthorizedUser.user_id}, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe("User does not have the following permission(s): add:pesticides");
          done()
        })
      });

      test('Circumvent authorization by adding farm_id to req.body', async (done) => {
        postRequest(fakepesticide, {user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done()
        })
      });

      test('Circumvent authorization by adding field_id to req.body', async (done) => {
        const [fieldunauthorizaed] = await mocks.fieldFactory({promisedFarm: [farmunAuthorizedUser]});
        postRequest({...fakepesticide, field_id: fieldunauthorizaed.field_id},
          //body
          {user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id}, async (err, res) => {
          expect(res.status).toBeGreaterThan(399);
          done()
        })
      });

    })


  });
});
