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

import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
import mocks from './mock.factories.js';

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);

async function returnUserFarms(role) {
  const [mainFarm] = await mocks.farmFactory();
  const [user] = await mocks.usersFactory();

  await mocks.userFarmFactory(
    {
      promisedUser: [user],
      promisedFarm: [mainFarm],
    },
    { ...mocks.fakeUserFarm(), role_id: role },
  );
  return { mainFarm, user };
}

describe('Animal identifier type tests', () => {
  describe('GET /animal_identifier_type', () => {
    let farm;
    let newOwner;

    beforeEach(async () => {
      [farm] = await mocks.farmFactory();
      [newOwner] = await mocks.usersFactory();
    });

    afterEach(async (done) => {
      await tableCleanup(knex);
      done();
    });

    afterAll(async (done) => {
      await knex.destroy();
      done();
    });

    test('should return all animal identifiers for all users', async () => {
      const mockIdentifiers = await mocks.animal_identifier_typeFactory(3);
      const requester = chai.request(server).keepOpen();

      async function makeRequest(user) {
        const {
          user: { user_id },
          mainFarm: { farm_id },
        } = await returnUserFarms(user);

        const response = await requester
          .get('/animal_identifier_type')
          .set('user_id', user_id)
          .set('farm_id', farm_id);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(mockIdentifiers);
      }

      await Promise.all([1, 2, 3, 5].map(makeRequest));
      requester.close();
    });
  });
});
