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
const { test } = require('../knexfile');


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
    chai.request(server).patch(`/task/assign/${farm_id}/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
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
      const [{ task_id }] = await mocks.taskFactory({ promisedFarm: [{ farm_id }] });

    });
  });
});