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

import chai from 'chai';

import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import server from '../src/server.js';
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
import locationModel from '../src/models/locationModel';

describe('Location organic history tests', () => {
  function postRequest(data, farm_id, user_id, callback) {
    chai
      .request(server)
      .post(`/location/organic_history`)
      .set('Content-Type', 'application/json')
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback);
  }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  let owner;
  let farm;
  let location;

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    await mocks.userFarmFactory(
      {
        promisedUser: [owner],
        promisedFarm: [farm],
      },
      fakeUserFarm(1),
    );
    [location] = await mocks.locationFactory({ promisedFarm: [farm] });
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('POST to create a new organic history entry', () => {
    ['field', 'garden', 'greenhouse'].map((type) => {
      test(`works for ${type}`, async (done) => {
        const something = await mocks[`${type}Factory`]({
          promisedLocation: [location],
        });
        const organicHistoryReqBody = mocks.fakeOrganicHistory({
          location_id: location.location_id,
        });
        postRequest(organicHistoryReqBody, farm.farm_id, owner.user_id, async (err, res) => {
          expect(res.status).toBe(201);
          const organicHistory = await knex('organic_history')
            .where({ location_id: location.location_id })
            .first();
          expect(organicHistory.organic_status).toBe(organicHistoryReqBody.organic_status);
          done();
        });
      });
    });

    ['buffer_zone', 'gate', 'barn'].map((type) => {
      test(`works for ${type}`, async (done) => {
        const something = await mocks[`${type}Factory`]({
          promisedLocation: [location],
        });
        const organicHistoryReqBody = mocks.fakeOrganicHistory({
          location_id: location.location_id,
        });
        postRequest(organicHistoryReqBody, farm.farm_id, owner.user_id, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
    });
  });
});
