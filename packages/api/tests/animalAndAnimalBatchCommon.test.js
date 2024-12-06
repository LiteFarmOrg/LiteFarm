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
import {
  fakeCompletionData,
  abandonTaskRequest,
  completeTaskRequest,
  postTaskRequest,
  toLocal8601Extended,
  yesterdayInYYYYMMDD,
} from './utils/taskUtils.js';
import {
  animalDeleteRequest,
  animalPatchRequest,
  animalRemoveRequest,
  batchDeleteRequest,
  batchPatchRequest,
  batchRemoveRequest,
} from './utils/animalUtils.js';

const mockDate = new Date('2024/12/05').toISOString();
const mockDateInYYYYMMDD = '2024-12-05';
const abandonTaskBody = {
  abandonment_reason: 'SCHEDULING_ISSUE',
  abandon_date: new Date(2024, 10, 30),
};
const TASK_STATE = {
  COMPLETE: 'complete',
  ABANDONED: 'abandoned',
};

const getIds = (animalsOrBatches) => animalsOrBatches.map(({ id }) => id);

const getIdAndRelationshipTableNames = (animalOrBatch) => {
  return animalOrBatch === 'animal'
    ? ['animal_id', 'task_animal_relationship']
    : ['animal_batch_id', 'task_animal_batch_relationship'];
};

