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

const diseaseModel = require('../src/models/diseaseModel');

describe('Disease Tests', () => {
  let middleware;
  let owner;
  let farm;

  beforeAll(() => {
    token = global.token;
  });

  function postRequest(data, {user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).post(`/disease/farm/${farm_id}`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function getRequest({user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).get(`/disease/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function deleteRequest({user_id = owner.user_id, farm_id = farm.farm_id, disease_id}, callback) {
    chai.request(server).delete(`/disease/${disease_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function fakeUserFarm(role) {
    return ({...mocks.fakeUserFarm(),role_id:role});
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({promisedUser:[owner], promisedFarm:[farm]}, fakeUserFarm(1));

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next();
    });
  });

  afterEach(async () => {
    await knex.raw(`
    DELETE FROM "cropDisease";
    DELETE FROM "crop";
    DELETE FROM "disease";
    DELETE FROM "userFarm";
    DELETE FROM "farm";
    DELETE FROM "users";
    `);
  });

  describe('Get && delete disease', () => {
    let disease;
    let worker;
    let manager;
    let unauthorizedUser;
    let unauthorizedFarmUser;

    beforeEach(async () => {
      [disease] = await mocks.diseaseFactory({promisedFarm: [farm]});

      [worker] = await mocks.usersFactory();
      const [workerFarm] = await mocks.userFarmFactory({promisedUser:[worker], promisedFarm:[farm]}, fakeUserFarm(3));
      [manager] = await mocks.usersFactory();
      const [managerFarm] = await mocks.userFarmFactory({promisedUser:[manager], promisedFarm:[farm]}, fakeUserFarm(2));


      [unauthorizedUser] = await mocks.usersFactory();
      [unauthorizedFarmUser] = await mocks.farmFactory();
      const [unauthorizedUserFarm] = await mocks.userFarmFactory({promisedUser:[unauthorizedUser], promisedFarm:[unauthorizedFarmUser]}, fakeUserFarm(1));
    });

    test('Should fail to get deleted disease', async (done) => {
      await diseaseModel.query().findById(disease.disease_id).del();
      getRequest({user_id: owner.user_id}, (err, res) => {
        // console.log(res.error,res.body);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
        done();
      });
    });

    describe('Get disease authorization tests', () => {
      test('Owner should get disease by farm id', async (done) => {
        getRequest({user_id: owner.user_id}, (err, res) => {
          // console.log(res.error, res.body);
          expect(res.status).toBe(200);
          expect(res.body[0].disease_id).toBe(disease.disease_id);
          done();
        });
      });

      test('Manager should get disease by farm id', async (done) => {
        getRequest({user_id: manager.user_id}, (err, res) => {
          // console.log(res.error, res.body);
          expect(res.status).toBe(200);
          expect(res.body[0].disease_id).toBe(disease.disease_id);
          done();
        });
      });

      test('Worker should get disease by farm id', async (done) => {
        getRequest({user_id: worker.user_id}, (err, res) => {
          // console.log(res.error, res.body);
          expect(res.status).toBe(200);
          expect(res.body[0].disease_id).toBe(disease.disease_id);
          done();
        });
      });

      test('Return 403 if unauthorized user tries to get disease by farm id', async (done) => {
        getRequest({user_id: unauthorizedUser.user_id}, (err, res) => {
          // console.log(res.error, res.body);
          expect(res.status).toBe(403);
          done();
        });
      });
    });

    describe('Delete disease authorization tests', () => {
      test('Owner should delete a disease', async (done) => {
        deleteRequest({disease_id: disease.disease_id}, async (err, res) => {
          // console.log(disease.deleted,res.error);
          expect(res.status).toBe(200);
          const diseaseRes = await diseaseModel.query().where('disease_id', disease.disease_id);
          expect(diseaseRes.length).toBe(1);
          expect(diseaseRes[0].deleted).toBe(true);
          done();
        });
      });

      test('Manager should delete a disease', async (done) => {
        deleteRequest({user_id: manager.user_id, disease_id: disease.disease_id}, async (err, res) => {
          // console.log(disease.deleted,res.error);
          expect(res.status).toBe(200);
          const diseaseRes = await diseaseModel.query().where('disease_id',disease.disease_id);
          expect(diseaseRes.length).toBe(1);
          expect(diseaseRes[0].deleted).toBe(true);
          done();
        });
      });
    });
  });
});
