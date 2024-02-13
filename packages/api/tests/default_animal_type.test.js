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

describe('Default Animal Type Tests', () => {
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

  async function getRequest({ user_id, farm_id }, query = '') {
    return await chai
      .request(server)
      .get(`/default_animal_types${query}`)
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

  async function makeDefaultAnimalType() {
    const [default_animal_type] = await mocks.default_animal_typeFactory();
    return default_animal_type;
  }

  // GET TESTS
  describe('GET animal type tests', () => {
    test('All farm users should get default animal types', async () => {
      const roles = [1, 2, 3, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        await makeDefaultAnimalType();

        const res = await getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id });

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
      }
    });

    test('Unauthorized user should also get default animal types', async () => {
      const { mainFarm } = await returnUserFarms(1);

      await makeDefaultAnimalType();

      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await getRequest({
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    test('Should get counts with count=true query', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      // typeId will be added later
      const animalBatchTypeCounts = [
        { animalCount: 0, batchCounts: [] },
        { animalCount: 5, batchCounts: [] },
        { animalCount: 0, batchCounts: [20, 81] },
        { animalCount: 7, batchCounts: [20, 20, 150] },
      ];

      // make types, animals and batches
      for (const animalBatchTypeCount of animalBatchTypeCounts) {
        const type = await makeDefaultAnimalType();

        // add typeId to animalBatchTypeCounts for validation later
        animalBatchTypeCount.typeId = type.id;

        const { animalCount, batchCounts } = animalBatchTypeCount;
        for (let i = 0; i < animalCount; i++) {
          await mocks.animalFactory({
            promisedFarm: [mainFarm],
            promisedDefaultAnimalType: [type],
          });
        }
        for (const batchCount of batchCounts) {
          await mocks.animal_batchFactory({
            promisedFarm: [mainFarm],
            promisedDefaultAnimalType: [type],
            promisedDefaultAnimalBreed: [() => ({})],
            properties: { count: batchCount },
          });
        }
      }

      const res = await getRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        '?count=true',
      );

      res.body.forEach(({ id, count }) => {
        const expectedCountsData = animalBatchTypeCounts.find(({ typeId }) => id === typeId);
        const expectedCount =
          expectedCountsData.animalCount +
          expectedCountsData.batchCounts.reduce((acc, currentValue) => acc + currentValue, 0);

        expect(count).toBe(expectedCount);
      });
    });
  });
});