describe('Animal and Animal Batch Tests', () => {
  let user_id;
  let farm_id;
  let removalReasonId;
  let broughtInOrigin;

  beforeAll(async () => {
    [{ user_id, farm_id }] = await mocks.userFarmFactory({ roleId: 1 });
    [{ id: removalReasonId }] = await mocks.animal_removal_reasonFactory();
    [broughtInOrigin] = await mocks.animal_originFactory('BROUGHT_IN');
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Animals and Animal Batches with Tasks Tests', () => {
    let location_id, task_type_id;

    beforeAll(async () => {
      [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
    });

    const createAnimalsOrBatches = async (animalOrBatch, count) => {
      const factory = animalOrBatch === 'animal' ? 'animalFactory' : 'animal_batchFactory';
      return Promise.all(
        Array(count)
          .fill()
          .map(() => mocks[factory]({ promisedFarm: [{ farm_id }] })),
      );
    };

    const createAnimalTask = async ({
      animalIds = [],
      batchIds = [],
      taskState,
      taskData = {},
    }) => {
      const postRes = await postTaskRequest({ user_id, farm_id }, 'animal_movement_task', {
        ...mocks.fakeTask(),
        assignee_user_id: user_id,
        owner_user_id: user_id,
        locations: [{ location_id }],
        task_type_id,
        related_animal_ids: animalIds,
        related_batch_ids: batchIds,
        animal_movement_task: {},
        ...taskData,
      });
      const { task_id: taskId } = postRes.body;

      if (taskState === TASK_STATE.COMPLETE) {
        await completeAnimalTask(taskId);
      }
      if (taskState === TASK_STATE.ABANDONED) {
        await abandonAnimalTask(taskId);
      }

      return { taskId };
    };

    const completeAnimalTask = async (taskId) => {
      return completeTaskRequest(
        { user_id, farm_id },
        fakeCompletionData,
        taskId,
        'animal_movement_task',
      );
    };

    const abandonAnimalTask = async (taskId) => {
      return abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, taskId);
    };

    const removeAnimalsOrBatches = async (animalOrBatch, ids) => {
      const req = animalOrBatch === 'animal' ? animalRemoveRequest : batchRemoveRequest;
      return req(
        { user_id, farm_id },
        ids.map((id) => ({
          id,
          animal_removal_reason_id: removalReasonId,
          removal_date: mockDate,
        })),
      );
    };

    const deleteAnimalsOrBatches = async (animalOrBatch, ids) => {
      const req = animalOrBatch === 'animal' ? animalDeleteRequest : batchDeleteRequest;
      return req({ user_id, farm_id, query: `ids=${ids.join(',')}&date=${mockDateInYYYYMMDD}` });
    };

    const checkAnimalOrBatchAndTaskRelationships = async (
      animalOrBatch,
      removedAnimalOrBatchIds,
      expectedTaskData,
    ) => {
      const [idName, relationshipTable] = getIdAndRelationshipTableNames(animalOrBatch);

      for (let expectedData of expectedTaskData) {
        const { taskId, remainingAnimalOrBatchIds, abandonDate, abandonmentReason } = expectedData;
        // Check if relationships were removed
        for (let animalOrBatchId of removedAnimalOrBatchIds) {
          const relationships = await knex(relationshipTable)
            .where(idName, animalOrBatchId)
            .where('task_id', taskId);

          const shouldRemain = remainingAnimalOrBatchIds.includes(animalOrBatchId);
          expect(relationships.length).toBe(shouldRemain ? 1 : 0);
        }

        // Check the task
        const task = await knex('task')
          .select('task_id', 'abandon_date', 'abandonment_reason')
          .where('task_id', taskId)
          .first();

        if (abandonDate && abandonmentReason) {
          expect(new Date(task.abandon_date).toISOString()).toBe(abandonDate);
          expect(task.abandonment_reason).toBe(abandonmentReason);
        } else if (!remainingAnimalOrBatchIds.length) {
          // Check if the task was abandoned
          expect(new Date(task.abandon_date).toISOString()).toBe(new Date(mockDate).toISOString());
          expect(task.abandonment_reason).toBe('NO_ANIMALS');
        } else {
          expect(task.abandon_date).toBe(null);
          expect(task.abandonment_reason).toBe(null);
        }
      }
    };

    // PATCH
    describe.each(['animal', 'batch'])('Patch %s', (animalOrBatch) => {
      const today = new Date();
      const todayInYYYYMMDD = toLocal8601Extended(today);

      test(`should be able to update ${animalOrBatch}'s birth or brough-in date to the same date as tasks' due date`, async () => {
        const [[entity1]] = await createAnimalsOrBatches(animalOrBatch, 1);

        // Create a task with due date
        await createAnimalTask({
          [`${animalOrBatch}Ids`]: [entity1.id],
          taskData: { due_date: todayInYYYYMMDD },
        });

        // Update birth_date to the same date as task's due date
        const patchReq = animalOrBatch === 'animal' ? animalPatchRequest : batchPatchRequest;
        const resWithBirthDate = await patchReq({ user_id, farm_id }, [
          { id: entity1.id, birth_date: `${todayInYYYYMMDD}T00:00:00.000-08:00` },
        ]);

        expect(resWithBirthDate.status).toBe(204);

        // Update brought_in_date to the same date as task's due date
        const resWithBroughtInDate = await patchReq({ user_id, farm_id }, [
          {
            id: entity1.id,
            origin_id: broughtInOrigin.id,
            brought_in_date: `${todayInYYYYMMDD}T00:00:00.000-08:00`,
          },
        ]);
        expect(resWithBroughtInDate.status).toBe(204);
      });

      test(`should not be able to update ${animalOrBatch}'s birth or brough-in date after tasks' due date`, async () => {
        const [[entity1]] = await createAnimalsOrBatches(animalOrBatch, 1);

        // Create tasks with due dates
        await createAnimalTask({
          [`${animalOrBatch}Ids`]: [entity1.id],
          taskData: { due_date: todayInYYYYMMDD },
        });
        const { taskId: task2Id } = await createAnimalTask({
          [`${animalOrBatch}Ids`]: [entity1.id],
        });
        await knex('task').update('due_date', yesterdayInYYYYMMDD).where('task_id', task2Id);

        const patchReq = animalOrBatch === 'animal' ? animalPatchRequest : batchPatchRequest;

        // Try to update to an invalid birth_date
        const resWithBirthDate = await patchReq({ user_id, farm_id }, [
          { id: entity1.id, birth_date: `${todayInYYYYMMDD}T00:00:00.000-08:00` },
        ]);

        expect(resWithBirthDate.status).toBe(400);
        expect(resWithBirthDate.error.text).toBe(
          `Birth and brought-in dates must be on or before associated tasks' due dates`,
        );

        // Try to update to an invalid brought_in_date
        const resWithBroughtInDate = await patchReq({ user_id, farm_id }, [
          {
            id: entity1.id,
            origin_id: broughtInOrigin.id,
            brought_in_date: `${todayInYYYYMMDD}T00:00:00.000-08:00`,
          },
        ]);
        expect(resWithBroughtInDate.status).toBe(400);
        expect(resWithBroughtInDate.error.text).toBe(
          `Birth and brought-in dates must be on or before associated tasks' due dates`,
        );
      });
    });

    // REMOVE
    describe.each(['animal', 'batch'])('Remove %s with tasks', (animalOrBatch) => {
      test(`Should remove ${animalOrBatch} with incomplete task`, async () => {
        const [[entity1], [entity2]] = await createAnimalsOrBatches(animalOrBatch, 2);
        const ids = getIds([entity1, entity2]);
        const { taskId } = await createAnimalTask({ [`${animalOrBatch}Ids`]: ids });
        const res = await removeAnimalsOrBatches(animalOrBatch, ids);
        expect(res.status).toBe(204);
        await checkAnimalOrBatchAndTaskRelationships(animalOrBatch, ids, [
          { taskId, remainingAnimalOrBatchIds: [] },
        ]);
      });

      test(`Should remove ${animalOrBatch} with abandoned task`, async () => {
        const [[entity1], [entity2]] = await createAnimalsOrBatches(animalOrBatch, 2);
        const ids = getIds([entity1, entity2]);
        const { taskId } = await createAnimalTask({
          [`${animalOrBatch}Ids`]: ids,
          taskState: TASK_STATE.ABANDONED,
        });
        const res = await removeAnimalsOrBatches(animalOrBatch, ids);

        expect(res.status).toBe(204);
        await checkAnimalOrBatchAndTaskRelationships(animalOrBatch, ids, [
          {
            taskId,
            remainingAnimalOrBatchIds: ids, // animals or batches should not be removed from abandoned tasks
            abandonDate: new Date(abandonTaskBody.abandon_date).toISOString(),
            abandonmentReason: abandonTaskBody.abandonment_reason,
          },
        ]);
      });

      test(`Should remove ${animalOrBatch} with completed task`, async () => {
        const [[entity1], [entity2]] = await createAnimalsOrBatches(animalOrBatch, 2);
        const ids = getIds([entity1, entity2]);
        const { taskId } = await createAnimalTask({
          [`${animalOrBatch}Ids`]: ids,
          taskState: TASK_STATE.COMPLETE,
        });
        const res = await removeAnimalsOrBatches(animalOrBatch, ids);

        expect(res.status).toBe(204);
        await checkAnimalOrBatchAndTaskRelationships(animalOrBatch, ids, [
          {
            taskId,
            remainingAnimalOrBatchIds: ids, // animals or batches should not be removed from completed tasks
          },
        ]);
      });

      test(`Should remove ${animalOrBatch} with multiple tasks`, async () => {
        const [[entity1], [entity2]] = await createAnimalsOrBatches(animalOrBatch, 3);
        const [[animal1], [animal2]] = await createAnimalsOrBatches('animal', 2);
        const [[batch1], [batch2]] = await createAnimalsOrBatches('batch', 2);

        const idsToRemove = getIds([entity1, entity2]);
        const testCases = [];
        const relationshipsWithExistingEntities = [];

        const addRelationships = (entities, animalOrBatch, taskId) => {
          entities.forEach(({ id }) =>
            relationshipsWithExistingEntities.push({ animalOrBatch, id, taskId }),
          );
        };

        const animalIds = getIds([
          animal1,
          animal2,
          ...(animalOrBatch === 'animal' ? [entity1, entity2] : []),
        ]);
        const batchIds = getIds([
          batch1,
          batch2,
          ...(animalOrBatch === 'animal' ? [] : [entity1, entity2]),
        ]);

        // task1 (Incomplete task for all animals or all batches)
        const task1EntityIds = animalOrBatch === 'animal' ? animalIds : batchIds;
        const { taskId: task1Id } = await createAnimalTask({
          [`${animalOrBatch}Ids`]: task1EntityIds,
        });
        const remainingAnimalOrBatchIds = task1EntityIds.filter((id) => !idsToRemove.includes(id));

        testCases.push({ taskId: task1Id, remainingAnimalOrBatchIds });

        remainingAnimalOrBatchIds.forEach((id) =>
          relationshipsWithExistingEntities.push({ animalOrBatch, id, taskId: task1Id }),
        );

        // task2 (Incomplete task for all animals and batches)
        const { taskId: task2Id } = await createAnimalTask({ animalIds, batchIds });

        testCases.push({
          taskId: task2Id,
          remainingAnimalOrBatchIds: getIds(
            animalOrBatch === 'animal' ? [animal1, animal2] : [batch1, batch2],
          ),
        });

        addRelationships([animal1, animal2], 'animal', task2Id);
        addRelationships([batch1, batch2], 'batch', task2Id);

        // task3 (Completed task for all animals and batches)
        const { taskId: task3Id } = await createAnimalTask({
          animalIds,
          batchIds,
          taskState: TASK_STATE.COMPLETE,
        });

        testCases.push({
          taskId: task3Id,
          remainingAnimalOrBatchIds: animalOrBatch === 'animal' ? animalIds : batchIds,
        });

        addRelationships([animal1, animal2], 'animal', task3Id);
        addRelationships([batch1, batch2], 'batch', task3Id);

        // task4 (Abandoned task for all animals and batches)
        const { taskId: task4Id } = await createAnimalTask({
          animalIds,
          batchIds,
          taskState: TASK_STATE.ABANDONED,
        });

        testCases.push({
          taskId: task4Id,
          remainingAnimalOrBatchIds: animalOrBatch === 'animal' ? animalIds : batchIds,
          abandonDate: new Date(abandonTaskBody.abandon_date).toISOString(),
          abandonmentReason: abandonTaskBody.abandonment_reason,
        });

        addRelationships([animal1, animal2], 'animal', task4Id);
        addRelationships([batch1, batch2], 'batch', task4Id);

        //  task5 (Incomplete task for only entities that will be removed)
        const { taskId: task5Id } = await createAnimalTask({
          [`${animalOrBatch}Ids`]: getIds([entity1, entity2]),
        });

        testCases.push({ taskId: task5Id, remainingAnimalOrBatchIds: [] });

        const res = await removeAnimalsOrBatches(animalOrBatch, idsToRemove);

        expect(res.status).toBe(204);
        await checkAnimalOrBatchAndTaskRelationships(animalOrBatch, idsToRemove, testCases);

        // Make sure unrelated relationships were not removed
        for (let { animalOrBatch, id, taskId } of relationshipsWithExistingEntities) {
          const [idName, table] = getIdAndRelationshipTableNames(animalOrBatch);
          const relationships = await knex(table).where(idName, id).where('task_id', taskId);
          expect(relationships.length).toBe(1);
        }
      });
    });

    // DELETE
    describe.each(['animal', 'batch'])('Delete %s with tasks', (animalOrBatch) => {
      test(`Should delete ${animalOrBatch} with incomplete tasks`, async () => {
        const [[entity1], [entity2]] = await createAnimalsOrBatches(animalOrBatch, 2);
        const ids = getIds([entity1, entity2]);
        const { taskId } = await createAnimalTask({ [`${animalOrBatch}Ids`]: ids });
        const res = await deleteAnimalsOrBatches(animalOrBatch, [entity1.id, entity2.id]);

        expect(res.status).toBe(204);
        await checkAnimalOrBatchAndTaskRelationships(animalOrBatch, ids, [
          { taskId, remainingAnimalOrBatchIds: [] },
        ]);
      });

      test(`Should not delete ${animalOrBatch} with abandoned tasks`, async () => {
        const [[entity1], [entity2]] = await createAnimalsOrBatches(animalOrBatch, 2);
        await createAnimalTask({
          [`${animalOrBatch}Ids`]: [entity1.id, entity2.id],
          taskState: TASK_STATE.ABANDONED,
        });
        const res = await deleteAnimalsOrBatches(animalOrBatch, [entity1.id, entity2.id]);

        expect(res.status).toBe(400);
        expect(res.error.text).toBe('Animals with completed or abandoned tasks cannot be deleted');
      });

      test(`Should not delete ${animalOrBatch} with completed tasks`, async () => {
        const [[entity1], [entity2]] = await createAnimalsOrBatches(animalOrBatch, 2);
        await createAnimalTask({
          [`${animalOrBatch}Ids`]: [entity1.id, entity2.id],
          taskState: TASK_STATE.COMPLETE,
        });
        const res = await deleteAnimalsOrBatches(animalOrBatch, [entity1.id, entity2.id]);

        expect(res.status).toBe(400);
        expect(res.error.text).toBe('Animals with completed or abandoned tasks cannot be deleted');
      });
    });
  });
});
