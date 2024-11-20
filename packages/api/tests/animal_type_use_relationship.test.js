/*
 *  Copyright 2024 LiteFarm.org
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
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';

describe('Animal Type Use Relationship Tests', () => {
  let farm;
  let newOwner;

  const getRequest = async ({ user_id = newOwner.user_id, farm_id = farm.farm_id }) => {
    const response = await chai
      .request(server)
      .get('/animal_type_use_relationships')
      .set('user_id', user_id)
      .set('farm_id', farm_id);

    return response;
  };

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

  async function makeAnimalUse(properties) {
    const [animalUse] = await mocks.animal_useFactory({
      properties,
    });
    return animalUse;
  }

  async function makeAnimalTypeUseRelationship(defaultType, use) {
    const [animalTypeUseRelationship] = await mocks.animal_type_use_relationshipFactory({
      promisedDefaultAnimalType: [defaultType],
      promisedAnimalUse: [use],
    });
    return animalTypeUseRelationship;
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

  describe('Get animal type use relationship tests', () => {
    test('All users should get animal type use relationships', async () => {
      const roles = [1, 2, 3, 5];
      const [use1, use2, use3, use4, use5, use6, use7, use8] = await Promise.all(
        [1, 2, 3, 4, 5, 6, 7, 8].map(async () => await makeAnimalUse()),
      );

      const [defaultType1] = await mocks.default_animal_typeFactory();
      const [defaultType2] = await mocks.default_animal_typeFactory();

      const testCase = [
        { defaultType: defaultType1, uses: [use1, use2, use3, use6, use7, use8] },
        { defaultType: defaultType2, uses: [use1, use5, use6, use7, use8] },
      ];

      for (let { defaultType, uses } of testCase) {
        if (defaultType) {
          for (let use of uses) {
            await makeAnimalTypeUseRelationship(defaultType, use);
          }
        }
      }

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const res = await getRequest({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(11);
        const filteredDefaultType1 = res.body.filter(
          (useRelationship) => useRelationship.default_type_id === defaultType1.id,
        );
        expect(filteredDefaultType1.length).toBe(6);
        const filteredDefaultType2 = res.body.filter(
          (useRelationship) => useRelationship.default_type_id === defaultType2.id,
        );
        expect(filteredDefaultType2.length).toBe(5);
      }
    });
  });
});
