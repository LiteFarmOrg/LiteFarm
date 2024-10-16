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
import AnimalBatchSexDetailModel from '../src/models/animalBatchSexDetailModel.js';
import AnimalBatchUseRelationshipModel from '../src/models/animalBatchUseRelationshipModel.js';

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

  async function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    return await chai
      .request(server)
      .get('/animal_batches')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  async function postRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, data) {
    return await chai
      .request(server)
      .post('/animal_batches')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  async function removeRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, data) {
    return await chai
      .request(server)
      .patch('/animal_batches/remove')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  async function patchRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, data) {
    return await chai
      .request(server)
      .patch('/animal_batches')
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

        const res = await getRequest({
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

      const res = await getRequest({
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

        const res = await postRequest(
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

        const res = await postRequest(
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

      const res = await postRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        animalBatch,
      );

      expect(res.status).toBe(400);
      expect(res.error.text).toBe('Request body should be an array');
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
        const res = await postRequest({ user_id: user.user_id, farm_id: farm.farm_id }, [
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

      const res = await postRequest(
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

      const res = await postRequest(
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

      const res = await postRequest(
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

      const res = await postRequest(
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

      const res = await postRequest(
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
        const res = await postRequest(
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

  // EDIT tests
  describe('Edit animal batch tests', () => {
    let animalGroup1;
    let animalGroup2;
    let animalSex1;
    let animalSex2;
    let animalIdentifierColor;
    let animalIdentifierType;
    let animalOrigin1;
    let animalOrigin2;
    let animalRemovalReason;
    let animalUse1;
    let animalUse2;
    let animalUse3;
    let animalBreed;
    let animalBreed2;

    beforeAll(async () => {
      [animalUse1] = await mocks.animal_useFactory('OTHER');
      [animalOrigin1] = await mocks.animal_originFactory('BROUGHT_IN');
    });

    beforeEach(async () => {
      [animalGroup1] = await mocks.animal_groupFactory();
      [animalGroup2] = await mocks.animal_groupFactory();
      // Populate enums
      [animalSex1] = await mocks.animal_sexFactory();
      [animalSex2] = await mocks.animal_sexFactory();
      [animalIdentifierColor] = await mocks.animal_identifier_colorFactory();
      [animalIdentifierType] = await mocks.animal_identifier_typeFactory();
      [animalOrigin2] = await mocks.animal_originFactory();
      [animalRemovalReason] = await mocks.animal_removal_reasonFactory();
      [animalUse2] = await mocks.animal_useFactory();
      [animalUse3] = await mocks.animal_useFactory();
      [animalBreed] = await mocks.default_animal_breedFactory();
      [animalBreed2] = await mocks.default_animal_breedFactory();
    });

    async function addAnimalBatches(mainFarm, user) {
      const [customAnimalType] = await mocks.custom_animal_typeFactory({
        promisedFarm: [mainFarm],
      });

      // Create two batchess, one with a default type and one with a custom type
      const firstBatch = mocks.fakeAnimalBatch({
        name: 'edit test 1',
        default_type_id: defaultTypeId,
        animal_batch_use_relationships: [{ use_id: animalUse1.id }],
        sire: 'Unchanged',
        count: 4,
        sex_detail: [
          {
            sex_id: animalSex1.id,
            count: 2,
          },
          {
            sex_id: animalSex2.id,
            count: 2,
          },
        ],
        group_name: animalGroup1.name,
      });
      const secondBatch = mocks.fakeAnimalBatch({
        name: 'edit test 2',
        custom_type_id: customAnimalType.id,
        animal_batch_use_relationships: [{ use_id: animalUse1.id }],
        sire: 'Unchanged',
        count: 5,
      });

      const res = await postRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [firstBatch, secondBatch],
      );

      const returnedFirstBatch = res.body?.find((batch) => batch.name === 'edit test 1');
      const returnedSecondBatch = res.body?.find((batch) => batch.name === 'edit test 2');

      return { res, returnedFirstBatch, returnedSecondBatch };
    }

    async function editAnimalBatches(mainFarm, user, returnedFirstBatch, returnedSecondBatch) {
      const [customAnimalType] = await mocks.custom_animal_typeFactory({
        promisedFarm: [mainFarm],
      });

      // Make edits to batches - does not test all top level batch columns, but all relationships
      const updatedFirstBatch = mocks.fakeAnimalBatch({
        // Extra properties are silently removed
        extra_non_existant_property: 'hello',
        id: returnedFirstBatch.id,
        default_type_id: defaultTypeId,
        name: 'Update Name 1',
        sire: returnedFirstBatch.sire,
        sex_detail: [
          {
            id: returnedFirstBatch.sex_detail.find((detail) => detail.sex_id === animalSex1.id)?.id,
            animal_batch_id: returnedFirstBatch.id,
            sex_id: animalSex1.id,
            count: 2,
          },
          {
            id: returnedFirstBatch.sex_detail.find((detail) => detail.sex_id === animalSex2.id)?.id,
            animal_batch_id: returnedFirstBatch.id,
            sex_id: animalSex2.id,
            count: 3,
          },
        ],
        count: 5,
        origin_id: animalOrigin1.id,
        // Extra properties are silently removed
        animal_removal_reason_id: animalRemovalReason.id,
        organic_status: 'Organic',
        animal_batch_use_relationships: [{ use_id: animalUse2.id }, { use_id: animalUse3.id }],
        group_ids: [{ animal_group_id: animalGroup2.id }],
      });
      const updatedSecondBatch = mocks.fakeAnimalBatch({
        id: returnedSecondBatch.id,
        custom_type_id: customAnimalType.id,
        name: 'Update Name 1',
        sire: returnedSecondBatch.sire,
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
        count: 5,
        origin_id: animalOrigin1.id,
        // Extra properties are silently removed
        animal_removal_reason_id: animalRemovalReason.id,
        organic_status: 'Organic',
        animal_batch_use_relationships: [{ use_id: animalUse2.id }, { use_id: animalUse3.id }],
        group_ids: [{ animal_group_id: animalGroup2.id }],
      });

      const patchRes = await patchRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [updatedFirstBatch, updatedSecondBatch],
      );

      // Remove or add properties not actually expected from get request
      [updatedFirstBatch, updatedSecondBatch].forEach((batch) => {
        // Should not cause an error
        delete batch.extra_non_existant_property;
        // Should not be able to update on edit
        batch.animal_removal_reason_id = null;
        // Return format different than post format
        batch.group_ids = batch.group_ids.map((groupId) => groupId.animal_group_id);
        batch.animal_batch_use_relationships.forEach((rel) => {
          rel.animal_batch_id = batch.id;
          rel.other_use = null;
        });
      });

      return { res: patchRes, updatedFirstBatch, updatedSecondBatch };
    }

    test('Admin users should be able to edit batches', async () => {
      const roles = [1, 2, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        // Add batches to db
        const { res: addRes, returnedFirstBatch, returnedSecondBatch } = await addAnimalBatches(
          mainFarm,
          user,
        );
        expect(addRes.status).toBe(201);
        expect(returnedFirstBatch).toBeTruthy();
        expect(returnedSecondBatch).toBeTruthy();

        // Edit batches in db
        const { res: editRes, updatedFirstBatch, updatedSecondBatch } = await editAnimalBatches(
          mainFarm,
          user,
          returnedFirstBatch,
          returnedSecondBatch,
        );
        expect(editRes.status).toBe(204);

        // Get updated batches
        const { body: batchRecords } = await getRequest({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });
        const filteredBatchRecords = batchRecords.filter((record) =>
          [returnedFirstBatch.id, returnedSecondBatch.id].includes(record.id),
        );

        // Test data matches expected changes
        filteredBatchRecords.forEach((record) => {
          // Remove properties that were not updated
          delete record.internal_identifier;
          // Remove base properties
          delete record.created_at;
          delete record.created_by_user_id;
          delete record.deleted;
          delete record.updated_at;
          delete record.updated_by;
          const updatedRecord = [updatedFirstBatch, updatedSecondBatch].find(
            (batch) => batch.id === record.id,
          );
          expect(record).toMatchObject(updatedRecord);
        });
      }
    });

    test('Non-admin users should not be able to edit batches', async () => {
      const adminRole = 1;
      const { mainFarm, user: admin } = await returnUserFarms(adminRole);
      const workerRole = 3;
      const [user] = await mocks.usersFactory();
      await mocks.userFarmFactory(
        {
          promisedUser: [user],
          promisedFarm: [mainFarm],
        },
        fakeUserFarm(workerRole),
      );

      // Add animals to db
      const { res: addRes, returnedFirstBatch, returnedSecondBatch } = await addAnimalBatches(
        mainFarm,
        admin,
      );
      expect(addRes.status).toBe(201);
      expect(returnedFirstBatch).toBeTruthy();
      expect(returnedSecondBatch).toBeTruthy();

      // Edit animals in db
      const { res: editRes } = await editAnimalBatches(
        mainFarm,
        user,
        returnedFirstBatch,
        returnedSecondBatch,
      );

      // Test failure
      expect(editRes.status).toBe(403);
      expect(editRes.error.text).toBe(
        'User does not have the following permission(s): edit:animal_batches',
      );
    });

    test('Should not be able to send out an individual batch instead of an array', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      // Add animals to db
      const { res: addRes, returnedFirstBatch } = await addAnimalBatches(mainFarm, user);
      expect(addRes.status).toBe(201);
      expect(returnedFirstBatch).toBeTruthy();

      // Change 1 thing
      returnedFirstBatch.sire = 'Changed';

      const res = await patchRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        {
          ...returnedFirstBatch,
        },
      );

      expect(res.status).toBe(400);
      expect(res.error.text).toBe('Request body should be an array');
    });

    test('Should not be able to edit a batch belonging to a different farm', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [secondFarm] = await mocks.farmFactory();

      const batch = await makeAnimalBatch(secondFarm, {
        default_type_id: defaultTypeId,
      });

      const res = await patchRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [
          {
            id: batch.id,
            sire: 'Neighbours sire',
          },
        ],
      );

      expect(res).toMatchObject({
        status: 400,
        body: {
          error: 'Invalid ids',
          invalidIds: [batch.id],
        },
      });

      // Check database
      const batchRecord = await AnimalBatchModel.query().findById(batch.id);
      expect(batchRecord.sire).toBeNull();
    });

    const customErrors = [
      {
        testName: 'Exactly one type provided',
        getPatchBody: (batch) => [
          {
            id: batch.id,
            default_type_id: batch.default_type_id,
            type_name: 'string',
          },
        ],
        patchErr: {
          code: 400,
          message: 'Exactly one of default_type_id, custom_type_id, or type_name must be sent',
        },
      },
      {
        testName: 'Custom type id is number',
        getPatchBody: (batch) => [
          {
            id: batch.id,
            custom_type_id: 'string',
          },
        ],
        patchErr: {
          code: 400,
          message: 'Must send valid ids',
        },
      },
      {
        testName: 'Custom id exists',
        getPatchBody: (batch) => [
          {
            id: batch.id,
            custom_type_id: 1000000,
          },
        ],
        patchErr: {
          code: 400,
          message: 'Custom type does not exist',
        },
      },
      {
        testName: 'Custom type does not belong to farm',
        getPatchBody: (batch, existingBatches, customs) => [
          {
            id: batch.id,
            custom_type_id: customs.otherFarm.otherCustomAnimalType.id,
          },
        ],
        patchErr: {
          code: 403,
          message: 'Forbidden custom type does not belong to this farm',
        },
      },
      {
        testName: 'Exactly one breed provided',
        getPatchBody: (batch) => [
          {
            id: batch.id,
            default_type_id: animalBreed.default_type_id,
            default_breed_id: animalBreed.id,
            breed_name: 'string',
          },
        ],
        patchErr: {
          code: 400,
          message: 'Exactly one of default_breed_id, custom_breed_id, or breed_name must be sent',
        },
      },
      {
        testName: 'Default type matches default breed -- default type is changed',
        getPatchBody: (batch, existingBatches) => [
          {
            id: existingBatches[0].id,
            default_type_id: animalBreed2.default_type_id,
          },
        ],
        getPostBody: () => [
          {
            default_type_id: animalBreed.default_type_id,
            default_breed_id: animalBreed.id,
          },
        ],
        patchErr: {
          code: 400,
          message: 'Breed does not match type',
        },
      },
      {
        testName: 'Default type matches default breed -- default breed is changed',
        getPatchBody: (batch, existingBatches) => [
          {
            id: existingBatches[0].id,
            default_breed_id: animalBreed2.id,
          },
        ],
        getPostBody: () => [
          {
            default_type_id: animalBreed.default_type_id,
            default_breed_id: animalBreed.id,
          },
        ],
        patchErr: {
          code: 400,
          message: 'Breed does not match type',
        },
      },
      {
        testName: 'Default breed is a number',
        getPatchBody: (batch) => [
          {
            id: batch.id,
            default_breed_id: 'string',
          },
        ],
        patchErr: {
          code: 400,
          message: 'Must send valid ids',
        },
      },
      {
        testName: 'Default breed provided exists (optional to provide)',
        getPatchBody: (batch) => [
          {
            id: batch.id,
            default_breed_id: 1000000,
          },
        ],
        patchErr: {
          code: 400,
          message: 'Default breed does not exist',
        },
      },
      {
        testName: 'Default type matches default breed -- both are changed but mismatch',
        getPatchBody: (batch, existingBatches) => [
          {
            id: existingBatches[0].id,
            default_type_id: animalBreed.default_type_id,
            default_breed_id: animalBreed2.id,
          },
        ],
        getPostBody: () => [
          {
            default_type_id: animalBreed.default_type_id,
            default_breed_id: animalBreed.id,
          },
        ],
        patchErr: {
          code: 400,
          message: 'Breed does not match type',
        },
      },
      {
        testName: 'Custom type cannot be used with default breed',
        getPostBody: (customs) => [
          {
            custom_type_id: customs.customAnimalType.id,
            default_breed_id: animalBreed.id,
          },
        ],
        postErr: {
          code: 400,
          message: 'Default breed must use default type',
        },
      },
      {
        testName: 'Custom breed is a number',
        getPatchBody: (batch) => [
          {
            id: batch.id,
            custom_breed_id: 'string',
          },
        ],
        patchErr: {
          code: 400,
          message: 'Must send valid ids',
        },
      },
      {
        testName: 'Custom breed provided exists (optional to provide)',
        getPatchBody: (batch) => [
          {
            id: batch.id,
            custom_breed_id: 1000000,
          },
        ],
        patchErr: {
          code: 400,
          message: 'Custom breed does not exist',
        },
      },
      {
        testName: 'Custom breed provided exists (optional to provide)',
        getPatchBody: (batch) => [
          {
            id: batch.id,
            custom_breed_id: 1000000,
          },
        ],
        patchErr: {
          code: 400,
          message: 'Custom breed does not exist',
        },
      },
      {
        testName: 'Custom breed does not belong to farm',
        getPatchBody: (batch, existingBatches, customs) => [
          {
            id: batch.id,
            custom_breed_id: customs.otherFarm.otherCustomAnimalBreed.id,
          },
        ],
        patchErr: {
          code: 403,
          message: 'Forbidden custom breed does not belong to this farm',
        },
      },
      {
        testName: 'Default type matches custom breed -- default type is changed',
        getPatchBody: (batch, existingBatches, customs) => [
          {
            id: existingBatches[0].id,
            default_type_id: animalBreed.default_type_id,
          },
        ],
        getPostBody: (customs) => [
          {
            default_type_id: customs.customAnimalBreed.default_type_id,
            custom_breed_id: customs.customAnimalBreed.id,
          },
        ],
        patchErr: {
          code: 400,
          message: 'Breed does not match type',
        },
      },
      {
        testName: 'Default type matches custom breed -- custom type is changed',
        getPatchBody: (batch, existingBatches, customs) => [
          {
            id: existingBatches[0].id,
            custom_type_id: customs.customAnimalBreed2.custom_type_id,
          },
        ],
        getPostBody: (customs) => [
          {
            default_type_id: customs.customAnimalBreed.default_type_id,
            custom_breed_id: customs.customAnimalBreed.id,
          },
        ],
        patchErr: {
          code: 400,
          message: 'Breed does not match type',
        },
      },
      {
        testName: 'Default type matches custom breed -- breed and type are changed',
        getPatchBody: (batch, existingBatches, customs) => [
          {
            id: existingBatches[0].id,
            default_type_id: customs.customAnimalBreed.default_type_id,
            custom_breed_id: customs.customAnimalBreed2.id,
          },
        ],
        getPostBody: (customs) => [
          {
            default_type_id: customs.customAnimalBreed.default_type_id,
            custom_breed_id: customs.customAnimalBreed.id,
          },
        ],
        patchErr: {
          code: 400,
          message: 'Breed does not match type',
        },
      },
      {
        testName: 'Check create batch sex detail',
        getPostBody: (customs) => [
          {
            count: 3,
            sex_detail: [
              {
                sex_id: animalSex1.id,
                count: 2,
              },
              {
                sex_id: animalSex2.id,
                count: 2,
              },
            ],
          },
        ],
        postErr: {
          code: 400,
          message: 'Batch count must be greater than or equal to sex detail count',
        },
      },
      {
        testName: 'Check edit batch sex detail -- change count',
        getPatchBody: (batch, existingBatches) => [
          {
            id: existingBatches[0].id,
            count: 3,
          },
        ],
        getPostBody: () => [
          {
            default_type_id: animalBreed.default_type_id,
            count: 4,
            sex_detail: [
              {
                sex_id: animalSex1.id,
                count: 2,
              },
              {
                sex_id: animalSex2.id,
                count: 2,
              },
            ],
          },
        ],
        patchErr: {
          code: 400,
          message: 'Batch count must be greater than or equal to sex detail count',
        },
      },
      {
        testName: 'Check edit batch sex detail -- change sex_detail',
        getPatchBody: (batch, existingBatches) => [
          {
            id: existingBatches[0].id,
            sex_detail: [
              {
                sex_id: animalSex1.id,
                count: 5,
              },
              {
                sex_id: animalSex2.id,
                count: 2,
              },
            ],
          },
        ],
        getPostBody: () => [
          {
            default_type_id: animalBreed.default_type_id,
            count: 4,
            sex_detail: [
              {
                sex_id: animalSex1.id,
                count: 2,
              },
              {
                sex_id: animalSex2.id,
                count: 2,
              },
            ],
          },
        ],
        patchErr: {
          code: 400,
          message: 'Batch count must be greater than or equal to sex detail count',
        },
      },
      {
        testName: 'Check edit batch sex detail -- duplicate sex ids not allowed',
        getPatchBody: (batch, existingBatches) => [
          {
            id: existingBatches[0].id,
            sex_detail: [
              {
                sex_id: animalSex1.id,
                count: 1,
              },
              {
                sex_id: animalSex1.id,
                count: 1,
              },
              {
                sex_id: animalSex2.id,
                count: 2,
              },
            ],
          },
        ],
        getPostBody: () => [
          {
            default_type_id: animalBreed.default_type_id,
            count: 4,
            sex_detail: [
              {
                sex_id: animalSex1.id,
                count: 2,
              },
              {
                sex_id: animalSex2.id,
                count: 1,
              },
            ],
          },
        ],
        patchErr: {
          code: 400,
          message: 'Duplicate sex ids in detail',
        },
      },
      {
        testName: 'Check edit batch sex detail -- patching sex id with record id updates record',
        getRawRecordMismatch: (existingBatches) => {
          return {
            model: AnimalBatchSexDetailModel,
            where: { animal_batch_id: existingBatches[0].id },
            getMatchingBody: (existingBatches, records) => {
              return [
                {
                  ...records[0],
                  id: existingBatches[0].sex_detail[0].id,
                  sex_id: animalSex1.id,
                  count: 1,
                  animal_batch_id: existingBatches[0].id,
                },
              ];
            },
          };
        },
        getPatchBody: (batch, existingBatches) => [
          {
            id: existingBatches[0].id,
            sex_detail: [
              {
                id: existingBatches[0].sex_detail[0].id,
                sex_id: animalSex1.id,
                count: 1,
              },
            ],
          },
        ],
        getPostBody: () => [
          {
            default_type_id: animalBreed.default_type_id,
            count: 4,
            sex_detail: [
              {
                sex_id: animalSex1.id,
                count: 2,
              },
            ],
          },
        ],
      },
      {
        testName:
          'Check edit batch sex detail -- patching sex id without record id deletes previous record and adds new one',
        getRawRecordMismatch: (existingBatches) => {
          return {
            model: AnimalBatchSexDetailModel,
            where: { animal_batch_id: existingBatches[0].id },
            getMatchingBody: (existingBatches, records) => {
              const record1 = records.find(
                (record) => record.id === existingBatches[0].sex_detail[0].id,
              );
              const record2 = records.find(
                (record) => record.id != existingBatches[0].sex_detail[0].id,
              );
              return [
                {
                  ...record1,
                  id: existingBatches[0].sex_detail[0].id,
                  sex_id: animalSex1.id,
                  count: 2,
                  animal_batch_id: existingBatches[0].id,
                  deleted: true,
                },
                {
                  ...record2,
                  id: record2.id,
                  sex_id: animalSex1.id,
                  count: 1,
                  animal_batch_id: existingBatches[0].id,
                  deleted: false,
                },
              ];
            },
          };
        },
        getPatchBody: (batch, existingBatches) => [
          {
            id: existingBatches[0].id,
            sex_detail: [
              {
                sex_id: animalSex1.id,
                count: 1,
              },
            ],
          },
        ],
        getPostBody: () => [
          {
            default_type_id: animalBreed.default_type_id,
            count: 4,
            sex_detail: [
              {
                sex_id: animalSex1.id,
                count: 2,
              },
            ],
          },
        ],
      },
      {
        testName:
          'Check edit batch sex detail -- patching sex detail with empty array deletes sex details',
        getRawRecordMismatch: (existingBatches) => {
          return {
            model: AnimalBatchSexDetailModel,
            where: { animal_batch_id: existingBatches[0].id },
            getMatchingBody: (existingBatches, records) => {
              return [
                {
                  ...records[0],
                  deleted: true,
                },
                {
                  ...records[1],
                  deleted: true,
                },
              ];
            },
          };
        },
        getPatchBody: (batch, existingBatches) => [
          {
            id: existingBatches[0].id,
            sex_detail: [],
          },
        ],
        getPostBody: () => [
          {
            default_type_id: animalBreed.default_type_id,
            count: 4,
            sex_detail: [
              {
                sex_id: animalSex1.id,
                count: 2,
              },
              {
                sex_id: animalSex2.id,
                count: 2,
              },
            ],
          },
        ],
      },
      {
        testName: 'Use relationships is an array',
        getPatchBody: (batch) => [
          {
            id: batch.id,
            animal_batch_use_relationships: 'string',
          },
        ],
        patchErr: {
          code: 400,
          message: 'animal_batch_use_relationships should be an array',
        },
      },
      {
        testName: 'Other use notes is for other use type',
        getPatchBody: (batch) => [
          {
            id: batch.id,
            animal_batch_use_relationships: [
              {
                use_id: animalUse2.id,
                other_use: 'Leather',
              },
            ],
          },
        ],
        patchErr: {
          code: 400,
          message: 'other_use notes is for other use type',
        },
      },
      {
        testName: 'Check edit use -- patching use relationship with empty array hard deletes use',
        getRawRecordMismatch: (existingBatches) => {
          return {
            model: AnimalBatchUseRelationshipModel,
            where: { animal_batch_id: existingBatches[0].id },
            getMatchingBody: (existingBatches, records) => {
              return [];
            },
          };
        },
        getPatchBody: (batch, existingBatches) => [
          {
            id: existingBatches[0].id,
            animal_batch_use_relationships: [],
          },
        ],
        getPostBody: () => [
          {
            default_type_id: animalBreed.default_type_id,
            animal_batch_use_relationships: [
              {
                use_id: animalUse2.id,
              },
              {
                use_id: animalUse3.id,
              },
            ],
          },
        ],
      },
      {
        testName:
          'Check edit use -- patching use relationship requires all pre-existing uses to be present hard deletes missing',
        getRawRecordMismatch: (existingBatches) => {
          return {
            model: AnimalBatchUseRelationshipModel,
            where: { animal_batch_id: existingBatches[0].id },
            getMatchingBody: (existingBatches, records) => {
              return [
                {
                  ...records[0],
                  use_id: animalUse1.id,
                  other_use: 'Leather',
                },
              ];
            },
          };
        },
        getPatchBody: (batch, existingBatches) => [
          {
            id: existingBatches[0].id,
            animal_batch_use_relationships: [
              {
                use_id: animalUse1.id,
                other_use: 'Leather',
              },
            ],
          },
        ],
        getPostBody: () => [
          {
            default_type_id: animalBreed.default_type_id,
            animal_batch_use_relationships: [
              {
                use_id: animalUse1.id,
              },
              {
                use_id: animalUse2.id,
              },
            ],
          },
        ],
      },
      {
        testName: 'Origin id must be brought in to have brought in date',
        getPatchBody: (batch) => [
          {
            id: batch.id,
            origin_id: animalOrigin2.id,
            brought_in_date: new Date(),
          },
        ],
        patchErr: {
          code: 400,
          message: 'Brought in date must be used with brought in origin',
        },
      },
      {
        testName: 'Cannot create a new type associated with an existing breed',
        getPatchBody: (batch) => [
          {
            id: batch.id,
            defaultBreedId: animalBreed.id,
            type_name: 'string',
          },
        ],
        patchErr: {
          code: 400,
          message: 'Cannot create a new type associated with an existing breed',
        },
      },
    ];

    customErrors.forEach(async (error) => {
      await test(`CustomError: ${error.testName}`, async () => {
        // Create userFarms needed for tests
        const { mainFarm, user } = await returnUserFarms(1);
        const { mainFarm: otherFarm } = await returnUserFarms(1);

        // Make, then group, farm specific resources
        const [customAnimalType] = await mocks.custom_animal_typeFactory({
          promisedFarm: [mainFarm],
        });
        const [customAnimalBreed] = await mocks.custom_animal_breedFactory(
          {
            promisedFarm: [mainFarm],
          },
          undefined,
          false,
        );
        const [customAnimalBreed2] = await mocks.custom_animal_breedFactory({
          promisedFarm: [mainFarm],
        });
        const [otherCustomAnimalType] = await mocks.custom_animal_typeFactory({
          promisedFarm: [otherFarm],
        });
        const [otherCustomAnimalBreed] = await mocks.custom_animal_breedFactory({
          promisedFarm: [otherFarm],
        });
        const customs = {
          customAnimalType,
          customAnimalBreed,
          customAnimalBreed2,
          otherFarm: { otherCustomAnimalType, otherCustomAnimalBreed },
        };

        const makeCheckGetBatch = async (getPostBody) => {
          const batches = getPostBody(customs).map((batch) => mocks.fakeAnimalBatch(batch));
          const postRes = await postRequest(
            {
              user_id: user.user_id,
              farm_id: mainFarm.farm_id,
            },
            [...batches],
          );

          // If checking error body on post
          expect(postRes.status).toBe(error.postErr?.code || 201);
          expect(postRes.error.text).toBe(error.postErr?.message || undefined);
          return postRes.body;
        };

        let existingBatches;
        if (error.getPostBody) {
          existingBatches = await makeCheckGetBatch(error.getPostBody);
        }

        const editCheckBatch = async (getPatchBody) => {
          // for skipping makeCheckGetBatch
          const batch = await makeAnimalBatch(mainFarm, {
            default_type_id: defaultTypeId,
          });
          const batches = getPatchBody(batch, existingBatches, customs);
          const patchRes = await patchRequest(
            {
              user_id: user.user_id,
              farm_id: mainFarm.farm_id,
            },
            [...batches],
          );
          // If checking error body on patch
          expect(patchRes.status).toBe(error.patchErr?.code || 204);
          expect(patchRes.error.text).toBe(error.patchErr?.message || undefined);
        };

        if (error.getPatchBody) {
          await editCheckBatch(error.getPatchBody);
        }

        // If checking for errors on record object
        const rawGetMatch = async (getRawRecordMismatch) => {
          const rawRecordMatch = getRawRecordMismatch(existingBatches);
          // Include deleted
          const records = await rawRecordMatch.model
            .query()
            .where(rawRecordMatch.where)
            .context({ showHidden: true });
          const expectedBody = rawRecordMatch.getMatchingBody(existingBatches, records);
          // No fallback if provided
          expect(records).toEqual(expectedBody);
        };

        if (error.getRawRecordMismatch) {
          await rawGetMatch(error.getRawRecordMismatch);
        }
      });
    });
  });

  // REMOVE tests
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

      expect(res.status).toBe(400);
      expect(res.error.text).toBe('Request body should be an array');

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
