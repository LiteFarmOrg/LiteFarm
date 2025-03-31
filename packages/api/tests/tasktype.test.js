/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (farm.test.js) is part of LiteFarm.
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
import taskTypeModel from '../src/models/taskTypeModel.js';

xdescribe('taskType Tests', () => {
  let token;
  let owner;
  let farm;

  beforeAll(() => {
    token = global.token;
  });

  function postRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }) {
    return chai
      .request(server)
      .post(`/task_type`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function getRequest({
    user_id = owner.user_id,
    farm_id = farm.farm_id,
    url = `/task_type/farm/${farm.farm_id}`,
  }) {
    return chai.request(server).get(url).set('user_id', user_id).set('farm_id', farm_id);
  }

  function deleteRequest({ user_id = owner.user_id, farm_id = farm.farm_id, task_id }) {
    return chai
      .request(server)
      .delete(`/task_type/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  function getfakeTaskType(farm_id = farm.farm_id) {
    const taskType = mocks.fakeTaskType();
    return { ...taskType, farm_id };
  }

  beforeEach(async () => {
    await knex.raw('DELETE from "taskType"');
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory(
      { promisedUser: [owner], promisedFarm: [farm] },
      fakeUserFarm(1),
    );
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('Get && delete taskType', () => {
    let taskType;
    beforeEach(async () => {
      [taskType] = await mocks.taskTypeFactory({ promisedFarm: [farm] });
    });

    test('Get by farm_id should filter out deleted task types', async () => {
      await taskTypeModel
        .query()
        .context({
          showHidden: true,
          user_id: owner.user_id,
        })
        .findById(taskType.task_id)
        .delete();
      const res = await getRequest({ user_id: owner.user_id });
      expect(res.status).toBe(404);
    });

    test('Get by task_id should filter out deleted task types', async () => {
      await taskTypeModel
        .query()
        .context({
          showHidden: true,
          user_id: owner.user_id,
        })
        .findById(taskType.task_id)
        .delete();
      const res = await getRequest({
        user_id: owner.user_id,
        url: `/task_type/${taskType.task_id}`,
      });
      expect(res.status).toBe(404);
    });

    test('Workers should get seeded taskType', async () => {
      let [seedtaskType] = await mocks.taskTypeFactory(
        { promisedFarm: [{ farm_id: null }] },
        mocks.fakeTaskType(),
      );
      const res = await getRequest({ user_id: owner.user_id });
      expect(res.status).toBe(200);
      expect(res.body[1].taskType_id).toBe(seedtaskType.taskType_id);
    });

    describe('Get task type  authorization tests', () => {
      let worker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async () => {
        [worker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory(
          { promisedUser: [worker], promisedFarm: [farm] },
          fakeUserFarm(3),
        );
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory(
          { promisedUser: [manager], promisedFarm: [farm] },
          fakeUserFarm(2),
        );

        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
          { promisedUser: [unAuthorizedUser], promisedFarm: [farmunAuthorizedUser] },
          fakeUserFarm(1),
        );
      });

      test('Owner should get taskType by farm id', async () => {
        const res = await getRequest({ user_id: owner.user_id });
        expect(res.status).toBe(200);
        expect(res.body[0].task_id).toBe(taskType.task_id);
      });

      test('Manager should get taskType by farm id', async () => {
        const res = await getRequest({ user_id: manager.user_id });
        expect(res.status).toBe(200);
        expect(res.body[0].task_id).toBe(taskType.task_id);
      });

      test('Worker should get taskType by farm id', async () => {
        const res = await getRequest({ user_id: worker.user_id });
        expect(res.status).toBe(200);
        expect(res.body[0].task_id).toBe(taskType.task_id);
      });

      test('Should get status 403 if an unauthorizedUser tries to get taskType by farm_id', async () => {
        const res = await getRequest({ user_id: unAuthorizedUser.user_id });
        expect(res.status).toBe(403);
      });

      test('Circumvent authorization by modifying farm_id', async () => {
        const res = await getRequest({
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id,
        });

        expect(res.status).toBe(403);
      });

      test('Owner should get taskType by task_id', async () => {
        const res = await getRequest({
          user_id: owner.user_id,
          url: `/task_type/${taskType.task_id}`,
        });
        expect(res.status).toBe(200);
        expect(res.body[0].task_id).toBe(taskType.task_id);
      });

      test('Manager should get taskType by task_id', async () => {
        const res = await getRequest({
          user_id: manager.user_id,
          url: `/task_type/${taskType.task_id}`,
        });
        expect(res.status).toBe(200);
        expect(res.body[0].task_id).toBe(taskType.task_id);
      });

      test('Worker should get taskType by task_id', async () => {
        const res = await getRequest({
          user_id: worker.user_id,
          url: `/task_type/${taskType.task_id}`,
        });
        expect(res.status).toBe(200);
        expect(res.body[0].task_id).toBe(taskType.task_id);
      });

      test('Should get status 403 if an unauthorizedUser tries to get taskType by task_id', async () => {
        const res = await getRequest({
          user_id: unAuthorizedUser.user_id,
          url: `/task_type/${taskType.task_id}`,
        });

        expect(res.status).toBe(403);
      });

      test('Get taskType by task_id circumvent authorization by modifying farm_id', async () => {
        const res = await getRequest({
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id,
          url: `/task_type/${taskType.task_id}`,
        });

        expect(res.status).toBe(403);
      });
    });

    describe('Delete task type', function () {
      test('should return 403 if user tries to delete a seeded taskType', async () => {
        let [seedTaskType] = await mocks.taskTypeFactory(
          { promisedFarm: [{ farm_id: null }] },
          mocks.fakeTaskType(),
        );
        const res = await deleteRequest({ task_id: seedTaskType.task_id });
        expect(res.status).toBe(403);
      });

      describe('Delete task type authorization tests', () => {
        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
          [worker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory(
            { promisedUser: [worker], promisedFarm: [farm] },
            fakeUserFarm(3),
          );
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory(
            { promisedUser: [manager], promisedFarm: [farm] },
            fakeUserFarm(2),
          );

          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
            { promisedUser: [unAuthorizedUser], promisedFarm: [farmunAuthorizedUser] },
            fakeUserFarm(1),
          );
        });

        test('Owner should delete a task type', async () => {
          const res = await deleteRequest({ task_id: taskType.task_id });
          expect(res.status).toBe(200);
          const taskTypeRes = await taskTypeModel
            .query()
            .context({ showHidden: true })
            .where('task_id', taskType.task_id);
          expect(taskTypeRes.length).toBe(1);
          expect(taskTypeRes[0].deleted).toBe(true);
        });

        test('Manager should delete a taskType', async () => {
          const res = await deleteRequest({ user_id: manager.user_id, task_id: taskType.task_id });
          expect(res.status).toBe(200);
          const taskTypeRes = await taskTypeModel
            .query()
            .context({ showHidden: true })
            .where('task_id', taskType.task_id);
          expect(taskTypeRes.length).toBe(1);
          expect(taskTypeRes[0].deleted).toBe(true);
        });

        test('should return 403 if an unauthorized user tries to delete a taskType', async () => {
          const res = await deleteRequest({
            user_id: unAuthorizedUser.user_id,
            task_id: taskType.task_id,
          });
          expect(res.status).toBe(403);
        });

        test('should return 403 if a worker tries to delete a taskType', async () => {
          const res = await deleteRequest({ user_id: worker.user_id, task_id: taskType.task_id });
          expect(res.status).toBe(403);
        });

        test('Circumvent authorization by modifying farm_id', async () => {
          const res = await deleteRequest({
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
            task_id: taskType.task_id,
          });

          expect(res.status).toBe(403);
        });
      });
    });
  });

  describe('Post taskType', () => {
    let fakeTaskType;

    beforeEach(async () => {
      fakeTaskType = getfakeTaskType();
    });

    test('should return 403 status if headers.farm_id is set to null', async () => {
      fakeTaskType.farm_id = null;
      const res = await postRequest(fakeTaskType, {});
      expect(res.status).toBe(403);
    });

    describe('Post taskType authorization tests', () => {
      let worker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async () => {
        [worker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory(
          { promisedUser: [worker], promisedFarm: [farm] },
          fakeUserFarm(3),
        );
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory(
          { promisedUser: [manager], promisedFarm: [farm] },
          fakeUserFarm(2),
        );

        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
          { promisedUser: [unAuthorizedUser], promisedFarm: [farmunAuthorizedUser] },
          fakeUserFarm(1),
        );
      });

      test('Owner should post and get a valid taskType', async () => {
        const res = await postRequest(fakeTaskType, {});
        expect(res.status).toBe(201);
        const taskTypes = await taskTypeModel
          .query()
          .context({ showHidden: true })
          .where('farm_id', farm.farm_id);
        expect(taskTypes.length).toBe(1);
        expect(taskTypes[0].task_name).toBe(fakeTaskType.task_name);
      });

      test('Manager should post and get a valid taskType', async () => {
        const res = await postRequest(fakeTaskType, { user_id: manager.user_id });
        expect(res.status).toBe(201);
        const taskTypes = await taskTypeModel
          .query()
          .context({ showHidden: true })
          .where('farm_id', farm.farm_id);
        expect(taskTypes.length).toBe(1);
        expect(taskTypes[0].task_name).toBe(fakeTaskType.task_name);
      });

      test('should return 403 status if taskType is posted by worker', async () => {
        const res = await postRequest(fakeTaskType, { user_id: worker.user_id });
        expect(res.status).toBe(403);
        expect(res.error.text).toBe(
          'User does not have the following permission(s): add:task_types',
        );
      });

      test('should return 403 status if taskType is posted by unauthorized user', async () => {
        const res = await postRequest(fakeTaskType, { user_id: unAuthorizedUser.user_id });
        expect(res.status).toBe(403);
        expect(res.error.text).toBe(
          'User does not have the following permission(s): add:task_types',
        );
      });

      test('Circumvent authorization by modify farm_id', async () => {
        const res = await postRequest(fakeTaskType, {
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id,
        });

        expect(res.status).toBe(403);
      });
    });
  });
});
