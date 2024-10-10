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
import { faker } from '@faker-js/faker';

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

import { makeFarmsWithAnimalsAndBatches } from './utils/animalUtils.js';
import AnimalBatchModel from '../src/models/animalBatchModel.js';
import CustomAnimalTypeModel from '../src/models/customAnimalTypeModel.js';
import CustomAnimalBreedModel from '../src/models/customAnimalBreedModel.js';

describe('Animal Batch Tests', () => {
  let farm;
  let newOwner;
  let defaultBreedId;
  let defaultTypeId;
  let animalRemovalReasonId;

  const mockDate = new Date('2024/3/12').toISOString();

  beforeAll(async () => {
    const [defaultAnimalBreed] = await mocks.default_animal_breedFactory();
    defaultBreedId = defaultAnimalBreed.id;
    defaultTypeId = defaultAnimalBreed.default_type_id;

    const [animalRemovalReason] = await mocks.animal_removal_reasonFactory();
    animalRemovalReasonId = animalRemovalReason.id;
  });

  function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .get('/animal_batches')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  const getRequestAsPromise = util.promisify(getRequest);

  function postRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, data, callback) {
    chai
      .request(server)
      .post('/animal_batches')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  const postRequestAsPromise = util.promisify(postRequest);

  async function removeRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, data) {
    return await chai
      .request(server)
      .patch('/animal_batches/remove')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  async function deleteRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id, query = '' }) {
    return await chai
      .request(server)
      .delete(`/animal_batches?${query}`)
      .set('Content-Type', 'application/json')
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

  async function makeAnimalBatch(mainFarm, properties) {
    const [animalBatch] = await mocks.animal_batchFactory({
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
          sex_detail: [
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

        // Create a third animal batch belonging to a different farm
        await makeAnimalBatch(secondFarm, {
          default_breed_id: defaultBreedId,
          default_type_id: defaultTypeId,
        });

        const res = await getRequestAsPromise({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });

        expect(res.status).toBe(200);
        // Should return first two animal batches
        expect(res.body.length).toBe(2);
        res.body.forEach((animalBatch) => {
          expect(animalBatch.farm_id).toBe(mainFarm.farm_id);
          expect(animalBatch.internal_identifier).toBeGreaterThan(0);
        });
        expect({
          ...firstAnimalBatch,
          internal_identifier: 1,
          group_ids: [],
          animal_batch_use_relationships: [],
        }).toMatchObject(res.body[0]);
        expect({
          ...secondAnimalBatch,
          internal_identifier: 2,
          group_ids: [],
          animal_batch_use_relationships: [],
        }).toMatchObject(res.body[1]);
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
        'User does not have the following permission(s): get:animal_batches',
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
        const [animalBreed] = await mocks.custom_animal_breedFactory({
          promisedFarm: [mainFarm],
        });

        const firstAnimalBatch = mocks.fakeAnimalBatch({
          default_breed_id: defaultBreedId,
          default_type_id: defaultTypeId,
        });
        const secondAnimalBatch = mocks.fakeAnimalBatch({
          default_breed_id: defaultBreedId,
          default_type_id: defaultTypeId,
        });
        const thirdAnimalBatch = mocks.fakeAnimalBatch({
          custom_type_id: animalBreed.custom_type_id,
          custom_breed_id: animalBreed.id,
          count: 6,
          sex_detail: [
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
        expect(res.body[0].internal_identifier).toBe(1);
        expect(res.body[1].internal_identifier).toBe(2);
        expect(res.body[2].internal_identifier).toBe(3);

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
          'User does not have the following permission(s): add:animal_batches',
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

    test('Unique internal_identifier should be added within the same farm_id between animals and animalBatches', async () => {
      const [user] = await mocks.usersFactory();
      const { existingAnimalsAndBatchesCountsPerFarm } = await makeFarmsWithAnimalsAndBatches(user);

      for (const existingAnimalsAndBatches of existingAnimalsAndBatchesCountsPerFarm) {
        const { farm, animalCount, batchCount } = existingAnimalsAndBatches;

        // creat an animal batch for the farm
        const animalBatch = mocks.fakeAnimalBatch({
          farm_id: farm.farm_id,
          default_type_id: defaultTypeId,
        });
        const res = await postRequestAsPromise({ user_id: user.user_id, farm_id: farm.farm_id }, [
          animalBatch,
        ]);

        expect(res.body[0].internal_identifier).toBe(animalCount + batchCount + 1);
      }
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

    test('Should not be able to create an animal batch where count is less than combined sex detail count', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const animalSex1 = await makeAnimalSex();
      const animalSex2 = await makeAnimalSex();
      const animalBatch = mocks.fakeAnimalBatch({
        default_breed_id: defaultBreedId,
        default_type_id: defaultTypeId,
        count: 4,
        sex_detail: [
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

    describe('Create new types and/or breeds while creating animal batches', () => {
      let farm;
      let owner;

      beforeEach(async () => {
        const { mainFarm, user } = await returnUserFarms(1);
        farm = mainFarm;
        owner = user;
      });

      const postAnimalBatchesRequest = async (animalBatches) => {
        const res = await postRequestAsPromise(
          { user_id: owner.user_id, farm_id: farm.farm_id },
          animalBatches,
        );
        return res;
      };

      const getCustomAnimalType = async (typeName) => {
        const createdType = await CustomAnimalTypeModel.query()
          .where('farm_id', farm.farm_id)
          .andWhere('type', typeName);
        return createdType[0];
      };

      const getCustomAnimalBreed = async (breedName, typeColumn, typeId) => {
        const createdBreed = await CustomAnimalBreedModel.query()
          .where('farm_id', farm.farm_id)
          .andWhere(typeColumn, typeId)
          .andWhere('breed', breedName);
        return createdBreed[0];
      };

      test('Should be able to create an animal batch with a new type', async () => {
        const typeName = faker.lorem.word();
        const animalBatch = mocks.fakeAnimalBatch({ type_name: typeName });
        const res = await postAnimalBatchesRequest([animalBatch]);
        const newType = await getCustomAnimalType(typeName);
        expect(res.status).toBe(201);
        expect(res.body[0].custom_type_id).toBe(newType.id);
      });

      test('Should be able to create an animal batch with type_id and a new breed', async () => {
        const breedName = faker.lorem.word();
        let animalBatch = mocks.fakeAnimalBatch({
          default_type_id: defaultTypeId,
          breed_name: breedName,
        });
        let res = await postAnimalBatchesRequest([animalBatch]);
        let newBreed = await getCustomAnimalBreed(breedName, 'default_type_id', defaultTypeId);
        expect(res.status).toBe(201);
        expect(res.body[0].custom_breed_id).toBe(newBreed.id);

        const [customAnimalType] = await mocks.custom_animal_typeFactory({ promisedFarm: [farm] });
        animalBatch = mocks.fakeAnimalBatch({
          custom_type_id: customAnimalType.id,
          breed_name: breedName,
        });
        res = await postAnimalBatchesRequest([animalBatch]);
        newBreed = await getCustomAnimalBreed(breedName, 'custom_type_id', customAnimalType.id);
        expect(res.status).toBe(201);
        expect(res.body[0].custom_breed_id).toBe(newBreed.id);
      });

      test('Should be able to create an animal batch with a new type and a new breed', async () => {
        const typeName = faker.lorem.word();
        const breedName = faker.lorem.word();
        const animalBatch = mocks.fakeAnimalBatch({
          type_name: typeName,
          breed_name: breedName,
        });
        const res = await postAnimalBatchesRequest([animalBatch]);
        const newType = await getCustomAnimalType(typeName);
        const newBreed = await getCustomAnimalBreed(breedName, 'custom_type_id', newType.id);
        expect(res.status).toBe(201);
        expect(res.body[0].custom_type_id).toBe(newType.id);
        expect(res.body[0].custom_breed_id).toBe(newBreed.id);
      });

      test('Should not be able to create an animal batch when type_id and type_name are passed', async () => {
        const typeName = faker.lorem.word();
        let animalBatch = mocks.fakeAnimalBatch({
          default_type_id: defaultTypeId,
          type_name: typeName,
        });
        let res = await postAnimalBatchesRequest([animalBatch]);
        expect(res.status).toBe(400);

        const [customAnimalType] = await mocks.custom_animal_typeFactory({ promisedFarm: [farm] });
        animalBatch = mocks.fakeAnimalBatch({
          custom_type_id: customAnimalType.id,
          type_name: typeName,
        });
        res = await postAnimalBatchesRequest([animalBatch]);
        expect(res.status).toBe(400);
      });

      test('Should not be able to create an animal batch when breed_id and breed_name are passed', async () => {
        const breedName = faker.lorem.word();
        let animalBatch = mocks.fakeAnimalBatch({
          default_type_id: defaultTypeId,
          default_breed_id: defaultBreedId,
          breed_name: breedName,
        });
        let res = await postAnimalBatchesRequest([animalBatch]);
        expect(res.status).toBe(400);

        const [customAnimalBreed] = await mocks.custom_animal_breedFactory({
          promisedFarm: [farm],
          properties: { default_type_id: defaultTypeId, custom_type_id: null },
        });
        animalBatch = mocks.fakeAnimalBatch({
          default_type_id: defaultTypeId,
          custom_breed_id: customAnimalBreed.id,
          breed_name: breedName,
        });
        res = await postAnimalBatchesRequest([animalBatch]);
        expect(res.status).toBe(400);
      });

      test('Should not be able to create an animal batch with a new type and an existing breed', async () => {
        const typeName = faker.lorem.word();
        const [animalBreed] = await mocks.default_animal_breedFactory();
        let animalBatch = mocks.fakeAnimalBatch({
          type_name: typeName,
          default_breed_id: animalBreed.id,
        });
        let res = await postAnimalBatchesRequest([animalBatch]);
        expect(res.status).toBe(400);

        const [customAnimalBreed] = await mocks.custom_animal_breedFactory({
          promisedFarm: [farm],
        });
        animalBatch = mocks.fakeAnimalBatch({
          type_name: typeName,
          custom_breed_id: customAnimalBreed.id,
        });
        res = await postAnimalBatchesRequest([animalBatch]);
        expect(res.status).toBe(400);
      });

      test('Should be able to create animal batches with a new type', async () => {
        const typeName = faker.lorem.word();
        const animals = [...Array(3)].map(() => mocks.fakeAnimalBatch({ type_name: typeName }));
        const res = await postAnimalBatchesRequest(animals);
        const newType = await getCustomAnimalType(typeName);
        expect(res.status).toBe(201);
        res.body.forEach(({ custom_type_id }) => {
          expect(custom_type_id).toBe(newType.id);
        });
      });

      test('Should be able to create animal batches with a new type and breed', async () => {
        const typeName = faker.lorem.word();
        const breedName = faker.lorem.word();
        const animals = [...Array(3)].map(() =>
          mocks.fakeAnimalBatch({ type_name: typeName, breed_name: breedName }),
        );
        const res = await postAnimalBatchesRequest(animals);
        const newType = await getCustomAnimalType(typeName);
        const newBreed = await getCustomAnimalBreed(breedName, 'custom_type_id', newType.id);
        expect(res.status).toBe(201);
        res.body.forEach(({ custom_type_id, custom_breed_id }) => {
          expect(custom_type_id).toBe(newType.id);
          expect(custom_breed_id).toBe(newBreed.id);
        });
      });

      test('Should be able to create animal batches with various types and breeds at once', async () => {
        const [typeName1, typeName2, breedName1, breedName2] = [1, 2, 3, 4].map(
          (num) => faker.lorem.word() + num,
        );
        const animalBatch1 = mocks.fakeAnimalBatch({ type_name: typeName1 });
        const animalBatch2 = mocks.fakeAnimalBatch({ type_name: typeName2 });
        const animalBatch3 = mocks.fakeAnimalBatch({
          type_name: typeName1,
          breed_name: breedName1,
        });
        const animalBatch4 = mocks.fakeAnimalBatch({
          type_name: typeName1,
          breed_name: breedName2,
        });
        const animalBatches = [...Array(3)].map(() =>
          mocks.fakeAnimalBatch({ default_type_id: defaultTypeId }),
        );
        const res = await postAnimalBatchesRequest([
          animalBatch1,
          animalBatch2,
          animalBatch3,
          animalBatch4,
          ...animalBatches,
        ]);
        const [newType1, newType2] = await Promise.all(
          [typeName1, typeName2].map(async (name) => await getCustomAnimalType(name)),
        );
        const [newBreed1, newBreed2] = await Promise.all(
          [breedName1, breedName2].map(
            async (name) => await getCustomAnimalBreed(name, 'custom_type_id', newType1.id),
          ),
        );
        expect(res.status).toBe(201);
        expect(res.body.length).toBe(7);
        expect(res.body[0].custom_type_id).toBe(newType1.id);
        expect(res.body[1].custom_type_id).toBe(newType2.id);
        expect(res.body[2].custom_type_id).toBe(newType1.id);
        expect(res.body[2].custom_breed_id).toBe(newBreed1.id);
        expect(res.body[3].custom_type_id).toBe(newType1.id);
        expect(res.body[3].custom_breed_id).toBe(newBreed2.id);
        [4, 5, 6].forEach((index) => {
          expect(res.body[index].default_type_id).toBe(defaultTypeId);
        });
      });
    });
  });

  describe('Remove animal batch tests', () => {
    test('Admin users should be able to remove animal batches', async () => {
      const roles = [1, 2, 5];
      const animalSex1 = await makeAnimalSex();
      const animalSex2 = await makeAnimalSex();

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const firstAnimalBatch = await makeAnimalBatch(mainFarm, {
          default_breed_id: defaultBreedId,
          default_type_id: defaultTypeId,
          count: 6,
          sex_detail: [
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

        const res = await removeRequest(
          {
            user_id: user.user_id,
            farm_id: mainFarm.farm_id,
          },

          [
            {
              id: firstAnimalBatch.id,
              animal_removal_reason_id: animalRemovalReasonId,
              explanation: 'Gifted to neighbor',
              removal_date: mockDate,
            },
            {
              id: secondAnimalBatch.id,
              animal_removal_reason_id: animalRemovalReasonId,
              explanation: 'Gifted to neighbor',
              removal_date: mockDate,
            },
          ],
        );

        expect(res.status).toBe(204);

        // Check database to make sure property has been updated
        const batchRecords = await AnimalBatchModel.query().whereIn('id', [
          firstAnimalBatch.id,
          secondAnimalBatch.id,
        ]);

        batchRecords.forEach((record) => {
          expect(record.animal_removal_reason_id).toBe(animalRemovalReasonId);
        });
      }
    });

    test('Non-admin users should not be able to remove animal batches', async () => {
      const roles = [3];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const animalBatch = await makeAnimalBatch(mainFarm, {
          default_breed_id: defaultBreedId,
          default_type_id: defaultTypeId,
        });

        const res = await removeRequest(
          {
            user_id: user.user_id,
            farm_id: mainFarm.farm_id,
          },
          [
            {
              id: animalBatch.id,
              animal_removal_reason_id: animalRemovalReasonId,
              explanation: 'Gifted to neighbor',
              removal_date: mockDate,
            },
          ],
        );

        expect(res.status).toBe(403);
        expect(res.error.text).toBe(
          'User does not have the following permission(s): edit:animal_batches',
        );

        // Check database
        const batchRecord = await AnimalBatchModel.query().findById(animalBatch.id);
        expect(batchRecord.animal_removal_reason_id).toBeNull();
      }
    });

    test('Should not be able to send out an individual animal batch instead of an array', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const animalBatch = await makeAnimalBatch(mainFarm, {
        default_breed_id: defaultBreedId,
        default_type_id: defaultTypeId,
      });

      const res = await removeRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },

        {
          id: animalBatch.id,
          animal_removal_reason_id: animalRemovalReasonId,
          explanation: 'Gifted to neighbor',
          removal_date: mockDate,
        },
      );

      expect(res).toMatchObject({
        status: 400,
        error: {
          text: 'Request body should be an array',
        },
      });

      // Check database
      const batchRecord = await AnimalBatchModel.query().findById(animalBatch.id);
      expect(batchRecord.animal_removal_reason_id).toBeNull();
    });

    test('Should not be able to remove an animal batch without providing a removal_date', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const animalBatch = await makeAnimalBatch(mainFarm, {
        default_breed_id: defaultBreedId,
        default_type_id: defaultTypeId,
      });

      const res = await removeRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [
          {
            id: animalBatch.id,
            animal_removal_reason_id: animalRemovalReasonId,
            explanation: 'Gifted to neighbor',
          },
        ],
      );

      expect(res.status).toBe(400);
      expect(res.error.text).toBe('Must send reason and date of removal');

      // Check database
      const batchRecord = await AnimalBatchModel.query().findById(animalBatch.id);
      expect(batchRecord.animal_removal_reason_id).toBeNull();
    });

    test('Should not be able to remove an animal batch belonging to a different farm', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [secondFarm] = await mocks.farmFactory();

      const animalBatch = await makeAnimalBatch(secondFarm, {
        default_breed_id: defaultBreedId,
        default_type_id: defaultTypeId,
      });

      const res = await removeRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [
          {
            id: animalBatch.id,
            animal_removal_reason_id: animalRemovalReasonId,
            explanation: 'Gifted to neighbor',
            removal_date: mockDate,
          },
        ],
      );

      expect(res).toMatchObject({
        status: 400,
        body: {
          error: 'Invalid ids',
          invalidIds: [animalBatch.id],
        },
      });

      // Check database
      const batchRecord = await AnimalBatchModel.query().findById(animalBatch.id);
      expect(batchRecord.animal_removal_reason_id).toBeNull();
    });
  });

  // DELETE tests
  describe('Delete animal batch tests', () => {
    test('Admin users should be able to delete animal batches', async () => {
      const roles = [1, 2, 5];
      const animalSex1 = await makeAnimalSex();
      const animalSex2 = await makeAnimalSex();

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const firstAnimalBatch = await makeAnimalBatch(mainFarm, {
          default_breed_id: defaultBreedId,
          default_type_id: defaultTypeId,
          count: 6,
          sex_detail: [
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

        const res = await deleteRequest({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
          query: `ids=${firstAnimalBatch.id},${secondAnimalBatch.id}`,
        });

        expect(res.status).toBe(204);
      }
    });

    test('Non-admin users should not be able to delete animal batches', async () => {
      const roles = [3];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const animalBatch = await makeAnimalBatch(mainFarm, {
          default_breed_id: defaultBreedId,
          default_type_id: defaultTypeId,
        });

        const res = await deleteRequest({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
          query: `ids=${animalBatch.id}`,
        });

        expect(res.status).toBe(403);
        expect(res.error.text).toBe(
          'User does not have the following permission(s): delete:animal_batches',
        );
      }
    });

    test('Must send animal batch ids', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const res = await deleteRequest({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
        query: ``,
      });

      expect(res).toMatchObject({
        status: 400,
        error: {
          text: 'Must send ids',
        },
      });
    });

    test('Must send valid queries', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const animalBatch = await makeAnimalBatch(mainFarm, {
        default_breed_id: defaultBreedId,
        default_type_id: defaultTypeId,
      });

      // Two query params that are not valid batch ids
      const res1 = await deleteRequest({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
        query: `ids=${animalBatch.id},,`,
      });

      expect(res1).toMatchObject({
        status: 400,
        error: {
          text: 'Must send valid ids',
        },
      });

      // Three query params that are not valid animal ids
      const res2 = await deleteRequest({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
        query: `ids=},a,`,
      });

      expect(res2).toMatchObject({
        status: 400,
        error: {
          text: 'Must send valid ids',
        },
      });
    });

    test('Should not be able to remove an animal batch belonging to a different farm', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [secondFarm] = await mocks.farmFactory();

      const animalBatch = await makeAnimalBatch(secondFarm, {
        default_breed_id: defaultBreedId,
        default_type_id: defaultTypeId,
      });

      const res = await deleteRequest({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
        query: `ids=${animalBatch.id}`,
      });

      expect(res).toMatchObject({
        status: 400,
        body: {
          error: 'Invalid ids',
          invalidIds: [`${animalBatch.id}`],
        },
      });
    });
  });
});
