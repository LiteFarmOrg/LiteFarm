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
import util from 'util';

import chaiHttp from 'chai-http';
chai.use(chaiHttp);

import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';

describe('Animal Identifier Color Tests', () => {
  let farm;
  let newOwner;

  function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    return chai
      .request(server)
      .get('/animal_identifier_colors')
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

  async function makeAnimalIdentifierColor(properties) {
    const [animalIdentifierColor] = await mocks.animal_identifier_colorFactory({
      properties,
    });
    return animalIdentifierColor;
  }

  beforeEach(async () => {
    [farm] = await mocks.farmFactory();
    [newOwner] = await mocks.usersFactory();
  });

  afterEach(async () => {
    await tableCleanup(knex);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  // GET TESTS
  describe('Get animal identifier color tests', () => {
    test('All users should get animal identifier colors', async () => {
      const roles = [1, 2, 3, 5];
      const firstAnimalIdentifierColor = await makeAnimalIdentifierColor();
      const secondAnimalIdentifierColor = await makeAnimalIdentifierColor();

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const res = await getRequest({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });

        expect(res.status).toBe(200);
        // Should return both colors
        expect(res.body.length).toBe(2);
        expect(firstAnimalIdentifierColor).toMatchObject(res.body[0]);
        expect(secondAnimalIdentifierColor).toMatchObject(res.body[1]);
      }
    });
  });
});
