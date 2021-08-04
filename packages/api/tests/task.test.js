const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require('../src/server');
const knex = require('../src/util/knex');
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
const mocks = require('./mock.factories');
const { tableCleanup } = require('./testEnvironment');
let faker = require('faker');


describe('Task tests', () => {
  let middleware;
  beforeEach(() => {
    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next();
    });
  })

  function assignTaskRequest({ user_id, farm_id }, data, task_id, callback) {
    chai.request(server).patch(`/task/assign/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function assignAllTasksOnDateRequest({ user_id, farm_id }, data, task_id, callback) {
    chai.request(server).patch(`/task/assign_all_tasks_on_date/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  async function getTask(task_id) {
    return knex('task').where({ task_id }).first();
  }


  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('PATCH Assginee tests', () => {
    test('Owners should be able to assign person to task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      assignTaskRequest({ user_id, farm_id }, { assignee_user_id: user_id }, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task_id);
        expect(updated_task.assignee_user_id).toBe(user_id);
        done();
      });
    });

    test('Managers should be able to assign person to task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
      const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      assignTaskRequest({ user_id, farm_id }, { assignee_user_id: user_id }, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task_id);
        expect(updated_task.assignee_user_id).toBe(user_id);
        done();
      });
    });

    test('EO should be able to assign person to task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      assignTaskRequest({ user_id, farm_id }, { assignee_user_id: user_id }, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task_id);
        expect(updated_task.assignee_user_id).toBe(user_id);
        done();
      });
    });

    test('Worker should be able to assign self to task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      assignTaskRequest({ user_id, farm_id }, { assignee_user_id: user_id }, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task_id);
        expect(updated_task.assignee_user_id).toBe(user_id);
        done();
      });
    });

    test('Worker should not be able to assign another person to task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const [{ other_user_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(3));
      const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      assignTaskRequest({ user_id, farm_id }, { assignee_user_id: other_user_id }, task_id, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

    test('Owner should be able to assign person to multiple tasks on date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const date = faker.date.future();
      const [task_1] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [task_2] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const task_1_id = task_1.task_id;
      const task_2_id = task_2.task_id;
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest({ user_id, farm_id }, { assignee_user_id: user_id, date: date }, task_1_id, async (err, res) => {
        console.log(res);
        expect(res.status).toBe(200);
        const updated_task_1 = await getTask(task_1_id);
        const updated_task_2 = await getTask(task_2_id);
        expect(updated_task_1.assignee_user_id).toBe(user_id);
        expect(updated_task_2.assignee_user_id).toBe(user_id);
        done();
      });
    });

    test('Manager should be able to assign person to multiple tasks on date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
      const date = faker.date.future();
      const [task_1] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [task_2] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const task_1_id = task_1.task_id;
      const task_2_id = task_2.task_id;
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest({ user_id, farm_id }, { assignee_user_id: user_id, date: date }, task_1_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task_1 = await getTask(task_1_id);
        const updated_task_2 = await getTask(task_2_id);
        expect(updated_task_1.assignee_user_id).toBe(user_id);
        expect(updated_task_2.assignee_user_id).toBe(user_id);
        done();
      });
    });

    test('EO should be able to assign person to multiple tasks on date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const date = faker.date.future();
      const [task_1] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [task_2] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const task_1_id = task_1.task_id;
      const task_2_id = task_2.task_id;
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest({ user_id, farm_id }, { assignee_user_id: user_id, date: date }, task_1_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task_1 = await getTask(task_1_id);
        const updated_task_2 = await getTask(task_2_id);
        expect(updated_task_1.assignee_user_id).toBe(user_id);
        expect(updated_task_2.assignee_user_id).toBe(user_id);
        done();
      });
    });

    test('Worker should be able to assign self to multiple tasks on date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const date = faker.date.future();
      const [task_1] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [task_2] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const task_1_id = task_1.task_id;
      const task_2_id = task_2.task_id;
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest({ user_id, farm_id }, { assignee_user_id: user_id, date: date }, task_1_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task_1 = await getTask(task_1_id);
        const updated_task_2 = await getTask(task_2_id);
        expect(updated_task_1.assignee_user_id).toBe(user_id);
        expect(updated_task_2.assignee_user_id).toBe(user_id);
        done();
      });
    });

    test('Worker should not be able to assign other person to multiple tasks on date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const [{ other_user_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(3));
      const date = faker.date.future();
      const [task_1] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [task_2] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest({ user_id, farm_id }, { assignee_user_id: other_user_id, date: date }, task_1.task_id, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

  });
});