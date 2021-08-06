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
  })

  function assignTaskRequest({ user_id, farm_id }, data, task_id, callback) {
    chai.request(server).patch(`/task/assign/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function postTaskRequest({user_id, farm_id}, type, data, callback) {
    chai.request(server).post(`/task/${type}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function getTasksRequest({user_id, farm_id}, callback) {
    chai.request(server).get(`/task/${farm_id}`)
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

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }


  async function userFarmTaskGenerator(linkPlan = true) {
    const userFarm = {...fakeUserFarm(1), wage: { type:'', amount: 30}};
    const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
    const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }]});
    const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }]});
    const [{ management_plan_id }] = linkPlan ? await mocks.management_planFactory({ promisedFarm: [{ farm_id }],
      promisedLocation: [{location_id}] }) : [{ management_plan_id: null}];
    return { user_id, farm_id, location_id, management_plan_id, task_type_id };
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
      const userFarm = {...fakeUserFarm(1), wage: { type:'', amount: 30}};
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
      const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }] });
      const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
      await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }] });
      assignTaskRequest({ user_id, farm_id }, { assignee_user_id: user_id }, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        const updated_task = await getTask(task_id);
        expect(updated_task.wage_at_moment).toBe(30);
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
      assignAllTasksOnDateRequest({ user_id, farm_id }, { assignee_user_id: user_id, date }, task_1_id, async (err, res) => {
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


  describe('POST Task' , () => {

    describe('creating types of tasks',  () => {
      let product;
      beforeEach(async () => {
         [{ product_id: product }] = await mocks.productFactory();
      });
      const fakeTaskData = {
        soil_amendment_task: () =>  mocks.fakeSoilAmendmentTask({ product_id: product }),
        pest_control_task: () => mocks.fakePestControlTask({ product_id: product }),
        irrigation_task: () => mocks.fakeIrrigationTask(),
        scouting_task: () => mocks.fakeScoutingTask(),
        soil_task: () => mocks.fakeSoilTask(),
        field_work_task: () => mocks.fakeFieldWorkTask(),
        harvest_task: () => mocks.fakeHarvestTask(),
        plant_task: () => mocks.fakePlantTask(),
      }

      Object.keys(fakeTaskData).map((type) => {
        test(`should successfully create a ${type} without an associated management plan`, async (done) => {
          const { user_id, farm_id, location_id, task_type_id } = await userFarmTaskGenerator(false);
          const data = {
            ...mocks.fakeTask({
              [type]: { ...fakeTaskData[type]() },
              type: task_type_id,
              owner_user_id: user_id,
              assignee_user_id: user_id,
            }),
            locations: [{ location_id } ],
            managementPlans: [],
          };

          postTaskRequest({ user_id, farm_id }, type, data, async (err, res) => {
            expect(res.status).toBe(200);
            const { task_id } = res.body;
            const createdTask = await knex('task').where({ task_id }).first();
            expect(createdTask).toBeDefined();
            expect(createdTask.wage_at_moment).toBe(30);
            const isTaskRelatedToLocation = await knex('location_tasks').where({ task_id }).first();
            expect(isTaskRelatedToLocation.location_id).toBe(location_id);
            expect(isTaskRelatedToLocation.task_id).toBe(task_id);
            const specificTask = await knex(type).where({ task_id });
            expect(specificTask.length).toBe(1);
            expect(specificTask[0].task_id).toBe(task_id)
            done();
          });
        });
      });

      Object.keys(fakeTaskData).map((type) => {
        test(`should successfully create a ${type} with a management plan`, async (done) => {
          const { user_id, farm_id, location_id, management_plan_id, task_type_id } = await userFarmTaskGenerator();
          const data = {
            ...mocks.fakeTask({
              [type]: { ...fakeTaskData[type]() },
              type: task_type_id,
              owner_user_id: user_id,
            }),
            locations: [{ location_id } ],
            managementPlans: [{ management_plan_id }],
          };

          postTaskRequest({ user_id, farm_id }, type, data, async (err, res) => {
            expect(res.status).toBe(200);
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
            expect(specificTask[0].task_id).toBe(task_id)
            done();
          });
        });
      });

      test('should create a task (i.e soilamendment)  with multiple management plans', async (done) => {
        const { user_id, farm_id, location_id, management_plan_id, task_type_id } = await userFarmTaskGenerator(true);
        const promisedManagement  = await Promise.all([...Array(3)].map(async () =>
          mocks.management_planFactory({ promisedFarm: [{ farm_id }],
            promisedLocation: [{location_id}] })
        ));
        const managementPlans = promisedManagement.reduce((a,b) => a.concat({ management_plan_id: b[0].management_plan_id }), []);
        const data = {
          ...mocks.fakeTask({
            soil_amendment_task: { ...fakeTaskData.soil_amendment_task() },
            type: task_type_id,
            owner_user_id: user_id,
          }),
          locations: [{ location_id } ],
          managementPlans,
        }

        postTaskRequest({ user_id, farm_id }, 'soil_amendment_task', data, async (err, res) => {
          expect(res.status).toBe(200);
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
    });

    describe('GET tasks', () => {

      test('should get all tasks for a farm ', async (done) => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
        const tasks = await Promise.all([...Array(10)].map(async () => {
          const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }]});
          const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }]});
          const [{ management_plan_id }] = await mocks.management_planFactory({ promisedFarm: [{ farm_id }], promisedLocation: [{location_id}] });
          const [{ task_id }] = await mocks.taskFactory({promisedUser: [{ user_id }], promisedTaskType: [{task_type_id}]});
          await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }]});
          await mocks.management_tasksFactory({ promisedTask: [{ task_id }], promisedManagementPlan: [{ management_plan_id }]});
        }));
        getTasksRequest({farm_id, user_id}, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(10);
          done();
        })
      })

      test('should get all tasks that are related to a farm, but not from different farms of that user', async (done) => {
        const [firstUserFarm] = await mocks.userFarmFactory({}, fakeUserFarm(1));
        const [secondUserFarmWithSameUser] = await mocks.userFarmFactory({ promisedUser: [{ user_id: firstUserFarm.user_id }]}, fakeUserFarm(1));
        await Promise.all([...Array(20)].map(async (_, i) => {
          const innerFarmId = i > 9 ? firstUserFarm.farm_id : secondUserFarmWithSameUser.farm_id;
          const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id: innerFarmId }]});
          const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id: innerFarmId }]});
          const [{ management_plan_id }] = await mocks.management_planFactory({ promisedFarm: [{ farm_id: innerFarmId }], promisedLocation: [{location_id}] });
          const [{ task_id }] = await mocks.taskFactory({promisedUser: [{ user_id: firstUserFarm.user_id }], promisedTaskType: [{task_type_id}]});
          await mocks.location_tasksFactory({ promisedTask: [{ task_id }], promisedField: [{ location_id }]});
          await mocks.management_tasksFactory({ promisedTask: [{ task_id }], promisedManagementPlan: [{ management_plan_id }]});
        }));
        getTasksRequest({farm_id: firstUserFarm.farm_id, user_id: firstUserFarm.user_id}, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(10);
          done();
        })
      });
    });
  })
});
