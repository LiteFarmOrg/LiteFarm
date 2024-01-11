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

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';

describe('Animal Breed Tests', () => {
  let token;
  let farm;
  let newOwner;

  beforeAll(() => {
    token = global.token;
  });

  function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .get('/animal_breed?type_id=2')
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

  async function makeUserCreatedAnimalBreed(mainFarm) {
    const [animal_breed] = await mocks.animal_breedFactory({
      promisedFarm: [mainFarm],
      properties: {
        type_id: 2,
      },
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
  describe('Get animal breed tests', () => {
    test('All users should get animal breed by farm id (or null)', async () => {
      const roles = [1, 2, 3, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const animal_breed = await makeUserCreatedAnimalBreed(mainFarm);

        const res = await getRequestAsPromise({ user_id: user.user_id, farm_id: mainFarm.farm_id });

        expect(res.status).toBe(200);
        res.body.forEach((breed) => {
          expect({ farm_id: breed.farm_id }).toMatchObject({
            farm_id: breed.farm_id ? animal_breed.farm_id : null,
          });
          expect({ farm_id: breed.farm_id }).toMatchObject({
            farm_id: breed.farm_id ? animal_breed.farm_id : null,
          });
        });
      }
    });

    test('Unauthorized user should get 403 if they try to get animal breed by farm id (or null)', async () => {
      const { mainFarm } = await returnUserFarms(1);
      await makeUserCreatedAnimalBreed(mainFarm);
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
  });
});
