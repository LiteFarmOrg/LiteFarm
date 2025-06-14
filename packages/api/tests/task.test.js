/* eslint-disable @typescript-eslint/no-unused-vars */

import chai from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
import server from '../src/server.js';
import knex from '../src/util/knex.js';

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);

// For mocking call to Ensemble API (irrigation tasks)
import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios;

import mocks from './mock.factories.js';
import { tableCleanup } from './testEnvironment.js';
import { faker } from '@faker-js/faker';
import {
  toLocal8601Extended,
  fakeUserFarm,
  customFieldWorkTask,
  userFarmTaskGenerator,
  generateUserFarms,
  getTask,
  fakeCompletionData,
  CROP_FAILURE,
  sampleNote,
  abandonTaskBody,
  expectTaskCompletionFields,
} from './utils/taskUtils.js';
import { setupFarmEnvironment } from './utils/testDataSetup.js';
import { connectFarmToEnsemble } from './utils/ensembleUtils.js';

describe('Task tests', () => {
  function assignTaskRequest({ user_id, farm_id }, data, task_id, callback) {
    chai
      .request(server)
      .patch(`/task/assign/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function postTaskRequest({ user_id, farm_id }, type, data, callback) {
    chai
      .request(server)
      .post(`/task/${type}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function postHarvestTasksRequest({ user_id, farm_id }, data, callback) {
    chai
      .request(server)
      .post('/task/harvest_tasks')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function postTransplantTaskRequest({ user_id, farm_id }, data, callback) {
    chai
      .request(server)
      .post('/task/transplant_task')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function getTasksRequest({ user_id, farm_id }, callback) {
    chai
      .request(server)
      .get(`/task/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function getHarvestUsesRequest({ user_id, farm_id }, callback) {
    chai
      .request(server)
      .get(`/task/harvest_uses/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function assignAllTasksOnDateRequest({ user_id, farm_id }, data, task_id, callback) {
    chai
      .request(server)
      .patch(`/task/assign_all_tasks_on_date/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function patchTaskDateRequest({ user_id, farm_id }, data, task_id, callback) {
    chai
      .request(server)
      .patch(`/task/patch_due_date/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function patchTaskWageRequest({ user_id, farm_id }, data, task_id, callback) {
    chai
      .request(server)
      .patch(`/task/patch_wage/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function completeTaskRequest({ user_id, farm_id }, data, task_id, type, callback) {
    chai
      .request(server)
      .patch(`/task/complete/${type}/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function abandonTaskRequest({ user_id, farm_id }, data, task_id, callback) {
    chai
      .request(server)
      .patch(`/task/abandon/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function deleteTaskRequest({ user_id, farm_id }, task_id, callback) {
    chai
      .request(server)
      .delete(`/task/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  const tasksWithProducts = ['soil_amendment_task'];

  beforeAll(async () => {
    // Check in controller expects Soil Amendment Task to exist
    await knex('task_type').insert({
      farm_id: null,
      task_name: 'Soil amendment',
      task_translation_key: 'SOIL_AMENDMENT_TASK',
    });
  });

  beforeEach(async () => {
    mockedAxios.mockClear();
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('PATCH Assginee tests', () => {
    test('Owners should be able to assign person to task', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      assignTaskRequest(
        { user_id, farm_id },
        { assignee_user_id: user_id },
        task_id,
        async (err, res) => {
          expect(res.status).toBe(200);
          const updated_task = await getTask(task_id);
          // expect(updated_task.wage_at_moment).toBe(30);
          expect(updated_task.assignee_user_id).toBe(user_id);
          done();
        },
      );
    });

    test('Should not be able to assign tasks to Inactive users', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ user_id: assignee_user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        {
          ...userFarm,
          status: 'Inactive',
        },
      );

      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      assignTaskRequest({ user_id, farm_id }, { assignee_user_id }, task_id, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('Managers should be able to assign person to task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      assignTaskRequest(
        { user_id, farm_id },
        { assignee_user_id: user_id },
        task_id,
        async (err, res) => {
          expect(res.status).toBe(200);
          const updated_task = await getTask(task_id);
          expect(updated_task.assignee_user_id).toBe(user_id);
          done();
        },
      );
    });

    test('EO should be able to assign person to task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      assignTaskRequest(
        { user_id, farm_id },
        { assignee_user_id: user_id },
        task_id,
        async (err, res) => {
          expect(res.status).toBe(200);
          const updated_task = await getTask(task_id);
          expect(updated_task.assignee_user_id).toBe(user_id);
          done();
        },
      );
    });

    test('Worker should be able to assign self to task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      assignTaskRequest(
        { user_id, farm_id },
        { assignee_user_id: user_id },
        task_id,
        async (err, res) => {
          expect(res.status).toBe(200);
          const updated_task = await getTask(task_id);
          expect(updated_task.assignee_user_id).toBe(user_id);
          done();
        },
      );
    });

    test('Worker should not be able to assign another person to task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(3),
      );
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      assignTaskRequest(
        { user_id, farm_id },
        { assignee_user_id: other_user_id },
        task_id,
        async (err, res) => {
          expect(res.status).toBe(403);
          done();
        },
      );
    });

    test('Farm worker should not be able to re-assign a task assigned to another person', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const [{ user_id: admin_user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(1),
      );
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(3),
      );
      const fakeTask = mocks.fakeTask({
        owner_user_id: admin_user_id,
        assignee_user_id: other_user_id,
      });
      const [{ task_id }] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        fakeTask,
      );
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      assignTaskRequest(
        { user_id, farm_id },
        { assignee_user_id: user_id },
        task_id,
        async (err, res) => {
          expect(res.status).toBe(403);
          done();
        },
      );
    });

    test('Should not be able to re-assign completed tasks', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: another_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(2),
      );
      const fakeTask = mocks.fakeTask({
        assignee_user_id: user_id,
        complete_date: faker.date.future(),
      });
      const [{ task_id }] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        fakeTask,
      );
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      assignTaskRequest(
        { user_id, farm_id },
        { assignee_user_id: another_id },
        task_id,
        async (err, res) => {
          expect(res.status).toBe(400);
          done();
        },
      );
    });

    test('Should not be able to re-assign abandoned tasks', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: another_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(2),
      );
      const fakeTask = mocks.fakeTask({
        assignee_user_id: user_id,
        abandon_date: faker.date.future(),
      });
      const [{ task_id }] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        fakeTask,
      );
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      assignTaskRequest(
        { user_id, farm_id },
        { assignee_user_id: another_id },
        task_id,
        async (err, res) => {
          expect(res.status).toBe(400);
          done();
        },
      );
    });

    test('Owner should be able to assign person to multiple tasks on date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task_1] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [task_2] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const task_1_id = task_1.task_id;
      const task_2_id = task_2.task_id;
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest(
        { user_id, farm_id },
        {
          assignee_user_id: user_id,
          date,
        },
        task_1_id,
        async (err, res) => {
          expect(res.status).toBe(200);
          const updated_task_1 = await getTask(task_1_id);
          const updated_task_2 = await getTask(task_2_id);
          expect(updated_task_1.assignee_user_id).toBe(user_id);
          expect(updated_task_2.assignee_user_id).toBe(user_id);
          done();
        },
      );
    });

    test('Manager should be able to assign person to multiple tasks on date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task_1] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [task_2] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const task_1_id = task_1.task_id;
      const task_2_id = task_2.task_id;
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest(
        { user_id, farm_id },
        {
          assignee_user_id: user_id,
          date,
        },
        task_1_id,
        async (err, res) => {
          expect(res.status).toBe(200);
          const updated_task_1 = await getTask(task_1_id);
          const updated_task_2 = await getTask(task_2_id);
          expect(updated_task_1.assignee_user_id).toBe(user_id);
          expect(updated_task_2.assignee_user_id).toBe(user_id);
          done();
        },
      );
    });

    test('EO should be able to assign person to multiple tasks on date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task_1] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [task_2] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const task_1_id = task_1.task_id;
      const task_2_id = task_2.task_id;
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest(
        { user_id, farm_id },
        {
          assignee_user_id: user_id,
          date,
        },
        task_1_id,
        async (err, res) => {
          expect(res.status).toBe(200);
          const updated_task_1 = await getTask(task_1_id);
          const updated_task_2 = await getTask(task_2_id);
          expect(updated_task_1.assignee_user_id).toBe(user_id);
          expect(updated_task_2.assignee_user_id).toBe(user_id);
          done();
        },
      );
    });

    test('should be able to assign a person to multiple tasks  without an assignee on a date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const [{ user_id: another_user }] = await mocks.userFarmFactory({
        promisedFarm: [{ farm_id }],
      });
      const date = faker.date.future().toISOString().split('T')[0];
      const [task_1] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [task_2] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [task_3] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({
          due_date: date,
          assignee_user_id: another_user,
        }),
      );
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const task_1_id = task_1.task_id;
      const task_2_id = task_2.task_id;
      const task_3_id = task_3.task_id;
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      await mocks.location_tasksFactory({ promisedTask: [task_3], promisedField: [location_2] });
      assignAllTasksOnDateRequest(
        { user_id, farm_id },
        {
          assignee_user_id: user_id,
          date,
        },
        task_1_id,
        async (err, res) => {
          expect(res.status).toBe(200);
          const updated_task_1 = await getTask(task_1_id);
          const updated_task_2 = await getTask(task_2_id);
          const updated_task_3 = await getTask(task_3_id);
          expect(updated_task_1.assignee_user_id).toBe(user_id);
          expect(updated_task_2.assignee_user_id).toBe(user_id);
          expect(updated_task_3.assignee_user_id).toBe(another_user);
          done();
        },
      );
    });

    test('Worker should be able to assign self to multiple tasks on date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task_1] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [task_2] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const task_1_id = task_1.task_id;
      const task_2_id = task_2.task_id;
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest(
        { user_id, farm_id },
        {
          assignee_user_id: user_id,
          date,
        },
        task_1_id,
        async (err, res) => {
          expect(res.status).toBe(200);
          const updated_task_1 = await getTask(task_1_id);
          const updated_task_2 = await getTask(task_2_id);
          expect(updated_task_1.assignee_user_id).toBe(user_id);
          expect(updated_task_2.assignee_user_id).toBe(user_id);
          done();
        },
      );
    });

    test('Worker should not be able to assign other person to multiple tasks on date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(3),
      );
      const date = faker.date.future().toISOString().split('T')[0];
      const [task_1] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [task_2] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest(
        { user_id, farm_id },
        {
          assignee_user_id: other_user_id,
          date,
        },
        task_1.task_id,
        async (err, res) => {
          expect(res.status).toBe(403);
          done();
        },
      );
    });

    test('Should only re-assign multiple non-completed or abandoned tasks on date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: another_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(2),
      );
      const date = faker.date.future().toISOString().split('T')[0];
      const fakeTask_completed = mocks.fakeTask({
        complete_date: faker.date.future(),
        due_date: date,
      });
      const fakeTask_abandoned = mocks.fakeTask({
        abandon_date: faker.date.future(),
        due_date: date,
      });
      const [task_1] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [task_2] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [completed_task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        fakeTask_completed,
      );
      const [abandoned_task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        fakeTask_abandoned,
      );
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      await mocks.location_tasksFactory({
        promisedTask: [completed_task],
        promisedField: [location_1],
      });
      await mocks.location_tasksFactory({
        promisedTask: [abandoned_task],
        promisedField: [location_2],
      });
      assignAllTasksOnDateRequest(
        { user_id, farm_id },
        {
          assignee_user_id: another_id,
          date,
        },
        task_1.task_id,
        async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(2);
          const updated_task_1 = await getTask(task_1.task_id);
          const updated_task_2 = await getTask(task_2.task_id);
          expect(updated_task_1.assignee_user_id).toBe(another_id);
          expect(updated_task_2.assignee_user_id).toBe(another_id);
          const updated_completed_task = await getTask(completed_task.task_id);
          expect(updated_completed_task.assignee_user_id).toBe(null);
          const updated_abandoned_task = await getTask(abandoned_task.task_id);
          expect(updated_abandoned_task.assignee_user_id).toBe(null);
          done();
        },
      );
    });

    test('Farm owner should be able to reassign a task and assign all tasks on date', async (done) => {
      const [{ user_id: ownerUserId, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: anotherUserId }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(2),
      );

      const date = faker.date.future().toISOString().split('T')[0];

      const [assignedTask] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id: ownerUserId }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date, assignee_user_id: ownerUserId }),
      );
      const [unassignedTask1] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id: ownerUserId }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date, assignee_user_id: null }),
      );
      const [unassignedTask2] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id: ownerUserId }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date, assignee_user_id: null }),
      );

      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [assignedTask],
        promisedField: [location_1],
      });
      await mocks.location_tasksFactory({
        promisedTask: [unassignedTask1],
        promisedField: [location_1],
      });
      await mocks.location_tasksFactory({
        promisedTask: [unassignedTask2],
        promisedField: [location_1],
      });

      assignAllTasksOnDateRequest(
        { user_id: ownerUserId, farm_id },
        { assignee_user_id: anotherUserId, date },
        assignedTask.task_id,
        async (err, res) => {
          expect(res.status).toBe(200);
          const reassignedTask = await getTask(assignedTask.task_id);
          const updatedTask1 = await getTask(unassignedTask1.task_id);
          const updatedTask2 = await getTask(unassignedTask2.task_id);
          expect(reassignedTask.assignee_user_id).toBe(anotherUserId);
          expect(updatedTask1.assignee_user_id).toBe(anotherUserId);
          expect(updatedTask2.assignee_user_id).toBe(anotherUserId);
          done();
        },
      );
    });

    test('Farm worker should not be able to reassign a task and assign all tasks on date', async (done) => {
      const [{ user_id: ownerUserId, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: workerUserId }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(3),
      );

      const date = faker.date.future().toISOString().split('T')[0];

      const [assignedTaskBefore] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id: ownerUserId }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date, assignee_user_id: ownerUserId }),
      );
      const [unassignedTask1Before] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id: ownerUserId }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date, assignee_user_id: null }),
      );
      const [unassignedTask2Before] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id: ownerUserId }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date, assignee_user_id: null }),
      );

      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [assignedTaskBefore],
        promisedField: [location_1],
      });
      await mocks.location_tasksFactory({
        promisedTask: [unassignedTask1Before],
        promisedField: [location_1],
      });
      await mocks.location_tasksFactory({
        promisedTask: [unassignedTask2Before],
        promisedField: [location_1],
      });

      assignAllTasksOnDateRequest(
        { user_id: workerUserId, farm_id },
        { assignee_user_id: workerUserId, date },
        assignedTaskBefore.task_id,
        async (err, res) => {
          expect(res.status).toBe(403);
          const assignedTaskAfter = await getTask(assignedTaskBefore.task_id);
          const unassignedTask1After = await getTask(unassignedTask1Before.task_id);
          const unassignedTask2After = await getTask(unassignedTask2Before.task_id);
          expect(assignedTaskAfter.assignee_user_id).toBe(ownerUserId);
          expect(unassignedTask1After.assignee_user_id).toBe(null);
          expect(unassignedTask2After.assignee_user_id).toBe(null);
          done();
        },
      );
    });
  });

  describe('GET harvest uses', () => {
    test('should get all harvest_uses for a farm', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      const fakeTask = mocks.fakeTask({
        task_type_id,
        owner_user_id: user_id,
        assignee_user_id: user_id,
      });
      await Promise.all(
        [...Array(3)].map(async () => {
          const [{ task_id }] = await mocks.taskFactory(
            {
              promisedUser: [{ user_id }],
              promisedTaskType: [{ task_type_id }],
            },
            fakeTask,
          );
          await mocks.location_tasksFactory({
            promisedTask: [{ task_id }],
            promisedField: [{ location_id }],
          });
          await mocks.harvest_taskFactory({ promisedTask: [{ task_id }] });
          const promisedHarvestUseTypes = await Promise.all(
            [...Array(3)].map(async () =>
              mocks.harvest_use_typeFactory({
                promisedFarm: { farm_id },
              }),
            ),
          );
          const harvest_types = promisedHarvestUseTypes.reduce(
            (a, b) => a.concat({ harvest_use_type_id: b[0].harvest_use_type_id }),
            [],
          );
          const harvest_uses = [];
          for (let i = 0; i < harvest_types.length; i++) {
            const [harvest_use] = await mocks.harvest_useFactory({
              promisedHarvestTask: [{ task_id }],
              promisedHarvestUseType: [
                { harvest_use_type_id: harvest_types[i].harvest_use_type_id },
              ],
            });
            harvest_uses.push(harvest_use);
          }
        }),
      );
      getHarvestUsesRequest({ user_id, farm_id }, async (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(9);
        done();
      });
    });

    test('should get all harvest uses related to a farm, but not different farms of that user', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [firstUserFarm] = await mocks.userFarmFactory({}, userFarm);
      const [secondUserFarm] = await mocks.userFarmFactory({}, userFarm);
      await Promise.all(
        [...Array(2)].map(async (_, i) => {
          const { user_id, farm_id } = i > 0 ? secondUserFarm : firstUserFarm;
          const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
          const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

          const fakeTask = mocks.fakeTask({
            task_type_id,
            owner_user_id: user_id,
            assignee_user_id: user_id,
          });

          const [{ task_id }] = await mocks.taskFactory(
            { promisedUser: [{ user_id }], promisedTaskType: [{ task_type_id }] },
            fakeTask,
          );
          await mocks.location_tasksFactory({
            promisedTask: [{ task_id }],
            promisedField: [{ location_id }],
          });
          await mocks.harvest_taskFactory({ promisedTask: [{ task_id }] });
          const promisedHarvestUseTypes = await Promise.all(
            [...Array(3)].map(async () =>
              mocks.harvest_use_typeFactory({
                promisedFarm: { farm_id },
              }),
            ),
          );
          const harvest_types = promisedHarvestUseTypes.reduce(
            (a, b) => a.concat({ harvest_use_type_id: b[0].harvest_use_type_id }),
            [],
          );
          const harvest_uses = [];
          for (let i = 0; i < harvest_types.length; i++) {
            const [harvest_use] = await mocks.harvest_useFactory({
              promisedHarvestTask: [{ task_id }],
              promisedHarvestUseType: [
                { harvest_use_type_id: harvest_types[i].harvest_use_type_id },
              ],
            });
            harvest_uses.push(harvest_use);
          }
        }),
      );
      getHarvestUsesRequest(
        { user_id: firstUserFarm.user_id, farm_id: firstUserFarm.farm_id },
        async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(3);
          done();
        },
      );
    });
  });

  describe('GET tasks', () => {
    test('should get all tasks for a farm ', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      await Promise.all(
        [...Array(10)].map(async () => {
          const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
          const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
          const [{ management_plan_id }] = await mocks.management_planFactory({
            promisedFarm: [{ farm_id }],
            promisedLocation: [{ location_id }],
          });
          const [{ task_id }] = await mocks.taskFactory({
            promisedUser: [{ user_id }],
            promisedTaskType: [{ task_type_id }],
          });
          await mocks.location_tasksFactory({
            promisedTask: [{ task_id }],
            promisedField: [{ location_id }],
          });
          await mocks.management_tasksFactory({
            promisedTask: [{ task_id }],
            promisedManagementPlan: [{ management_plan_id }],
          });
        }),
      );
      getTasksRequest({ farm_id, user_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(10);
        done();
      });
    });

    test(`should get custom tasks that don't have locations, managementPlans, or animals`, async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedTaskType: [{ task_type_id }],
      });
      getTasksRequest({ farm_id, user_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        done();
      });
    });

    xtest('should get all tasks related to a farm, but not from different farms of that user', async (done) => {
      const [firstUserFarm] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [secondUserFarmWithSameUser] = await mocks.userFarmFactory(
        { promisedUser: [{ user_id: firstUserFarm.user_id }] },
        fakeUserFarm(1),
      );
      await Promise.all(
        [...Array(20)].map(async (_, i) => {
          const innerFarmId = i > 9 ? firstUserFarm.farm_id : secondUserFarmWithSameUser.farm_id;
          const [{ task_type_id }] = await mocks.task_typeFactory({
            promisedFarm: [{ farm_id: innerFarmId }],
          });
          const [{ location_id }] = await mocks.locationFactory({
            promisedFarm: [{ farm_id: innerFarmId }],
          });
          const [{ management_plan_id }] = await mocks.management_planFactory({
            promisedFarm: [{ farm_id: innerFarmId }],
            promisedLocation: [{ location_id }],
          });
          const [{ task_id }] = await mocks.taskFactory({
            promisedUser: [{ user_id: firstUserFarm.user_id }],
            promisedTaskType: [{ task_type_id }],
          });
          await mocks.location_tasksFactory({
            promisedTask: [{ task_id }],
            promisedField: [{ location_id }],
          });
          await mocks.management_tasksFactory({
            promisedTask: [{ task_id }],
            promisedManagementPlan: [{ management_plan_id }],
          });
        }),
      );
      getTasksRequest(
        { farm_id: firstUserFarm.farm_id, user_id: firstUserFarm.user_id },
        (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(10);
          done();
        },
      );
    });
  });

  describe('POST Task', () => {
    describe('creating types of tasks', () => {
      let product;
      let productData;
      let soilAmendmentMethod;
      let soilAmendmentPurpose;
      beforeEach(async () => {
        [{ product_id: product }] = await mocks.productFactory(
          {},
          mocks.fakeProduct({ supplier: 'mock' }),
        );
        productData = mocks.fakeProduct({ supplier: 'test' });

        [{ id: soilAmendmentMethod }] = await mocks.soil_amendment_methodFactory();

        [{ id: soilAmendmentPurpose }] = await mocks.soil_amendment_purposeFactory();
      });

      const fakeProductData = {
        soil_amendment_task_products: async (farm_id) => {
          // checkSoilAmendmentTaskProducts middleware requires a product that belongs to the given farm
          const [soilAmendmentProduct] = await mocks.productFactory(
            { promisedFarm: [{ farm_id }] },
            // of type 'soil_amendment_task'
            mocks.fakeProduct({ type: 'soil_amendment_task' }),
          );
          // Make product details available
          await mocks.soil_amendment_productFactory({
            promisedProduct: [soilAmendmentProduct],
          });

          return [
            mocks.fakeSoilAmendmentTaskProduct({
              product_id: soilAmendmentProduct.product_id,
              purpose_relationships: [{ purpose_id: soilAmendmentPurpose }],
            }),
          ];
        },
      };

      const fakeTaskData = {
        soil_amendment_task: () => mocks.fakeSoilAmendmentTask({ method_id: soilAmendmentMethod }),
        soil_sample_task: () => mocks.fakeSoilSampleTask(),
        pest_control_task: () =>
          mocks.fakePestControlTask({ product_id: product, product: productData }),
        irrigation_task: () => mocks.fakeIrrigationTask(),
        scouting_task: () => mocks.fakeScoutingTask(),
        soil_task: () => mocks.fakeSoilTask(),
        field_work_task: () => mocks.fakeFieldWorkTask(),
        harvest_task: () => mocks.fakeHarvestTask(),
      };

      test('should successfully create a bunch of harvest tasks', async (done) => {
        const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
        const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
        const [{ location_id }] = await mocks.fieldFactory({ promisedFarm: [{ farm_id }] });
        const promisedManagement = await Promise.all(
          [...Array(3)].map(async () =>
            mocks.planting_management_planFactory(
              {
                promisedFarm: [{ farm_id }],
                promisedField: [{ location_id }],
              },
              { start_date: null },
            ),
          ),
        );
        const managementPlans = promisedManagement.map(([{ planting_management_plan_id }]) => ({
          planting_management_plan_id,
        }));
        const harvest_tasks = mocks
          .fakeHarvestTasks({ projected_quantity: 300 }, 3)
          .map((harvest_task, i) => {
            return {
              harvest_task,
              due_date: faker.date.future().toISOString().split('T')[0],
              task_type_id,
              owner_user_id: user_id,
              assignee_user_id: user_id,
              locations: [{ location_id }],
              managementPlans: [managementPlans[i]],
              notes: faker.lorem.words(),
            };
          });

        postHarvestTasksRequest({ user_id, farm_id }, harvest_tasks, async (err, res) => {
          expect(res.status).toBe(201);
          const task_ids = res.body.map(({ task_id }) => task_id);
          for (let i = 0; i < task_ids.length; i++) {
            const created_task = await knex('task').where({ task_id: task_ids[i] }).first();
            expect(created_task.task_type_id).toBe(task_type_id);
            expect(created_task.wage_at_moment).toBe(30);
            const isTaskRelatedToLocation = await knex('location_tasks')
              .where({ task_id: task_ids[i] })
              .first();
            expect(isTaskRelatedToLocation.location_id).toBe(location_id);
            expect(isTaskRelatedToLocation.task_id).toBe(Number(task_ids[i]));
            const isTaskRelatedToManagementPlans = await knex('management_tasks').where({
              task_id: task_ids[i],
            });
            expect(isTaskRelatedToManagementPlans.length).toBe(1);
            const created_harvest_task = await knex('harvest_task').where({
              task_id: task_ids[i],
            });
            expect(created_harvest_task.length).toBe(1);
            expect(created_harvest_task[0].task_id).toBe(Number(task_ids[i]));
            expect(created_harvest_task[0].projected_quantity).toBe(300);
          }
          done();
        });
      });

      describe('transplant task tests', () => {
        const fakeMethodMap = {
          broadcast_method: mocks.fakeBroadcastMethod,
          container_method: mocks.fakeContainerMethod,
          row_method: mocks.fakeRowMethod,
          bed_method: mocks.fakeBedMethod,
        };

        async function getBody(planting_method = 'container_method') {
          const [userFarm] = await mocks.userFarmFactory({}, { role_id: 1, status: 'Active' });
          const [transplantTaskType] = await mocks.task_typeFactory(
            {
              promisedFarm: [
                {
                  farm_id: null,
                  user_id: '1',
                },
              ],
            },
            {
              task_translation_key: 'TRANSPLANT_TASK',
              task_name: 'Transplant',
            },
          );
          const [{ location_id, management_plan_id }] = await mocks.planting_management_planFactory(
            { promisedFarm: [userFarm] },
          );
          const [{ planting_management_plan_id: prev_planting_management_plan_id }] =
            await mocks.planting_management_planFactory({ promisedFarm: [userFarm] });
          const transplant_task = {
            ...mocks.fakeTask(),
            task_type_id: transplantTaskType.task_type_id,
            transplant_task: {
              planting_management_plan: {
                ...mocks.fakePlantingManagementPlan(),
                location_id,
                management_plan_id,
                planting_task_type: 'TRANSPLANT_TASK',
                planting_method: planting_method.toUpperCase(),
                [planting_method]: fakeMethodMap[planting_method](),
              },
              prev_planting_management_plan_id,
            },
          };

          return { transplant_task, userFarm };
        }

        async function expectPlantingMethodPosted(res, transplantTaskReq) {
          expect(res.status).toBe(201);
          const transplant_task = res.body;
          transplant_task.name = transplantTaskReq.name;
          expect(transplant_task.transplant_task.planting_management_plan.planting_task_type).toBe(
            'TRANSPLANT_TASK',
          );
          expect(transplant_task.transplant_task.planting_management_plan.location_id).toBe(
            transplantTaskReq.transplant_task.planting_management_plan.location_id,
          );
          const planting_method =
            transplant_task.transplant_task.planting_management_plan.planting_method;
          expect(planting_method).toBe(
            transplantTaskReq.transplant_task.planting_management_plan.planting_method,
          );
          expect(
            transplant_task.transplant_task.planting_management_plan[planting_method.toLowerCase()],
          ).toBeDefined();
        }

        ['row_method', 'bed_method', 'container_method'].map((planting_method) => {
          test(`should create ${planting_method} transplant tasks`, async (done) => {
            const { transplant_task, userFarm } = await getBody(planting_method);
            postTransplantTaskRequest(userFarm, transplant_task, async (err, res) => {
              await expectPlantingMethodPosted(res, transplant_task);
              done();
            });
          });
        });

        test(`should fail to create a transplant task when plan's location is for a different farm`, async (done) => {
          const [userFarm2] = await generateUserFarms(1);
          const [{ location_id: locationIdInFarm2 }] = await mocks.fieldFactory({
            promisedFarm: [{ farm_id: userFarm2.farm_id }],
          });

          const { transplant_task, userFarm } = await getBody('row_method');
          transplant_task.transplant_task.planting_management_plan.location_id = locationIdInFarm2;
          postTransplantTaskRequest(userFarm, transplant_task, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test(`should fail to create a transplant task when previous plan is for different farm's location`, async (done) => {
          const [userFarm2] = await generateUserFarms(1);
          const { transplant_task, userFarm } = await getBody('row_method');
          const [{ planting_management_plan_id: prev_planting_management_plan_id }] =
            await mocks.planting_management_planFactory({ promisedFarm: [userFarm2] });
          transplant_task.transplant_task.prev_planting_management_plan_id =
            prev_planting_management_plan_id;

          postTransplantTaskRequest(userFarm, transplant_task, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });
      });

      // Object.keys(fakeTaskData).map((type) => {
      //   test(`should successfully create a ${type} without an associated management plan`, async (done) => {
      //     const { user_id, farm_id, location_id, task_type_id } = await userFarmTaskGenerator(
      //       false,
      //     );
      //     const data = {
      //       ...mocks.fakeTask({
      //         task_type_id,
      //         owner_user_id: user_id,
      //         assignee_user_id: user_id,
      //       }),
      //       locations: [{ location_id }],
      //       managementPlans: [],
      //     };

      //     postTaskRequest({ user_id, farm_id }, type, data, async (err, res) => {
      //       expect(res.status).toBe(201);
      //       const { task_id } = res.body;
      //       const createdTask = await knex('task').where({ task_id }).first();
      //       expect(createdTask).toBeDefined();
      //       // expect(createdTask.wage_at_moment).toBe(30);
      //       const isTaskRelatedToLocation = await knex('location_tasks').where({ task_id }).first();
      //       expect(isTaskRelatedToLocation.location_id).toBe(location_id);
      //       expect(isTaskRelatedToLocation.task_id).toBe(task_id);
      //       const specificTask = await knex(type).where({ task_id });
      //       expect(specificTask.length).toBe(1);
      //       expect(specificTask[0].task_id).toBe(task_id);
      //       if (res.body[type].product_id) {
      //         const specificProduct = await knex('product')
      //           .where({ product_id: res.body[type].product_id })
      //           .first();
      //         expect(specificProduct.supplier).toBe('test');
      //       }
      //       done();
      //     });
      //   });
      // });

      test('Should call Ensemble API if an irrigation task is created with an irrigation_prescription_external_id', async () => {
        const { farm, field, user } = await setupFarmEnvironment(1);
        await connectFarmToEnsemble(farm);

        const [{ task_type_id }] = await mocks.task_typeFactory();

        const irrigation_prescription_external_id = 123;

        const data = {
          ...mocks.fakeTask({
            irrigation_task: {
              ...mocks.fakeIrrigationTask({ irrigation_type_name: 'PIVOT' }),
              irrigation_prescription_external_id,
              location_id: field.location_id,
            },
            task_type_id,
            owner_user_id: user.user_id,
          }),
          locations: [{ location_id: field.location_id }],
        };

        const res = await chai
          .request(server)
          .post('/task/irrigation_task')
          .set('user_id', user.user_id)
          .set('farm_id', farm.farm_id)
          .send(data);

        expect(res.status).toBe(201);

        // Pause execution of test to allow the post-response side effect to run, before asserting on mock
        await new Promise((resolve) => setTimeout(resolve, 500));

        expect(axios).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'patch',
            url: expect.stringContaining(
              `/irrigation_prescription/${irrigation_prescription_external_id}/`,
            ),
            body: { approved: true },
          }),
        );
      });

      test('Should return an error if there is an attempt to associate the same irrigation_prescription_external_id with a second task on the same farm', async () => {
        const { farm, field, user } = await setupFarmEnvironment(1);

        const [{ task_type_id }] = await mocks.task_typeFactory();

        const irrigation_prescription_external_id = 223;

        const createMockTaskData = () => {
          return {
            ...mocks.fakeTask({
              irrigation_task: {
                ...mocks.fakeIrrigationTask({ irrigation_type_name: 'PIVOT' }),
                irrigation_prescription_external_id,
                location_id: field.location_id,
              },
              task_type_id,
              owner_user_id: user.user_id,
            }),
            locations: [{ location_id: field.location_id }],
          };
        };

        const firstTaskData = createMockTaskData();

        const res = await chai
          .request(server)
          .post('/task/irrigation_task')
          .set('user_id', user.user_id)
          .set('farm_id', farm.farm_id)
          .send(firstTaskData);

        expect(res.status).toBe(201);

        const secondTaskData = createMockTaskData();

        const res2 = await chai
          .request(server)
          .post('/task/irrigation_task')
          .set('user_id', user.user_id)
          .set('farm_id', farm.farm_id)
          .send(secondTaskData);

        expect(res2.status).toBe(400);
        expect(res2.error.text).toBe('Irrigation prescription already associated with task');
      });

      Object.keys(fakeTaskData).map((type) => {
        test(`should successfully create a ${type} with a management plan`, async (done) => {
          const { user_id, farm_id, location_id, planting_management_plan_id, task_type_id } =
            await userFarmTaskGenerator();

          const data = {
            ...mocks.fakeTask({
              [type]: fakeTaskData[type](),
              task_type_id,
              owner_user_id: user_id,
            }),
            locations: [{ location_id }],
            managementPlans: [{ planting_management_plan_id }],
          };

          if (tasksWithProducts.some((task) => task == type)) {
            data[`${type}_products`] = await fakeProductData[`${type}_products`](farm_id);
          }
          postTaskRequest({ user_id, farm_id }, type, data, async (err, res) => {
            expect(res.status).toBe(201);
            const { task_id } = res.body;
            const createdTask = await knex('task').where({ task_id }).first();
            expect(createdTask).toBeDefined();
            const isTaskRelatedToLocation = await knex('location_tasks').where({ task_id }).first();
            expect(isTaskRelatedToLocation.location_id).toBe(location_id);
            expect(isTaskRelatedToLocation.task_id).toBe(task_id);
            const isTaskRelatedToManagementPlans = await knex('management_tasks').where({
              task_id,
            });
            expect(isTaskRelatedToManagementPlans.length).toBe(1);
            const specificTask = await knex(type).where({ task_id });
            expect(specificTask.length).toBe(1);
            expect(specificTask[0].task_id).toBe(task_id);
            done();
          });
        });

        test(`should fail to create a ${type} when locations contain different farm's location`, async (done) => {
          const [userFarm1, userFarm2] = await generateUserFarms(2);
          const { farm_id, user_id } = userFarm1;
          const [{ location_id }] = await mocks.fieldFactory({
            promisedFarm: [{ farm_id }],
          });
          const [{ location_id: locationIdInFarm2 }] = await mocks.fieldFactory({
            promisedFarm: [{ farm_id: userFarm2.farm_id }],
          });
          const [{ task_type_id }] = await mocks.task_typeFactory({
            promisedFarm: [{ farm_id }],
          });
          const [{ management_plan_id }] = await mocks.crop_management_planFactory({
            promisedFarm: [{ farm_id }],
            promisedLocation: [{ location_id }],
            promisedField: [{ location_id }],
          });
          const [{ planting_management_plan_id }] = await knex('planting_management_plan').where({
            management_plan_id,
          });

          const data = {
            ...mocks.fakeTask({
              [type]: { ...fakeTaskData[type]() },
              task_type_id,
              owner_user_id: user_id,
            }),
            locations: [{ location_id }, { location_id: locationIdInFarm2 }],
            managementPlans: [{ planting_management_plan_id }],
          };

          postTaskRequest({ user_id, farm_id }, type, data, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test(`should fail to create a ${type} when any managementPlan is for different farm's location`, async (done) => {
          const [userFarm1, userFarm2] = await generateUserFarms(2);
          const { farm_id, user_id } = userFarm1;
          const [{ location_id }] = await mocks.fieldFactory({
            promisedFarm: [{ farm_id }],
          });
          const [{ crop_variety_id }] = await mocks.crop_varietyFactory({
            promisedFarm: [{ farm_id }],
          });
          const [{ crop_variety_id: cropVarietyIdInFarm2 }] = await mocks.crop_varietyFactory({
            promisedFarm: [{ farm_id: userFarm2.farm_id }],
          });
          const [{ task_type_id }] = await mocks.task_typeFactory({
            promisedFarm: [{ farm_id }],
          });

          const promisedManagement = await Promise.all(
            [...Array(3)].map(async (item, index) => {
              return mocks.planting_management_planFactory(
                {
                  promisedFarm: [{ farm_id }],
                  promisedCropVariety: [
                    {
                      crop_variety_id: [crop_variety_id, crop_variety_id, cropVarietyIdInFarm2][
                        index
                      ],
                    },
                  ],
                },
                { start_date: null },
              );
            }),
          );
          const pinLocationPlantingManagementPlan = await knex('planting_management_plan')
            .where(
              'planting_management_plan_id',
              promisedManagement[0][0].planting_management_plan_id,
            )
            .update({
              location_id: null,
              pin_coordinate: { lng: 30, lat: 30 },
            });
          const managementPlans = promisedManagement.map(([{ planting_management_plan_id }]) => ({
            planting_management_plan_id,
          }));

          const data = {
            ...mocks.fakeTask({
              [type]: { ...fakeTaskData[type]() },
              task_type_id,
              owner_user_id: user_id,
            }),
            locations: [{ location_id }],
            managementPlans,
          };

          postTaskRequest({ user_id, farm_id }, type, data, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });
      });

      test('should create a task (i.e soil amendment) with multiple management plans', async (done) => {
        const { user_id, farm_id, location_id, task_type_id } = await userFarmTaskGenerator(true);
        const promisedManagement = await Promise.all(
          [...Array(3)].map(async () =>
            mocks.crop_management_planFactory(
              {
                promisedFarm: [{ farm_id }],
                promisedLocation: [{ location_id }],
                promisedField: [{ location_id }],
              },
              {
                cropManagementPlan: { ...mocks.fakeCropManagementPlan(), needs_transplant: false },
              },
            ),
          ),
        );
        const managementPlanIds = promisedManagement.map(
          ([{ management_plan_id }]) => management_plan_id,
        );
        const plantingManagementPlans = await knex('planting_management_plan').whereIn(
          'management_plan_id',
          managementPlanIds,
        );
        const managementPlans = plantingManagementPlans.map(({ planting_management_plan_id }) => ({
          planting_management_plan_id,
        }));

        const [farmProduct] = await mocks.productFactory(
          { promisedFarm: [{ farm_id }] },
          mocks.fakeProduct({ type: 'soil_amendment_task' }),
        );
        // Make product details available
        await mocks.soil_amendment_productFactory({
          promisedProduct: [farmProduct],
        });

        const data = {
          ...mocks.fakeTask({
            soil_amendment_task: {
              method_id: soilAmendmentMethod,
              ...mocks.fakeSoilAmendmentTask(),
            },
            soil_amendment_task_products: [
              mocks.fakeSoilAmendmentTaskProduct({
                product_id: farmProduct.product_id,
                purpose_relationships: [{ purpose_id: soilAmendmentPurpose }],
              }),
            ],
            task_type_id,
            owner_user_id: user_id,
          }),
          locations: [{ location_id }],
          managementPlans,
        };

        postTaskRequest({ user_id, farm_id }, 'soil_amendment_task', data, async (err, res) => {
          expect(res.status).toBe(201);
          const { task_id } = res.body;
          const createdTask = await knex('task').where({ task_id }).first();
          expect(createdTask).toBeDefined();
          const isTaskRelatedToLocation = await knex('location_tasks').where({ task_id }).first();
          expect(isTaskRelatedToLocation.location_id).toBe(location_id);
          expect(isTaskRelatedToLocation.task_id).toBe(task_id);
          const isTaskRelatedToManagementPlans = await knex('management_tasks').where({ task_id });
          expect(isTaskRelatedToManagementPlans.length).toBe(3);
          done();
        });
      });

      test('should create a task (i.e soil amendment) and override wage', async (done) => {
        const { user_id, farm_id, location_id, task_type_id } = await userFarmTaskGenerator(true);
        const promisedManagement = await Promise.all(
          [...Array(3)].map(async () =>
            mocks.crop_management_planFactory(
              {
                promisedFarm: [{ farm_id }],
                promisedLocation: [{ location_id }],
                promisedField: [{ location_id }],
              },
              {
                cropManagementPlan: { ...mocks.fakeCropManagementPlan(), needs_transplant: false },
              },
            ),
          ),
        );
        const managementPlanIds = promisedManagement.map(
          ([{ management_plan_id }]) => management_plan_id,
        );
        const plantingManagementPlans = await knex('planting_management_plan').whereIn(
          'management_plan_id',
          managementPlanIds,
        );
        const managementPlans = plantingManagementPlans.map(({ planting_management_plan_id }) => ({
          planting_management_plan_id,
        }));
        const [farmProduct] = await mocks.productFactory(
          { promisedFarm: [{ farm_id }] },
          mocks.fakeProduct({ type: 'soil_amendment_task' }),
        );
        // Make product details available
        await mocks.soil_amendment_productFactory({
          promisedProduct: [farmProduct],
        });

        const data = {
          ...mocks.fakeTask({
            soil_amendment_task: {
              method_id: soilAmendmentMethod,
              ...mocks.fakeSoilAmendmentTask(),
            },
            soil_amendment_task_products: [
              mocks.fakeSoilAmendmentTaskProduct({
                product_id: farmProduct.product_id,
                purpose_relationships: [{ purpose_id: soilAmendmentPurpose }],
              }),
            ],
            task_type_id,
            owner_user_id: user_id,
            wage_at_moment: 50,
          }),
          locations: [{ location_id }],
          managementPlans,
        };

        postTaskRequest({ user_id, farm_id }, 'soil_amendment_task', data, async (err, res) => {
          expect(res.status).toBe(201);
          const { task_id } = res.body;
          const createdTask = await knex('task').where({ task_id }).first();
          expect(createdTask).toBeDefined();
          const isTaskRelatedToLocation = await knex('location_tasks').where({ task_id }).first();
          expect(isTaskRelatedToLocation.location_id).toBe(location_id);
          expect(isTaskRelatedToLocation.task_id).toBe(task_id);
          expect(createdTask.wage_at_moment).toBe(50);
          const isTaskRelatedToManagementPlans = await knex('management_tasks').where({ task_id });
          expect(isTaskRelatedToManagementPlans.length).toBe(3);
          done();
        });
      });

      test('should create a task (i.e pest control) and patch a product', async (done) => {
        const { user_id, farm_id, location_id, task_type_id } = await userFarmTaskGenerator(true);
        const promisedManagement = await Promise.all(
          [...Array(3)].map(async () =>
            mocks.crop_management_planFactory(
              {
                promisedFarm: [{ farm_id }],
                promisedLocation: [{ location_id }],
                promisedField: [{ location_id }],
              },
              {
                cropManagementPlan: { ...mocks.fakeCropManagementPlan(), needs_transplant: false },
              },
            ),
          ),
        );
        const managementPlanIds = promisedManagement.map(
          ([{ management_plan_id }]) => management_plan_id,
        );
        const plantingManagementPlans = await knex('planting_management_plan').whereIn(
          'management_plan_id',
          managementPlanIds,
        );
        const managementPlans = plantingManagementPlans.map(({ planting_management_plan_id }) => ({
          planting_management_plan_id,
        }));
        const pestControlProduct = mocks.fakeProduct();
        pestControlProduct.name = 'pestProduct';
        const data = {
          ...mocks.fakeTask({
            pest_control_task: {
              ...fakeTaskData.pest_control_task(),
              product: pestControlProduct,
            },
            task_type_id,
            owner_user_id: user_id,
            wage_at_moment: 50,
          }),
          locations: [{ location_id }],
          managementPlans,
        };

        postTaskRequest({ user_id, farm_id }, 'pest_control_task', data, async (err, res) => {
          expect(res.status).toBe(201);
          const { task_id } = res.body;
          const { product_id } = res.body.pest_control_task;
          const createdTask = await knex('task').where({ task_id }).first();
          expect(createdTask).toBeDefined();
          const isTaskRelatedToLocation = await knex('location_tasks').where({ task_id }).first();
          expect(isTaskRelatedToLocation.location_id).toBe(location_id);
          expect(isTaskRelatedToLocation.task_id).toBe(task_id);
          expect(createdTask.wage_at_moment).toBe(50);
          const isTaskRelatedToManagementPlans = await knex('management_tasks').where({ task_id });
          expect(isTaskRelatedToManagementPlans.length).toBe(3);
          const specificProduct = await knex('product').where({ product_id }).first();
          expect(specificProduct.name).toBe('pestProduct');
          done();
        });
      });

      test('should create a task (i.e pest control) and create a product', async (done) => {
        const { user_id, farm_id, location_id, task_type_id } = await userFarmTaskGenerator(true);
        const promisedManagement = await Promise.all(
          [...Array(3)].map(async () =>
            mocks.crop_management_planFactory(
              {
                promisedFarm: [{ farm_id }],
                promisedLocation: [{ location_id }],
                promisedField: [{ location_id }],
              },
              {
                cropManagementPlan: { ...mocks.fakeCropManagementPlan(), needs_transplant: false },
              },
            ),
          ),
        );
        const managementPlanIds = promisedManagement.map(
          ([{ management_plan_id }]) => management_plan_id,
        );
        const plantingManagementPlans = await knex('planting_management_plan').whereIn(
          'management_plan_id',
          managementPlanIds,
        );
        const managementPlans = plantingManagementPlans.map(({ planting_management_plan_id }) => ({
          planting_management_plan_id,
        }));
        const pestControlProduct = mocks.fakeProduct();
        pestControlProduct.name = 'pestProduct2';
        pestControlProduct.farm_id = farm_id;
        const data = {
          ...mocks.fakeTask({
            pest_control_task: {
              ...fakeTaskData.pest_control_task(),
              product: pestControlProduct,
              product_id: null,
            },
            task_type_id,
            owner_user_id: user_id,
            wage_at_moment: 50,
          }),
          locations: [{ location_id }],
          managementPlans,
        };

        postTaskRequest({ user_id, farm_id }, 'pest_control_task', data, async (err, res) => {
          expect(res.status).toBe(201);
          const { task_id } = res.body;
          const { product_id } = res.body.pest_control_task;
          const createdTask = await knex('task').where({ task_id }).first();
          expect(createdTask).toBeDefined();
          const isTaskRelatedToLocation = await knex('location_tasks').where({ task_id }).first();
          expect(isTaskRelatedToLocation.location_id).toBe(location_id);
          expect(isTaskRelatedToLocation.task_id).toBe(task_id);
          expect(createdTask.wage_at_moment).toBe(50);
          const isTaskRelatedToManagementPlans = await knex('management_tasks').where({ task_id });
          expect(isTaskRelatedToManagementPlans.length).toBe(3);
          const specificProduct = await knex('product').where({ product_id }).first();
          expect(specificProduct.name).toBe('pestProduct2');
          done();
        });
      });

      test('should create a custom task without locations, managementPlans or animals', async (done) => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
        const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
        const data = { ...mocks.fakeTask({ task_type_id }) };

        postTaskRequest({ user_id, farm_id }, 'custom_task', data, async (err, res) => {
          expect(res.status).toBe(201);
          const createdTask = await knex('task').where({ task_id: res.body.task_id }).first();
          expect(createdTask).toBeDefined();
          done();
        });
      });

      test('should fail to create a task were a worker is trying to assign someone else', async (done) => {
        const { farm_id, location_id, management_plan_id, task_type_id } =
          await userFarmTaskGenerator(true);
        const [{ user_id: worker_id }] = await mocks.userFarmFactory(
          { promisedFarm: [{ farm_id }] },
          fakeUserFarm(3),
        );
        const [{ user_id: another_id }] = await mocks.userFarmFactory(
          { promisedFarm: [{ farm_id }] },
          fakeUserFarm(2),
        );
        const data = {
          ...mocks.fakeTask({
            soil_amendment_task: { ...fakeTaskData.soil_amendment_task() },
            task_type_id,
            owner_user_id: worker_id,
            assignee_user_id: another_id,
          }),
          locations: [{ location_id }],
          managementPlans: [{ management_plan_id }],
        };

        postTaskRequest(
          { user_id: worker_id, farm_id },
          'soil_amendment_task',
          data,
          async (err, res) => {
            expect(res.status).toBe(403);
            done();
          },
        );
      });

      test('should fail to create a task were a worker is trying to modify wage for himself ', async (done) => {
        const { farm_id, location_id, management_plan_id, task_type_id } =
          await userFarmTaskGenerator(true);
        const [{ user_id: worker_id }] = await mocks.userFarmFactory(
          { promisedFarm: [{ farm_id }] },
          fakeUserFarm(3),
        );
        const data = {
          ...mocks.fakeTask({
            soil_amendment_task: { ...fakeTaskData.soil_amendment_task() },
            task_type_id,
            owner_user_id: worker_id,
            assignee_user_id: worker_id,
            wage_at_moment: 3512222,
          }),
          locations: [{ location_id }],
          managementPlans: [{ management_plan_id }],
        };

        postTaskRequest(
          { user_id: worker_id, farm_id },
          'soil_amendment_task',
          data,
          async (err, res) => {
            expect(res.status).toBe(403);
            done();
          },
        );
      });
    });
  });

  describe('Patch tasks completion tests', () => {
    let product;
    let productData;
    let soilAmendmentPurpose;
    let soilAmendmentMethod;
    beforeEach(async () => {
      [{ product_id: product }] = await mocks.productFactory(
        {},
        mocks.fakeProduct({ supplier: 'mock' }),
      );
      productData = mocks.fakeProduct({ supplier: 'test' });
      [{ id: soilAmendmentMethod }] = await mocks.soil_amendment_methodFactory();
      [{ id: soilAmendmentPurpose }] = await mocks.soil_amendment_purposeFactory();
    });

    const fakeProductData = {
      soil_amendment_task_products: async (farm_id) => {
        // checkSoilAmendmentTaskProducts middleware requires a product that belongs to the given farm
        const [soilAmendmentProduct] = await mocks.productFactory(
          { promisedFarm: [{ farm_id }] },
          // of type 'soil_amendment_task'
          mocks.fakeProduct({ type: 'soil_amendment_task' }),
        );
        // Make product details available
        await mocks.soil_amendment_productFactory({
          promisedProduct: [soilAmendmentProduct],
        });

        return [
          mocks.fakeSoilAmendmentTaskProduct({
            product_id: soilAmendmentProduct.product_id,
            purpose_relationships: [{ purpose_id: soilAmendmentPurpose }],
          }),
        ];
      },
    };

    const fakeTaskData = {
      soil_amendment_task: () => mocks.fakeSoilAmendmentTask({ method_id: soilAmendmentMethod }),

      pest_control_task: () =>
        mocks.fakePestControlTask({ product_id: product, product: productData }),
      irrigation_task: () => mocks.fakeIrrigationTask(),
      scouting_task: () => mocks.fakeScoutingTask(),
      soil_task: () => mocks.fakeSoilTask(),
      field_work_task: () => mocks.fakeFieldWorkTask(),
      harvest_task: () => mocks.fakeHarvestTask(),
      plant_task: () => mocks.fakePlantTask(),
    };

    const { complete_date, duration, happiness, completion_notes: notes } = fakeCompletionData;

    test('should return 403 if non-assignee tries to complete task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: another_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(1),
      );
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      assignTaskRequest({ user_id, farm_id }, { assignee_user_id: user_id }, task_id, async () => {
        completeTaskRequest(
          { user_id: another_id, farm_id },
          {
            ...fakeCompletionData,
            pest_control_task: fakeTaskData.pest_control_task(),
            assignee_user_id: user_id,
          },
          task_id,
          'pest_control_task',
          async (err, res) => {
            expect(res.status).toBe(403);
            done();
          },
        );
      });
    });

    test('should be able to complete a soil amendment task', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      const fakeTask = mocks.fakeTask({
        task_type_id,
        owner_user_id: user_id,
        assignee_user_id: user_id,
      });
      const [{ task_id }] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedTaskType: [{ task_type_id }],
        },
        fakeTask,
      );
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      await mocks.soil_amendment_taskFactory({ promisedTask: [{ task_id }] });

      const new_soil_amendment_task = fakeTaskData.soil_amendment_task(farm_id);
      const new_soil_amendment_task_products =
        await fakeProductData.soil_amendment_task_products(farm_id);

      completeTaskRequest(
        { user_id, farm_id },
        {
          ...fakeCompletionData,
          task_id,
          soil_amendment_task: { task_id, ...new_soil_amendment_task },
          soil_amendment_task_products: new_soil_amendment_task_products,
        },
        task_id,
        'soil_amendment_task',
        async (err, res) => {
          expect(res.status).toBe(200);
          const completed_task = await knex('task').where({ task_id }).first();
          expect(toLocal8601Extended(completed_task.complete_date)).toBe(complete_date);
          expect(completed_task.duration).toBe(duration);
          expect(completed_task.happiness).toBe(happiness);
          expect(completed_task.completion_notes).toBe(notes);
          const patched_soil_amendment_task = await knex('soil_amendment_task')
            .where({ task_id })
            .first();
          expect(patched_soil_amendment_task.purpose).toBe(new_soil_amendment_task.purpose);
          done();
        },
      );
    });

    test('should be able to update a soil amendment task', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      // Insert a second available purpose
      const [{ id: soilAmendmentPurposeTwo }] = await mocks.soil_amendment_purposeFactory();

      // Insert three differents products
      const [soilAmendmentProductOne] = await mocks.productFactory(
        { promisedFarm: [{ farm_id }] },
        // of type 'soil_amendment_task'
        mocks.fakeProduct({ type: 'soil_amendment_task' }),
      );
      // Make product details available
      await mocks.soil_amendment_productFactory({
        promisedProduct: [soilAmendmentProductOne],
      });
      const [soilAmendmentProductTwo] = await mocks.productFactory(
        { promisedFarm: [{ farm_id }] },
        // of type 'soil_amendment_task'
        mocks.fakeProduct({ type: 'soil_amendment_task' }),
      );
      // Make product details available
      await mocks.soil_amendment_productFactory({
        promisedProduct: [soilAmendmentProductTwo],
      });
      const [soilAmendmentProductThree] = await mocks.productFactory(
        { promisedFarm: [{ farm_id }] },
        // of type 'soil_amendment_task'
        mocks.fakeProduct({ type: 'soil_amendment_task' }),
      );
      // Make product details available
      await mocks.soil_amendment_productFactory({
        promisedProduct: [soilAmendmentProductThree],
      });

      // Initial task product state
      const soilAmendmentTaskProductData = [
        mocks.fakeSoilAmendmentTaskProduct({
          product_id: soilAmendmentProductOne.product_id,
          purpose_relationships: [
            { purpose_id: soilAmendmentPurpose },
            { purpose_id: soilAmendmentPurposeTwo },
          ],
        }),
        mocks.fakeSoilAmendmentTaskProduct({
          product_id: soilAmendmentProductTwo.product_id,
          purpose_relationships: [{ purpose_id: soilAmendmentPurpose }],
        }),
      ];

      const taskData = {
        ...mocks.fakeTask({
          soil_amendment_task: mocks.fakeSoilAmendmentTask({
            method_id: soilAmendmentMethod,
          }),
          soil_amendment_task_products: soilAmendmentTaskProductData,
          task_type_id,
          owner_user_id: user_id,
          wage_at_moment: 50,
          assignee_user_id: user_id,
        }),
        locations: [{ location_id }],
      };

      // Add task
      postTaskRequest({ user_id, farm_id }, 'soil_amendment_task', taskData, async (err, res) => {
        expect(res.status).toBe(201);
        const createdTask = res.body;
        const createdTaskProducts = createdTask.soil_amendment_task_products;
        const { task_id } = createdTask;
        // Delete abandonment reason to prevent validation error
        delete createdTask.abandonment_reason;

        // Remove a purpose relationship
        const taskProductIdForDeletedPurpose = createdTaskProducts[0].id;
        const deletedPurposeRelationship = createdTaskProducts[0].purpose_relationships.pop();
        // Delete a task product
        const deletedTaskProduct = createdTaskProducts.pop();
        // Add a new task product
        createdTaskProducts.push(
          mocks.fakeSoilAmendmentTaskProduct({
            product_id: soilAmendmentProductThree.product_id,
            purpose_relationships: [{ purpose_id: soilAmendmentPurpose }],
          }),
        );

        const { animals, animal_batches, ...patchTaskData } = createdTask;

        // Update the task
        completeTaskRequest(
          { user_id, farm_id },
          {
            ...patchTaskData,
            ...fakeCompletionData,
          },
          task_id,
          'soil_amendment_task',
          async (err, res) => {
            expect(res.status).toBe(200);

            // Two active and one deleted task product should be present
            const completed_task_products = await knex('soil_amendment_task_products').where({
              task_id,
            });
            expect(completed_task_products.length).toBe(3);
            expect(
              completed_task_products.find((prod) => prod.id == deletedTaskProduct.id).deleted,
            ).toBe(true);
            const completed_soil_amendment_task_products_purpose_relationship = await knex(
              'soil_amendment_task_products_purpose_relationship',
            ).whereIn('task_products_id', [
              completed_task_products[0].id,
              completed_task_products[1].id,
              completed_task_products[2].id,
            ]);
            expect(completed_soil_amendment_task_products_purpose_relationship.length).toBe(3);

            // The relationship created originally should be hard deleted
            const deletedRelationship = await knex(
              'soil_amendment_task_products_purpose_relationship',
            ).where('task_products_id', taskProductIdForDeletedPurpose);
            expect(deletedRelationship.length).toBe(1);
            expect(deletedRelationship[0].purpose_id).not.toBe(
              deletedPurposeRelationship.purpose_id,
            );

            // The added product should be present and have a relationship
            const addedTaskProduct = await knex('soil_amendment_task_products')
              .where({ task_id })
              .andWhere({ product_id: soilAmendmentProductThree.product_id });
            expect(addedTaskProduct.length).toBe(1);
            const addedRelationship = await knex(
              'soil_amendment_task_products_purpose_relationship',
            ).where('task_products_id', addedTaskProduct[0].id);
            expect(addedRelationship.length).toBe(1);
            done();
          },
        );
      });
    });

    test('should  not be able to delete the last purpose', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      // Insert a second available purpose
      const [{ id: soilAmendmentPurposeTwo }] = await mocks.soil_amendment_purposeFactory();

      // Insert two differents products
      const [soilAmendmentProductOne] = await mocks.productFactory(
        { promisedFarm: [{ farm_id }] },
        // of type 'soil_amendment_task'
        mocks.fakeProduct({ type: 'soil_amendment_task' }),
      );
      // Make product details available
      await mocks.soil_amendment_productFactory({
        promisedProduct: [soilAmendmentProductOne],
      });
      const [soilAmendmentProductTwo] = await mocks.productFactory(
        { promisedFarm: [{ farm_id }] },
        // of type 'soil_amendment_task'
        mocks.fakeProduct({ type: 'soil_amendment_task' }),
      );
      // Make product details available
      await mocks.soil_amendment_productFactory({
        promisedProduct: [soilAmendmentProductTwo],
      });

      // Initial task product state
      const soilAmendmentTaskProductData = [
        mocks.fakeSoilAmendmentTaskProduct({
          product_id: soilAmendmentProductOne.product_id,
          purpose_relationships: [
            { purpose_id: soilAmendmentPurpose },
            { purpose_id: soilAmendmentPurposeTwo },
          ],
        }),
        mocks.fakeSoilAmendmentTaskProduct({
          product_id: soilAmendmentProductTwo.product_id,
          purpose_relationships: [{ purpose_id: soilAmendmentPurpose }],
        }),
      ];

      const taskData = {
        ...mocks.fakeTask({
          soil_amendment_task: mocks.fakeSoilAmendmentTask({
            method_id: soilAmendmentMethod,
          }),
          soil_amendment_task_products: soilAmendmentTaskProductData,
          task_type_id,
          owner_user_id: user_id,
          wage_at_moment: 50,
          assignee_user_id: user_id,
        }),
        locations: [{ location_id }],
      };

      // Add task
      postTaskRequest({ user_id, farm_id }, 'soil_amendment_task', taskData, async (err, res) => {
        expect(res.status).toBe(201);
        const createdTask = res.body;
        const createdTaskProducts = createdTask.soil_amendment_task_products;
        const { task_id } = createdTask;
        // Delete abandonment reason to prevent validation error
        delete createdTask.abandonment_reason;

        // Remove all purpose relationships
        const taskProductForDeletedPurpose = createdTaskProducts.find(
          (product) => product.product_id == soilAmendmentProductTwo.product_id,
        );
        const taskProductIdForDeletedPurpose = taskProductForDeletedPurpose.id;
        taskProductForDeletedPurpose.purpose_relationships.pop();

        // Update the task
        completeTaskRequest(
          { user_id, farm_id },
          {
            ...createdTask,
            ...fakeCompletionData,
          },
          task_id,
          'soil_amendment_task',
          async (err, res) => {
            expect(res.status).toBe(400);
            const completed_soil_amendment_task_products_purpose_relationship = await knex(
              'soil_amendment_task_products_purpose_relationship',
            ).whereIn('task_products_id', [taskProductIdForDeletedPurpose]);
            expect(completed_soil_amendment_task_products_purpose_relationship.length).toBe(1);
            done();
          },
        );
      });
    });

    test('should not be able to delete the last product', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      // Insert a second available purpose
      const [{ id: soilAmendmentPurposeTwo }] = await mocks.soil_amendment_purposeFactory();

      // Insert one product
      const [soilAmendmentProductOne] = await mocks.productFactory(
        { promisedFarm: [{ farm_id }] },
        // of type 'soil_amendment_task'
        mocks.fakeProduct({ type: 'soil_amendment_task' }),
      );

      // Initial task product state
      const soilAmendmentTaskProductData = [
        mocks.fakeSoilAmendmentTaskProduct({
          product_id: soilAmendmentProductOne.product_id,
          purpose_relationships: [
            { purpose_id: soilAmendmentPurpose },
            { purpose_id: soilAmendmentPurposeTwo },
          ],
        }),
      ];

      const taskData = {
        ...mocks.fakeTask({
          soil_amendment_task: mocks.fakeSoilAmendmentTask({
            method_id: soilAmendmentMethod,
          }),
          soil_amendment_task_products: soilAmendmentTaskProductData,
          task_type_id,
          owner_user_id: user_id,
          wage_at_moment: 50,
          assignee_user_id: user_id,
        }),
        locations: [{ location_id }],
      };

      // Add task
      postTaskRequest({ user_id, farm_id }, 'soil_amendment_task', taskData, async (err, res) => {
        expect(res.status).toBe(201);
        const createdTask = res.body;
        const createdTaskProducts = createdTask.soil_amendment_task_products;
        const { task_id } = createdTask;
        // Delete abandonment reason to prevent validation error
        delete createdTask.abandonment_reason;

        // Delete a task product
        const deletedTaskProductOne = createdTaskProducts.pop();

        completeTaskRequest(
          { user_id, farm_id },
          {
            ...createdTask,
            ...fakeCompletionData,
          },
          task_id,
          'soil_amendment_task',
          async (err, res) => {
            expect(res.status).toBe(400);

            // One deleted task product should be present
            const completed_task_products = await knex('soil_amendment_task_products').where({
              task_id,
            });
            expect(completed_task_products.length).toBe(1);
            expect(completed_task_products[0].deleted).toBe(false);
            done();
          },
        );
      });
    });

    test('should not be able set deleted to true on the last product', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      // Insert a second available purpose
      const [{ id: soilAmendmentPurposeTwo }] = await mocks.soil_amendment_purposeFactory();

      // Insert one product
      const [soilAmendmentProductOne] = await mocks.productFactory(
        { promisedFarm: [{ farm_id }] },
        // of type 'soil_amendment_task'
        mocks.fakeProduct({ type: 'soil_amendment_task' }),
      );
      // Make product details available
      await mocks.soil_amendment_productFactory({
        promisedProduct: [soilAmendmentProductOne],
      });

      // Initial task product state
      const soilAmendmentTaskProductData = [
        mocks.fakeSoilAmendmentTaskProduct({
          product_id: soilAmendmentProductOne.product_id,
          purpose_relationships: [
            { purpose_id: soilAmendmentPurpose },
            { purpose_id: soilAmendmentPurposeTwo },
          ],
        }),
      ];

      const taskData = {
        ...mocks.fakeTask({
          soil_amendment_task: mocks.fakeSoilAmendmentTask({
            method_id: soilAmendmentMethod,
          }),
          soil_amendment_task_products: soilAmendmentTaskProductData,
          task_type_id,
          owner_user_id: user_id,
          wage_at_moment: 50,
          assignee_user_id: user_id,
        }),
        locations: [{ location_id }],
      };

      // Add task
      postTaskRequest({ user_id, farm_id }, 'soil_amendment_task', taskData, async (err, res) => {
        expect(res.status).toBe(201);
        const createdTask = res.body;
        const { task_id } = createdTask;
        // Delete abandonment reason to prevent validation error
        delete createdTask.abandonment_reason;

        // Delete a task product
        createdTask.soil_amendment_task_products[0].deleted = true;

        completeTaskRequest(
          { user_id, farm_id },
          {
            ...createdTask,
            ...fakeCompletionData,
          },
          task_id,
          'soil_amendment_task',
          async (err, res) => {
            expect(res.status).toBe(400);

            // One deleted task product should be present
            const completed_task_products = await knex('soil_amendment_task_products').where({
              task_id,
            });
            expect(completed_task_products.length).toBe(1);
            expect(completed_task_products[0].deleted).toBe(false);
            done();
          },
        );
      });
    });

    test('should be able to switch product ids on complete product by updating product id and adding removed product as new back in', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      // Insert two products
      const [soilAmendmentProductOne] = await mocks.productFactory(
        { promisedFarm: [{ farm_id }] },
        // of type 'soil_amendment_task'
        mocks.fakeProduct({ type: 'soil_amendment_task' }),
      );
      const [soilAmendmentProductTwo] = await mocks.productFactory(
        { promisedFarm: [{ farm_id }] },
        // of type 'soil_amendment_task'
        mocks.fakeProduct({ type: 'soil_amendment_task' }),
      );

      // Make product details available
      await mocks.soil_amendment_productFactory({
        promisedProduct: [soilAmendmentProductOne],
      });
      await mocks.soil_amendment_productFactory({
        promisedProduct: [soilAmendmentProductTwo],
      });

      // Initial task product state
      const soilAmendmentTaskProductData = [
        mocks.fakeSoilAmendmentTaskProduct({
          product_id: soilAmendmentProductOne.product_id,
          purpose_relationships: [{ purpose_id: soilAmendmentPurpose }],
        }),
        mocks.fakeSoilAmendmentTaskProduct({
          product_id: soilAmendmentProductTwo.product_id,
          purpose_relationships: [{ purpose_id: soilAmendmentPurpose }],
        }),
      ];

      const taskData = {
        ...mocks.fakeTask({
          soil_amendment_task: mocks.fakeSoilAmendmentTask({
            method_id: soilAmendmentMethod,
          }),
          soil_amendment_task_products: soilAmendmentTaskProductData,
          task_type_id,
          owner_user_id: user_id,
          wage_at_moment: 50,
          assignee_user_id: user_id,
        }),
        locations: [{ location_id }],
      };

      // Add task
      postTaskRequest({ user_id, farm_id }, 'soil_amendment_task', taskData, async (err, res) => {
        expect(res.status).toBe(201);
        const createdTask = res.body;
        const { task_id } = createdTask;
        // Delete abandonment reason to prevent validation error
        delete createdTask.abandonment_reason;

        // Find index of second task product
        const indexOfFirstProduct = createdTask.soil_amendment_task_products.findIndex(
          (tp) => tp.product_id === soilAmendmentProductOne.product_id,
        );
        const indexOfSecondProduct = createdTask.soil_amendment_task_products.findIndex(
          (tp) => tp.product_id === soilAmendmentProductTwo.product_id,
        );

        // Replace second task product with new taskProduct with id of first task product
        createdTask.soil_amendment_task_products[indexOfSecondProduct] =
          mocks.fakeSoilAmendmentTaskProduct({
            product_id: soilAmendmentProductOne.product_id,
            purpose_relationships: [{ purpose_id: soilAmendmentPurpose }],
          });

        // Update first task product id to second product id
        createdTask.soil_amendment_task_products[indexOfFirstProduct].product_id =
          soilAmendmentProductTwo.product_id;

        const { animals, animal_batches, ...patchTaskData } = createdTask;

        completeTaskRequest(
          { user_id, farm_id },
          {
            ...patchTaskData,
            ...fakeCompletionData,
          },
          task_id,
          'soil_amendment_task',
          async (err, res) => {
            expect(res.status).toBe(200);

            // One deleted task product should be present
            const completed_task_products = await knex('soil_amendment_task_products').where({
              task_id,
            });
            expect(completed_task_products.length).toBe(3);
            done();
          },
        );
      });
    });

    test('should be able to complete a soil sample task', async (done) => {
      const { user: owner, farm, field } = await setupFarmEnvironment(1);
      const user_id = owner.user_id;
      const farm_id = farm.farm_id;
      const location_id = field.location_id;

      // Create task type
      const [{ task_type_id }] = await mocks.task_typeFactory(
        {},
        {
          farm_id: null,
          task_translation_key: 'SOIL_SAMPLE_TASK',
          task_name: 'Soil Sample',
        },
      );

      // Create task
      const [{ task_id }] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedTaskType: [{ task_type_id }],
        },
        mocks.fakeTask({
          task_type_id,
          owner_user_id: user_id,
          assignee_user_id: user_id,
        }),
      );

      // Create location_tasks record to associate with farm
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      await mocks.soil_sample_taskFactory({ promisedTask: [{ task_id }] });

      // Generate PATCH content
      const newData = mocks.fakeSoilSampleTask();
      const { samples_per_location, sampling_tool, sample_depths } = newData;

      completeTaskRequest(
        { user_id, farm_id },
        {
          ...fakeCompletionData,
          soil_sample_task: { task_id, ...newData },
        },
        task_id,
        'soil_sample_task',

        async (_err, res) => {
          expect(res.status).toBe(200);

          // Assert on task record
          const completed = await knex('task').where({ task_id }).first();
          expectTaskCompletionFields(completed, fakeCompletionData);

          // Assert on soil_sample_task record
          const updated = await knex('soil_sample_task').where({ task_id }).first();
          expect(updated.samples_per_location).toBe(samples_per_location);
          expect(updated.sampling_tool).toBe(sampling_tool);
          expect(updated.sample_depths).toEqual(sample_depths);

          done();
        },
      );
    });

    test('should be able to complete a pest control task', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      const fakeTask = mocks.fakeTask({
        task_type_id,
        owner_user_id: user_id,
        assignee_user_id: user_id,
      });
      const [{ task_id }] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedTaskType: [{ task_type_id }],
        },
        fakeTask,
      );
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      await mocks.pest_control_taskFactory({ promisedTask: [{ task_id }] });

      const new_pest_control_task = fakeTaskData.pest_control_task();

      completeTaskRequest(
        { user_id, farm_id },
        {
          ...fakeCompletionData,
          pest_control_task: { task_id, ...new_pest_control_task },
        },
        task_id,
        'pest_control_task',
        async (err, res) => {
          expect(res.status).toBe(200);
          const completed_task = await knex('task').where({ task_id }).first();
          expect(toLocal8601Extended(completed_task.complete_date)).toBe(complete_date);
          expect(completed_task.duration).toBe(duration);
          expect(completed_task.happiness).toBe(happiness);
          expect(completed_task.completion_notes).toBe(notes);
          const patched_pest_control_task = await knex('pest_control_task')
            .where({ task_id })
            .first();
          expect(patched_pest_control_task.volume || patched_pest_control_task.weight).toBe(
            new_pest_control_task.product_quantity,
          );
          expect(patched_pest_control_task.pest_target).toBe(new_pest_control_task.pest_target);
          expect(patched_pest_control_task.control_method).toBe(
            new_pest_control_task.control_method,
          );
          done();
        },
      );
    });

    test('should be able to complete a field work task with a new custom field work task type', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      const fakeTask = mocks.fakeTask({
        task_type_id,
        owner_user_id: user_id,
        assignee_user_id: user_id,
      });
      const [{ task_id }] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedTaskType: [{ task_type_id }],
        },
        fakeTask,
      );
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      await mocks.field_work_taskFactory({ promisedTask: [{ task_id }] });

      const new_field_work_task = customFieldWorkTask(faker.lorem.words(2));
      completeTaskRequest(
        { user_id, farm_id },
        {
          ...fakeCompletionData,
          field_work_task: { task_id, ...new_field_work_task },
        },
        task_id,
        'field_work_task',
        async (err, res) => {
          expect(res.status).toBe(200);
          const completed_task = await knex('task').where({ task_id }).first();
          expect(toLocal8601Extended(completed_task.complete_date)).toBe(complete_date);
          expect(completed_task.duration).toBe(duration);
          expect(completed_task.happiness).toBe(happiness);
          expect(completed_task.completion_notes).toBe(notes);
          done();
        },
      );
    });

    test('should be able to complete a harvest task', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      const fakeTask = mocks.fakeTask({
        task_type_id,
        owner_user_id: user_id,
        assignee_user_id: user_id,
      });
      const [{ task_id }] = await mocks.taskFactory(
        { promisedUser: [{ user_id }], promisedTaskType: [{ task_type_id }] },
        fakeTask,
      );
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      await mocks.harvest_taskFactory({ promisedTask: [{ task_id }] });
      const harvest_uses = [];
      const promisedHarvestUseTypes = await Promise.all(
        [...Array(3)].map(async () =>
          mocks.harvest_use_typeFactory({
            promisedFarm: [{ farm_id }],
          }),
        ),
      );
      const harvest_types = promisedHarvestUseTypes.reduce(
        (a, b) => a.concat({ harvest_use_type_id: b[0].harvest_use_type_id }),
        [],
      );

      let actual_quantity = 0;
      harvest_types.forEach(({ harvest_use_type_id }) => {
        const harvest_use = mocks.fakeHarvestUse({
          task_id,
          harvest_use_type_id,
        });
        harvest_uses.push(harvest_use);
        actual_quantity += harvest_use.quantity;
      });
      completeTaskRequest(
        { user_id, farm_id },
        {
          task: { ...fakeCompletionData, harvest_task: { task_id, actual_quantity } },
          harvest_uses,
        },
        task_id,
        'harvest_task',
        async (err, res) => {
          expect(res.status).toBe(200);
          const completed_task = await knex('task').where({ task_id }).first();
          expect(toLocal8601Extended(completed_task.complete_date)).toBe(complete_date);
          expect(completed_task.duration).toBe(duration);
          expect(completed_task.happiness).toBe(happiness);
          expect(completed_task.completion_notes).toBe(notes);
          const new_harvest_uses = await knex('harvest_use').where({ task_id });
          expect(new_harvest_uses.length).toBe(harvest_uses.length);
          const patched_harvest_task = await knex('harvest_task').where({ task_id }).first();
          expect(patched_harvest_task.actual_quantity).toBe(actual_quantity);
          let harvest_uses_quantity = 0;
          new_harvest_uses.forEach(({ quantity }) => (harvest_uses_quantity += quantity));
          expect(harvest_uses_quantity).toBe(actual_quantity);
          done();
        },
      );
    });

    test('wage_at_moment should be updated when completing a harvest task', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const WAGE_AT_MOMENT = 50;

      const fakeTask = mocks.fakeTask({
        task_type_id,
        owner_user_id: user_id,
        assignee_user_id: user_id,
        override_hourly_wage: true,
        wage_at_moment: WAGE_AT_MOMENT,
      });
      const [{ task_id }] = await mocks.taskFactory(
        { promisedUser: [{ user_id }], promisedTaskType: [{ task_type_id }] },
        fakeTask,
      );
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      await mocks.harvest_taskFactory({ promisedTask: [{ task_id }] });
      const harvest_uses = [];
      const promisedHarvestUseTypes = await Promise.all(
        [...Array(3)].map(async () =>
          mocks.harvest_use_typeFactory({
            promisedFarm: [{ farm_id }],
          }),
        ),
      );
      const harvest_types = promisedHarvestUseTypes.reduce(
        (a, b) => a.concat({ harvest_use_type_id: b[0].harvest_use_type_id }),
        [],
      );

      let actual_quantity = 0;
      harvest_types.forEach(({ harvest_use_type_id }) => {
        const harvest_use = mocks.fakeHarvestUse({
          task_id,
          harvest_use_type_id,
        });
        harvest_uses.push(harvest_use);
        actual_quantity += harvest_use.quantity;
      });
      completeTaskRequest(
        { user_id, farm_id },
        {
          task: { ...fakeCompletionData, harvest_task: { task_id, actual_quantity } },
          harvest_uses,
        },
        task_id,
        'harvest_task',
        async (err, res) => {
          expect(res.status).toBe(200);
          const completed_task = await knex('task').where({ task_id }).first();
          expect(completed_task.wage_at_moment).toBe(WAGE_AT_MOMENT);
          done();
        },
      );
    });

    //TODO: complete plant task test
    xtest('should be able to complete a plant task', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      const fakeTask = mocks.fakeTask({
        task_type_id,
        owner_user_id: user_id,
        assignee_user_id: user_id,
      });
      const [{ task_id }] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedTaskType: [{ task_type_id }],
        },
        fakeTask,
      );
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      await mocks.plant_taskFactory({ promisedTask: [{ task_id }] });

      const new_plant_task = fakeTaskData.plant_task();

      completeTaskRequest(
        { user_id, farm_id },
        {
          ...fakeCompletionData,
          plant_task: { task_id, ...new_plant_task },
        },
        task_id,
        'plant_task',
        async (err, res) => {
          expect(res.status).toBe(200);
          const completed_task = await knex('task').where({ task_id }).first();
          expect(completed_task.complete_date.toString()).toBe(complete_date.toString());
          expect(completed_task.duration).toBe(duration);
          expect(completed_task.happiness).toBe(happiness);
          expect(completed_task.completion_notes).toBe(notes);
          const patched_plant_task = await knex('plant_task').where({ task_id }).first();
          expect(patched_plant_task.space_depth_cm).toBe(new_plant_task.space_depth_cm);
          expect(patched_plant_task.space_length_cm).toBe(new_plant_task.space_length_cm);
          expect(patched_plant_task.space_width_cm).toBe(new_plant_task.space_width_cm);
          done();
        },
      );
    });
    test('should complete a task (i.e pest control task) with multiple management plans', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.fieldFactory({ promisedFarm: [{ farm_id }] });

      const promisedManagement = await Promise.all(
        [...Array(3)].map(async () =>
          mocks.planting_management_planFactory(
            {
              promisedFarm: [{ farm_id }],
              promisedField: [{ location_id }],
              promisedManagementPlan: mocks.management_planFactory(
                { promisedFarm: [{ farm_id }] },
                {
                  ...mocks.fakeManagementPlan,
                  start_date: null,
                },
              ),
            },
            { start_date: null },
          ),
        ),
      );
      const managementPlans = promisedManagement.map(([{ planting_management_plan_id }]) => ({
        planting_management_plan_id,
      }));
      const fakeTask = mocks.fakeTask({
        task_type_id,
        owner_user_id: user_id,
        assignee_user_id: user_id,
      });
      const [{ task_id }] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedTaskType: [{ task_type_id }],
        },
        fakeTask,
      );
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });
      await mocks.pest_control_taskFactory({ promisedTask: [{ task_id }] });

      await mocks.management_tasksFactory({
        promisedTask: [{ task_id }],
        promisedPlantingManagementPlan: [managementPlans[0]],
      });
      await mocks.management_tasksFactory({
        promisedTask: [{ task_id }],
        promisedPlantingManagementPlan: [managementPlans[1]],
      });
      await mocks.management_tasksFactory({
        promisedTask: [{ task_id }],
        promisedPlantingManagementPlan: [managementPlans[2]],
      });

      const new_pest_control_task = fakeTaskData.pest_control_task();

      completeTaskRequest(
        { user_id, farm_id },
        {
          ...fakeCompletionData,
          pest_control_task: { task_id, ...new_pest_control_task },
        },
        task_id,
        'pest_control_task',
        async (err, res) => {
          expect(res.status).toBe(200);
          const completed_task = await knex('task').where({ task_id }).first();
          expect(toLocal8601Extended(completed_task.complete_date)).toBe(complete_date);
          expect(completed_task.duration).toBe(duration);
          expect(completed_task.happiness).toBe(happiness);
          expect(completed_task.completion_notes).toBe(notes);
          const patched_pest_control_task = await knex('pest_control_task')
            .where({ task_id })
            .first();
          expect(patched_pest_control_task.volume || patched_pest_control_task.weight).toBe(
            new_pest_control_task.product_quantity,
          );
          expect(patched_pest_control_task.control_method).toBe(
            new_pest_control_task.control_method,
          );
          const management_plan_1 = await knex('management_plan')
            .where({ management_plan_id: promisedManagement[0][0].management_plan_id })
            .first();
          const management_plan_2 = await knex('management_plan')
            .where({ management_plan_id: promisedManagement[1][0].management_plan_id })
            .first();
          const management_plan_3 = await knex('management_plan')
            .where({ management_plan_id: promisedManagement[2][0].management_plan_id })
            .first();
          expect(toLocal8601Extended(management_plan_1.start_date)).toBe(complete_date);
          expect(toLocal8601Extended(management_plan_2.start_date)).toBe(complete_date);
          expect(toLocal8601Extended(management_plan_3.start_date)).toBe(complete_date);
          done();
        },
      );
    });
  });

  describe('PATCH abandon task tests', () => {
    test('An unassigned task should not abandoned with a rating', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      const abandonTaskBodyWithRating = {
        ...abandonTaskBody,
        happiness: faker.datatype.number({ min: 1, max: 5 }),
      };
      abandonTaskRequest(
        { user_id, farm_id },
        abandonTaskBodyWithRating,
        task.task_id,
        async (err, res) => {
          expect(res.status).toBe(400);
          done();
        },
      );
    });

    test('An unassigned task should not abandoned with a duration', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      const abandonTaskBodyWithDuration = {
        ...abandonTaskBody,
        duration: faker.datatype.number(1000),
      };
      abandonTaskRequest(
        { user_id, farm_id },
        abandonTaskBodyWithDuration,
        task.task_id,
        async (err, res) => {
          expect(res.status).toBe(400);
          done();
        },
      );
    });

    test('Owner should be able to abandon a task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date, assignee_user_id: user_id }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.abandon_date).toBeDefined();
        expect(updated_task.abandonment_reason).toBe(CROP_FAILURE);
        expect(updated_task.other_abandonment_reason).toBe(null);
        expect(updated_task.abandonment_notes).toBe(sampleNote);
        done();
      });
    });

    test('Manager should be able to abandon a task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.abandon_date).toBeDefined();
        expect(updated_task.abandonment_reason).toBe(CROP_FAILURE);
        expect(updated_task.other_abandonment_reason).toBe(null);
        expect(updated_task.abandonment_notes).toBe(sampleNote);
        done();
      });
    });

    test('EO should be able to abandon a task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.abandon_date).toBeDefined();
        expect(updated_task.abandonment_reason).toBe(CROP_FAILURE);
        expect(updated_task.other_abandonment_reason).toBe(null);
        expect(updated_task.abandonment_notes).toBe(sampleNote);
        done();
      });
    });

    test('Admin should be able to abandon a task they do not own', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(3),
      );
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id: other_user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.abandon_date).toBeDefined();
        expect(updated_task.abandonment_reason).toBe(CROP_FAILURE);
        expect(updated_task.other_abandonment_reason).toBe(null);
        expect(updated_task.abandonment_notes).toBe(sampleNote);
        done();
      });
    });

    test('Admin should be able to abandon a task they are not assigned to', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(3),
      );
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id: other_user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date, assignee_user_id: other_user_id }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.abandon_date).toBeDefined();
        expect(updated_task.abandonment_reason).toBe(CROP_FAILURE);
        expect(updated_task.other_abandonment_reason).toBe(null);
        expect(updated_task.abandonment_notes).toBe(sampleNote);
        done();
      });
    });

    test('Worker should be able to abandon a task they own', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.abandon_date).toBeDefined();
        expect(updated_task.abandonment_reason).toBe(CROP_FAILURE);
        expect(updated_task.other_abandonment_reason).toBe(null);
        expect(updated_task.abandonment_notes).toBe(sampleNote);
        done();
      });
    });

    test('Worker should be able to abandon a task they are assigned to', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(1),
      );
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id: other_user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date, assignee_user_id: user_id }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.abandon_date).toBeDefined();
        expect(updated_task.abandonment_reason).toBe(CROP_FAILURE);
        expect(updated_task.other_abandonment_reason).toBe(null);
        expect(updated_task.abandonment_notes).toBe(sampleNote);
        done();
      });
    });

    test('Worker should not be able to abandon a task they neither own or are assigned', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(1),
      );
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id: other_user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date, assignee_user_id: other_user_id }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

    test('Should not be able to abandon a task with disallowed reason', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date, assignee_user_id: user_id }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest(
        { user_id, farm_id },
        { abandonTaskBody, abandonment_reason: 'NO_ANIMALS' },
        task.task_id,
        async (err, res) => {
          expect(res.status).toBe(400);
          expect(res.error.text).toBe('The provided abandonment_reason is not allowed');
          done();
        },
      );
    });
  });

  describe('DELETE task tests', () => {
    test('Owner should be able to delete a task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date, assignee_user_id: user_id }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      deleteTaskRequest({ user_id, farm_id }, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.deleted).toBe(true);
        done();
      });
    });

    test('Manager should be able to delete a task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      deleteTaskRequest({ user_id, farm_id }, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.deleted).toBe(true);
        done();
      });
    });

    test('EO should be able to delete a task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      deleteTaskRequest({ user_id, farm_id }, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.deleted).toBe(true);
        done();
      });
    });

    test('Owner should be able to delete a task they do not own', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(3),
      );
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id: other_user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      deleteTaskRequest({ user_id, farm_id }, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.deleted).toBe(true);
        done();
      });
    });

    test('Owner should be able to delete a task they are not assigned to', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(3),
      );
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id: other_user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date, assignee_user_id: other_user_id }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      deleteTaskRequest({ user_id, farm_id }, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.deleted).toBe(true);
        done();
      });
    });

    test('Worker should not be able to delete any task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
          promisedFarm: [{ farm_id }],
        },
        mocks.fakeTask({ due_date: date, assignee_user_id: user_id }),
      );
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      deleteTaskRequest({ user_id, farm_id }, task.task_id, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });
  });

  describe('Patch task due date test', () => {
    test('Farm owner must be able to patch task due date to today', async (done) => {
      const today = new Date();
      const due_date = today.toISOString().split('T')[0];
      const patchTaskDateBody = { due_date };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchTaskDateRequest({ user_id, farm_id }, patchTaskDateBody, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task_id);
        expect(toLocal8601Extended(updated_task.due_date)).toBe(due_date);
        done();
      });
    });

    test('Farm owner must be able to patch task due date to a future date', async (done) => {
      const due_date = faker.date.future().toISOString().split('T')[0];
      const patchTaskDateBody = { due_date };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchTaskDateRequest({ user_id, farm_id }, patchTaskDateBody, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task_id);
        expect(toLocal8601Extended(updated_task.due_date)).toBe(due_date);
        done();
      });
    });

    test('Farm owner should be able to patch task due date to a date in the past', async (done) => {
      const past = faker.date.past();
      const due_date = past.toISOString().split('T')[0];
      const patchTaskDateBody = { due_date };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchTaskDateRequest({ user_id, farm_id }, patchTaskDateBody, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });

    test('EO must be able to patch task due date to today', async (done) => {
      const today = new Date();
      const due_date = today.toISOString().split('T')[0];
      const patchTaskDateBody = { due_date };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchTaskDateRequest({ user_id, farm_id }, patchTaskDateBody, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task_id);
        expect(toLocal8601Extended(updated_task.due_date)).toBe(due_date);
        done();
      });
    });

    test('EO must be able to patch task due date to a future date', async (done) => {
      const due_date = faker.date.future().toISOString().split('T')[0];
      const patchTaskDateBody = { due_date };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchTaskDateRequest({ user_id, farm_id }, patchTaskDateBody, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task_id);
        expect(toLocal8601Extended(updated_task.due_date)).toBe(due_date);
        done();
      });
    });

    test('EO should be able to patch task due date to a date in the past', async (done) => {
      const past = faker.date.past();
      const due_date = past.toISOString().split('T')[0];
      const patchTaskDateBody = { due_date };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchTaskDateRequest({ user_id, farm_id }, patchTaskDateBody, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });

    test('Managers must be able to patch task due date to today', async (done) => {
      const today = new Date();
      const due_date = today.toISOString().split('T')[0];
      const patchTaskDateBody = { due_date };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchTaskDateRequest({ user_id, farm_id }, patchTaskDateBody, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task_id);
        expect(toLocal8601Extended(updated_task.due_date)).toBe(due_date);
        done();
      });
    });

    test('Managers must be able to patch task due date to a future date', async (done) => {
      const due_date = faker.date.future().toISOString().split('T')[0];
      const patchTaskDateBody = { due_date };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchTaskDateRequest({ user_id, farm_id }, patchTaskDateBody, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task_id);
        expect(toLocal8601Extended(updated_task.due_date)).toBe(due_date);
        done();
      });
    });

    test('Managers should be able to patch task due date to a date in the past', async (done) => {
      const past = faker.date.past();
      const due_date = past.toISOString().split('T')[0];
      const patchTaskDateBody = { due_date };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchTaskDateRequest({ user_id, farm_id }, patchTaskDateBody, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });

    test('Farm worker must not be able to patch task due date', async (done) => {
      const due_date = faker.date.future().toISOString().split('T')[0];
      const patchTaskDateBody = { due_date };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchTaskDateRequest({ user_id, farm_id }, patchTaskDateBody, task_id, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });
  });

  describe('Patch task wage test', () => {
    const testWithRole = async (userRoleId, wage_at_moment, done) => {
      const patchTaskWageBody = { wage_at_moment };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(userRoleId));
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedFarm: [{ farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      const adminRoles = [1, 2, 5];
      if (adminRoles.includes(userRoleId)) {
        patchTaskWageRequest({ user_id, farm_id }, patchTaskWageBody, task_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updated_task = await getTask(task_id);
          expect(updated_task.wage_at_moment).toBe(wage_at_moment);
          expect(updated_task.override_hourly_wage).toBe(true);
          done();
        });
        return;
      }

      patchTaskWageRequest({ user_id, farm_id }, patchTaskWageBody, task_id, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    };

    test('Farm owner must be able to patch task wage', async (done) => {
      testWithRole(1, 33, done);
    });

    test('EO must be able to patch task wage', async (done) => {
      testWithRole(5, 27, done);
    });

    test('Managers must be able to patch task wage', async (done) => {
      testWithRole(2, 37, done);
    });

    test('Farm worker must not be able to patch task wage', async (done) => {
      testWithRole(3, 30, done);
    });
  });
});
