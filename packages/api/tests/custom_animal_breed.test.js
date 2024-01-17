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

describe('Custom Animal Breed Tests', () => {
  let farm;
  let newOwner;
  let defaultTypeId;

  beforeAll(async () => {
    const [defaultAnimalType] = await mocks.default_animal_typeFactory();
    defaultTypeId = defaultAnimalType.id;
  });

  function getRequest(
    { user_id = newOwner.user_id, farm_id = farm.farm_id, query_params_string },
    callback,
  ) {
    chai
      .request(server)
      .get(`/custom_animal_breeds?${query_params_string}`)
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

  async function makeCustomAnimalBreed(mainFarm, properties) {
    const [animal_breed] = await mocks.custom_animal_breedFactory({
      promisedFarm: [mainFarm],
      properties,
    });
    return animal_breed;
  }

  beforeEach(async () => {
    [farm] = await mocks.farmFactory();
    [newOwner] = await mocks.usersFactory();
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  // GET TESTS
  describe('Get custom animal breed tests', () => {
    test('All users should get custom animal breeds for a default type', async () => {
      const roles = [1, 2, 3, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        // Create two breeds, one with the default type and one with a custom one
        const firstBreed = await makeCustomAnimalBreed(mainFarm, {
          default_type_id: defaultTypeId,
        });
        await makeCustomAnimalBreed(mainFarm);

        const res = await getRequestAsPromise({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
          query_params_string: `default_type_id=${defaultTypeId}`,
        });

        expect(res.status).toBe(200);
        // Should return breed with default type only
        expect(res.body.length).toBe(1);
        expect(res.body[0].farm_id).toBe(mainFarm.farm_id);
        expect(firstBreed).toMatchObject(res.body[0]);
      }
    });

    test('All users should get custom animal breeds for a custom type', async () => {
      const roles = [1, 2, 3, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        // Create two breeds, one with the default type and one with a custom one
        await makeCustomAnimalBreed(mainFarm, {
          default_type_id: defaultTypeId,
        });
        const secondBreed = await makeCustomAnimalBreed(mainFarm);

        const res = await getRequestAsPromise({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
          query_params_string: `custom_type_id=${secondBreed.custom_type_id}`,
        });

        expect(res.status).toBe(200);
        // Should return breed with custom type only
        expect(res.body.length).toBe(1);
        expect(res.body[0].farm_id).toBe(mainFarm.farm_id);
        expect(secondBreed).toMatchObject(res.body[0]);
      }
    });

    test('All users should get custom animal breeds for all types', async () => {
      const roles = [1, 2, 3, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        // Create two breeds with different types
        await makeCustomAnimalBreed(mainFarm);
        await makeCustomAnimalBreed(mainFarm);

        const res = await getRequestAsPromise({ user_id: user.user_id, farm_id: mainFarm.farm_id });

        expect(res.status).toBe(200);
        // Should return both breeds
        expect(res.body.length).toBe(2);
        res.body.forEach((breed) => {
          expect(breed.farm_id).toBe(mainFarm.farm_id);
        });
      }
    });

    test('Unauthorized user should get 403 if they try to get custom animal breeds', async () => {
      const { mainFarm } = await returnUserFarms(1);
      await makeCustomAnimalBreed(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await getRequestAsPromise({
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): get:animal_breeds',
      );
    });

    test('Returns 400 if both default and custom type ID are specified', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const res = await getRequestAsPromise({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
        query_params_string: 'default_type_id=1&custom_type_id=1',
      });

      expect(res.status).toBe(400);
    });
  });
});
