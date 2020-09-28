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
const environment = process.env.TEAMCITY_DOCKER_NETWORK ? 'pipeline': 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);
const { tableCleanup } = require('./testEnvironment')
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks  = require('./mock.factories');


const fertilizerModel = require('../src/models/fertilizerModel');

describe('Fertilizer Tests', () => {
  let middleware;
  let owner;
  let farm;

  beforeAll(() => {
    token = global.token;
  });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  })

  function postFertilizerRequest( data, {user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).post(`/fertilizer/farm/${farm_id}`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getRequest({user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).get(`/fertilizer/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function deleteRequest({user_id = owner.user_id, farm_id = farm.farm_id, fertilizer_id}, callback) {
    chai.request(server).delete(`/fertilizer/${fertilizer_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function fakeUserFarm(role=1){
    return ({...mocks.fakeUserFarm(),role_id:role});
  }

  function getFakeFertilizer(farm_id = farm.farm_id){
    const fertilizer = mocks.fakeFertilizer();
    return ({...fertilizer, farm_id});
  }

  beforeEach(async () => {
    await knex.raw('DELETE from fertilizer');
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({promisedUser:[owner], promisedFarm:[farm]},fakeUserFarm(1));

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next()
    });
  })

  afterAll (async (done) => {
    await tableCleanup(knex);
  });

  describe('Get && delete fertilizer',()=>{
    let fertilizer;
    beforeEach(async()=>{
      [fertilizer] = await mocks.fertilizerFactory({promisedFarm: [farm]});
    })

    test('Should filter out deleted fertilizer', async (done)=>{
      await fertilizerModel.query().findById(fertilizer.fertilizer_id).del();
      getRequest({user_id: owner.user_id},(err,res)=>{
        expect(res.status).toBe(404);
        done();
      });
    })

    test('should get seeded fertilizer', async (done)=>{
      let [seedFertilizer] = await knex('fertilizer').insert({...mocks.fakeFertilizer(), farm_id: null}).returning('*');
      getRequest({user_id: owner.user_id},(err,res)=>{
        expect(res.status).toBe(200);
        expect(res.body[1].fertilizer_id).toBe(seedFertilizer.fertilizer_id);
        done();
      });
    })

      describe('Get fertilizer authorization tests',()=>{
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

        test('Owner should get fertilizer by farm id', async (done)=>{
          getRequest({user_id: owner.user_id},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
            done();
          });
        })

        test('Manager should get fertilizer by farm id', async (done)=>{
          getRequest({user_id: manager.user_id},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
            done();
          });
        })

        test('Worker should get fertilizer by farm id', async (done)=>{
          getRequest({user_id: worker.user_id},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
            done();
          });
        })


        test('Should get status 403 if an unauthorizedUser tries to get fertilizer by farm id', async (done)=>{
          getRequest({user_id: unAuthorizedUser.user_id},(err,res)=>{
            expect(res.status).toBe(403);
            done();
          });
        })


      })

    describe('Delete fertlizer', function () {

      test('should return 403 if user tries to delete a seeded fertilizer', async (done) => {
        let [seedFertilizer] = await knex('fertilizer').insert({...mocks.fakeFertilizer(), farm_id: null}).returning('*');
        deleteRequest({fertilizer_id: seedFertilizer.fertilizer_id}, async (err, res) => {
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
          deleteRequest({fertilizer_id: fertilizer.fertilizer_id}, async (err, res) => {
            expect(res.status).toBe(200);
            const fertilizerRes = await fertilizerModel.query().where('fertilizer_id',fertilizer.fertilizer_id);
            expect(fertilizerRes.length).toBe(1);
            expect(fertilizerRes[0].deleted).toBe(true);
            done();
          })
        });

        test('Manager should delete a fertilizer', async (done) => {
          deleteRequest({user_id:manager.user_id, fertilizer_id: fertilizer.fertilizer_id}, async (err, res) => {
            expect(res.status).toBe(200);
            const fertilizerRes = await fertilizerModel.query().where('fertilizer_id',fertilizer.fertilizer_id);
            expect(fertilizerRes.length).toBe(1);
            expect(fertilizerRes[0].deleted).toBe(true);
            done();
          })
        });

        test('should return 403 if an unauthorized user tries to delete a fertilizer', async (done) => {
          deleteRequest({user_id:unAuthorizedUser.user_id, fertilizer_id: fertilizer.fertilizer_id}, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          })
        });

        test('should return 403 if a worker tries to delete a fertilizer', async (done) => {
          deleteRequest({user_id: worker.user_id, fertilizer_id: fertilizer.fertilizer_id}, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          })
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          deleteRequest({user_id:unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id, fertilizer_id: fertilizer.fertilizer_id}, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          })
        });


      })


  })


  })






  describe('Post fertilizer', () => {
    let fakeFertilizer;

    beforeEach(async()=>{
        fakeFertilizer = getFakeFertilizer();
    })

    test('should return 403 status if headers.farm_id is set to null', async (done) => {
      fakeFertilizer.farm_id = null;
      postFertilizerRequest(fakeFertilizer, {}, (err, res) => {
        expect(res.status).toBe(403);
        done()
      })
    });

    describe('Post fertilizer authorization tests', ()=>{

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

      test('Owner should post and get a valid crop', async (done) => {
        postFertilizerRequest(fakeFertilizer, {}, async (err, res) => {
          expect(res.status).toBe(201);
          const fertilizers = await fertilizerModel.query().where('farm_id',farm.farm_id);
          expect(fertilizers.length).toBe(1);
          expect(fertilizers[0].fertilizer_type).toBe(fakeFertilizer.fertilizer_type);
          done();
        })
      });

      test('Manager should post and get a valid crop', async (done) => {
        postFertilizerRequest(fakeFertilizer, {user_id: manager.user_id}, async (err, res) => {
          expect(res.status).toBe(201);
          const fertilizers = await fertilizerModel.query().where('farm_id',farm.farm_id);
          expect(fertilizers.length).toBe(1);
          expect(fertilizers[0].fertilizer_type).toBe(fakeFertilizer.fertilizer_type);
          done();
        })
      });

      test('should return 403 status if fertilizer is posted by worker', async (done) => {
        postFertilizerRequest(fakeFertilizer, {user_id: worker.user_id}, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe("User does not have the following permission(s): add:fertilizers");
          done()
        })
      });

      test('should return 403 status if fertilizer is posted by unauthorized user', async (done) => {
        postFertilizerRequest(fakeFertilizer, {user_id: unAuthorizedUser.user_id}, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe("User does not have the following permission(s): add:fertilizers");
          done()
        })
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        postFertilizerRequest(fakeFertilizer, {user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done()
        })
      });

    })


  });
});
