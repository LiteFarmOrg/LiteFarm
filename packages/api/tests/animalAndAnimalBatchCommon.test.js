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
  abandonTaskBody,
  fakeCompletionData,
  abandonTaskRequest,
  completeTaskRequest,
  postTaskRequest,
} from './utils/taskUtils.js';
import {
  animalDeleteRequest,
  animalRemoveRequest,
  batchDeleteRequest,
  batchRemoveRequest,
} from './utils/animalUtils.js';

const mockDate = new Date('2024/12/05').toISOString();
const mockDateInYYYYMMDD = '2024-12-05';

describe('Animal and Animal Batch Tests', () => {
  let user_id;
  let farm_id;
  let removalReasonId;

  beforeAll(async () => {
    [{ user_id, farm_id }] = await mocks.userFarmFactory({ roleId: 1 });
    [{ id: removalReasonId }] = await mocks.animal_removal_reasonFactory();
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

    const createAnimalTask = async ({ animalIds = [], batchIds = [] }) => {
      return postTaskRequest({ user_id, farm_id }, 'animal_movement_task', {
        ...mocks.fakeTask(),
        assignee_user_id: user_id,
        owner_user_id: user_id,
        locations: [{ location_id }],
        task_type_id,
        related_animal_ids: animalIds,
        related_batch_ids: batchIds,
        animal_movement_task: {},
      });
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
      operation,
      animalOrBatch,
      removedAnimalOrBatchIds,
      expectedTaskData,
    ) => {
      // Check if animals or batches have expected data
      const table = animalOrBatch === 'animal' ? 'animal' : 'animal_batch';
      const removedEntities = await knex(table)
        .select('', 'removal_date', 'animal_removal_reason_id')
        .whereIn('id', removedAnimalOrBatchIds);

      expect(removedEntities.length).toBe(removedAnimalOrBatchIds.length);

      for (let { removal_date, animal_removal_reason_id, deleted } of removedEntities) {
        if (operation === 'REMOVE') {
          expect(new Date(removal_date).toISOString()).toBe(new Date(mockDate).toISOString());
          expect(animal_removal_reason_id).toBe(removalReasonId);
        } else {
          expect(deleted).toBe(true);
        }
      }

      const [idName, relationshipTable] =
        animalOrBatch === 'animal'
          ? ['animal_id', 'task_animal_relationship']
          : ['animal_batch_id', 'task_animal_batch_relationship'];

      for (let { taskId, remainingAnimalOrBatchIds } of expectedTaskData) {
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
        expect(task).toBeDefined();

        // Check if the task was abandoned
        if (!remainingAnimalOrBatchIds.length) {
          expect(new Date(task.abandon_date).toISOString()).toBe(new Date(mockDate).toISOString());
          expect(task.abandonment_reason).toBe('NO_ANIMALS');
        }
      }
    };

    // REMOVE
    describe.each(['animal', 'batch'])('Remove %s with tasks', (animalOrBatch) => {
      test(`Should remove ${animalOrBatch} with incomplete tasks`, async () => {
        const [[entity1], [entity2]] = await createAnimalsOrBatches(animalOrBatch, 2);
        const ids = [entity1, entity2].map(({ id }) => id);
        const postRes = await createAnimalTask({ [`${animalOrBatch}Ids`]: ids });
        const res = await removeAnimalsOrBatches(animalOrBatch, ids);
        expect(res.status).toBe(204);
        await checkAnimalOrBatchAndTaskRelationships('REMOVE', animalOrBatch, ids, [
          { taskId: postRes.body.task_id, remainingAnimalOrBatchIds: [] },
        ]);
      });

      test(`Should remove ${animalOrBatch} with abandoned tasks`, async () => {
        const [[entity1], [entity2]] = await createAnimalsOrBatches(animalOrBatch, 2);
        const ids = [entity1, entity2].map(({ id }) => id);
        const postRes = await createAnimalTask({ [`${animalOrBatch}Ids`]: ids });
        await abandonAnimalTask(postRes.body.task_id);
        const res = await removeAnimalsOrBatches(animalOrBatch, ids);

        expect(res.status).toBe(204);
        await checkAnimalOrBatchAndTaskRelationships('REMOVE', animalOrBatch, ids, [
          { taskId: postRes.body.task_id, remainingAnimalOrBatchIds: ids },
        ]);
      });

      test(`Should remove ${animalOrBatch} with completed tasks`, async () => {
        const [[entity1], [entity2]] = await createAnimalsOrBatches(animalOrBatch, 2);
        const ids = [entity1, entity2].map(({ id }) => id);
        const postRes = await createAnimalTask({ [`${animalOrBatch}Ids`]: ids });
        await completeAnimalTask(postRes.body.task_id);
        const res = await removeAnimalsOrBatches(animalOrBatch, ids);

        expect(res.status).toBe(204);
        await checkAnimalOrBatchAndTaskRelationships('REMOVE', animalOrBatch, ids, [
          { taskId: postRes.body.task_id, remainingAnimalOrBatchIds: ids },
        ]);
      });
    });

    // DELETE
    describe.each(['animal', 'batch'])('Delete %s with tasks', (animalOrBatch) => {
      test(`Should delete ${animalOrBatch} with incomplete tasks`, async () => {
        const [[entity1], [entity2]] = await createAnimalsOrBatches(animalOrBatch, 2);
        const ids = [entity1, entity2].map(({ id }) => id);
        const postRes = await createAnimalTask({ [`${animalOrBatch}Ids`]: ids });
        const res = await deleteAnimalsOrBatches(animalOrBatch, [entity1.id, entity2.id]);

        expect(res.status).toBe(204);
        await checkAnimalOrBatchAndTaskRelationships('DELETE', animalOrBatch, ids, [
          { taskId: postRes.body.task_id, remainingAnimalOrBatchIds: [] },
        ]);
      });

      test(`Should not delete ${animalOrBatch} with abandoned tasks`, async () => {
        const [[entity1], [entity2]] = await createAnimalsOrBatches(animalOrBatch, 2);
        const postRes = await createAnimalTask({
          [`${animalOrBatch}Ids`]: [entity1.id, entity2.id],
        });
        await abandonAnimalTask(postRes.body.task_id);
        const res = await deleteAnimalsOrBatches(animalOrBatch, [entity1.id, entity2.id]);

        expect(res.status).toBe(400);
        expect(res.error.text).toBe('animals with completed or abandoned tasks cannot be deleted');
      });

      test(`Should not delete ${animalOrBatch} with completed tasks`, async () => {
        const [[entity1], [entity2]] = await createAnimalsOrBatches(animalOrBatch, 2);
        const postRes = await createAnimalTask({
          [`${animalOrBatch}Ids`]: [entity1.id, entity2.id],
        });
        await completeAnimalTask(postRes.body.task_id);
        const res = await deleteAnimalsOrBatches(animalOrBatch, [entity1.id, entity2.id]);

        expect(res.status).toBe(400);
        expect(res.error.text).toBe('animals with completed or abandoned tasks cannot be deleted');
      });
    });
  });
});
