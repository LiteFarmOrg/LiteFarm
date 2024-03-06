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
import animalGroupModel from '../src/models/animalGroupModel.js';
import animalGroupRelationshipModel from '../src/models/animalGroupRelationshipModel.js';
import animalBatchGroupRelationshipModel from '../src/models/animalBatchGroupRelationshipModel.js';

describe('Animal Group Tests', () => {
  let farm;
  let newOwner;

  function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .get('/animal_groups')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  const getRequestAsPromise = util.promisify(getRequest);

  function postRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .post('/animal_groups')
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

  async function makeAnimalGroup(mainFarm, properties) {
    const [animalGroup] = await mocks.animal_groupFactory({
      promisedFarm: [mainFarm],
      properties,
    });
    return animalGroup;
  }

  async function makeAnimal(mainFarm, properties) {
    const [animal] = await mocks.animalFactory({
      promisedFarm: [mainFarm],
      properties,
    });
    return animal;
  }

  async function makeAnimalBatch(mainFarm, properties) {
    const [animalBatch] = await mocks.animal_batchFactory({
      promisedFarm: [mainFarm],
      properties,
    });
    return animalBatch;
  }

  async function makeAnimalGroupRelationship(animalGroup, animal) {
    const [animalGroupRelationship] = await mocks.animal_group_relationshipFactory({
      promisedGroup: [animalGroup],
      ...(animal && { promisedAnimal: [animal] }),
    });
    return animalGroupRelationship;
  }

  async function makeAnimalBatchGroupRelationship(animalGroup, animalBatch) {
    const [animalBatchGroupRelationship] = await mocks.animal_batch_group_relationshipFactory({
      promisedGroup: [animalGroup],
      ...(animalBatch && { promisedBatch: [animalBatch] }),
    });
    return animalBatchGroupRelationship;
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
  describe('Get animal groups tests', () => {
    test('All users should get animal groups for their farm', async () => {
      const roles = [1, 2, 3, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const [secondFarm] = await mocks.farmFactory();

        // Create two animals groups and add animals and batches to each of them
        const groups = await Promise.all([makeAnimalGroup(mainFarm), makeAnimalGroup(mainFarm)]);
        const animalRelationships = await Promise.all(
          groups.map(
            async (group) =>
              await Promise.all([
                makeAnimalGroupRelationship(group),
                makeAnimalGroupRelationship(group),
              ]),
          ),
        );
        const batchRelationships = await Promise.all(
          groups.map(
            async (group) =>
              await Promise.all([
                makeAnimalBatchGroupRelationship(group),
                makeAnimalBatchGroupRelationship(group),
              ]),
          ),
        );

        // Create a third animal group belonging to a different farm
        await makeAnimalGroup(secondFarm);

        const res = await getRequestAsPromise({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });

        expect(res.status).toBe(200);
        // Should return first two animal groups
        expect(res.body.length).toBe(2);
        res.body.forEach((group, index) => {
          expect(group.farm_id).toBe(mainFarm.farm_id);
          expect(group.name).toBe(groups[index].name);
          // Match relationships in any order
          expect(group.related_animal_ids.sort()).toEqual(
            animalRelationships[index].map((relationship) => relationship.animal_id).sort(),
          );
          expect(group.related_batch_ids.sort()).toEqual(
            batchRelationships[index].map((relationship) => relationship.animal_batch_id).sort(),
          );
        });
      }
    });

    test('Unauthorized user should get 403 if they try to get animals', async () => {
      const { mainFarm } = await returnUserFarms(1);
      await makeAnimalGroup(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await getRequestAsPromise({
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): get:animal_groups',
      );
    });

    test('Groups should not include deleted animals or batches', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const group = await makeAnimalGroup(mainFarm);

      const animal = await makeAnimal(mainFarm, { deleted: true });
      const batch = await makeAnimalBatch(mainFarm, { deleted: true });

      await makeAnimalGroupRelationship(group, animal);
      await makeAnimalBatchGroupRelationship(group, batch);

      const res = await getRequestAsPromise({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      // Should return only one animal group with no related ids
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);

      const resGroup = res.body[0];
      expect(resGroup.name).toBe(group.name);
      expect(resGroup.related_animal_ids).toEqual([]);
      expect(resGroup.related_batch_ids).toEqual([]);
    });
  });

  // POST TESTS
  describe('POST animal groups tests', () => {
    test('Admin users should create animal groups for their farm', async () => {
      const adminRoles = [1, 2, 5];

      for (const role of adminRoles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const firstAnimal = await makeAnimal(mainFarm);
        const secondAnimal = await makeAnimal(mainFarm);

        const firstAnimalBatch = await makeAnimalBatch(mainFarm);
        const secondAnimalBatch = await makeAnimalBatch(mainFarm);

        const animalGroup = mocks.fakeAnimalGroup();

        const related_animal_ids = [firstAnimal.id, secondAnimal.id];
        const related_batch_ids = [firstAnimalBatch.id, secondAnimalBatch.id];

        const res = await postRequestAsPromise(
          {
            ...animalGroup,
            related_animal_ids,
            related_batch_ids,
          },
          {
            user_id: user.user_id,
            farm_id: mainFarm.farm_id,
          },
        );

        // Check response
        expect(res).toMatchObject({
          status: 201,
          body: {
            farm_id: mainFarm.farm_id,
            created_by_user_id: user.user_id,
            name: animalGroup.name,
            notes: animalGroup.notes,
          },
        });

        const { id } = res.body;

        // Check join tables
        const animal_group_relationship = await animalGroupRelationshipModel
          .query()
          .where({ animal_group_id: id });

        expect(animal_group_relationship).toHaveLength(related_animal_ids.length);
        animal_group_relationship.forEach((record) => {
          expect(related_animal_ids).toContain(record.animal_id);
        });

        const animal_batch_group_relationship = await animalBatchGroupRelationshipModel
          .query()
          .where({ animal_group_id: id });

        expect(animal_batch_group_relationship).toHaveLength(related_batch_ids.length);
        animal_batch_group_relationship.forEach((record) => {
          expect(related_batch_ids).toContain(record.animal_batch_id);
        });
      }
    });

    test('Workers should not be able to create animal groups', async () => {
      const { mainFarm, user } = await returnUserFarms(3);

      const firstAnimal = await makeAnimal(mainFarm);
      const secondAnimal = await makeAnimal(mainFarm);

      const firstAnimalBatch = await makeAnimalBatch(mainFarm);
      const secondAnimalBatch = await makeAnimalBatch(mainFarm);

      const animalGroup = mocks.fakeAnimalGroup();

      const res = await postRequestAsPromise(
        {
          ...animalGroup,
          related_animal_ids: [firstAnimal.id, secondAnimal.id],
          related_batch_ids: [firstAnimalBatch.id, secondAnimalBatch.id],
        },
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
      );

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): add:animal_groups',
      );
    });

    test('Should be possible to create empty groups', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const animalGroup = mocks.fakeAnimalGroup();

      const res = await postRequestAsPromise(
        {
          ...animalGroup,
          related_animal_ids: [],
          related_batch_ids: [],
        },
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
      );

      // Check response
      expect(res).toMatchObject({
        status: 201,
        body: {
          farm_id: mainFarm.farm_id,
          created_by_user_id: user.user_id,
          name: animalGroup.name,
          notes: animalGroup.notes,
        },
      });

      const { id } = res.body;

      // Check join tables
      const animal_group_relationship = await animalGroupRelationshipModel
        .query()
        .where({ animal_group_id: id });

      expect(animal_group_relationship).toHaveLength(0);

      const animal_batch_group_relationship = await animalBatchGroupRelationshipModel
        .query()
        .where({ animal_group_id: id });

      expect(animal_batch_group_relationship).toHaveLength(0);
    });

    test('Should not be possible to create groups with the same name as existing animal groups', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const animalGroup = mocks.fakeAnimalGroup();

      await postRequestAsPromise(
        {
          ...animalGroup,
          related_animal_ids: [],
          related_batch_ids: [],
        },
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
      );

      const res = await postRequestAsPromise(
        {
          ...animalGroup,
          related_animal_ids: [],
          related_batch_ids: [],
        },
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
      );

      // Check response
      expect(res.status).toBe(409);
    });

    test('Should not be possible to created animal groups with animals from other farms', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [secondFarm] = await mocks.farmFactory();

      const firstAnimal = await makeAnimal(mainFarm);
      const secondAnimal = await makeAnimal(secondFarm);

      const related_animal_ids = [firstAnimal.id, secondAnimal.id];
      const related_batch_ids = [];

      const animalGroup = mocks.fakeAnimalGroup();

      const res = await postRequestAsPromise(
        {
          ...animalGroup,
          related_animal_ids,
          related_batch_ids,
        },
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
      );

      // Check response
      expect(res).toMatchObject({
        status: 400,
        body: {
          error: 'Invalid ids',
          invalidAnimalIds: [secondAnimal.id],
          invalidBatchIds: [],
        },
      });

      // Check that nothing has been added to join table
      const animal_group_relationship = await animalGroupRelationshipModel
        .query()
        .where({ animal_id: firstAnimal.id })
        .orWhere({ animal_id: secondAnimal.id });

      expect(animal_group_relationship).toHaveLength(0);
    });

    test('Should not be possible to created animal groups with batches from other farms', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [secondFarm] = await mocks.farmFactory();

      const firstBatch = await makeAnimalBatch(mainFarm);
      const secondBatch = await makeAnimalBatch(secondFarm);

      const related_animal_ids = [];
      const related_batch_ids = [firstBatch.id, secondBatch.id];

      const animalGroup = mocks.fakeAnimalGroup();

      const res = await postRequestAsPromise(
        {
          ...animalGroup,
          related_animal_ids,
          related_batch_ids,
        },
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
      );

      // Check response
      expect(res).toMatchObject({
        status: 400,
        body: {
          error: 'Invalid ids',
          invalidAnimalIds: [],
          invalidBatchIds: [secondBatch.id],
        },
      });

      // Check that nothing has been added to join table
      const animal_batch_group_relationship = await animalBatchGroupRelationshipModel
        .query()
        .where({ animal_batch_id: firstBatch.id })
        .orWhere({ animal_batch_id: secondBatch.id });

      expect(animal_batch_group_relationship).toHaveLength(0);
    });
  });
});
