const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require('../src/server');
const knex = require('../src/util/knex');
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
const mocks = require('./mock.factories');
const { tableCleanup } = require('./testEnvironment');
const moment = require('moment');
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
  });

  function assignTaskRequest({ user_id, farm_id }, data, task_id, callback) {
    chai.request(server).patch(`/task/assign/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function postTaskRequest({ user_id, farm_id }, type, data, callback) {
    chai.request(server).post(`/task/${type}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function postHarvestTasksRequest({ user_id, farm_id }, data, callback) {
    chai.request(server).post(`/task/harvest_tasks`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function postTransplantTaskRequest({ user_id, farm_id }, data, callback) {
    chai.request(server).post(`/task/transplant_task`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function getTasksRequest({ user_id, farm_id }, callback) {
    chai.request(server).get(`/task/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function getHarvestUsesRequest({ user_id, farm_id }, callback) {
    chai.request(server).get(`/task/harvest_uses/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function assignAllTasksOnDateRequest({ user_id, farm_id }, data, task_id, callback) {
    chai.request(server).patch(`/task/assign_all_tasks_on_date/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function completeTaskRequest({ user_id, farm_id }, data, task_id, type, callback) {
    chai.request(server).patch(`/task/complete/${type}/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function abandonTaskRequest({ user_id, farm_id }, data, task_id, callback) {
    chai.request(server).patch(`/task/abandon/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }


  async function userFarmTaskGenerator(linkPlan = true) {
    const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
    const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
    const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
    const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
    const [{ crop_variety_id }] = await mocks.crop_varietyFactory({ promisedFarm: [{ farm_id }] });

    const [{ management_plan_id }] = linkPlan ? await mocks.crop_management_planFactory({
      promisedFarm: [{ farm_id }],
      promisedLocation: [{ location_id }],
      crop_variety: [{ crop_variety_id }],
    }) : [{ management_plan_id: null }];
    const [{ planting_management_plan_id }] = linkPlan ? await knex('planting_management_plan').where({ management_plan_id }) : [{ planting_management_plan_id: null }];
    return { user_id, farm_id, location_id, management_plan_id, planting_management_plan_id, task_type_id };
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
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      assignTaskRequest({ user_id, farm_id }, { assignee_user_id: user_id }, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task_id);
        // expect(updated_task.wage_at_moment).toBe(30);
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
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(3));
      const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      assignTaskRequest({ user_id, farm_id }, { assignee_user_id: other_user_id }, task_id, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

    test('Should not be able to re-assign completed tasks', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: another_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(2));
      const fakeTask = mocks.fakeTask({
        assignee_user_id: user_id,
        completed_time: faker.date.future(),
      });
      const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, task = fakeTask);
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      assignTaskRequest({ user_id, farm_id }, { assignee_user_id: another_id }, task_id, async (err, res) => {
        expect(res.status).toBe(406);
        done();
      });
    });

    test('Should not be able to re-assign abandoned tasks', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: another_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(2));
      const fakeTask = mocks.fakeTask({
        assignee_user_id: user_id,
        abandoned_time: faker.date.future(),
      });
      const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, task = fakeTask);
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      assignTaskRequest({ user_id, farm_id }, { assignee_user_id: another_id }, task_id, async (err, res) => {
        expect(res.status).toBe(406);
        done();
      });
    });

    test('Owner should be able to assign person to multiple tasks on date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task_1] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [task_2] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const task_1_id = task_1.task_id;
      const task_2_id = task_2.task_id;
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest({ user_id, farm_id }, {
        assignee_user_id: user_id,
        date: date,
      }, task_1_id, async (err, res) => {
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
      const date = faker.date.future().toISOString().split('T')[0];
      const [task_1] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [task_2] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const task_1_id = task_1.task_id;
      const task_2_id = task_2.task_id;
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest({ user_id, farm_id }, {
        assignee_user_id: user_id,
        date: date,
      }, task_1_id, async (err, res) => {
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
      const date = faker.date.future().toISOString().split('T')[0];
      const [task_1] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [task_2] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const task_1_id = task_1.task_id;
      const task_2_id = task_2.task_id;
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest({ user_id, farm_id }, {
        assignee_user_id: user_id,
        date,
      }, task_1_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task_1 = await getTask(task_1_id);
        const updated_task_2 = await getTask(task_2_id);
        expect(updated_task_1.assignee_user_id).toBe(user_id);
        expect(updated_task_2.assignee_user_id).toBe(user_id);
        done();
      });
    });

    test('should be able to assign a person to multiple tasks  without an assignee on a date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const [{ user_id: another_user }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] });
      const date = faker.date.future().toISOString().split('T')[0];
      const [task_1] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [task_2] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [task_3] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({
        due_date: date,
        assignee_user_id: another_user,
      }));
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const task_1_id = task_1.task_id;
      const task_2_id = task_2.task_id;
      const task_3_id = task_3.task_id;
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      await mocks.location_tasksFactory({ promisedTask: [task_3], promisedField: [location_2] });
      assignAllTasksOnDateRequest({ user_id, farm_id }, {
        assignee_user_id: user_id,
        date,
      }, task_1_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task_1 = await getTask(task_1_id);
        const updated_task_2 = await getTask(task_2_id);
        const updated_task_3 = await getTask(task_3_id);
        expect(updated_task_1.assignee_user_id).toBe(user_id);
        expect(updated_task_2.assignee_user_id).toBe(user_id);
        expect(updated_task_3.assignee_user_id).toBe(another_user);
        done();
      });
    });

    test('Worker should be able to assign self to multiple tasks on date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task_1] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [task_2] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const task_1_id = task_1.task_id;
      const task_2_id = task_2.task_id;
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest({ user_id, farm_id }, {
        assignee_user_id: user_id,
        date: date,
      }, task_1_id, async (err, res) => {
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
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(3));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task_1] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [task_2] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      assignAllTasksOnDateRequest({ user_id, farm_id }, {
        assignee_user_id: other_user_id,
        date: date,
      }, task_1.task_id, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

    test('Should only re-assign multiple non-completed or abandoned tasks on date', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: another_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(2));
      const date = faker.date.future().toISOString().split('T')[0];
      const fakeTask_completed = mocks.fakeTask({
        completed_time: faker.date.future(),
        due_date: date,
      });
      const fakeTask_abandoned = mocks.fakeTask({
        abandoned_time: faker.date.future(),
        due_date: date,
      });
      const [task_1] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [task_2] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [completed_task] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, task = fakeTask_completed);
      const [abandoned_task] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, task = fakeTask_abandoned);
      const [location_1] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      const [location_2] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task_1], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [task_2], promisedField: [location_2] });
      await mocks.location_tasksFactory({ promisedTask: [completed_task], promisedField: [location_1] });
      await mocks.location_tasksFactory({ promisedTask: [abandoned_task], promisedField: [location_2] });
      assignAllTasksOnDateRequest({ user_id, farm_id }, {
        assignee_user_id: another_id,
        date: date,
      }, task_1.task_id, async (err, res) => {
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
      });
    });
  });

  describe('GET harvest uses', () => {
    test('should get all harvest_uses for a farm', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      const fakeTask = mocks.fakeTask({
        task_type_id: task_type_id,
        owner_user_id: user_id,
        assignee_user_id: user_id,
      });
      await Promise.all([...Array(3)].map(async () => {
        const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }], promisedTaskType: [{ task_type_id }] }, fakeTask);
        await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
        await mocks.harvest_taskFactory({ promisedTask: [{ task_id }] });
        const promisedHarvestUseTypes = await Promise.all([...Array(3)].map(async () =>
          mocks.harvest_use_typeFactory({
            promisedFarm: { farm_id },
          })
        ));
        const harvest_types = promisedHarvestUseTypes.reduce((a, b) => a.concat({ harvest_use_type_id: b[0].harvest_use_type_id }), []);
        const harvest_uses = [];
        for (let i = 0; i < harvest_types.length; i++) {
          let [harvest_use] = await mocks.harvest_useFactory({
            promisedHarvestTask: [{ task_id }],
            promisedHarvestUseType: [{ harvest_use_type_id: harvest_types[i].harvest_use_type_id }]
          });
          harvest_uses.push(harvest_use);
        }
      }));
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
      await Promise.all([...Array(2)].map(async (_, i) => {
        const { user_id, farm_id } = i > 0 ? secondUserFarm : firstUserFarm;
        const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
        const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

        const fakeTask = mocks.fakeTask({
          task_type_id: task_type_id,
          owner_user_id: user_id,
          assignee_user_id: user_id,
        });

        const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }], promisedTaskType: [{ task_type_id }] }, fakeTask);
        await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
        await mocks.harvest_taskFactory({ promisedTask: [{ task_id }] });
        const promisedHarvestUseTypes = await Promise.all([...Array(3)].map(async () =>
          mocks.harvest_use_typeFactory({
            promisedFarm: { farm_id },
          })
        ));
        const harvest_types = promisedHarvestUseTypes.reduce((a, b) => a.concat({ harvest_use_type_id: b[0].harvest_use_type_id }), []);
        const harvest_uses = [];
        for (let i = 0; i < harvest_types.length; i++) {
          let [harvest_use] = await mocks.harvest_useFactory({
            promisedHarvestTask: [{ task_id }],
            promisedHarvestUseType: [{ harvest_use_type_id: harvest_types[i].harvest_use_type_id }]
          });
          harvest_uses.push(harvest_use);
        }
      }));
      getHarvestUsesRequest({ user_id: firstUserFarm.user_id, farm_id: firstUserFarm.farm_id }, async (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(3);
        done();
      });
    });
  })

  describe('GET tasks', () => {

    test('should get all tasks for a farm ', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const tasks = await Promise.all([...Array(10)].map(async () => {
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
        await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
        await mocks.management_tasksFactory({
          promisedTask: [{ task_id }],
          promisedManagementPlan: [{ management_plan_id }],
        });
      }));
      getTasksRequest({ farm_id, user_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(10);
        done();
      });
    });

    xtest('should get all tasks that are related to a farm, but not from different farms of that user', async (done) => {
      const [firstUserFarm] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [secondUserFarmWithSameUser] = await mocks.userFarmFactory({ promisedUser: [{ user_id: firstUserFarm.user_id }] }, fakeUserFarm(1));
      await Promise.all([...Array(20)].map(async (_, i) => {
        const innerFarmId = i > 9 ? firstUserFarm.farm_id : secondUserFarmWithSameUser.farm_id;
        const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id: innerFarmId }] });
        const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id: innerFarmId }] });
        const [{ management_plan_id }] = await mocks.management_planFactory({
          promisedFarm: [{ farm_id: innerFarmId }],
          promisedLocation: [{ location_id }],
        });
        const [{ task_id }] = await mocks.taskFactory({
          promisedUser: [{ user_id: firstUserFarm.user_id }],
          promisedTaskType: [{ task_type_id }],
        });
        await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
        await mocks.management_tasksFactory({
          promisedTask: [{ task_id }],
          promisedManagementPlan: [{ management_plan_id }],
        });
      }));
      getTasksRequest({ farm_id: firstUserFarm.farm_id, user_id: firstUserFarm.user_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(10);
        done();
      });
    });
  });

  describe('POST Task', () => {

    describe('creating types of tasks', () => {
      let product;
      let productData;
      beforeEach(async () => {
        [{ product_id: product }] = await mocks.productFactory({}, mocks.fakeProduct({ supplier: 'mock' }));
        productData = mocks.fakeProduct({ supplier: 'test' });
      });
      const fakeTaskData = {
        soil_amendment_task: () => mocks.fakeSoilAmendmentTask({ product_id: product, product: productData }),
        pest_control_task: () => mocks.fakePestControlTask({ product_id: product, product: productData }),
        irrigation_task: () => mocks.fakeIrrigationTask(),
        scouting_task: () => mocks.fakeScoutingTask(),
        soil_task: () => mocks.fakeSoilTask(),
        field_work_task: () => mocks.fakeFieldWorkTask(),
        harvest_task: () => mocks.fakeHarvestTask(),
      };

      test('should succesfully create a bunch of harvest tasks', async (done) => {
        const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
        const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
        const [{ location_id }] = await mocks.fieldFactory({ promisedFarm: [{ farm_id }] });
        const promisedManagement = await Promise.all([...Array(3)].map(async () =>
          mocks.planting_management_planFactory({
            promisedFarm: [{ farm_id }],
            promisedField: [{ location_id }],
          }, { start_date: null }),
        ));
        const managementPlans = promisedManagement.map(([{ planting_management_plan_id }]) => ({ planting_management_plan_id }));
        const harvest_tasks = mocks.fakeHarvestTasks({ projected_quantity: 300 }, 3).map((harvest_task, i) => {
          return {
            harvest_task,
            due_date: faker.date.future(),
            task_type_id: task_type_id,
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
            const isTaskRelatedToLocation = await knex('location_tasks').where({ task_id: task_ids[i] }).first();
            expect(isTaskRelatedToLocation.location_id).toBe(location_id);
            expect(isTaskRelatedToLocation.task_id).toBe(Number(task_ids[i]));
            const isTaskRelatedToManagementPlans = await knex('management_tasks').where({ task_id: task_ids[i] });
            expect(isTaskRelatedToManagementPlans.length).toBe(1);
            const created_harvest_task = await knex('harvest_task').where({ task_id: task_ids[i] });
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
          const [transplantTaskType] = await mocks.task_typeFactory({
            promisedFarm: [{
              farm_id: null,
              user_id: '1',
            }],
          }, {
            'task_translation_key': 'TRANSPLANT_TASK',
            'task_name': 'Transplant',
          });
          const [{ location_id }] = await mocks.fieldFactory({ promisedFarm: [userFarm] });
          const [{ management_plan_id }] = await mocks.crop_management_planFactory({ promisedFarm: [userFarm] });
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
            },
          };

          return { transplant_task, userFarm };
        }

        async function expectPlantingMethodPosted(res, transplantTaskReq) {
          expect(res.status).toBe(201);
          const transplant_task = res.body;
          transplant_task.name = transplantTaskReq.name;
          expect(transplant_task.transplant_task.planting_management_plan.planting_task_type).toBe('TRANSPLANT_TASK');
          expect(transplant_task.transplant_task.planting_management_plan.location_id).toBe(transplantTaskReq.transplant_task.planting_management_plan.location_id);
          const planting_method = transplant_task.transplant_task.planting_management_plan.planting_method;
          expect(planting_method).toBe(transplantTaskReq.transplant_task.planting_management_plan.planting_method);
          expect(transplant_task.transplant_task.planting_management_plan[planting_method.toLowerCase()]).toBeDefined();
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

      });


      Object.keys(fakeTaskData).map((type) => {
        test(`should successfully create a ${type} without an associated management plan`, async (done) => {
          const { user_id, farm_id, location_id, task_type_id } = await userFarmTaskGenerator(false);
          const data = {
            ...mocks.fakeTask({
              [type]: { ...fakeTaskData[type]() },
              task_type_id: task_type_id,
              owner_user_id: user_id,
              assignee_user_id: user_id,
            }),
            locations: [{ location_id }],
            managementPlans: [],
          };

          postTaskRequest({ user_id, farm_id }, type, data, async (err, res) => {
            expect(res.status).toBe(201);
            const { task_id } = res.body;
            const createdTask = await knex('task').where({ task_id }).first();
            expect(createdTask).toBeDefined();
            // expect(createdTask.wage_at_moment).toBe(30);
            const isTaskRelatedToLocation = await knex('location_tasks').where({ task_id }).first();
            expect(isTaskRelatedToLocation.location_id).toBe(location_id);
            expect(isTaskRelatedToLocation.task_id).toBe(task_id);
            const specificTask = await knex(type).where({ task_id });
            expect(specificTask.length).toBe(1);
            expect(specificTask[0].task_id).toBe(task_id);
            if (res.body[type].product_id) {
              const specificProduct = await knex('product').where({ product_id: res.body[type].product_id }).first();
              expect(specificProduct.supplier).toBe('test');
            }
            done();
          });
        });
      });

      Object.keys(fakeTaskData).map((type) => {
        test(`should successfully create a ${type} with a management plan`, async (done) => {
          const {
            user_id,
            farm_id,
            location_id,
            management_plan_id,
            planting_management_plan_id,
            task_type_id,
          } = await userFarmTaskGenerator();
          const data = {
            ...mocks.fakeTask({
              [type]: { ...fakeTaskData[type]() },
              task_type_id: task_type_id,
              owner_user_id: user_id,
            }),
            locations: [{ location_id }],
            managementPlans: [{ planting_management_plan_id }],
          };

          postTaskRequest({ user_id, farm_id }, type, data, async (err, res) => {
            expect(res.status).toBe(201);
            const { task_id } = res.body;
            const createdTask = await knex('task').where({ task_id }).first();
            expect(createdTask).toBeDefined();
            const isTaskRelatedToLocation = await knex('location_tasks').where({ task_id }).first();
            expect(isTaskRelatedToLocation.location_id).toBe(location_id);
            expect(isTaskRelatedToLocation.task_id).toBe(task_id);
            const isTaskRelatedToManagementPlans = await knex('management_tasks').where({ task_id });
            expect(isTaskRelatedToManagementPlans.length).toBe(1);
            const specificTask = await knex(type).where({ task_id });
            expect(specificTask.length).toBe(1);
            expect(specificTask[0].task_id).toBe(task_id);
            done();
          });
        });
      });

      test('should create a task (i.e soilamendment)  with multiple management plans', async (done) => {
        const { user_id, farm_id, location_id, management_plan_id, task_type_id } = await userFarmTaskGenerator(true);
        const promisedManagement = await Promise.all([...Array(3)].map(async () =>
          mocks.crop_management_planFactory({
            promisedFarm: [{ farm_id }],
            promisedLocation: [{ location_id }],
            promisedField: [{ location_id }],
          }, {
            cropManagementPlan: { ...mocks.fakeCropManagementPlan(), needs_transplant: false },
          }),
        ));
        const managementPlanIds = promisedManagement.map(([{ management_plan_id }]) => management_plan_id);
        const plantingManagementPlans = await knex('planting_management_plan').whereIn('management_plan_id', managementPlanIds);
        const managementPlans = plantingManagementPlans.map(({ planting_management_plan_id }) => ({ planting_management_plan_id }));

        const data = {
          ...mocks.fakeTask({
            soil_amendment_task: { ...fakeTaskData.soil_amendment_task() },
            task_type_id: task_type_id,
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

      test('should create a task (i.e soilamendment) and override wage', async (done) => {
        const { user_id, farm_id, location_id, management_plan_id, task_type_id } = await userFarmTaskGenerator(true);
        const promisedManagement = await Promise.all([...Array(3)].map(async () =>
          mocks.crop_management_planFactory({
            promisedFarm: [{ farm_id }],
            promisedLocation: [{ location_id }],
            promisedField: [{ location_id }],
          }, {
            cropManagementPlan: { ...mocks.fakeCropManagementPlan(), needs_transplant: false },
          }),
        ));
        const managementPlanIds = promisedManagement.map(([{ management_plan_id }]) => management_plan_id);
        const plantingManagementPlans = await knex('planting_management_plan').whereIn('management_plan_id', managementPlanIds);
        const managementPlans = plantingManagementPlans.map(({ planting_management_plan_id }) => ({ planting_management_plan_id }));
        const data = {
          ...mocks.fakeTask({
            soil_amendment_task: { ...fakeTaskData.soil_amendment_task() },
            task_type_id: task_type_id,
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

      test('should create a task (i.e soilamendment) and patch a product', async (done) => {
        const { user_id, farm_id, location_id, management_plan_id, task_type_id } = await userFarmTaskGenerator(true);
        const promisedManagement = await Promise.all([...Array(3)].map(async () =>
          mocks.crop_management_planFactory({
            promisedFarm: [{ farm_id }],
            promisedLocation: [{ location_id }],
            promisedField: [{ location_id }],

          }, {
            cropManagementPlan: { ...mocks.fakeCropManagementPlan(), needs_transplant: false },
          }),
        ));
        const managementPlanIds = promisedManagement.map(([{ management_plan_id }]) => management_plan_id);
        const plantingManagementPlans = await knex('planting_management_plan').whereIn('management_plan_id', managementPlanIds);
        const managementPlans = plantingManagementPlans.map(({ planting_management_plan_id }) => ({ planting_management_plan_id }));
        const soilAmendmentProduct = mocks.fakeProduct();
        soilAmendmentProduct.name = 'soilProduct';
        const data = {
          ...mocks.fakeTask({
            soil_amendment_task: { ...fakeTaskData.soil_amendment_task(), product: soilAmendmentProduct },
            task_type_id: task_type_id,
            owner_user_id: user_id,
            wage_at_moment: 50,
          }),
          locations: [{ location_id }],
          managementPlans,
        };

        postTaskRequest({ user_id, farm_id }, 'soil_amendment_task', data, async (err, res) => {
          expect(res.status).toBe(201);
          const { task_id } = res.body;
          const { product_id } = res.body.soil_amendment_task;
          const createdTask = await knex('task').where({ task_id }).first();
          expect(createdTask).toBeDefined();
          const isTaskRelatedToLocation = await knex('location_tasks').where({ task_id }).first();
          expect(isTaskRelatedToLocation.location_id).toBe(location_id);
          expect(isTaskRelatedToLocation.task_id).toBe(task_id);
          expect(createdTask.wage_at_moment).toBe(50);
          const isTaskRelatedToManagementPlans = await knex('management_tasks').where({ task_id });
          expect(isTaskRelatedToManagementPlans.length).toBe(3);
          const specificProduct = await knex('product').where({ product_id }).first();
          expect(specificProduct.name).toBe('soilProduct');
          done();
        });
      });

      test('should create a task (i.e soilamendment) and create a product', async (done) => {
        const { user_id, farm_id, location_id, management_plan_id, task_type_id } = await userFarmTaskGenerator(true);
        const promisedManagement = await Promise.all([...Array(3)].map(async () =>
          mocks.crop_management_planFactory({
            promisedFarm: [{ farm_id }],
            promisedLocation: [{ location_id }],
            promisedField: [{ location_id }],

          }, {
            cropManagementPlan: { ...mocks.fakeCropManagementPlan(), needs_transplant: false },
          }),
        ));
        const managementPlanIds = promisedManagement.map(([{ management_plan_id }]) => management_plan_id);
        const plantingManagementPlans = await knex('planting_management_plan').whereIn('management_plan_id', managementPlanIds);
        const managementPlans = plantingManagementPlans.map(({ planting_management_plan_id }) => ({ planting_management_plan_id }));
        const soilAmendmentProduct = mocks.fakeProduct();
        soilAmendmentProduct.name = 'soilProduct2';
        soilAmendmentProduct.farm_id = farm_id;
        const data = {
          ...mocks.fakeTask({
            soil_amendment_task: {
              ...fakeTaskData.soil_amendment_task(),
              product: soilAmendmentProduct,
              product_id: null,
            },
            task_type_id: task_type_id,
            owner_user_id: user_id,
            wage_at_moment: 50,
          }),
          locations: [{ location_id }],
          managementPlans,
        };

        postTaskRequest({ user_id, farm_id }, 'soil_amendment_task', data, async (err, res) => {
          expect(res.status).toBe(201);
          const { task_id } = res.body;
          const { product_id } = res.body.soil_amendment_task;
          const createdTask = await knex('task').where({ task_id }).first();
          expect(createdTask).toBeDefined();
          const isTaskRelatedToLocation = await knex('location_tasks').where({ task_id }).first();
          expect(isTaskRelatedToLocation.location_id).toBe(location_id);
          expect(isTaskRelatedToLocation.task_id).toBe(task_id);
          expect(createdTask.wage_at_moment).toBe(50);
          const isTaskRelatedToManagementPlans = await knex('management_tasks').where({ task_id });
          expect(isTaskRelatedToManagementPlans.length).toBe(3);
          const specificProduct = await knex('product').where({ product_id }).first();
          expect(specificProduct.name).toBe('soilProduct2');
          done();
        });
      });


      test('should fail to create a task were a worker is trying to assign someone else', async (done) => {
        const { user_id, farm_id, location_id, management_plan_id, task_type_id } = await userFarmTaskGenerator(true);
        const [{ user_id: worker_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(3));
        const [{ user_id: another_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(2));
        const data = {
          ...mocks.fakeTask({
            soil_amendment_task: { ...fakeTaskData.soil_amendment_task() },
            task_type_id: task_type_id,
            owner_user_id: worker_id,
            assignee_user_id: another_id,
          }),
          locations: [{ location_id }],
          managementPlans: [{ management_plan_id }],
        };

        postTaskRequest({ user_id: worker_id, farm_id }, 'soil_amendment_task', data, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('should fail to create a task were a worker is trying to modify wage for himself ', async (done) => {
        const { user_id, farm_id, location_id, management_plan_id, task_type_id } = await userFarmTaskGenerator(true);
        const [{ user_id: worker_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(3));
        const data = {
          ...mocks.fakeTask({
            soil_amendment_task: { ...fakeTaskData.soil_amendment_task() },
            task_type_id: task_type_id,
            owner_user_id: worker_id,
            assignee_user_id: worker_id,
            wage_at_moment: 3512222,
          }),
          locations: [{ location_id }],
          managementPlans: [{ management_plan_id }],
        };

        postTaskRequest({ user_id: worker_id, farm_id }, 'soil_amendment_task', data, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });
    });
  })

  describe('Patch tasks completion tests', () => {

    let product;
    let productData;
    beforeEach(async () => {
      [{ product_id: product }] = await mocks.productFactory({}, mocks.fakeProduct({ supplier: 'mock' }));
      productData = mocks.fakeProduct({ supplier: 'test' });
    });

    const fakeTaskData = {
      soil_amendment_task: () => mocks.fakeSoilAmendmentTask({ product_id: product, product: productData }),
      pest_control_task: () => mocks.fakePestControlTask({ product_id: product, product: productData }),
      irrigation_task: () => mocks.fakeIrrigationTask(),
      scouting_task: () => mocks.fakeScoutingTask(),
      soil_task: () => mocks.fakeSoilTask(),
      field_work_task: () => mocks.fakeFieldWorkTask(),
      harvest_task: () => mocks.fakeHarvestTask(),
      plant_task: () => mocks.fakePlantTask(),
    };

    const completed_time = faker.date.future();
    const completed_date = completed_time.toISOString().split('T')[0];
    const duration = 15;
    const happiness = 5;
    const notes = faker.lorem.sentence();

    const fakeCompletionData = {
      completed_time: completed_time,
      duration: duration,
      happiness: happiness,
      completion_notes: notes,
    };

    test('should return 403 if non-assignee tries to complete task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: another_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(1));
      const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      assignTaskRequest({ user_id, farm_id }, { assignee_user_id: user_id }, task_id, async (err, res) => {
      });
      completeTaskRequest({ user_id: another_id, farm_id }, {
        ...fakeCompletionData,
        soil_amendment_task: fakeTaskData.soil_amendment_task(),
      }, task_id, 'soil_amendment_task', async (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

    test('should be able to complete a soil amendment task', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      const fakeTask = mocks.fakeTask({
        task_type_id: task_type_id,
        owner_user_id: user_id,
        assignee_user_id: user_id,
      });
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedTaskType: [{ task_type_id }],
      }, fakeTask);
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      await mocks.soil_amendment_taskFactory({ promisedTask: [{ task_id }] });

      const new_soil_amendment_task = fakeTaskData.soil_amendment_task();

      completeTaskRequest({ user_id, farm_id }, {
        ...fakeCompletionData,
        soil_amendment_task: { task_id: task_id, ...new_soil_amendment_task },
      }, task_id, 'soil_amendment_task', async (err, res) => {
        expect(res.status).toBe(200);
        const completed_task = await knex('task').where({ task_id }).first();
        expect(completed_task.completed_time.toString()).toBe(completed_time.toString());
        expect(completed_task.duration).toBe(duration);
        expect(completed_task.happiness).toBe(happiness);
        expect(completed_task.completion_notes).toBe(notes);
        const patched_soil_amendment_task = await knex('soil_amendment_task').where({ task_id }).first();
        expect(patched_soil_amendment_task.product_quantity).toBe(new_soil_amendment_task.product_quantity);
        expect(patched_soil_amendment_task.purpose).toBe(new_soil_amendment_task.purpose);
        done();
      });
    });

    test('should be able to complete a pest control task', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      const fakeTask = mocks.fakeTask({
        task_type_id: task_type_id,
        owner_user_id: user_id,
        assignee_user_id: user_id,
      });
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedTaskType: [{ task_type_id }],
      }, fakeTask);
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      await mocks.pest_control_taskFactory({ promisedTask: [{ task_id }] });

      const new_pest_control_task = fakeTaskData.pest_control_task();

      completeTaskRequest({ user_id, farm_id }, {
        ...fakeCompletionData,
        pest_control_task: { task_id: task_id, ...new_pest_control_task },
      }, task_id, 'pest_control_task', async (err, res) => {
        expect(res.status).toBe(200);
        const completed_task = await knex('task').where({ task_id }).first();
        expect(completed_task.completed_time.toString()).toBe(completed_time.toString());
        expect(completed_task.duration).toBe(duration);
        expect(completed_task.happiness).toBe(happiness);
        expect(completed_task.completion_notes).toBe(notes);
        const patched_pest_control_task = await knex('pest_control_task').where({ task_id }).first();
        expect(patched_pest_control_task.product_quantity).toBe(new_pest_control_task.product_quantity);
        expect(patched_pest_control_task.pest_target).toBe(new_pest_control_task.pest_target);
        expect(patched_pest_control_task.control_method).toBe(new_pest_control_task.control_method);
        done();
      });
    });

    test('should be able to complete a harvest task', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      const fakeTask = mocks.fakeTask({
        task_type_id: task_type_id,
        owner_user_id: user_id,
        assignee_user_id: user_id,
      })
      const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }], promisedTaskType: [{ task_type_id }] }, fakeTask);
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      await mocks.harvest_taskFactory({ promisedTask: [{ task_id }] });
      const harvest_uses = [];
      const promisedHarvestUseTypes = await Promise.all([...Array(3)].map(async () =>
        mocks.harvest_use_typeFactory({
          promisedFarm: [{ farm_id }],
        })
      ));
      const harvest_types = promisedHarvestUseTypes.reduce((a, b) => a.concat({ harvest_use_type_id: b[0].harvest_use_type_id }), []);

      let actual_quantity = 0;
      harvest_types.forEach(({ harvest_use_type_id }) => {
        let harvest_use = mocks.fakeHarvestUse({
          task_id: task_id,
          harvest_use_type_id,
        });
        harvest_uses.push(harvest_use);
        actual_quantity += harvest_use.quantity;
      });
      completeTaskRequest({ user_id, farm_id }, { task: { ...fakeCompletionData, harvest_task: { task_id, actual_quantity } }, harvest_uses: harvest_uses }, task_id, 'harvest_task', async (err, res) => {
        expect(res.status).toBe(200);
        const completed_task = await knex('task').where({ task_id }).first();
        expect(completed_task.completed_time.toString()).toBe(completed_time.toString());
        expect(completed_task.duration).toBe(duration);
        expect(completed_task.happiness).toBe(happiness);
        expect(completed_task.completion_notes).toBe(notes);
        const new_harvest_uses = await knex('harvest_use').where({ task_id });
        expect(new_harvest_uses.length).toBe(harvest_uses.length);
        const patched_harvest_task = await knex('harvest_task').where({ task_id }).first();
        expect(patched_harvest_task.actual_quantity).toBe(actual_quantity);
        let harvest_uses_quantity = 0;
        new_harvest_uses.forEach(({ quantity }) => harvest_uses_quantity += quantity);
        expect(harvest_uses_quantity).toBe(actual_quantity);
        done();
      });
    });

    //TODO: complete plant task test
    xtest('should be able to complete a plant task', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

      const fakeTask = mocks.fakeTask({
        task_type_id: task_type_id,
        owner_user_id: user_id,
        assignee_user_id: user_id,
      });
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedTaskType: [{ task_type_id }],
      }, fakeTask);
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      await mocks.plant_taskFactory({ promisedTask: [{ task_id }] });

      const new_plant_task = fakeTaskData.plant_task();

      completeTaskRequest({ user_id, farm_id }, {
        ...fakeCompletionData,
        plant_task: { task_id: task_id, ...new_plant_task },
      }, task_id, 'plant_task', async (err, res) => {
        expect(res.status).toBe(200);
        const completed_task = await knex('task').where({ task_id }).first();
        expect(completed_task.completed_time.toString()).toBe(completed_time.toString());
        expect(completed_task.duration).toBe(duration);
        expect(completed_task.happiness).toBe(happiness);
        expect(completed_task.completion_notes).toBe(notes);
        const patched_plant_task = await knex('plant_task').where({ task_id }).first();
        expect(patched_plant_task.space_depth_cm).toBe(new_plant_task.space_depth_cm);
        expect(patched_plant_task.space_length_cm).toBe(new_plant_task.space_length_cm);
        expect(patched_plant_task.space_width_cm).toBe(new_plant_task.space_width_cm);
        done();
      });
    });
    test('should complete a task (i.e soilamendment) with multiple management plans', async (done) => {
      const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
      const [{ location_id }] = await mocks.fieldFactory({ promisedFarm: [{ farm_id }] });

      const promisedManagement = await Promise.all([...Array(3)].map(async () =>
        mocks.planting_management_planFactory({
          promisedFarm: [{ farm_id }],
          promisedField: [{ location_id }],
          promisedManagementPlan: mocks.management_planFactory({ promisedFarm: [{ farm_id }] }, {
            ...mocks.fakeManagementPlan,
            start_date: null,
          }),
        }, { start_date: null }),
      ));
      const managementPlans = promisedManagement.map(([{ planting_management_plan_id }]) => ({ planting_management_plan_id }));
      const fakeTask = mocks.fakeTask({
        task_type_id: task_type_id,
        owner_user_id: user_id,
        assignee_user_id: user_id,
      });
      const [{ task_id }] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
        promisedTaskType: [{ task_type_id }],
      }, fakeTask);
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      await mocks.soil_amendment_taskFactory({ promisedTask: [{ task_id }] });

      await mocks.management_tasksFactory({
        promisedTask: [{ task_id: task_id }],
        promisedPlantingManagementPlan: [managementPlans[0]],
      });
      await mocks.management_tasksFactory({
        promisedTask: [{ task_id: task_id }],
        promisedPlantingManagementPlan: [managementPlans[1]],
      });
      await mocks.management_tasksFactory({
        promisedTask: [{ task_id: task_id }],
        promisedPlantingManagementPlan: [managementPlans[2]],
      });

      const new_soil_amendment_task = fakeTaskData.soil_amendment_task();

      completeTaskRequest({ user_id, farm_id }, {
        ...fakeCompletionData,
        soil_amendment_task: { task_id: task_id, ...new_soil_amendment_task },
      }, task_id, 'soil_amendment_task', async (err, res) => {
        expect(res.status).toBe(200);
        const completed_task = await knex('task').where({ task_id }).first();
        expect(completed_task.completed_time.toString()).toBe(completed_time.toString());
        expect(completed_task.duration).toBe(duration);
        expect(completed_task.happiness).toBe(happiness);
        expect(completed_task.completion_notes).toBe(notes);
        const patched_soil_amendment_task = await knex('soil_amendment_task').where({ task_id }).first();
        expect(patched_soil_amendment_task.product_quantity).toBe(new_soil_amendment_task.product_quantity);
        expect(patched_soil_amendment_task.purpose).toBe(new_soil_amendment_task.purpose);
        const management_plan_1 = await knex('management_plan').where({ management_plan_id: promisedManagement[0][0].management_plan_id }).first();
        const management_plan_2 = await knex('management_plan').where({ management_plan_id: promisedManagement[1][0].management_plan_id }).first();
        const management_plan_3 = await knex('management_plan').where({ management_plan_id: promisedManagement[2][0].management_plan_id }).first();
        expect(management_plan_1.start_date.toISOString().split('T')[0]).toBe(completed_date);
        expect(management_plan_2.start_date.toISOString().split('T')[0]).toBe(completed_date);
        expect(management_plan_3.start_date.toISOString().split('T')[0]).toBe(completed_date);
        done();
      });
    });
  });

  describe('PATCH abandon task tests', () => {
    const CROP_FAILURE = 'CROP_FAILURE';
    const OTHER = 'OTHER';
    const sampleOtherReason = 'sample reason';
    const sampleNote = 'This is a sample note';
    const abandonTaskBody = {
      abandonment_reason: CROP_FAILURE,
      other_abandonment_reason: null,
      abandonment_notes: sampleNote,
    };
    const abandonTaskBodyOther = {
      abandonment_reason: OTHER,
      other_abandonment_reason: sampleOtherReason,
      abandonment_notes: sampleNote,
    };

    beforeEach(async () => {
      [{ product_id: product }] = await mocks.productFactory({}, mocks.fakeProduct({ supplier: 'mock' }));
      productData = mocks.fakeProduct({ supplier: 'test' });
    });

    test('An unassigned task should not abandoned with a rating', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      const abandonTaskBodyWithRating = {
        ...abandonTaskBody,
        happiness: faker.random.number({ min: 1, max: 5 }),
      };
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBodyWithRating, task.task_id, async (err, res) => {
        expect(res.status).toBe(406);
        done();
      });
    });

    test('An unassigned task should not abandoned with a duration', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      const abandonTaskBodyWithDuration = {
        ...abandonTaskBody,
        duration: faker.random.number(1000),
      };
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBodyWithDuration, task.task_id, async (err, res) => {
        expect(res.status).toBe(406);
        done();
      });
    });

    test('Owner should be able to abandon a task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
      }, mocks.fakeTask({ due_date: date, assignee_user_id: user_id }));
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.abandoned_time).toBeDefined();
        expect(updated_task.abandonment_reason).toBe(CROP_FAILURE);
        expect(updated_task.other_abandonment_reason).toBe(null);
        expect(updated_task.abandonment_notes).toBe(sampleNote);
        done();
      });
    });

    test('Manager should be able to abandon a task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.abandoned_time).toBeDefined();
        expect(updated_task.abandonment_reason).toBe(CROP_FAILURE);
        expect(updated_task.other_abandonment_reason).toBe(null);
        expect(updated_task.abandonment_notes).toBe(sampleNote);
        done();
      });
    });

    test('EO should be able to abandon a task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory({ promisedUser: [{ user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.abandoned_time).toBeDefined();
        expect(updated_task.abandonment_reason).toBe(CROP_FAILURE);
        expect(updated_task.other_abandonment_reason).toBe(null);
        expect(updated_task.abandonment_notes).toBe(sampleNote);
        done();
      });
    });

    test('Admin should be able to abandon a task they do not own', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(3));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory({ promisedUser: [{ user_id: other_user_id }] }, mocks.fakeTask({ due_date: date }));
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.abandoned_time).toBeDefined();
        expect(updated_task.abandonment_reason).toBe(CROP_FAILURE);
        expect(updated_task.other_abandonment_reason).toBe(null);
        expect(updated_task.abandonment_notes).toBe(sampleNote);
        done();
      });
    });

    test('Admin should be able to abandon a task they are not assigned to', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(3));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory({
        promisedUser: [{ user_id: other_user_id }],
      }, mocks.fakeTask({ due_date: date, assignee_user_id: other_user_id }));
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.abandoned_time).toBeDefined();
        expect(updated_task.abandonment_reason).toBe(CROP_FAILURE);
        expect(updated_task.other_abandonment_reason).toBe(null);
        expect(updated_task.abandonment_notes).toBe(sampleNote);
        done();
      });
    });

    test('Worker should be able to abandon a task they own', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory({
        promisedUser: [{ user_id }],
      }, mocks.fakeTask({ due_date: date }));
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.abandoned_time).toBeDefined();
        expect(updated_task.abandonment_reason).toBe(CROP_FAILURE);
        expect(updated_task.other_abandonment_reason).toBe(null);
        expect(updated_task.abandonment_notes).toBe(sampleNote);
        done();
      });
    });

    test('Worker should be able to abandon a task they are assigned to', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(1));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory({
        promisedUser: [{ user_id: other_user_id }],
      }, mocks.fakeTask({ due_date: date, assignee_user_id: user_id }));
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task.task_id);
        expect(updated_task.abandoned_time).toBeDefined();
        expect(updated_task.abandonment_reason).toBe(CROP_FAILURE);
        expect(updated_task.other_abandonment_reason).toBe(null);
        expect(updated_task.abandonment_notes).toBe(sampleNote);
        done();
      });
    });

    test('Worker should not be able to abandon a task they neither own or are assigned', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      const [{ user_id: other_user_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] }, fakeUserFarm(1));
      const date = faker.date.future().toISOString().split('T')[0];
      const [task] = await mocks.taskFactory({
        promisedUser: [{ user_id: other_user_id }],
      }, mocks.fakeTask({ due_date: date, assignee_user_id: other_user_id }));
      const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
      abandonTaskRequest({ user_id, farm_id }, abandonTaskBody, task.task_id, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });
  });
});
