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
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';

import customAnimalTypeModel from '../src/models/customAnimalTypeModel.js';

describe('Custom Animal Type Tests', () => {
  let token;

  beforeAll(() => {
    token = global.token;
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  async function getRequest({ user_id, farm_id }, query = '') {
    return await chai
      .request(server)
      .get(`/custom_animal_types${query}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  function postRequest(data, { user_id, farm_id }) {
    return chai
      .request(server)
      .post(`/custom_animal_types`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
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

  async function makeUserCreatedAnimalType(mainFarm, properties = {}) {
    const [custom_animal_type] = await mocks.custom_animal_typeFactory({
      promisedFarm: [mainFarm],
      properties,
    });
    return custom_animal_type;
  }

  // GET TESTS
  describe('GET custom animal type tests', () => {
    test('All farm users should get custom animal type by farm id', async () => {
      const roles = [1, 2, 3, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const custom_animal_type = await makeUserCreatedAnimalType(mainFarm);

        const res = await getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id });

        expect(res.status).toBe(200);
        res.body.forEach((type) => {
          expect(type.farm_id).toBe(custom_animal_type.farm_id);
        });
      }
    });

    test('Unauthorized user should get 403 if they try to get custom animal type by farm id', async () => {
      const { mainFarm } = await returnUserFarms(1);
      await makeUserCreatedAnimalType(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await getRequest({
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): get:animal_types',
      );
    });

    test(`Should not get other farms' types`, async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [secondFarm] = await mocks.farmFactory();

      // make types for the farm and another farm
      await makeUserCreatedAnimalType(mainFarm);
      await makeUserCreatedAnimalType(secondFarm);

      const resWithoutCount = await getRequest({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      const resWithCount = await getRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        '?count=true',
      );

      expect(resWithoutCount.body.length).toBe(1);
      expect(resWithCount.body.length).toBe(1);
    });

    test('Should not get deleted types', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      // make an active type and a deleted type
      await makeUserCreatedAnimalType(mainFarm);
      await makeUserCreatedAnimalType(mainFarm, { deleted: true });

      const resWithoutCount = await getRequest({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      const resWithCount = await getRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        '?count=true',
      );

      expect(resWithoutCount.body.length).toBe(1);
      expect(resWithCount.body.length).toBe(1);
    });

    test('Should get counts with count=true query', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      // typeId will be added later
      const animalBatchTypeCounts = [
        { animalCount: 0, batchCounts: [] },
        { animalCount: 1, batchCounts: [] },
        { animalCount: 0, batchCounts: [2, 40] },
        { animalCount: 11, batchCounts: [20, 40, 60, 80, 100] },
      ];

      // make animals and batches
      for (const animalBatchTypeCount of animalBatchTypeCounts) {
        const { animalCount, batchCounts } = animalBatchTypeCount;
        const type = await makeUserCreatedAnimalType(mainFarm);

        // add type to animalBatchTypeCounts for validation later
        animalBatchTypeCount.typeId = type.id;

        for (let i = 0; i < animalCount; i++) {
          await mocks.animalFactory({
            promisedFarm: [mainFarm],
            promisedDefaultAnimalType: [() => ({})],
            properties: { custom_type_id: type.id },
          });
        }
        for (const batchCount of batchCounts) {
          await mocks.animal_batchFactory({
            promisedFarm: [mainFarm],
            promisedDefaultAnimalType: [() => ({})],
            promisedDefaultAnimalBreed: [() => ({})],
            properties: { custom_type_id: type.id, count: batchCount },
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

    test('Deleted animals or batches should not be counted', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const type = await makeUserCreatedAnimalType(mainFarm);

      // make active animal, active batch(50), deleted animal and deleted batch(50)
      for (let i = 0; i < 2; i++) {
        await mocks.animalFactory({
          promisedFarm: [mainFarm],
          promisedDefaultAnimalType: [() => ({})],
          properties: { custom_type_id: type.id, deleted: i % 2 === 0 },
        });

        await mocks.animal_batchFactory({
          promisedFarm: [mainFarm],
          promisedDefaultAnimalType: [() => ({})],
          promisedDefaultAnimalBreed: [() => ({})],
          properties: { custom_type_id: type.id, count: 50, deleted: i % 2 === 0 },
        });
      }

      const res = await getRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        '?count=true',
      );

      expect(res.body[0].count).toBe(51);
    });
  });

  // POST tests
  describe('POST custom animal type tests', () => {
    test('Admin users should be able to post new custom animal type', async () => {
      const adminRoles = [1, 2, 5];

      for (const role of adminRoles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const animal_type = mocks.fakeCustomAnimalType();
        const res = await postRequest(animal_type, {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });

        // Check response
        expect(res).toMatchObject({
          status: 201,
          body: {
            farm_id: mainFarm.farm_id,
            type: animal_type.type,
          },
        });

        // Check database
        const animal_types = await customAnimalTypeModel
          .query()
          .context({ showHidden: true })
          .where('farm_id', mainFarm.farm_id)
          .andWhere('type', animal_type.type);

        expect(animal_types).toHaveLength(1);
      }
    });

    test('Worker should not be able to post new animal custom animal type', async () => {
      const { mainFarm, user } = await returnUserFarms(3);

      const animal_type = mocks.fakeCustomAnimalType();
      const res = await postRequest(animal_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      // Check response
      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): add:animal_types',
      );

      const animal_types = await customAnimalTypeModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', mainFarm.farm_id)
        .andWhere('type', animal_type.type);

      // Check database
      expect(animal_types).toHaveLength(0);
    });

    test('Creating the same type as an existing type on farm should return a conflict error', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const animal_type = mocks.fakeCustomAnimalType();

      await postRequest(animal_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      const res = await postRequest(animal_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      // Check response
      expect(res.status).toBe(409);

      // Check database (no second record created)
      const animal_types = await customAnimalTypeModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', mainFarm.farm_id)
        .andWhere('type', animal_type.type);

      expect(animal_types).toHaveLength(1);
    });

    test('Creating the same type as a deleted type should be allowed', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const animal_type = mocks.fakeCustomAnimalType();

      await postRequest(animal_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      await customAnimalTypeModel
        .query()
        .context({ user_id: user.user_id, showHidden: true })
        .where('farm_id', mainFarm.farm_id)
        .andWhere('type', animal_type.type)
        .delete();

      const res = await postRequest(animal_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      // Check response
      expect(res).toMatchObject({
        status: 201,
        body: {
          farm_id: mainFarm.farm_id,
          type: animal_type.type,
        },
      });

      // Check database
      const animal_types = await customAnimalTypeModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', mainFarm.farm_id)
        .andWhere('type', animal_type.type);

      expect(animal_types).toHaveLength(2);
    });
  });
});
