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

import server from './../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';

import animalTypeModel from '../src/models/animalTypeModel.js';

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';

describe('Animal Type Tests', () => {
  let token;

  beforeAll(() => {
    token = global.token;
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  function getRequest({ user_id, farm_id }, callback) {
    chai
      .request(server)
      .get('/animal_type')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  const getRequestAsPromise = util.promisify(getRequest);

  function postRequest(data, { user_id, farm_id }, callback) {
    chai
      .request(server)
      .post(`/animal_type`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }
  const postRequestAsPromise = util.promisify(postRequest);

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

  async function makeUserCreatedAnimalType(mainFarm) {
    const [animal_type] = await mocks.animal_typeFactory({
      promisedFarm: [mainFarm],
    });
    return animal_type;
  }

  // GET TESTS
  describe('GET animal type tests', () => {
    test('All users should get animal type by farm id (or null)', async () => {
      const roles = [1, 2, 3, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const animal_type = await makeUserCreatedAnimalType(mainFarm);

        const res = await getRequestAsPromise({ user_id: user.user_id, farm_id: mainFarm.farm_id });

        expect(res.status).toBe(200);
        res.body.forEach((type) => {
          expect({ farm_id: type.farm_id }).toMatchObject({
            farm_id: type.farm_id ? animal_type.farm_id : null,
          });
        });
      }
    });

    test('Unauthorized user should get 403 if they try to get animal type by farm id (or null)', async () => {
      const { mainFarm } = await returnUserFarms(1);
      await makeUserCreatedAnimalType(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await getRequestAsPromise({
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): get:animal_types',
      );
    });
  });

  // POST tests
  describe('POST animal type tests', () => {
    test('Admin users should be able to post new animal type', async () => {
      const adminRoles = [1, 2, 5];

      for (const role of adminRoles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const animal_type = mocks.fakeAnimalType();
        const res = await postRequestAsPromise(animal_type, {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });

        // Check response
        expect(res).toMatchObject({
          status: 201,
          body: {
            farm_id: mainFarm.farm_id,
            custom_type_name: animal_type.custom_type_name,
          },
        });

        // Check database
        const animal_types = await animalTypeModel
          .query()
          .context({ showHidden: true })
          .where('farm_id', mainFarm.farm_id)
          .andWhere('custom_type_name', animal_type.custom_type_name);

        expect(animal_types).toHaveLength(1);
      }
    });

    test('Worker should not be able to post new animal custom_type_name', async () => {
      const { mainFarm, user } = await returnUserFarms(3);

      const animal_type = mocks.fakeAnimalType();
      const res = await postRequestAsPromise(animal_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      // Check response
      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): add:animal_types',
      );

      const animal_types = await animalTypeModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', mainFarm.farm_id)
        .andWhere('custom_type_name', animal_type.custom_type_name);

      // Check database
      expect(animal_types).toHaveLength(0);
    });

    test('Creating the same type as an existing type on farm should return a conflict error', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const animal_type = mocks.fakeAnimalType();

      await postRequestAsPromise(animal_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      const res = await postRequestAsPromise(animal_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      // Check response
      expect(res.status).toBe(409);

      // Check database (no second record created)
      const animal_types = await animalTypeModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', mainFarm.farm_id)
        .andWhere('custom_type_name', animal_type.custom_type_name);

      expect(animal_types).toHaveLength(1);
    });

    test('Creating the same type as a deleted type should be allowed', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const animal_type = mocks.fakeAnimalType();

      await postRequestAsPromise(animal_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      await animalTypeModel
        .query()
        .context({ user_id: user.user_id, showHidden: true })
        .where('farm_id', mainFarm.farm_id)
        .andWhere('custom_type_name', animal_type.custom_type_name)
        .delete();

      const res = await postRequestAsPromise(animal_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      // Check response
      expect(res).toMatchObject({
        status: 201,
        body: {
          farm_id: mainFarm.farm_id,
          custom_type_name: animal_type.custom_type_name,
        },
      });

      // Check database
      const animal_types = await animalTypeModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', mainFarm.farm_id)
        .andWhere('custom_type_name', animal_type.custom_type_name);

      expect(animal_types).toHaveLength(2);
    });
  });
});
