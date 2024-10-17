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
import CustomAnimalTypeModel from '../src/models/customAnimalTypeModel.js';
import CustomAnimalBreedModel from '../src/models/customAnimalBreedModel.js';
import AnimalUseRelationshipModel from '../src/models/animalUseRelationshipModel.js';

describe('Animal Tests', () => {
  let farm;
  let newOwner;
  let defaultTypeId;
  let animalRemovalReasonId;
  let animalUse1;
  let animalOrigin1;
  let animalIdentifier1;

  const mockDate = new Date('2024/3/12').toISOString();

  beforeAll(async () => {
    const [defaultAnimalType] = await mocks.default_animal_typeFactory();
    defaultTypeId = defaultAnimalType.id;

    // Alternatively the enum table could be kept (not cleaned up)
    const [animalRemovalReason] = await mocks.animal_removal_reasonFactory();
    animalRemovalReasonId = animalRemovalReason.id;

    [animalUse1] = await mocks.animal_useFactory('OTHER');
    [animalOrigin1] = await mocks.animal_originFactory('BROUGHT_IN');
    [animalIdentifier1] = await mocks.animal_identifier_typeFactory(undefined, 'OTHER');
  });

  async function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    return await chai
      .request(server)
      .get('/animals')
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  async function postRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, data) {
    return await chai
      .request(server)
      .post('/animals')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  async function removeRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, data) {
    return await chai
      .request(server)
      .patch('/animals/remove')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

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

  async function returnUserFarms(role, farm = undefined) {
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

        const res = await getRequest({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });

        expect(res.status).toBe(200);
        // Should return first two animals
        expect(res.body.length).toBe(2);
        res.body.forEach((animal) => {
          expect(animal.farm_id).toBe(mainFarm.farm_id);
        });
        expect({
          ...firstAnimal,
          internal_identifier: res.body[0].internal_identifier,
          group_ids: [],
          animal_use_relationships: [],
        }).toMatchObject(res.body[0]);
        expect({
          ...secondAnimal,
          internal_identifier: res.body[1].internal_identifier,
          group_ids: [],
          animal_use_relationships: [],
        }).toMatchObject(res.body[1]);
      }
    });

    test('Unauthorized user should get 403 if they try to get animals', async () => {
      const { mainFarm } = await returnUserFarms(1);
      await makeAnimal(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await getRequest({
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

        const res = await postRequest(
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

        const res = await postRequest(
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

      const res = await postRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        animal,
      );

      expect(res.status).toBe(400);
      expect(res.error.text).toBe('Request body should be an array');
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
        const res = await postRequest({ user_id: user.user_id, farm_id: farm.farm_id }, [animal]);

        expect(res.body[0].internal_identifier).toBe(animalCount + batchCount + 1);
      }
    });

    test('Should not be able to create an animal without a type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const animal = mocks.fakeAnimal({
        default_type_id: null,
        custom_type_id: null,
      });

      const res = await postRequest(
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

      const res = await postRequest(
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

      const res = await postRequest(
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

      const res = await postRequest(
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
        const res = await postRequest({ user_id: owner.user_id, farm_id: farm.farm_id }, animals);
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
        const [defaultAnimalBreed] = await mocks.default_animal_breedFactory();
        let animal = mocks.fakeAnimal({
          default_type_id: defaultAnimalBreed.default_type_id,
          default_breed_id: defaultAnimalBreed.id,
          breed_name: breedName,
        });
        let res = await postAnimalsRequest([animal]);
        expect(res.status).toBe(400);

        const [customAnimalBreed] = await mocks.custom_animal_breedFactory({
          promisedFarm: [farm],
          properties: { default_type_id: defaultTypeId, custom_type_id: null },
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
        const [
          customTypeName1,
          customTypeName2,
          typeName1,
          typeName2,
          breedName1,
          breedName2,
          breedName3,
          breedName4,
          breedName5,
        ] = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          return `${faker.lorem.word() + num}`;
        });
        const [customAnimalType1] = await mocks.custom_animal_typeFactory({
          promisedFarm: [farm],
          properties: { type: customTypeName1 },
        });
        const [customAnimalType2] = await mocks.custom_animal_typeFactory({
          promisedFarm: [farm],
          properties: { type: customTypeName2 },
        });
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
        const animal5 = mocks.fakeAnimal({
          default_type_id: defaultTypeId,
          breed_name: breedName3,
        });
        const animal6 = mocks.fakeAnimal({
          custom_type_id: customAnimalType1.id,
          breed_name: breedName4,
        });
        const animal7 = mocks.fakeAnimal({
          custom_type_id: customAnimalType2.id,
          breed_name: breedName5,
        });
        const res = await postAnimalsRequest([
          animal1,
          animal2,
          animal3,
          animal4,
          animal5,
          animal6,
          animal7,
        ]);
        const [newType1, newType2] = await Promise.all(
          [typeName1, typeName2].map(async (name) => await getCustomAnimalType(name)),
        );
        const [newBreed1, newBreed2] = await Promise.all(
          [breedName1, breedName2].map(
            async (name) => await getCustomAnimalBreed(name, 'custom_type_id', newType1.id),
          ),
        );
        const newBreed3 = await getCustomAnimalBreed(breedName3, 'default_type_id', defaultTypeId);
        const newBreed4 = await getCustomAnimalBreed(
          breedName4,
          'custom_type_id',
          customAnimalType1.id,
        );
        const newBreed5 = await getCustomAnimalBreed(
          breedName5,
          'custom_type_id',
          customAnimalType2.id,
        );

        expect(res.status).toBe(201);
        expect(res.body.length).toBe(7);
        expect(res.body[0].custom_type_id).toBe(newType1.id);
        expect(res.body[1].custom_type_id).toBe(newType2.id);
        expect(res.body[2].custom_type_id).toBe(newType1.id);
        expect(res.body[2].custom_breed_id).toBe(newBreed1.id);
        expect(res.body[3].custom_type_id).toBe(newType1.id);
        expect(res.body[3].custom_breed_id).toBe(newBreed2.id);
        expect(res.body[4].default_type_id).toBe(defaultTypeId);
        expect(res.body[4].custom_breed_id).toBe(newBreed3.id);
        expect(res.body[5].custom_type_id).toBe(customAnimalType1.id);
        expect(res.body[5].custom_breed_id).toBe(newBreed4.id);
        expect(res.body[6].custom_type_id).toBe(customAnimalType2.id);
        expect(res.body[6].custom_breed_id).toBe(newBreed5.id);
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

      const res = await postRequest(
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

      // animalIds of animals that didn't have group_name in request body should not exist in animal_group_relationship table
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

  // EDIT tests
  describe('Edit animal tests', () => {
    let animalGroup1;
    let animalGroup2;
    let animalSex;
    let animalIdentifierColor;
    let animalIdentifierType;
    let animalOrigin;
    let animalRemovalReason;
    let animalUse2;
    let animalUse3;

    beforeEach(async () => {
      [animalGroup1] = await mocks.animal_groupFactory();
      [animalGroup2] = await mocks.animal_groupFactory();
      // Populate enums
      [animalSex] = await mocks.animal_sexFactory();
      [animalIdentifierColor] = await mocks.animal_identifier_colorFactory();
      [animalIdentifierType] = await mocks.animal_identifier_typeFactory();
      [animalOrigin] = await mocks.animal_originFactory();
      [animalRemovalReason] = await mocks.animal_removal_reasonFactory();
      [animalUse2] = await mocks.animal_useFactory();
      [animalUse3] = await mocks.animal_useFactory();
    });

    async function addAnimals(mainFarm, user) {
      const [customAnimalType] = await mocks.custom_animal_typeFactory({
        promisedFarm: [mainFarm],
      });

      // Create two animals, one with a default type and one with a custom type
      const firstAnimal = mocks.fakeAnimal({
        name: 'edit test 1',
        default_type_id: defaultTypeId,
        animal_use_relationships: [{ use_id: animalUse1.id }],
        sire: 'Unchanged',
        group_name: animalGroup1.name,
      });
      const secondAnimal = mocks.fakeAnimal({
        name: 'edit test 2',
        custom_type_id: customAnimalType.id,
        animal_use_relationships: [{ use_id: animalUse1.id }],
        sire: 'Unchanged',
      });

      const res = await postRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [firstAnimal, secondAnimal],
      );

      const returnedFirstAnimal = res.body?.find((animal) => animal.name === 'edit test 1');
      const returnedSecondAnimal = res.body?.find((animal) => animal.name === 'edit test 2');

      return { res, returnedFirstAnimal, returnedSecondAnimal };
    }

    async function editAnimals(mainFarm, user, returnedFirstAnimal, returnedSecondAnimal) {
      const [customAnimalType] = await mocks.custom_animal_typeFactory({
        promisedFarm: [mainFarm],
      });

      // Make edits to animals - does not test all top level animal columns, but all relationships
      const updatedFirstAnimal = mocks.fakeAnimal({
        // Extra properties are silently removed
        extra_non_existant_property: 'hello',
        id: returnedFirstAnimal.id,
        default_type_id: defaultTypeId,
        name: 'Update Name 1',
        sire: returnedFirstAnimal.sire,
        sex_id: animalSex.id,
        identifier: '2',
        identifier_color_id: animalIdentifierColor.id,
        origin_id: animalOrigin.id,
        // Extra properties are silently removed
        animal_removal_reason_id: animalRemovalReason.id,
        identifier_type_id: animalIdentifierType.id,
        organic_status: 'Organic',
        animal_use_relationships: [{ use_id: animalUse2.id }, { use_id: animalUse3.id }],
        group_ids: [{ animal_group_id: animalGroup2.id }],
      });
      const updatedSecondAnimal = mocks.fakeAnimal({
        id: returnedSecondAnimal.id,
        custom_type_id: customAnimalType.id,
        name: 'Update Name 1',
        sire: returnedSecondAnimal.sire,
        sex_id: animalSex.id,
        identifier: '2',
        identifier_color_id: animalIdentifierColor.id,
        origin_id: animalOrigin.id,
        // Extra properties are silently removed
        animal_removal_reason_id: animalRemovalReason.id,
        identifier_type_id: animalIdentifierType.id,
        organic_status: 'Organic',
        animal_use_relationships: [{ use_id: animalUse2.id }, { use_id: animalUse3.id }],
        group_ids: [{ animal_group_id: animalGroup2.id }],
      });

      const patchRes = await patchRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [updatedFirstAnimal, updatedSecondAnimal],
      );

      // Remove or add properties not actually expected from get request
      [updatedFirstAnimal, updatedSecondAnimal].forEach((animal) => {
        // Should not cause an error
        delete animal.extra_non_existant_property;
        // Should not be able to update on edit
        animal.animal_removal_reason_id = null;
        // Return format different than post format
        animal.group_ids = animal.group_ids.map((groupId) => groupId.animal_group_id);
        animal.animal_use_relationships.forEach((rel) => {
          rel.animal_id = animal.id;
          rel.other_use = null;
        });
      });

      return { res: patchRes, updatedFirstAnimal, updatedSecondAnimal };
    }

    test('Admin users should be able to edit animals', async () => {
      const roles = [1, 2, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        // Add animals to db
        const { res: addRes, returnedFirstAnimal, returnedSecondAnimal } = await addAnimals(
          mainFarm,
          user,
        );
        expect(addRes.status).toBe(201);
        expect(returnedFirstAnimal).toBeTruthy();
        expect(returnedSecondAnimal).toBeTruthy();

        // Edit animals in db
        const { res: editRes, updatedFirstAnimal, updatedSecondAnimal } = await editAnimals(
          mainFarm,
          user,
          returnedFirstAnimal,
          returnedSecondAnimal,
        );
        expect(editRes.status).toBe(204);

        // Get updated animals
        const { body: animalRecords } = await getRequest({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });
        const filteredAnimalRecords = animalRecords.filter((record) =>
          [returnedFirstAnimal.id, returnedSecondAnimal.id].includes(record.id),
        );

        // Test data matches expected changes
        filteredAnimalRecords.forEach((record) => {
          // Remove properties that were not updated
          delete record.internal_identifier;
          // Remove base properties
          delete record.created_at;
          delete record.created_by_user_id;
          delete record.deleted;
          delete record.updated_at;
          delete record.updated_by;
          const updatedRecord = [updatedFirstAnimal, updatedSecondAnimal].find(
            (animal) => animal.id === record.id,
          );
          expect(record).toMatchObject(updatedRecord);
        });
      }
    });

    test('Non-admin users should not be able to edit animals', async () => {
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
      const { res: addRes, returnedFirstAnimal, returnedSecondAnimal } = await addAnimals(
        mainFarm,
        admin,
      );
      expect(addRes.status).toBe(201);
      expect(returnedFirstAnimal).toBeTruthy();
      expect(returnedSecondAnimal).toBeTruthy();

      // Edit animals in db
      const { res: editRes } = await editAnimals(
        mainFarm,
        user,
        returnedFirstAnimal,
        returnedSecondAnimal,
      );

      // Test failure
      expect(editRes.status).toBe(403);
      expect(editRes.error.text).toBe(
        'User does not have the following permission(s): edit:animals',
      );
    });

    test('Should not be able to send out an individual animal instead of an array', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      // Add animals to db
      const { res: addRes, returnedFirstAnimal } = await addAnimals(mainFarm, user);
      expect(addRes.status).toBe(201);
      expect(returnedFirstAnimal).toBeTruthy();

      // Change 1 thing
      returnedFirstAnimal.sire = 'Changed';

      const res = await patchRequest(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        {
          ...returnedFirstAnimal,
        },
      );

      // Test for failure
      expect(res.status).toBe(400);
      expect(res.error.text).toBe('Request body should be an array');
    });

    test('Should not be able to edit an animal belonging to a different farm', async () => {
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
            sire: 'Neighbours sire',
          },
        ],
      );

      expect(res).toMatchObject({
        status: 400,
        body: {
          error: 'Invalid ids',
          invalidIds: [animal.id],
        },
      });

      // Check database
      const animalRecord = await AnimalModel.query().findById(animal.id);
      expect(animalRecord.sire).toBeNull();
    });
  });

  // REMOVE tests
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

        const res = await removeRequest(
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

        const res = await removeRequest(
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

      const res = await removeRequest(
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

      expect(res.status).toBe(400);
      expect(res.error.text).toBe('Request body should be an array');
    });

    test('Should not be able to remove an animal without providng a removal_date', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const animal = await makeAnimal(mainFarm, {
        default_type_id: defaultTypeId,
      });

      const res = await removeRequest(
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
      expect(res.status).toBe(400);
      expect(res.error.text).toBe('Must send reason and date of removal');

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

      const res = await removeRequest(
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
          invalidIds: [animal.id],
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

  // MIDDLEWARE tests
  describe('Edit animal animal tests', () => {
    let animalOrigin2;
    let animalUse2;
    let animalUse3;
    let animalBreed;
    let animalBreed2;
    let animalIdentifier2;

    beforeEach(async () => {
      // Populate enums
      [animalOrigin2] = await mocks.animal_originFactory();
      [animalUse2] = await mocks.animal_useFactory();
      [animalUse3] = await mocks.animal_useFactory();
      [animalBreed] = await mocks.default_animal_breedFactory();
      [animalBreed2] = await mocks.default_animal_breedFactory();
      [animalIdentifier2] = await mocks.animal_identifier_typeFactory();
    });

    // Top level structure is endpoint string with value as in caps, value is an array of tests
    // Example: {'CREATE': [{test1}, {test2},...],'EDIT': [{test1}, {test2},...}
    // Test structure to test 'CREATE' middleware is:
    // { testName: 'name', getPostBody: function() {return [animal]}, postErr: {code: 400, message: 'errorMessage'}}
    // Test structure to test 'EDIT' middleware is:
    // { testName: 'name', getPostBody?: function() {return [animal]}, getPatchBody?: function() {return [editedAnimal]}, patchErr: {code: 400, message: 'errorMessage'}} }
    // Test structure to test raw data expectations is:
    // { testName: 'name', getPostBody?: function() {return [animal]}, getPatchBody?: function() {return [editedAnimal]}, getRawRecordMismatch: function() return { model: Model, where: {id}, getMatchingBody: function() return [records] } } }
    const middlewareErrors = {
      CREATE: [
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
      ],
      EDIT: [
        {
          testName: 'Exactly one type provided',
          getPatchBody: (animal) => [
            {
              id: animal.id,
              default_type_id: animal.default_type_id,
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
          getPatchBody: (animal) => [
            {
              id: animal.id,
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
          getPatchBody: (animal) => [
            {
              id: animal.id,
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
          getPatchBody: (animal, existingAnimals, customs) => [
            {
              id: animal.id,
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
          getPatchBody: (animal) => [
            {
              id: animal.id,
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
          getPatchBody: (animal, existingAnimals) => [
            {
              id: existingAnimals[0].id,
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
          getPatchBody: (animal, existingAnimals) => [
            {
              id: existingAnimals[0].id,
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
          getPatchBody: (animal) => [
            {
              id: animal.id,
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
          getPatchBody: (animal) => [
            {
              id: animal.id,
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
          getPatchBody: (animal, existingAnimals) => [
            {
              id: existingAnimals[0].id,
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
          testName: 'Custom breed is a number',
          getPatchBody: (animal) => [
            {
              id: animal.id,
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
          getPatchBody: (animal) => [
            {
              id: animal.id,
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
          getPatchBody: (animal) => [
            {
              id: animal.id,
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
          getPatchBody: (animal, existingAnimals, customs) => [
            {
              id: animal.id,
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
          getPatchBody: (animal, existingAnimals, customs) => [
            {
              id: existingAnimals[0].id,
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
          getPatchBody: (animal, existingAnimals, customs) => [
            {
              id: existingAnimals[0].id,
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
          getPatchBody: (animal, existingAnimals, customs) => [
            {
              id: existingAnimals[0].id,
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
          testName: 'Use relationships is an array',
          getPatchBody: (animal) => [
            {
              id: animal.id,
              animal_use_relationships: 'string',
            },
          ],
          patchErr: {
            code: 400,
            message: 'animal_use_relationships should be an array',
          },
        },
        {
          testName: 'Other use notes is for other use type',
          getPatchBody: (animal) => [
            {
              id: animal.id,
              animal_use_relationships: [
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
          getRawRecordMismatch: (existingAnimals) => {
            return {
              model: AnimalUseRelationshipModel,
              where: { animal_id: existingAnimals[0].id },
              getMatchingBody: (existingAnimals, records) => {
                return [];
              },
            };
          },
          getPatchBody: (animal, existingAnimals) => [
            {
              id: existingAnimals[0].id,
              animal_use_relationships: [],
            },
          ],
          getPostBody: () => [
            {
              default_type_id: animalBreed.default_type_id,
              animal_use_relationships: [
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
          getRawRecordMismatch: (existingAnimals) => {
            return {
              model: AnimalUseRelationshipModel,
              where: { animal_id: existingAnimals[0].id },
              getMatchingBody: (existingAnimals, records) => {
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
          getPatchBody: (animal, existingAnimals) => [
            {
              id: existingAnimals[0].id,
              animal_use_relationships: [
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
              animal_use_relationships: [
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
          getPatchBody: (animal) => [
            {
              id: animal.id,
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
          testName: 'Other identifier notes must be used with "other" identifier',
          getPatchBody: (animal) => [
            {
              id: animal.id,
              identifier_type_id: animalIdentifier2.id,
              identifier_type_other: 'string',
            },
          ],
          patchErr: {
            code: 400,
            message: 'Other identifier notes must be used with "other" identifier',
          },
        },
        {
          testName: 'Cannot create a new type associated with an existing breed',
          getPatchBody: (animal) => [
            {
              id: animal.id,
              defaultBreedId: animalBreed.id,
              type_name: 'string',
            },
          ],
          patchErr: {
            code: 400,
            message: 'Cannot create a new type associated with an existing breed',
          },
        },
      ],
    };

    // Takes middleWareErrors object and makes it into individual tests
    for (const errorEndpoint in middlewareErrors) {
      middlewareErrors[errorEndpoint].forEach(async (error) => {
        await test(`${errorEndpoint} Middleware: ${error.testName}`, async () => {
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

          // Post endpoint for testing CREATE or testing EDIT against existing record
          const makeCheckGetAnimal = async (getPostBody) => {
            const animals = getPostBody(customs).map((animal) => mocks.fakeAnimal(animal));
            const postRes = await postRequest(
              {
                user_id: user.user_id,
                farm_id: mainFarm.farm_id,
              },
              [...animals],
            );

            // If checking error body on post
            expect(postRes.status).toBe(error.postErr?.code || 201);
            expect(postRes.error.text).toBe(error.postErr?.message || undefined);
            return postRes.body;
          };

          let existingAnimals;
          if (error.getPostBody) {
            existingAnimals = await makeCheckGetAnimal(error.getPostBody);
          }

          // Patch endpoint for testing EDIT or testing raw successful records against
          const editCheckAnimal = async (getPatchBody) => {
            // for skipping makeCheckGetAnimal
            const animal = await makeAnimal(mainFarm, {
              default_type_id: defaultTypeId,
            });
            const animals = getPatchBody(animal, existingAnimals, customs);
            const patchRes = await patchRequest(
              {
                user_id: user.user_id,
                farm_id: mainFarm.farm_id,
              },
              [...animals],
            );
            console.log(error.testName);
            console.log(patchRes);
            // If checking error body on patch
            expect(patchRes.status).toBe(error.patchErr?.code || 204);
            expect(patchRes.error.text).toBe(error.patchErr?.message || undefined);
          };

          if (error.getPatchBody) {
            await editCheckAnimal(error.getPatchBody);
          }

          // For checking raw records made in CREATE or EDIT
          const rawGetMatch = async (getRawRecordMismatch) => {
            const rawRecordMatch = getRawRecordMismatch(existingAnimals);
            // Include deleted
            const records = await rawRecordMatch.model
              .query()
              .where(rawRecordMatch.where)
              .context({ showHidden: true });
            const expectedBody = rawRecordMatch.getMatchingBody(existingAnimals, records, customs);
            // No fallback if provided
            expect(records).toEqual(expectedBody);
          };

          if (error.getRawRecordMismatch) {
            await rawGetMatch(error.getRawRecordMismatch);
          }
        });
      });
    }
  });
});
