/*
 *  Copyright (c) 2024 LiteFarm.org
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

import server from './../src/server.js';
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

describe('Soil Amendment Purpose Test', () => {
  let token;

  beforeAll(() => {
    token = global.token;
  });

  afterEach(async (done) => {
    await tableCleanup(knex);
    done();
  });

  afterAll(async (done) => {
    await knex.destroy();
    done();
  });

  async function getRequest({ user_id, farm_id }) {
    return await chai
      .request(server)
      .get('/soil_amendment_purpose')
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  async function returnUserFarms(role) {
    const [mainFarm] = await mocks.farmFactory();
    const [user] = await mocks.usersFactory();

    await mocks.userFarmFactory(
      {
        promisedUser: [user],
        promisedFarm: [mainFarm],
      },
      fakeUserFarm(role),
    );
    return { mainFarm, user };
  }

  async function makeSoilAmendmentPurpose() {
    const [soil_amendment_purpose] = await mocks.soil_amendment_purposeFactory();
    return soil_amendment_purpose;
  }

  // GET TESTS
  describe('GET soil amendment purpose tests', () => {
    test('All farm users should get soil amendment purpose', async () => {
      const roles = [1, 2, 3, 5];
      await makeSoilAmendmentPurpose();
      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const res = await getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id });
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
      }
    });

    test('Unauthorized user should also get soil amendment purpose', async () => {
      const { mainFarm } = await returnUserFarms(1);

      await makeSoilAmendmentPurpose();

      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await getRequest({
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });
});
