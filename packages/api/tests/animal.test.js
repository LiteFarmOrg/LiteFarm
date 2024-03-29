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

import { makeFarmsWithAnimalsAndBatches } from './utils/animalUtils.js';
import AnimalModel from '../src/models/animalModel.js';
import AnimalGroupModel from '../src/models/animalGroupModel.js';
import AnimalGroupRelationshipModel from '../src/models/animalGroupRelationshipModel.js';

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';
import CustomAnimalTypeModel from '../src/models/CustomAnimalTypeModel.js';
import CustomAnimalBreedModel from '../src/models/CustomAnimalBreedModel.js';

describe('Animal Tests', () => {
  let farm;
  let newOwner;
  let defaultTypeId;
  let animalRemovalReasonId;

  const mockDate = new Date('2024/3/12').toISOString();

  beforeAll(async () => {
    const [defaultAnimalType] = await mocks.default_animal_typeFactory();
    defaultTypeId = defaultAnimalType.id;

    // Alternatively the enum table could be kept (not cleaned up)
    const [animalRemovalReason] = await mocks.animal_removal_reasonFactory();
    animalRemovalReasonId = animalRemovalReason.id;
  });

  function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .get('/animals')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  const getRequestAsPromise = util.promisify(getRequest);

  function postRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, data, callback) {
    chai
      .request(server)
      .post('/animals')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  const postRequestAsPromise = util.promisify(postRequest);

  async function patchRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, data) {
    return await chai
      .request(server)
      .patch('/animals')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  async function deleteRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id, query = '' }) {
    return await chai
      .request(server)
      .delete(`/animals?${query}`)
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

  async function makeAnimal(mainFarm, properties) {
    const [animal] = await mocks.animalFactory({
      promisedFarm: [mainFarm],
      properties,
    });
    return animal;
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
  describe('Get animals tests', () => {
    test('All users should get animals for their farm', async () => {
      const roles = [1, 2, 3, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const [secondFarm] = await mocks.farmFactory();
        const [customAnimalType] = await mocks.custom_animal_typeFactory();

        // Create two animals, one with a default type and one with a custom type
        const firstAnimal = await makeAnimal(mainFarm, {
          default_type_id: defaultTypeId,
        });
        const secondAnimal = await makeAnimal(mainFarm, {
          default_type_id: null,
          custom_type_id: customAnimalType.id,
        });
        // Create a third animal belonging to a different farm
        await makeAnimal(secondFarm);

        const res = await getRequestAsPromise({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });

        expect(res.status).toBe(200);
        // Should return first two animals
        expect(res.body.length).toBe(2);
        res.body.forEach((animal) => {
          expect(animal.farm_id).toBe(mainFarm.farm_id);
        });
        expect({ ...firstAnimal, internal_identifier: 1, group_ids: [] }).toMatchObject(
          res.body[0],
        );
        expect({ ...secondAnimal, internal_identifier: 2, group_ids: [] }).toMatchObject(
          res.body[1],
        );
      }
    });

    test('Unauthorized user should get 403 if they try to get animals', async () => {
      const { mainFarm } = await returnUserFarms(1);
      await makeAnimal(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await getRequestAsPromise({
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe('User does not have the following permission(s): get:animals');
    });
  });

  describe('Add animal tests', () => {
    test('Admin users should be able to create animals', async () => {
      const roles = [1, 2, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const [animalType] = await mocks.custom_animal_typeFactory({
          promisedFarm: [mainFarm],
        });
        const [animalBreed] = await mocks.custom_animal_breedFactory({
          promisedFarm: [mainFarm],
        });

        const firstAnimal = mocks.fakeAnimal({ default_type_id: defaultTypeId });
        const secondAnimal = mocks.fakeAnimal({ custom_type_id: animalType.id });
        const thirdAnimal = mocks.fakeAnimal({
          custom_type_id: animalBreed.custom_type_id,
          custom_breed_id: animalBreed.id,
        });

        const res = await postRequestAsPromise(
          {
            user_id: user.user_id,
            farm_id: mainFarm.farm_id,
          },
          [firstAnimal, secondAnimal, thirdAnimal],
        );

        expect(res.status).toBe(201);
        expect(res.body[0]).toMatchObject({ ...firstAnimal, internal_identifier: 1 });
        expect(res.body[1]).toMatchObject({ ...secondAnimal, internal_identifier: 2 });
        expect(res.body[2]).toMatchObject({ ...thirdAnimal, internal_identifier: 3 });

        res.body.forEach((animal) => expect(animal.farm_id).toBe(mainFarm.farm_id));
      }
    });

    test('Non-admin users should not be able to create animals', async () => {
      const roles = [3];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const animal = mocks.fakeAnimal();

        const res = await postRequestAsPromise(
          {
            user_id: user.user_id,
            farm_id: mainFarm.farm_id,
          },
          [animal],
        );

        expect(res.status).toBe(403);
        expect(res.error.text).toBe('User does not have the following permission(s): add:animals');
      }
    });

    test('Should not be able to send out an individual animal instead of an array', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const animal = mocks.fakeAnimal();

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        animal,
      );

      expect(res.status).toBe(500);
    });

    test('Unique internal_identifier should be added within the same farm_id between animals and animalBatches', async () => {
      const [user] = await mocks.usersFactory();
      const { existingAnimalsAndBatchesCountsPerFarm } = await makeFarmsWithAnimalsAndBatches(user);

      for (const existingAnimalsAndBatches of existingAnimalsAndBatchesCountsPerFarm) {
        const { farm, animalCount, batchCount } = existingAnimalsAndBatches;

        // creat an animal for the farm
        const animal = mocks.fakeAnimal({
          farm_id: farm.farm_id,
          default_type_id: defaultTypeId,
        });
        const res = await postRequestAsPromise({ user_id: user.user_id, farm_id: farm.farm_id }, [
          animal,
        ]);

        expect(res.body[0].internal_identifier).toBe(animalCount + batchCount + 1);
      }
    });

    test('Should not be able to create an animal without a type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const animal = mocks.fakeAnimal({
        default_type_id: null,
        custom_type_id: null,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animal],
      );

      expect(res.status).toBe(400);
    });

    test('Should not be able to create an animal with a type belonging to a different farm', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [secondFarm] = await mocks.farmFactory();
      const [animalType] = await mocks.custom_animal_typeFactory({
        promisedFarm: [secondFarm],
      });

      const animal = mocks.fakeAnimal({
        default_type_id: null,
        custom_type_id: animalType.id,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animal],
      );

      expect(res.status).toBe(403);
    });

    test('Should not be able to create an animal with a breed belonging to a different farm', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [secondFarm] = await mocks.farmFactory();
      const [animalBreed] = await mocks.custom_animal_breedFactory({
        promisedFarm: [secondFarm],
      });

      const animal = mocks.fakeAnimal({
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
        [animal],
      );

      expect(res.status).toBe(403);
    });

    test('Should not be able to create an animal where type and breed do not match', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [animalBreed] = await mocks.default_animal_breedFactory();

      const animal = mocks.fakeAnimal({
        default_breed_id: animalBreed.id,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animal],
      );

      expect(res.status).toBe(400);
    });

    describe('Create new types and/or breeds while creating animals', () => {
      let farm;
      let owner;

      beforeEach(async () => {
        const { mainFarm, user } = await returnUserFarms(1);
        farm = mainFarm;
        owner = user;
      });

      const postAnimalsRequest = async (animals) => {
        const res = await postRequestAsPromise(
          { user_id: owner.user_id, farm_id: farm.farm_id },
          animals,
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

      test('Should be able to create an animal with a new type', async () => {
        const typeName = faker.lorem.word();
        const animal = mocks.fakeAnimal({ type_name: typeName });
        const res = await postAnimalsRequest([animal]);
        const newType = await getCustomAnimalType(typeName);
        expect(res.status).toBe(201);
        expect(res.body[0].custom_type_id).toBe(newType.id);
      });

      test('Should be able to create an animal with type_id and a new breed', async () => {
        const breedName = faker.lorem.word();
        let animal = mocks.fakeAnimal({ default_type_id: defaultTypeId, breed_name: breedName });
        let res = await postAnimalsRequest([animal]);
        let newBreed = await getCustomAnimalBreed(breedName, 'default_type_id', defaultTypeId);
        expect(res.status).toBe(201);
        expect(res.body[0].custom_breed_id).toBe(newBreed.id);

        const [customAnimalType] = await mocks.custom_animal_typeFactory({ promisedFarm: [farm] });
        animal = mocks.fakeAnimal({
          custom_type_id: customAnimalType.id,
          breed_name: breedName,
        });
        res = await postAnimalsRequest([animal]);
        newBreed = await getCustomAnimalBreed(breedName, 'custom_type_id', customAnimalType.id);
        expect(res.status).toBe(201);
        expect(res.body[0].custom_breed_id).toBe(newBreed.id);
      });

      test('Should be able to create an animal with a new type and a new breed', async () => {
        const typeName = faker.lorem.word();
        const breedName = faker.lorem.word();
        const animal = mocks.fakeAnimal({
          type_name: typeName,
          breed_name: breedName,
        });
        const res = await postAnimalsRequest([animal]);
        const newType = await getCustomAnimalType(typeName);
        const newBreed = await getCustomAnimalBreed(breedName, 'custom_type_id', newType.id);
        expect(res.status).toBe(201);
        expect(res.body[0].custom_type_id).toBe(newType.id);
        expect(res.body[0].custom_breed_id).toBe(newBreed.id);
      });

      test('Should not be able to create an animal when type_id and type_name are passed', async () => {
        const typeName = faker.lorem.word();
        let animal = mocks.fakeAnimal({ default_type_id: defaultTypeId, type_name: typeName });
        let res = await postAnimalsRequest([animal]);
        expect(res.status).toBe(400);

        const [customAnimalType] = await mocks.custom_animal_typeFactory({ promisedFarm: [farm] });
        animal = mocks.fakeAnimal({ custom_type_id: customAnimalType.id, type_name: typeName });
        res = await postAnimalsRequest([animal]);
        expect(res.status).toBe(400);
      });

      test('Should not be able to create an animal when breed_id and breed_name are passed', async () => {
        const breedName = faker.lorem.word();
        const [animalBreed] = await mocks.default_animal_breedFactory();
        let animal = mocks.fakeAnimal({
          default_type_id: defaultTypeId,
          default_breed_id: animalBreed.id,
          breed_name: breedName,
        });
        let res = await postAnimalsRequest([animal]);
        expect(res.status).toBe(400);

        const [customAnimalBreed] = await mocks.custom_animal_breedFactory({
          promisedFarm: [farm],
        });
        animal = mocks.fakeAnimal({
          default_type_id: defaultTypeId,
          custom_breed_id: customAnimalBreed.id,
          breed_name: breedName,
        });
        res = await postAnimalsRequest([animal]);
        expect(res.status).toBe(400);
      });

      test('Should not be able to create an animal with a new type and an existing breed', async () => {
        const typeName = faker.lorem.word();
        const [animalBreed] = await mocks.default_animal_breedFactory();
        let animal = mocks.fakeAnimal({
          type_name: typeName,
          default_breed_id: animalBreed.id,
        });
        let res = await postAnimalsRequest([animal]);
        expect(res.status).toBe(400);

        const [customAnimalBreed] = await mocks.custom_animal_breedFactory({
          promisedFarm: [farm],
        });
        animal = mocks.fakeAnimal({
          type_name: typeName,
          custom_breed_id: customAnimalBreed.id,
        });
        res = await postAnimalsRequest([animal]);
        expect(res.status).toBe(400);
      });

      test('Should be able to create animals with a new type', async () => {
        const typeName = faker.lorem.word();
        const animals = [...Array(3)].map(() => mocks.fakeAnimal({ type_name: typeName }));
        const res = await postAnimalsRequest(animals);
        const newType = await getCustomAnimalType(typeName);
        expect(res.status).toBe(201);
        res.body.forEach(({ custom_type_id }) => {
          expect(custom_type_id).toBe(newType.id);
        });
      });

      test('Should be able to create animals with a new type and breed', async () => {
        const typeName = faker.lorem.word();
        const breedName = faker.lorem.word();
        const animals = [...Array(3)].map(() =>
          mocks.fakeAnimal({ type_name: typeName, breed_name: breedName }),
        );
        const res = await postAnimalsRequest(animals);
        const newType = await getCustomAnimalType(typeName);
        const newBreed = await getCustomAnimalBreed(breedName, 'custom_type_id', newType.id);
        expect(res.status).toBe(201);
        res.body.forEach(({ custom_type_id, custom_breed_id }) => {
          expect(custom_type_id).toBe(newType.id);
          expect(custom_breed_id).toBe(newBreed.id);
        });
      });

      test('Should be able to create animals with various types and breeds at once', async () => {
        const [typeName1, typeName2, breedName1, breedName2] = [...Array(4)].map(() =>
          faker.lorem.word(),
        );
        const animal1 = mocks.fakeAnimal({ type_name: typeName1 });
        const animal2 = mocks.fakeAnimal({ type_name: typeName2 });
        const animal3 = mocks.fakeAnimal({
          type_name: typeName1,
          breed_name: breedName1,
        });
        const animal4 = mocks.fakeAnimal({
          type_name: typeName1,
          breed_name: breedName2,
        });
        const animals = [...Array(3)].map(() =>
          mocks.fakeAnimal({ default_type_id: defaultTypeId }),
        );
        const res = await postAnimalsRequest([animal1, animal2, animal3, animal4, ...animals]);
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

    test('Add animals to groups while adding animals', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const groupNames = [...Array(3)].map(() => faker.lorem.word());
      const [existingGroupName, newGroupName1, newGroupName2] = groupNames;

      const [existingGroup] = await mocks.animal_groupFactory({
        promisedFarm: [mainFarm],
        properties: { name: existingGroupName },
      });

      // insert a deleted group
      await mocks.animal_groupFactory({
        promisedFarm: [mainFarm],
        properties: { name: newGroupName1, deleted: true },
      });

      const animalsGroups = [
        { group_name: newGroupName1 },
        { group_name: existingGroupName },
        { group_name: newGroupName2 },
        {},
        { group_name: newGroupName1 },
        { group_name: newGroupName1 },
      ];

      const animals = animalsGroups.map(({ group_name }) => {
        const data = { default_type_id: defaultTypeId };
        return mocks.fakeAnimal(group_name ? { ...data, group_name } : data);
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        animals,
      );

      const expectedGroupNameAnimalIdsMap = {}; // { [newGroupName1]: [<animal_id>, ...], [newGroupName2]: [<animal_id>], ... }
      animalsGroups.forEach(({ group_name }, index) => {
        if (group_name) {
          if (!expectedGroupNameAnimalIdsMap[group_name]) {
            expectedGroupNameAnimalIdsMap[group_name] = [];
          }
          expectedGroupNameAnimalIdsMap[group_name].push(res.body[index].id);
        }
      });

      const groupNameIdMap = { [existingGroupName]: existingGroup.id };
      for (let groupName of [newGroupName1, newGroupName2]) {
        const [group] = await AnimalGroupModel.query()
          .where('farm_id', mainFarm.farm_id)
          .andWhere('name', groupName)
          .andWhere('deleted', false);
        groupNameIdMap[groupName] = group.id;
      }

      // check if animal_group_relationship table has expected data
      for (let groupName of groupNames) {
        const foundRelationships = await AnimalGroupRelationshipModel.query().where(
          'animal_group_id',
          groupNameIdMap[groupName],
        );
        const animalIdsInGroup = foundRelationships.map(({ animal_id }) => animal_id);
        expect(animalIdsInGroup).toEqual(expectedGroupNameAnimalIdsMap[groupName]);
      }

      // animalIds of animals that didn't have group_name in request body should not exist in animal_group_relationship  table
      const animalsWithoutGroups = res.body.filter((animal, index) => {
        return !animalsGroups[index].group_name;
      });
      for (let animal of animalsWithoutGroups) {
        const foundRelationships = await AnimalGroupRelationshipModel.query().where(
          'animal_id',
          animal.id,
        );
        expect(foundRelationships.length).toBe(0);
      }

      // check if each animal has correct group_ids
      res.body.forEach((animal, index) => {
        const { group_name } = animalsGroups[index];

        if (group_name) {
          expect(animal.group_ids).toEqual([groupNameIdMap[group_name]]);
        } else {
          expect(animal.group_ids.length).toBe(0);
        }
      });
    });
  });

  describe('Remove animal tests', () => {
    test('Admin users should be able to remove animals', async () => {
      const roles = [1, 2, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const [customAnimalType] = await mocks.custom_animal_typeFactory();

        // Create two animals, one with a default type and one with a custom type
        const firstAnimal = await makeAnimal(mainFarm, {
          default_type_id: defaultTypeId,
        });
        const secondAnimal = await makeAnimal(mainFarm, {
          default_type_id: null,
          custom_type_id: customAnimalType.id,
        });

        const res = await patchRequest(
          {
            user_id: user.user_id,
            farm_id: mainFarm.farm_id,
          },

          [
            {
              id: firstAnimal.id,
              animal_removal_reason_id: animalRemovalReasonId,
              explanation: 'Gifted to neighbor',
              removal_date: mockDate,
            },
            {
              id: secondAnimal.id,
              animal_removal_reason_id: animalRemovalReasonId,
              explanation: 'Gifted to neighbor',
              removal_date: mockDate,
            },
          ],
        );

        expect(res.status).toBe(204);

        // Check database to make sure property has been updated
        const animalRecords = await AnimalModel.query().whereIn('id', [
          firstAnimal.id,
          secondAnimal.id,
        ]);

        animalRecords.forEach((record) => {
          expect(record.animal_removal_reason_id).toBe(animalRemovalReasonId);
        });
      }
    });

    test('Non-admin users should not be able to remove animals', async () => {
      const roles = [3];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const animal = await makeAnimal(mainFarm, {
          default_type_id: defaultTypeId,
        });

        const res = await patchRequest(
          {
            user_id: user.user_id,
            farm_id: mainFarm.farm_id,
          },
          [
            {
              id: animal.id,
              animal_removal_reason_id: animalRemovalReasonId,
              explanation: 'Gifted to neighbor',
              removal_date: mockDate,
            },
          ],
        );

        expect(res.status).toBe(403);
        expect(res.error.text).toBe('User does not have the following permission(s): edit:animals');

        // Check database
        const animalRecord = await AnimalModel.query().findById(animal.id);
        expect(animalRecord.animal_removal_reason_id).toBeNull();
      }
    });

    test('Should not be able to send out an individual animal instead of an array', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const animal = await makeAnimal(mainFarm, {
        default_type_id: defaultTypeId,
      });

      const res = await patchRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },

        {
          id: animal.id,
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
    });

    test('Should not be able to remove an animal without providng a removal_date', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const animal = await makeAnimal(mainFarm, {
        default_type_id: defaultTypeId,
      });

      const res = await patchRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [
          {
            id: animal.id,
            animal_removal_reason_id: animalRemovalReasonId,
            explanation: 'Gifted to neighbor',
          },
        ],
      );

      expect(res).toMatchObject({
        status: 400,
        body: {
          type: 'CheckViolation',
        },
      });

      // Check database
      const animalRecord = await AnimalModel.query().findById(animal.id);
      expect(animalRecord.animal_removal_reason_id).toBeNull();
    });

    test('Should not be able to remove an animal belonging to a different farm', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [secondFarm] = await mocks.farmFactory();

      const animal = await makeAnimal(secondFarm, {
        default_type_id: defaultTypeId,
      });

      const res = await patchRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [
          {
            id: animal.id,
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
          invalidAnimalIds: [animal.id],
        },
      });

      // Check database
      const animalRecord = await AnimalModel.query().findById(animal.id);
      expect(animalRecord.animal_removal_reason_id).toBeNull();
    });
  });

  // DELETE tests
  describe('Delete animal tests', () => {
    test('Admin users should be able to delete animals', async () => {
      const roles = [1, 2, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const [customAnimalType] = await mocks.custom_animal_typeFactory();

        // Create two animals, one with a default type and one with a custom type
        const firstAnimal = await makeAnimal(mainFarm, {
          default_type_id: defaultTypeId,
        });
        const secondAnimal = await makeAnimal(mainFarm, {
          default_type_id: null,
          custom_type_id: customAnimalType.id,
        });

        const res = await deleteRequest({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
          query: `ids=${firstAnimal.id},${secondAnimal.id}`,
        });

        expect(res.status).toBe(204);
      }
    });

    test('Non-admin users should not be able to delete animals', async () => {
      const roles = [3];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const animal = await makeAnimal(mainFarm, {
          default_type_id: defaultTypeId,
        });

        const res = await deleteRequest({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
          query: `ids=${animal.ids}`,
        });

        expect(res.status).toBe(403);
        expect(res.error.text).toBe(
          'User does not have the following permission(s): delete:animals',
        );
      }
    });

    test('Must send animal ids', async () => {
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
      const animal = await makeAnimal(mainFarm, {
        default_type_id: defaultTypeId,
      });

      // Two query params that are not valid animal ids
      const res1 = await deleteRequest({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
        query: `ids=${animal.id},,`,
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

    test('Should not be able to delete an animal belonging to a different farm', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [secondFarm] = await mocks.farmFactory();

      const animal = await makeAnimal(secondFarm, {
        default_type_id: defaultTypeId,
      });

      const res = await deleteRequest({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
        query: `ids=${animal.id}`,
      });

      expect(res).toMatchObject({
        status: 400,
        body: {
          error: 'Invalid ids',
          invalidIds: [`${animal.id}`],
        },
      });
    });

    test('Should not be able to delete an already-deleted animal', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [secondFarm] = await mocks.farmFactory();

      const animal = await makeAnimal(secondFarm, {
        default_type_id: defaultTypeId,
        deleted: true,
      });

      const res = await deleteRequest({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
        query: `ids=${animal.id}`,
      });

      expect(res).toMatchObject({
        status: 400,
        body: {
          error: 'Invalid ids',
          invalidIds: [`${animal.id}`],
        },
      });
    });
  });
});
