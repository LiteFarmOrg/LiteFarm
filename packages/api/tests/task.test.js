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

  function assignTaskRequest({user_id, farm_id}, {assignee_user_id, is_admin}, task_id, callback) {
    chai.request(server).patch(`/task/assign/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .set('assignee_user_id', assignee_user_id)
      .set('is_admin', is_admin)
      .end(callback);
  }

  function assignAllTasksOnDateRequest({user_id, farm_id}, {date, assignee_user_id, is_admin}, callback) {
    chai.request(server).patch(`/task/assign_all_tasks_on_date`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .set('date', date)
      .set('assignee_user_id', assignee_user_id)
      .set('is_admin', is_admin)
      .end(callback);
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }


  afterAll(async (done) => {
    await tableCleanup('tasks');
    await knex.destroy();
    done();
  });

  describe('PATCH Assginee tests', () => {
    test('Owners should be able to assign person to task', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ task_id }] = await mocks.taskFactory({ promisedUser: [{ user_id }] });
      const [{ location_id }] = await mocks.fieldFactory({promisedFarm: [{ farm_id }]});
      await mocks.location_tasksFactory({promisedTask: [{ task_id }] , promisedField: [{ location_id }]});
      assignTaskRequest({ user_id, farm_id }, { assignee_user_id: user_id, is_admin: true }, task_id, async (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });
});