/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file is part of LiteFarm.
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
const server = require('../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment');
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
const mocks = require('./mock.factories');

const locationModel = require('../src/models/locationModel');

describe('Location organic history tests', () => {
  function postRequest(url, data, farm_id, user_id, callback) {
    chai.request(server).post(`/location/${data.location_id}/organic_history`)
      .set('Content-Type', 'application/json')
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback)
  }

  // function getRequest(url, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
  //   chai.request(server).get(url)
  //     .set('user_id', user_id)
  //     .set('farm_id', farm_id)
  //     .end(callback)
  // }

  // function putSensorRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
  //   const { sensor_id } = data;
  //   chai.request(server).put(`/sensor/${sensor_id}`)
  //     .set('farm_id', farm_id)
  //     .set('user_id', user_id)
  //     .send(data)
  //     .end(callback)
  // }

  // function deleteRequest(url, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
  //   chai.request(server).delete(url)
  //     .set('user_id', user_id)
  //     .set('farm_id', farm_id)
  //     .end(callback)
  // }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  // function fakeSensor() {
  //   const sensor = mocks.fakeSensor();
  //   return ({ ...sensor, location_id: field.location_id });
  // }

  // async function getUser(roleName = 'owner') {
  //   let roleId = 1;

  //   switch (roleName) {
  //     case 'owner': roleId = 1; break;
  //     case 'manager': roleId = 2; break;
  //     case 'worker': roleId = 3; break;
  //     case 'eo': roleId = 5; break;
  //   }

  //   const [user] = await mocks.usersFactory();
  //   await mocks.userFarmFactory({
  //     promisedUser: [user],
  //     promisedFarm: [farm],
  //   }, fakeUserFarm(roleId));
  //   return user;
  // }

  // async function getUnauthorizedUser() {
  //   const [unauthorizedUser] = await mocks.usersFactory();
  //   const [theirFarm] = await mocks.farmFactory();
  //   await mocks.userFarmFactory({
  //     promisedUser: [unauthorizedUser],
  //     promisedFarm: [theirFarm],
  //   }, fakeUserFarm(1));
  //   return { unauthorizedUser, theirFarm };
  // }

  let owner;
  let farm;
  let location;

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    await mocks.userFarmFactory({
      promisedUser: [owner],
      promisedFarm: [farm],
    }, fakeUserFarm(1));
    [location] = await mocks.locationFactory({ promisedFarm: [farm] });

    const middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next();
    });
  })

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('POST to create a new organic history entry', () => {
    test('works for a field', async (done) => {
      await mocks.fieldFactory({
        promisedLocation: [location],
      });
      const cropLocation = await locationModel.query().context({ showHidden: true })
        .whereNotDeleted().findById(location.location_id)
        .withGraphFetched('[figure.[area], field]');
      postRequest(`/location/${cropLocation.location_id}/organic-history`,
        { location_id: cropLocation.location_id, to_state: 'Organic', effective_date: new Date() },
        farm.farm_id, owner.user_id,
        (err, res) => {
          expect(res.status).toBe(201);
          done();
        });
    })

    test('works for a garden', async (done) => {
      await mocks.gardenFactory({
        promisedLocation: [location],
      });
      const cropLocation = await locationModel.query().context({ showHidden: true })
        .whereNotDeleted().findById(location.location_id);
      postRequest(`/location/${cropLocation.location_id}/organic-history`,
        { location_id: cropLocation.location_id, to_state: 'Organic', effective_date: new Date() },
        farm.farm_id, owner.user_id,
        (err, res) => {
          expect(res.status).toBe(201);
          done();
        });
    })

    test('works for a greenhouse', async (done) => {
      await mocks.greenhouseFactory({
        promisedLocation: [location],
      });
      const cropLocation = await locationModel.query().context({ showHidden: true })
        .whereNotDeleted().findById(location.location_id);
      postRequest(`/location/${cropLocation.location_id}/organic-history`,
        { location_id: cropLocation.location_id, to_state: 'Organic', effective_date: new Date() },
        farm.farm_id, owner.user_id,
        (err, res) => {
          expect(res.status).toBe(201);
          done();
        });
    })
  });
});

/* global jest describe test expect beforeEach afterAll */