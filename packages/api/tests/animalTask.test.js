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

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';
import { tableCleanup } from './testEnvironment.js';
import { faker } from '@faker-js/faker';

import {
  toLocal8601Extended,
  postTaskRequest,
  getTasksRequest,
  completeTaskRequest,
  patchTaskDateRequest,
  userFarmTaskGenerator,
  todayWithTimezone,
  yesterdayInYYYYMMDD,
  fakeCompletionData,
  animalTaskGenerator,
} from './utils/taskUtils.js';

// data representing a completed task, formatted as expected in a GET response
const expectedCompletedTaskData = {
  ...fakeCompletionData,
  complete_date: `${fakeCompletionData.complete_date}T00:00:00.000`,
};

// simulates the data for a completed movement task as returned by a GET request
const simulateMovementTaskCompletion = (task) => {
  const { location_id } = task.locations[0];
  return {
    ...task,
    ...expectedCompletedTaskData,
    animals: task.animals.map((animal) => ({ ...animal, location_id })),
    animal_batches: task.animal_batches.map((batch) => ({ ...batch, location_id })),
  };
};

const simulateTaskCompletion = (task, type) => {
  const complete = {
    animal_movement_task: simulateMovementTaskCompletion,
  }[type];

  return complete?.(task) || { ...task, ...expectedCompletedTaskData };
};

// generates a fake movement task for direct insertion into the DB
const createFakeMovementTask = (purposeRelationships) => {
  const movementTask = { animal_movement_task: {} };
  if (purposeRelationships) {
    movementTask.animal_movement_task = { purpose_relationships: purposeRelationships };
  }
  return mocks.fakeAnimalMovementTask(movementTask);
};

const createMovementTaskForReqBody = (purposeIds, otherPurpose) => {
  const animalMovementTask = {};

  if (purposeIds) {
    animalMovementTask.purpose_ids = purposeIds;
  }
  if (otherPurpose) {
    animalMovementTask.other_purpose = otherPurpose;
  }

  return { animal_movement_task: animalMovementTask };
};

const checkMovementPurposeRelationships = (expectedRelationships, actualRelationships) => {
  if (!expectedRelationships) {
    return;
  }
  expect(actualRelationships.length).toBe(expectedRelationships.length);

  expectedRelationships.forEach(
    ({ purpose_id: expectedPurposeId, other_purpose: expectedOtherPurpose }) => {
      const actualRelationship = actualRelationships.filter(
        (relation) => relation.purpose_id === expectedPurposeId,
      );
      expect(actualRelationship.length).toBe(1);

      if (expectedOtherPurpose) {
        expect(actualRelationship[0].other_purpose).toBe(expectedOtherPurpose);
      }
    },
  );
};

