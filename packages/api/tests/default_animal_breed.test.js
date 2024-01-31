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

describe('Default Animal Breed Tests', () => {
  let farm;
  let newOwner;

  function getRequest(
    { user_id = newOwner.user_id, farm_id = farm.farm_id, query_params_string },
    callback,
  ) {
    chai
      .request(server)
      .get(`/default_animal_breeds?${query_params_string}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  const getRequestAsPromise = util.promisify(getRequest);

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

  async function makeDefaultAnimalBreed() {
    const [animal_breed] = await mocks.default_animal_breedFactory();
    return animal_breed;
  }

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

  // GET TESTS
  describe('Get default animal breed tests', () => {
    test('All users should get default animal breeds for a specific type', async () => {
      const roles = [1, 2, 3, 5];

      // Create two default breeds with two different default types
      const firstBreed = await makeDefaultAnimalBreed();
      await makeDefaultAnimalBreed();

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const res = await getRequestAsPromise({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
          query_params_string: `default_type_id=${firstBreed.default_type_id}`,
        });

        expect(res.status).toBe(200);
        // Should return first breed only
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toMatchObject(firstBreed);
      }
    });

    test('All users should get default animal breeds for all types', async () => {
      const roles = [1, 2, 3, 5];

      // Create two default breeds with two different default types
      await makeDefaultAnimalBreed();
      await makeDefaultAnimalBreed();

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const res = await getRequestAsPromise({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });

        expect(res.status).toBe(200);
        // Should return both breeds
        expect(res.body.length).toBe(2);
      }
    });
  });
});
