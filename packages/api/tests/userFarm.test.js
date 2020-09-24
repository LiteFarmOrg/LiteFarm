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
const moment = require('moment')
chai.use(chaiHttp);
const server = require('./../src/server');
const Knex = require('knex')
const environment = 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);
const { tableCleanup } = require('./testEnvironment');
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
jest.mock('../src/templates/sendEmailTemplate');
const mocks  = require('./mock.factories');
const userFarmModel = require('../src/models/userFarmModel');
const userModel = require('../src/models/userModel');

describe('User Farm Tests', () => {
  let middleware;
  let owner;
  let worker;
  let manager;
  let unauthorizedUser;

  let farm;
  let unauthorizedFarm;

  beforeAll(() => {
    token = global.token;
  });

  function getUserFarmsOfUserRequest({user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).get(`/user_farm/user/${user_id}`)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function updateUserFarmConsentRequest({user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).patch(`/user_farm/consent/farm/${farm_id}/user/${user_id}`)
      .send({has_consent: true, consent_version: '3.0'})
      .end(callback);
  }

  function addUserFarmRequest(data, {user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).post(`/user_farm`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function deleteRequest({user_id = owner.user_id, farm_id = farm.farm_id, disease_id}, callback) {
    chai.request(server).delete(`/disease/${disease_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function fakeUserFarm(role_id=1, status='Active', has_consent=true) {
    return ({
      ...mocks.fakeUserFarm(),
      role_id,
      status,
      has_consent
    });
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({promisedUser:[owner], promisedFarm:[farm]}, fakeUserFarm(1));

    [worker] = await mocks.usersFactory();
    const [workerFarm] = await mocks.userFarmFactory({promisedUser:[worker], promisedFarm:[farm]}, fakeUserFarm(3));
    [manager] = await mocks.usersFactory();
    const [managerFarm] = await mocks.userFarmFactory({promisedUser:[manager], promisedFarm:[farm]}, fakeUserFarm(2));


    [unauthorizedUser] = await mocks.usersFactory();
    [unauthorizedFarm] = await mocks.farmFactory();
    const [unauthorizedUserFarm] = await mocks.userFarmFactory({promisedUser:[unauthorizedUser], promisedFarm:[unauthorizedFarm]}, fakeUserFarm(1));

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next();
    });
  });

  afterEach(async () => {
    await tableCleanup(knex);
  });

  test('Get all user farms of a user', async (done) => {
    [farm2] = await mocks.farmFactory();
    [farm3] = await mocks.farmFactory();
    const [workerFarm2] = await mocks.userFarmFactory({promisedUser:[worker], promisedFarm:[farm2]}, fakeUserFarm(3));
    const [workerFarm3] = await mocks.userFarmFactory({promisedUser:[worker], promisedFarm:[farm3]}, fakeUserFarm(3));
    getUserFarmsOfUserRequest({user_id: worker.user_id}, async (err, res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body[0].farm_id).toBe(farm.farm_id);
      expect(res.body[1].farm_id).toBe(farm2.farm_id);
      expect(res.body[2].farm_id).toBe(farm3.farm_id);
      done();
    });
  });

  test('Update consent status for user farm', async (done) => {
    [noConsentUser] = await mocks.usersFactory();
    const [noConsentUserFarm] = await mocks.userFarmFactory({promisedUser:[noConsentUser], promisedFarm:[farm]}, fakeUserFarm(3, 'Active', false));
    let targetUser = await userFarmModel.query().where('user_id', noConsentUser.user_id).first();
    expect(targetUser.has_consent).toBe(false);
    updateUserFarmConsentRequest({user_id: noConsentUser.user_id}, async (err, res) => {
      expect(res.status).toBe(200);
      targetUser = await userFarmModel.query().where('user_id', noConsentUser.user_id).first();
      expect(targetUser.has_consent).toBe(true);
      done();
    });
  });

  xdescribe('Get user farm info by farm: authorization tests', () => {
    describe('Get all user farm info', () => {
      test('Owner should get all user farm info', async (done) => {

      });

      test('Manager should get all user farm info', async (done) => {

      });

      test('Worker should get all user farm limited info', async (done) => {

      });

      test('Return 403 if unauthorized user tries to get all user farm info', async (done) => {

      });
    });

    describe('Get active user farm info', () => {
      test('Owner should get active user farm info', async (done) => {

      });

      test('Manager should get active user farm info', async (done) => {

      });

      test('Worker should get active user farm limited info', async (done) => {

      });

      test('Return 403 if unauthorized user tries to get active user farm info', async (done) => {

      });
    });
  });

  xdescribe('Add user farm: authorization tests', () => {
    let userFarmToAdd;
    beforeEach(async () => {
      userFarmToAdd = fakeUserFarm();
    });

    test('Owner should successfully add user farm', async (done) => {
      addUserFarmRequest(userFarmToAdd, {user_id: owner.user_id}, async (err, res) => {
        expect(res.status).toBe(201);
        const addedUserFarm = await diseaseModel.query().where('farm_id', farm.farm_id);
        addedUserFarm = addedUserFarm[addedUserFarm.length - 1];
        expect(addedUserFarm.role_id).toBe(userFarmToAdd.role_id);
        expect(addedUserFarm.status).toBe(userFarmToAdd.status);
        expect(addedUserFarm.has_consent).toBe(userFarmToAdd.has_consent);
        done();
      });
    });
  });

  xdescribe('Update user farm: authorization tests', () => {
    describe('Update user farm role', () => {
      test('Owner should update user farm role', async (done) => {

      });

      test('Manager should update user farm role', async (done) => {

      });

      test('Return 403 if worker tries to update user farm role', async (done) => {

      });

      test('Return 403 if unauthorized user tries to update user farm role', async (done) => {

      });
    });

    describe('Update user farm status', () => {
      test('Owner should update user farm status', async (done) => {

      });

      test('Manager should update user farm status', async (done) => {

      });

      test('Return 403 if worker tries to update user farm status', async (done) => {

      });

      test('Return 403 if unauthorized user tries to update user farm status', async (done) => {

      });
    });

    describe('Update user farm wage', () => {
      test('Owner should update user farm wage', async (done) => {

      });

      test('Manager should update user farm wage', async (done) => {

      });

      test('Return 403 if worker tries to update user farm wage', async (done) => {

      });

      test('Return 403 if unauthorized user tries to update user farm wage', async (done) => {

      });
    });
  });
});