describe('Animal task tests', () => {
  let user_id, farm_id, location_id, task_type_id, planting_management_plan_id;
  let animal1, animal2, animal3, animal4, batch1, batch2, batch3, batch4;
  let farmBId, farmBAnimal1, farmBBatch1, location2Id, farmBLocationId;
  let removedAnimal1, removedBatch1, deletedAnimal1, deletedBatch1;
  let animalBornToday, animalBroughtInToday;
  let purpose1, purpose2, otherPurpose;

  beforeAll(async () => {
    // Check in controller expects Soil Amendment Task to exist
    await knex('task_type').insert({
      farm_id: null,
      task_name: 'Soil amendment',
      task_translation_key: 'SOIL_AMENDMENT_TASK',
    });

    ({
      user_id,
      farm_id,
      location_id,
      task_type_id,
      planting_management_plan_id,
    } = await userFarmTaskGenerator());

    [{ location_id: location2Id }] = await mocks.locationFactory({
      promisedFarm: [{ farm_id }],
    });
    [{ farm_id: farmBId }] = await mocks.userFarmFactory({}, { user_id });
    [{ location_id: farmBLocationId }] = await mocks.locationFactory({
      promisedFarm: [{ farm_id: farmBId }],
    });

    [[animal1], [animal2], [animal3], [animal4]] = await Promise.all(
      new Array(4).fill().map(() => mocks.animalFactory({ promisedFarm: [{ farm_id }] })),
    );
    [[batch1], [batch2], [batch3], [batch4]] = await Promise.all(
      new Array(4).fill().map(() => mocks.animal_batchFactory({ promisedFarm: [{ farm_id }] })),
    );

    const [animalRemovalReason] = await mocks.animal_removal_reasonFactory();
    [removedAnimal1] = await mocks.animalFactory({
      promisedFarm: [{ farm_id }],
      properties: {
        removal_date: new Date(),
        animal_removal_reason_id: animalRemovalReason.id,
      },
    });
    [removedBatch1] = await mocks.animal_batchFactory({
      promisedFarm: [{ farm_id }],
      properties: {
        removal_date: new Date(),
        animal_removal_reason_id: animalRemovalReason.id,
      },
    });
    [deletedAnimal1] = await mocks.animalFactory({
      promisedFarm: [{ farm_id }],
      properties: { deleted: true },
    });
    [deletedBatch1] = await mocks.animal_batchFactory({
      promisedFarm: [{ farm_id }],
      properties: { deleted: true },
    });
    [farmBAnimal1] = await mocks.animalFactory({ promisedFarm: [{ farm_id: farmBId }] });
    [farmBBatch1] = await mocks.animal_batchFactory({ promisedFarm: [{ farm_id: farmBId }] });

    [animalBornToday] = await mocks.animalFactory({
      promisedFarm: [{ farm_id }],
      properties: { birth_date: todayWithTimezone },
    });
    [animalBroughtInToday] = await mocks.animalFactory({
      promisedFarm: [{ farm_id }],
      properties: { brought_in_date: todayWithTimezone },
    });

    [otherPurpose] = await mocks.animal_movement_purposeFactory('OTHER');
    [[purpose1], [purpose2]] = await Promise.all(
      Array(2)
        .fill()
        .map(() => mocks.animal_movement_purposeFactory()),
    );
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  // generate and insert animal task data into the DB
  const animalTaskFactory = async (data) => {
    return animalTaskGenerator({
      due_date: faker.date.future().toISOString().split('T')[0],
      task_type_id,
      locations: [{ location_id }],
      owner_user_id: user_id,
      assignee_user_id: user_id,
      override_hourly_wage: true,
      wage_at_moment: 50,
      animals: [{ id: animal1.id }, { id: animal2.id }, { id: animal3.id }],
      animal_batches: [{ id: batch1.id }, { id: batch2.id }],
      ...data,
    });
  };

  describe('GET tasks', () => {
    test('should get all tasks for a farm with correct task-specific details', async () => {
      const typesToTest = ['animal_movement_task'];
      const [
        [{ task_type_id: movementTaskId }],
        // Destructure other types as needed
      ] = await Promise.all(
        typesToTest.map(() => mocks.task_typeFactory({ promisedFarm: [{ farm_id }] })),
      );

      // Add more cases (data to add to the DB) here for new task types as needed
      const taskDataBlueprint = [
        {
          task_type_id: movementTaskId,
          ...createFakeMovementTask([
            { purpose_id: purpose1.id },
            { purpose_id: otherPurpose.id, other_purpose: faker.lorem.sentence() },
          ]),
        },
        { task_type_id: movementTaskId, ...createFakeMovementTask() },
      ];

      const expectedTasks = await Promise.all(
        taskDataBlueprint.map((data) => animalTaskFactory(data)),
      );
      const res = await getTasksRequest({ farm_id, user_id });

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(taskDataBlueprint.length);

      res.body.forEach((resTask) => {
        const expectedTask = expectedTasks.find(({ task_id }) => resTask.task_id === task_id);

        switch (resTask.task_type_id) {
          case movementTaskId:
            expect(resTask.animal_movement_task.task_id).toBe(expectedTask.task_id);
            checkMovementPurposeRelationships(
              expectedTask.animal_movement_task.purpose_relationships,
              resTask.animal_movement_task.purpose_relationships,
            );
            break;
          // Add more cases here for other task types added to taskDataBlueprint
          default:
            throw new Error(`Unexpected task type: ${resTask.task_type_id}`);
        }
      });
    });
  });

  describe('POST Task', () => {
    const createAnimalTaskForReqBody = (extraData = {}) => {
      return mocks.fakeTask({
        related_animal_ids: [animal1, animal2, animal3, animal4].map(({ id }) => id),
        related_batch_ids: [batch1, batch2, batch3, batch4].map(({ id }) => id),
        task_type_id,
        owner_user_id: user_id,
        locations: [{ location_id }],
        ...extraData,
      });
    };
    const fakeTaskData = {
      animal_movement_task: () => mocks.fakeAnimalMovementTask(),
    };

    const checkValidPostRequest = async (type, postData) => {
      const res = await postTaskRequest({ user_id, farm_id }, type, postData);
      expect(res.status).toBe(201);
      const { task_id } = res.body;
      const createdTask = await knex('task').where({ task_id }).first();
      expect(createdTask).toBeDefined();
      const location = await knex('location_tasks').where({ task_id }).first();
      expect(location.location_id).toBe(postData.locations[0].location_id);
      const specificTask = await knex(type).where({ task_id });
      expect(specificTask.length).toBe(1);
      const relatedAnimals = await knex('task_animal_relationship')
        .select('animal_id')
        .where({ task_id });
      expect(postData.related_animal_ids.sort()).toEqual(
        relatedAnimals.map(({ animal_id }) => animal_id).sort(),
      );
      const relatedBatches = await knex('task_animal_batch_relationship')
        .select('animal_batch_id')
        .where({ task_id });
      expect(postData.related_batch_ids.sort()).toEqual(
        relatedBatches.map(({ animal_batch_id }) => animal_batch_id).sort(),
      );
      return res;
    };

    describe.each(Object.keys(fakeTaskData))('animal tasks common validation tests', (type) => {
      const checkPostRequestWithInvalidAnimals = async (animalOrBatch, data, invalidIds) => {
        const invalidIdsKey = animalOrBatch === 'animal' ? 'invalidAnimalIds' : 'invalidBatchIds';

        const res = await postTaskRequest({ user_id, farm_id }, type, data);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe(
          'Some animal IDs or animal batch IDs do not exist, are removed, or are not associated with the given farm.',
        );
        expect(res.body[invalidIdsKey]).toEqual(invalidIds);
      };

      test(`should create a(n) ${type} with animals`, async () => {
        const data = createAnimalTaskForReqBody({
          [type]: fakeTaskData[type](),
          related_batch_ids: [],
        });
        await checkValidPostRequest(type, data);
      });

      test(`should create a(n) ${type} with batches`, async () => {
        const data = createAnimalTaskForReqBody({
          [type]: fakeTaskData[type](),
          related_animal_ids: [],
        });
        await checkValidPostRequest(type, data);
      });

      test(`should create a(n) ${type} with both animals and batches`, async () => {
        const data = createAnimalTaskForReqBody({ [type]: fakeTaskData[type]() });
        await checkValidPostRequest(type, data);
      });

      test(`should not create a(n) ${type} for a removed animal`, async () => {
        const data = createAnimalTaskForReqBody({
          [type]: fakeTaskData[type](),
          related_animal_ids: [removedAnimal1.id],
          related_batch_ids: [],
        });
        await checkPostRequestWithInvalidAnimals('animal', data, [removedAnimal1.id]);
      });

      test(`should not create a(n) ${type} for a deleted animal`, async () => {
        const data = createAnimalTaskForReqBody({
          [type]: fakeTaskData[type](),
          related_animal_ids: [deletedAnimal1.id],
          related_batch_ids: [],
        });
        await checkPostRequestWithInvalidAnimals('animal', data, [deletedAnimal1.id]);
      });

      test(`should not create a(n) ${type} for a removed batch`, async () => {
        const data = createAnimalTaskForReqBody({
          [type]: fakeTaskData[type](),
          related_animal_ids: [],
          related_batch_ids: [removedBatch1.id],
        });
        await checkPostRequestWithInvalidAnimals('batch', data, [removedBatch1.id]);
      });

      test(`should not create a(n) ${type} for a deleted batch`, async () => {
        const data = createAnimalTaskForReqBody({
          [type]: fakeTaskData[type](),
          related_animal_ids: [],
          related_batch_ids: [deletedBatch1.id],
        });
        await checkPostRequestWithInvalidAnimals('batch', data, [deletedBatch1.id]);
      });

      test(`should not create a(n) ${type} for animals in a different farm`, async () => {
        const data = createAnimalTaskForReqBody({
          [type]: fakeTaskData[type](),
          related_animal_ids: [farmBAnimal1.id],
          related_batch_ids: [],
        });
        await checkPostRequestWithInvalidAnimals('animal', data, [farmBAnimal1.id]);
      });

      test(`should not create a(n) ${type} for batches in a different farm`, async () => {
        const data = createAnimalTaskForReqBody({
          [type]: fakeTaskData[type](),
          related_animal_ids: [],
          related_batch_ids: [farmBBatch1.id],
        });
        await checkPostRequestWithInvalidAnimals('batch', data, [farmBBatch1.id]);
      });

      test(`should not create a(n) ${type} without animals and batches`, async () => {
        const data = createAnimalTaskForReqBody({
          [type]: fakeTaskData[type](),
          related_animal_ids: [],
          related_batch_ids: [],
        });
        const res = await postTaskRequest({ user_id, farm_id }, type, data);
        expect(res.status).toBe(400);
        expect(res.error.text).toBe(
          'At least one of the animal IDs or animal batch IDs is required',
        );
      });

      test(`should not create a(n) ${type} without a due date`, async () => {
        const data = createAnimalTaskForReqBody({ [type]: fakeTaskData[type](), due_date: null });
        const res = await postTaskRequest({ user_id, farm_id }, type, data);
        expect(res.status).toBe(400);
        expect(res.error.text).toBe('must have due date');
      });

      test(`should create a(n) ${type} with a due date equal to the animals' birth and brought-in dates`, async () => {
        const today = new Date();
        const todayInYYYYMMDD = toLocal8601Extended(today);
        const data = createAnimalTaskForReqBody({
          [type]: fakeTaskData[type](),
          due_date: todayInYYYYMMDD,
          related_animal_ids: [animalBornToday.id, animalBroughtInToday.id],
        });
        await checkValidPostRequest(type, data);
      });

      test(`should not create a(n) ${type} with a due date earlier than the animal's birth date`, async () => {
        const data = createAnimalTaskForReqBody({
          [type]: fakeTaskData[type](),
          due_date: yesterdayInYYYYMMDD,
        });
        data.related_animal_ids = [...data.related_animal_ids, animalBornToday.id];
        const res = await postTaskRequest({ user_id, farm_id }, type, data);
        expect(res.status).toBe(400);
        expect(res.error.text).toBe(
          `due_date must be on or after the animals' birth and brought-in dates`,
        );
      });

      test(`should not create a(n) ${type} with a due date earlier than the animal's brought-in date`, async () => {
        const data = createAnimalTaskForReqBody({
          [type]: fakeTaskData[type](),
          due_date: yesterdayInYYYYMMDD,
        });
        data.related_animal_ids = [...data.related_animal_ids, animalBroughtInToday.id];
        const res = await postTaskRequest({ user_id, farm_id }, type, data);
        expect(res.status).toBe(400);
        expect(res.error.text).toBe(
          `due_date must be on or after the animals' birth and brought-in dates`,
        );
      });

      test(`should not create a(n) ${type} with managementPlans`, async () => {
        const data = createAnimalTaskForReqBody({
          [type]: fakeTaskData[type](),
          managementPlans: [{ planting_management_plan_id }],
        });
        const res = await postTaskRequest({ user_id, farm_id }, type, data);
        expect(res.status).toBe(400);
        expect(res.error.text).toBe(`managementPlans cannot be added for ${type}`);
      });
    });

    describe('animal movement task tests', () => {
      const type = 'animal_movement_task';

      const checkAnimalMovementTaskInDB = async (taskId) => {
        const animalMovementTask = await knex('animal_movement_task').where({ task_id: taskId });
        expect(animalMovementTask.length).toBe(1);
      };

      const checkPurposeRelationshipsInDB = async (taskId, expectedPurposes) => {
        const relationships = await knex('animal_movement_task_purpose_relationship').where({
          task_id: taskId,
        });
        expect(relationships.length).toBe(expectedPurposes.length);

        expectedPurposes.forEach(({ id, other_purpose }) => {
          const foundRelationship = relationships.filter(({ purpose_id }) => purpose_id === id);
          expect(foundRelationship.length).toBe(1);

          if (other_purpose) {
            expect(foundRelationship[0].other_purpose).toBe(other_purpose);
          }
        });
      };

      const createMovementTaskPostBody = (purposeIds, otherPurpose) => {
        return createAnimalTaskForReqBody(createMovementTaskForReqBody(purposeIds, otherPurpose));
      };

      test('should create a movement task without purpose_ids', async () => {
        const data = createMovementTaskPostBody();
        const res = await postTaskRequest({ user_id, farm_id }, type, data);
        expect(res.status).toBe(201);
        await checkAnimalMovementTaskInDB(res.body.task_id);
      });

      test('should create a movement task with purpose_ids', async () => {
        const data = createMovementTaskPostBody([purpose1.id, purpose2.id]);
        const res = await postTaskRequest({ user_id, farm_id }, type, data);
        await checkAnimalMovementTaskInDB(res.body.task_id);
        await checkPurposeRelationshipsInDB(res.body.task_id, [purpose1, purpose2]);
      });

      test('should create a movement task with other_purpose', async () => {
        const otherPurposeData = faker.lorem.sentence();
        const data = createMovementTaskPostBody([otherPurpose.id], otherPurposeData);
        const res = await postTaskRequest({ user_id, farm_id }, type, data);

        await checkAnimalMovementTaskInDB(res.body.task_id);
        await checkPurposeRelationshipsInDB(res.body.task_id, [
          { ...otherPurpose, other_purpose: otherPurposeData },
        ]);
      });

      test('should not create a movement task with invalid purpose id', async () => {
        const unknownPurposeId = 1234567;
        const data = createMovementTaskPostBody([unknownPurposeId]);
        const res = await postTaskRequest({ user_id, farm_id }, type, data);
        expect(res.status).toBe(400);
      });

      test('should ignore other_purpose without correct purpose id', async () => {
        const otherPurposeData = faker.lorem.sentence();
        const data = createMovementTaskPostBody([purpose1.id], otherPurposeData);
        const res = await postTaskRequest({ user_id, farm_id }, type, data);
        const purposeRelationships = await knex('animal_movement_task_purpose_relationship').where({
          task_id: res.body.task_id,
        });
        expect(res.status).toBe(201);
        expect(purposeRelationships.length).toBe(1);
        expect(purposeRelationships[0].purpose_id).toBe(purpose1.id);
        expect(purposeRelationships[0].other_purpose).toBe(null);
      });

      test('should not create a movement task without a location', async () => {
        const data = createAnimalTaskForReqBody({
          animal_movement_task: {},
          locations: [],
        });
        const res = await postTaskRequest({ user_id, farm_id }, type, data);
        expect(res.status).toBe(403);
        expect(res.error.text).toBe('user not authorized to access farm');
      });

      test('should not create a movement task with a location in a different farm', async () => {
        const data = createAnimalTaskForReqBody({
          animal_movement_task: {},
          locations: [{ location_id: farmBLocationId }],
        });
        const res = await postTaskRequest({ user_id, farm_id }, type, data);
        expect(res.status).toBe(403);
        expect(res.error.text).toBe('user not authorized to access farm');
      });

      test('should not create a movement task with multiple locations', async () => {
        const data = createAnimalTaskForReqBody({
          animal_movement_task: {},
          locations: [{ location_id }, { location_id: location2Id }],
        });
        const res = await postTaskRequest({ user_id, farm_id }, type, data);
        expect(res.status).toBe(400);
        expect(res.error.text).toBe('Only one location can be assigned to this task type');
      });
    });
  });

  describe('Patch tasks completion tests', () => {
    beforeEach(async () => {
      await knex('animal').update({ location_id: null });
      await knex('animal_batch').update({ location_id: null });
    });

    describe('Completion of animal tasks', () => {
      const fakeTaskData = {
        animal_movement_task: () =>
          createFakeMovementTask([
            { purpose_id: purpose1.id },
            { purpose_id: otherPurpose.id, other_purpose: faker.lorem.sentence() },
          ]),
      };

      describe.each(Object.keys(fakeTaskData))('animal tasks common validation tests', (type) => {
        const checkBeforeAfterAnimals = async ({
          beforeAnimalIds = [],
          beforeBatchIds = [],
          afterAnimalIds = [],
          afterBatchIds = [],
        }) => {
          const { task_id } = await animalTaskFactory({
            animals: beforeAnimalIds.map((id) => ({ id })),
            animal_batches: beforeBatchIds.map((id) => ({ id })),
            ...fakeTaskData[type](),
          });
          const patchRes = await completeTaskRequest(
            { user_id, farm_id },
            {
              ...fakeCompletionData,
              related_animal_ids: afterAnimalIds,
              related_batch_ids: afterBatchIds,
            },
            task_id,
            type,
          );
          expect(patchRes.status).toBe(200);
          const res = await getTasksRequest({ user_id, farm_id });
          const returnedAnimals = res.body.find((task) => task.task_id === task_id).animals;
          expect(returnedAnimals.map(({ id }) => id).sort()).toEqual(afterAnimalIds.sort());
          const returnedbatches = res.body.find((task) => task.task_id === task_id).animal_batches;
          expect(returnedbatches.map(({ id }) => id).sort()).toEqual(afterBatchIds.sort());
        };

        const checkInvalidAnimalsToComplete = async (animalOrBatch, ids, invalidIds) => {
          const { task_id } = await animalTaskFactory();
          const patchRes = await completeTaskRequest(
            { user_id, farm_id },
            { ...fakeCompletionData, [`related_${animalOrBatch}_ids`]: ids },
            task_id,
            type,
          );
          const invalidIdsKey = animalOrBatch === 'animal' ? 'invalidAnimalIds' : 'invalidBatchIds';
          expect(patchRes.status).toBe(400);
          expect(patchRes.body.message).toBe(
            'Some animal IDs or animal batch IDs do not exist, are removed, or are not associated with the given farm.',
          );
          expect(patchRes.body[invalidIdsKey]).toEqual(invalidIds);
        };

        test('should complete an animal task without modifying animals, batches and task type specific details', async () => {
          const { task_id } = await animalTaskFactory(fakeTaskData[type]());
          const getResBefore = await getTasksRequest({ user_id, farm_id });
          const patchRes = await completeTaskRequest(
            { user_id, farm_id },
            fakeCompletionData,
            task_id,
            type,
          );
          expect(patchRes.status).toBe(200);
          const getResAfter = await getTasksRequest({ user_id, farm_id });
          const taskBefore = getResBefore.body.find((task) => task.task_id === task_id);
          const taskAfter = getResAfter.body.find((task) => task.task_id === task_id);
          const expectedTaskAfter = simulateTaskCompletion(taskBefore, type);
          expect(taskAfter).toEqual(expectedTaskAfter);
        });

        test('should complete an animal task with updates to animals', async () => {
          await checkBeforeAfterAnimals({
            beforeAnimalIds: [animal1.id, animal2.id],
            afterAnimalIds: [animal1.id, animal3.id],
          });
        });

        test('should complete an animal task with updates to batches', async () => {
          await checkBeforeAfterAnimals({
            beforeBatchIds: [batch1.id, batch2.id],
            afterBatchIds: [batch3.id, batch4.id],
          });
        });

        test('should complete an animal task with updates to both animals and batches', async () => {
          await checkBeforeAfterAnimals({
            beforeAnimalIds: [],
            afterAnimalIds: [animal1.id, animal2.id, animal3.id, animal4.id],
            beforeBatchIds: [batch1.id, batch2.id, batch3.id, batch4.id],
            afterBatchIds: [],
          });
          await checkBeforeAfterAnimals({
            beforeAnimalIds: [animal1.id, animal2.id, animal3.id, animal4.id],
            afterAnimalIds: [],
            beforeBatchIds: [],
            afterBatchIds: [batch1.id, batch2.id, batch3.id, batch4.id],
          });
          await checkBeforeAfterAnimals({
            beforeAnimalIds: [animal1.id, animal2.id, animal3.id, animal4.id],
            afterAnimalIds: [animal1.id],
            beforeBatchIds: [],
            afterBatchIds: [batch1.id, batch2.id, batch3.id, batch4.id],
          });
        });

        test('should not complete an animal task with an attempt to remove all animals and batches from the task', async () => {
          const emptyIdsVariants = [[], null];
          for (let emptyIds of emptyIdsVariants) {
            const { task_id } = await animalTaskFactory(fakeTaskData[type]());
            const patchRes = await completeTaskRequest(
              { user_id, farm_id },
              {
                ...fakeCompletionData,
                related_animal_ids: emptyIds,
                related_animal_batch_ids: emptyIds,
              },
              task_id,
              type,
            );
            expect(patchRes.status).toBe(400);
            expect(patchRes.error.text).toBe(
              'At least one of the animal IDs or animal batch IDs is required',
            );
          }
        });

        test('should not complete an animal task for a removed animal', async () => {
          await checkInvalidAnimalsToComplete(
            'animal',
            [animal1.id, removedAnimal1.id],
            [removedAnimal1.id],
          );
        });

        test('should not complete an animal task for a deleted animal', async () => {
          await checkInvalidAnimalsToComplete('animal', [deletedAnimal1.id], [deletedAnimal1.id]);
        });

        test('should not complete an animal task for a removed batch', async () => {
          await checkInvalidAnimalsToComplete('batch', [removedBatch1.id], [removedBatch1.id]);
        });

        test('should not complete an animal task for a deleted batch', async () => {
          await checkInvalidAnimalsToComplete(
            'batch',
            [batch4.id, deletedBatch1.id],
            [deletedBatch1.id],
          );
        });

        test('should not complete an animal task for animals in a different farm', async () => {
          await checkInvalidAnimalsToComplete('animal', [farmBAnimal1.id], [farmBAnimal1.id]);
        });

        test('should not complete an animal task for batches in a different farm', async () => {
          await checkInvalidAnimalsToComplete('batch', [farmBBatch1.id], [farmBBatch1.id]);
        });

        test(`should not complete an animal task without a complete date`, async () => {
          const { task_id } = await animalTaskFactory(fakeTaskData[type]());
          const patchRes = await completeTaskRequest(
            { user_id, farm_id },
            { ...fakeCompletionData, complete_date: null },
            task_id,
            type,
          );
          expect(patchRes.status).toBe(400);
          expect(patchRes.error.text).toBe('must have completion date');
        });

        test(`should not complete an animal task with a complete date earlier than the animal's birth date`, async () => {
          const { task_id } = await animalTaskFactory({
            ...fakeTaskData[type](),
            animals: [{ id: animalBornToday.id }],
          });
          const patchRes = await completeTaskRequest(
            { user_id, farm_id },
            { ...fakeCompletionData, complete_date: yesterdayInYYYYMMDD },
            task_id,
            type,
          );
          expect(patchRes.status).toBe(400);
          expect(patchRes.error.text).toBe(
            `complete_date must be on or after the animals' birth and brought-in dates`,
          );
        });

        test(`should not complete an animal task with a complete date earlier than the animal's brought-in date`, async () => {
          const { task_id } = await animalTaskFactory({
            ...fakeTaskData[type](),
            animals: [{ id: animalBroughtInToday.id }],
          });
          const patchRes = await completeTaskRequest(
            { user_id, farm_id },
            { ...fakeCompletionData, complete_date: yesterdayInYYYYMMDD },
            task_id,
            type,
          );
          expect(patchRes.status).toBe(400);
          expect(patchRes.error.text).toBe(
            `complete_date must be on or after the animals' birth and brought-in dates`,
          );
        });
      });

      describe('animal movement task tests', () => {
        const completeMovementTaskReq = async (data, task_id) => {
          return completeTaskRequest({ user_id, farm_id }, data, task_id, 'animal_movement_task');
        };

        const checkAnimalMovement = (original, completedTask) => {
          expect(completedTask.animals.length).toBe(original.animals.length);
          expect(completedTask.animal_batches.length).toBe(original.animal_batches.length);
          [...completedTask.animals, ...completedTask.animal_batches].forEach((animalOrBatch) => {
            expect(animalOrBatch.location_id).toBe(location_id);
          });
        };

        const checkCompletedMovementTask = async (
          initialPurposes,
          initialOtherPurpose,
          purposesInPatchReq,
          otherPurposeInPatchReq,
        ) => {
          const task = await animalTaskFactory(
            createFakeMovementTask(
              initialPurposes?.map(({ id }) => ({
                purpose_id: id,
                other_purpose: id === otherPurpose.id ? initialOtherPurpose : null,
              })),
            ),
          );
          const { task_id } = task;

          const patchRes = await completeMovementTaskReq(
            {
              ...fakeCompletionData,
              ...(purposesInPatchReq
                ? createMovementTaskForReqBody(
                    purposesInPatchReq.map(({ id }) => id),
                    otherPurposeInPatchReq,
                  )
                : {}),
            },
            task_id,
          );

          expect(patchRes.status).toBe(200);
          const res = await getTasksRequest({ user_id, farm_id });

          const completedTask = res.body.find((retrievedTask) => retrievedTask.task_id === task_id);
          checkAnimalMovement(task, completedTask);
          expect(completedTask.animal_movement_task.task_id).toBe(task_id);

          const finalPurposes = purposesInPatchReq || initialPurposes || [];

          if (completedTask.animal_movement_task.purpose_relationships.length) {
            completedTask.animal_movement_task.purpose_relationships.forEach(
              ({ purpose_id, other_purpose }) => {
                const expectedRelationship = finalPurposes.filter(
                  (purpose) => purpose.id === purpose_id,
                );
                expect(expectedRelationship.length).toBe(1);

                if (other_purpose) {
                  expect(other_purpose).toBe(
                    purposesInPatchReq.map(({ id }) => id).includes(otherPurpose.id)
                      ? otherPurposeInPatchReq
                      : initialOtherPurpose,
                  );
                }
              },
            );
          } else {
            expect(finalPurposes.length).toBe(0);
          }
        };

        test('should complete an animal task without purpose relations and no updates', async () => {
          await checkCompletedMovementTask(null, null, null, null);
        });

        test('should complete a movement task without modifying purposes', async () => {
          await checkCompletedMovementTask([purpose1], null, null, null);
        });

        test('should complete a movement task with updated purposes', async () => {
          const purposes = [
            { before: null, after: [purpose2] },
            { before: [purpose2], after: [purpose1, purpose2] },
            { before: [purpose1, purpose2], after: [otherPurpose] },
          ];

          for (let { before, after } of purposes) {
            await checkCompletedMovementTask(before, null, after, null);
          }
        });

        test('should complete a movement task with purposes removed', async () => {
          // remove purposes with []
          await checkCompletedMovementTask([purpose1], null, [], null);
          // remove purposes with null
          await checkCompletedMovementTask([purpose1], null, null, null);
        });

        test('should complete a movement task with the addition of other_purpose', async () => {
          await checkCompletedMovementTask(
            [otherPurpose],
            null,
            [otherPurpose],
            faker.lorem.sentence(),
          );
        });

        test('should complete a movement task with modifying other_purpose', async () => {
          const otherPurposeText = faker.lorem.word();
          await checkCompletedMovementTask(
            [otherPurpose],
            otherPurposeText,
            [otherPurpose],
            otherPurposeText + faker.lorem.word(),
          );
        });

        test('should complete a movement task with deleting other_purpose', async () => {
          await checkCompletedMovementTask([otherPurpose], faker.lorem.word(), [otherPurpose], '');
        });

        test('should not complete a movement task with an invalid purpose id', async () => {
          const { task_id } = await animalTaskFactory(createFakeMovementTask());
          const unknownPurposeId = 123456;
          const patchRes = await completeMovementTaskReq(
            {
              ...fakeCompletionData,
              ...createMovementTaskForReqBody([unknownPurposeId]),
            },
            task_id,
          );
          expect(patchRes.status).toBe(400);
        });

        test('should ignore other_purpose without correct purpose id', async () => {
          const { task_id } = await animalTaskFactory(createFakeMovementTask());
          const patchRes = await completeMovementTaskReq(
            {
              ...fakeCompletionData,
              ...createMovementTaskForReqBody([purpose1.id], faker.lorem.sentence()),
            },
            task_id,
          );
          const purposeRelationships = await knex(
            'animal_movement_task_purpose_relationship',
          ).where({ task_id });
          expect(patchRes.status).toBe(200);
          expect(purposeRelationships.length).toBe(1);
          expect(purposeRelationships[0].purpose_id).toBe(purpose1.id);
          expect(purposeRelationships[0].other_purpose).toBe(null);
        });

        test('should not complete a movement task for a deleted location', async () => {
          const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
          await knex('location').update({ deleted: true }).where({ location_id });

          const { task_id } = await animalTaskFactory({
            ...createFakeMovementTask(),
            locations: [{ location_id }],
          });
          const patchRes = await completeMovementTaskReq(fakeCompletionData, task_id);
          expect(patchRes.status).toBe(400);
          expect(patchRes.error.text).toBe('location deleted');
        });
      });
    });
  });

  const animalTaskTranslationKeys = ['MOVEMENT_TASK'];
  describe.each(animalTaskTranslationKeys)('Patch task due date test', (key) => {
    let task_id;

    beforeAll(async () => {
      const [{ task_type_id }] = await mocks.task_typeFactory(
        { promisedFarm: [{ farm_id }] },
        { task_name: faker.lorem.word(), task_translation_key: key },
      );
      ({ task_id } = await animalTaskFactory({
        task_type_id,
        due_date: faker.date.future().toISOString().split('T')[0],
        animals: [{ id: animalBornToday.id }, { id: animalBroughtInToday.id }],
      }));
    });

    test(`should update ${key}'s due_date to a date equal to the animals' birth and brought-in dates`, async () => {
      const today = new Date();
      const todayInYYYYMMDD = toLocal8601Extended(today);
      const res = await patchTaskDateRequest(
        { user_id, farm_id },
        { due_date: `${todayInYYYYMMDD}T00:00:00.000` },
        task_id,
      );
      expect(res.status).toBe(200);
      const [{ due_date }] = await knex('task').select('due_date').where({ task_id });

      const expectedDueDate = new Date(today);
      expectedDueDate.setUTCHours(0, 0, 0, 0);
      expect(due_date.toISOString()).toBe(expectedDueDate.toISOString());
    });

    test(`should not update ${key}'s due_date to a date earlier than the animal's birth and brought-in date`, async () => {
      const res = await patchTaskDateRequest(
        { user_id, farm_id },
        { due_date: `${yesterdayInYYYYMMDD}T00:00:00.000` },
        task_id,
      );
      expect(res.status).toBe(400);
      expect(res.error.text).toBe(
        `due_date must be on or after the animals' birth and brought-in dates`,
      );
    });
  });
});
