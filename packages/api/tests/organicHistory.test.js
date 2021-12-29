/*
 *  Copyright 2019-2022 LiteFarm.org
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

const OrganicHistory = require('../src/models/organicHistoryModel');

describe('Location organic history tests', () => {
  function postRequest(data, farm_id, user_id, callback) {
    chai.request(server).post('/location/organic_history')
      .set('Content-Type', 'application/json')
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback);
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

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
    ['field', 'garden', 'greenhouse'].map(type => {
      test(`works for ${type}`, async (done) => {
        const something = await mocks[`${type}Factory`]({
          promisedLocation: [location],
        });
        const organicHistoryReqBody = mocks.fakeOrganicHistory({ location_id: location.location_id });
        postRequest(
          organicHistoryReqBody,
          farm.farm_id, owner.user_id,
          async (err, res) => {
            expect(res.status).toBe(201);
            const organicHistory = await knex('organic_history').where({ location_id: location.location_id }).first();
            expect(organicHistory.organic_status).toBe(organicHistoryReqBody.organic_status);
            done();
          });
      });
    });

    ['buffer_zone', 'gate', 'barn'].map(type => {
      test(`works for ${type}`, async (done) => {
        const something = await mocks[`${type}Factory`]({
          promisedLocation: [location],
        });
        const organicHistoryReqBody = mocks.fakeOrganicHistory({ location_id: location.location_id });
        postRequest(
          organicHistoryReqBody,
          farm.farm_id, owner.user_id,
          async (err, res) => {
            expect(res.status).toBe(400);
            done();
          });
      });
    });
  });

  describe('Determine a location\'s organic status', () => {
    describe('for a specific date', () => {
      test('with a complex history', async (done) => {
        const promisedLocation = [location];
        const promisedArea = await mocks.areaFactory({ promisedFarm: farm, promisedLocation });
        const promisedField = await mocks.fieldFactory({ promisedFarm: farm, promisedLocation, promisedArea });
        const statuses = ['Non-Organic', 'Transitional', 'Organic'];

        for (let i = 0; i < statuses.length; i++) {
          await mocks.organic_historyFactory({ promisedFarm: farm, promisedLocation, promisedArea, promisedField },
            mocks.fakeOrganicHistory({ effective_date: `2020-01-0${2 * i + 1}`, organic_status: statuses[i] }));
        }

        for (let i = 1; i < 7; i++) {
          expect(await OrganicHistory.getOrganicStatus(location.location_id, `2020-01-0${i}`)).toEqual(statuses[Math.floor((i - 1) / 2)]);
        }
        done();
      });

      test('with no history', async (done) => {
        expect(await OrganicHistory.getOrganicStatus(location.location_id, '2020-01-01')).toBeFalsy();
        done();
      });
    });

    describe('for a date range', () => {
      test('with a complex history', async (done) => {
        const promisedLocation = [location];
        const promisedArea = await mocks.areaFactory({ promisedFarm: farm, promisedLocation });
        const promisedField = await mocks.fieldFactory({ promisedFarm: farm, promisedLocation, promisedArea });
        const statuses = ['Non-Organic', 'Transitional', 'Organic'];

        for (let i = 0; i < statuses.length; i++) {
          await mocks.organic_historyFactory({ promisedFarm: farm, promisedLocation, promisedArea, promisedField },
            mocks.fakeOrganicHistory({ effective_date: `2020-01-0${2 * i + 1}`, organic_status: statuses[i] }));
        }

        let expected = 'Non-Organic';
        expect(await OrganicHistory.getOrganicStatusForDateRange(location.location_id, '2019-12-31', '2020-01-01')).toEqual(expected);
        expect(await OrganicHistory.getOrganicStatusForDateRange(location.location_id, '2020-01-01', '2020-01-01')).toEqual(expected);

        expected = 'Transitional';
        expect(await OrganicHistory.getOrganicStatusForDateRange(location.location_id, '2020-01-01', '2020-01-03')).toEqual(expected);
        expect(await OrganicHistory.getOrganicStatusForDateRange(location.location_id, '2020-01-03', '2020-01-04')).toEqual(expected);
        expect(await OrganicHistory.getOrganicStatusForDateRange(location.location_id, '2020-01-04', '2020-01-05')).toEqual(expected);
        expect(await OrganicHistory.getOrganicStatusForDateRange(location.location_id, '2020-01-04', '2020-01-09')).toEqual(expected);
        expect(await OrganicHistory.getOrganicStatusForDateRange(location.location_id, '2020-01-01', '2020-01-09')).toEqual(expected);
        expect(await OrganicHistory.getOrganicStatusForDateRange(location.location_id, '2019-01-01', '2020-01-09')).toEqual(expected);

        expected = 'Organic';
        expect(await OrganicHistory.getOrganicStatusForDateRange(location.location_id, '2020-01-05', '2020-01-05')).toEqual(expected);
        expect(await OrganicHistory.getOrganicStatusForDateRange(location.location_id, '2020-01-05', '2020-01-06')).toEqual(expected);
        expect(await OrganicHistory.getOrganicStatusForDateRange(location.location_id, '2020-01-06', '2020-01-07')).toEqual(expected);
        expect(await OrganicHistory.getOrganicStatusForDateRange(location.location_id, '2020-02-01', '2020-12-31')).toEqual(expected);

        done();
      });

      test('with no history', async (done) => {
        expect(await OrganicHistory.getOrganicStatusForDateRange(location.location_id, '2019-01-01', '2019-12-31')).toBeFalsy();
        done();
      });

      test('with bad date range', async (done) => {
        expect(await OrganicHistory.getOrganicStatusForDateRange(location.location_id, '2020-01-05', '2020-01-01')).toBeFalsy();
        done();
      });
    });
  });
});

/* global jest describe test expect beforeEach afterAll */
