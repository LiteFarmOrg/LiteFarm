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

describe('Animal Batch Tests', () => {
  let farm;
  let newOwner;
  let defaultBreedId;
  let defaultTypeId;

  beforeAll(async () => {
    const [defaultAnimalBreed] = await mocks.default_animal_breedFactory();
    defaultBreedId = defaultAnimalBreed.id;
    defaultTypeId = defaultAnimalBreed.default_type_id;
  });

  function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .get('/animal_batch')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  const getRequestAsPromise = util.promisify(getRequest);

  function postRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, data, callback) {
    chai
      .request(server)
      .post('/animal_batch')
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

  async function makeAnimalBatch(mainFarm, properties) {
    const [animalBatch] = await mocks.animalBatchFactory({
      promisedFarm: [mainFarm],
      properties,
    });
    return animalBatch;
  }

  async function makeAnimalSex(properties) {
    const [animalSex] = await mocks.animal_sexFactory({
      properties,
    });
    return animalSex;
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
  describe('Get animal batches tests', () => {
    test('All users should get animal batches for their farm', async () => {
      const roles = [1, 2, 3, 5];
      const animalSex1 = await makeAnimalSex();
      const animalSex2 = await makeAnimalSex();
      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const [secondFarm] = await mocks.farmFactory();
        // Create two animal batches, one with sex detail and one without
        const firstAnimalBatch = await makeAnimalBatch(mainFarm, {
          default_breed_id: defaultBreedId,
          default_type_id: defaultTypeId,
          count: 6,
          animal_batch_sex_detail: [
            {
              sex_id: animalSex1.id,
              count: 2,
            },
            {
              sex_id: animalSex2.id,
              count: 4,
            },
          ],
        });
        const secondAnimalBatch = await makeAnimalBatch(mainFarm, {
          default_breed_id: defaultBreedId,
          default_type_id: defaultTypeId,
        });

        // Create a third animal belonging to a different farm
        await makeAnimalBatch(secondFarm, {
          default_breed_id: defaultBreedId,
          default_type_id: defaultTypeId,
        });

        const res = await getRequestAsPromise({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });

        expect(res.status).toBe(200);
        // Should return first two animals
        expect(res.body.length).toBe(2);
        res.body.forEach((animalBatch) => {
          expect(animalBatch.farm_id).toBe(mainFarm.farm_id);
        });
        expect(firstAnimalBatch).toMatchObject(res.body[0]);
        expect(secondAnimalBatch).toMatchObject(res.body[1]);
      }
    });

    test('Unauthorized user should get 400 if they try to get animal batches', async () => {
      const { mainFarm } = await returnUserFarms(1);
      await makeAnimalBatch(mainFarm, {
        default_breed_id: defaultBreedId,
        default_type_id: defaultTypeId,
      });
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await getRequestAsPromise({
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): get:animal_batch',
      );
    });
  });

  // POST tests
  describe('Add animal batch tests', () => {
    test('Admin users should be able to create animal batch', async () => {
      const roles = [1, 2, 5];
      const animalSex1 = await makeAnimalSex();
      const animalSex2 = await makeAnimalSex();
      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const [animalType] = await mocks.custom_animal_typeFactory({
          promisedFarm: [mainFarm],
        });
        const [animalBreed] = await mocks.custom_animal_breedFactory({
          promisedFarm: [mainFarm],
        });

        const firstAnimalBatch = mocks.fakeAnimalBatch({
          default_breed_id: defaultBreedId,
          default_type_id: defaultTypeId,
        });
        const secondAnimalBatch = mocks.fakeAnimalBatch({
          default_breed_id: defaultBreedId,
          custom_type_id: animalType.id,
        });
        const thirdAnimalBatch = mocks.fakeAnimalBatch({
          custom_type_id: animalBreed.custom_type_id,
          custom_breed_id: animalBreed.id,
          count: 6,
          animal_batch_sex_detail: [
            {
              sex_id: animalSex1.id,
              count: 2,
            },
            {
              sex_id: animalSex2.id,
              count: 4,
            },
          ],
        });

        const res = await postRequestAsPromise(
          {
            user_id: user.user_id,
            farm_id: mainFarm.farm_id,
          },
          [firstAnimalBatch, secondAnimalBatch, thirdAnimalBatch],
        );
        expect(res.status).toBe(201);
        expect(res.body[0]).toMatchObject(firstAnimalBatch);
        expect(res.body[1]).toMatchObject(secondAnimalBatch);
        expect(res.body[2]).toMatchObject(thirdAnimalBatch);

        res.body.forEach((animalBatch) => expect(animalBatch.farm_id).toBe(mainFarm.farm_id));
      }
    });

    test('Non-admin users should not be able to create animal batch', async () => {
      const roles = [3];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const animalBatch = mocks.fakeAnimalBatch({
          default_breed_id: defaultBreedId,
          default_type_id: defaultTypeId,
        });

        const res = await postRequestAsPromise(
          {
            user_id: user.user_id,
            farm_id: mainFarm.farm_id,
          },
          [animalBatch],
        );

        expect(res.status).toBe(403);
        expect(res.error.text).toBe(
          'User does not have the following permission(s): add:animal_batch',
        );
      }
    });

    test('Should not be able to send out an individual animal batch instead of an array', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const animalBatch = mocks.fakeAnimalBatch({
        default_breed_id: defaultBreedId,
        default_type_id: defaultTypeId,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        animalBatch,
      );

      expect(res.status).toBe(400);
    });

    test('Should not be able to create an animal batch without a name', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const animalBatch = mocks.fakeAnimalBatch({
        name: null,
        default_breed_id: defaultBreedId,
        default_type_id: defaultTypeId,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animalBatch],
      );

      expect(res.status).toBe(400);
    });

    test('Should not be able to create an animal batch without a type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const animalBatch = mocks.fakeAnimalBatch({
        default_breed_id: defaultBreedId,
        default_type_id: null,
        custom_type_id: null,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animalBatch],
      );

      expect(res.status).toBe(400);
    });

    test('Should not be able to create an animal batch with a type belonging to a different farm', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [secondFarm] = await mocks.farmFactory();
      const [animalType] = await mocks.custom_animal_typeFactory({
        promisedFarm: [secondFarm],
      });

      const animalBatch = mocks.fakeAnimalBatch({
        default_breed_id: defaultBreedId,
        custom_type_id: animalType.id,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animalBatch],
      );

      expect(res.status).toBe(403);
    });

    test('Should not be able to create an animal batch with a breed belonging to a different farm', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [secondFarm] = await mocks.farmFactory();
      const [animalBreed] = await mocks.custom_animal_breedFactory({
        promisedFarm: [secondFarm],
      });

      const animalBatch = mocks.fakeAnimalBatch({
        default_type_id: null,
        custom_type_id: animalBreed.custom_type_id,
        default_breed_id: null,
        custom_breed_id: animalBreed.id,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animalBatch],
      );

      expect(res.status).toBe(403);
    });

    test('Should not be able to create an animal batch where type and breed do not match', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [animalType] = await mocks.default_animal_typeFactory();
      const [animalBreed] = await mocks.default_animal_breedFactory();

      const animalBatch = mocks.fakeAnimalBatch({
        default_type_id: animalType.id,
        default_breed_id: animalBreed.id,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animalBatch],
      );

      expect(res.status).toBe(400);
    });

    test('Should not be able to create an animal batch where count is less than 2', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const animalBatch = mocks.fakeAnimalBatch({
        default_breed_id: defaultBreedId,
        default_type_id: defaultTypeId,
        count: 1,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animalBatch],
      );

      expect(res.status).toBe(400);
    });

    test('Should not be able to create an animal batch where count and combined sex detail count do not match', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const animalSex1 = await makeAnimalSex();
      const animalSex2 = await makeAnimalSex();
      const animalBatch = mocks.fakeAnimalBatch({
        default_breed_id: defaultBreedId,
        default_type_id: defaultTypeId,
        count: 6,
        animal_batch_sex_detail: [
          {
            sex_id: animalSex1.id,
            count: 2,
          },
          {
            sex_id: animalSex2.id,
            count: 3,
          },
        ],
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animalBatch],
      );

      expect(res.status).toBe(400);
    });
  });
});
