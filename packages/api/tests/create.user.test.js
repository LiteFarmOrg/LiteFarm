const chai = require('chai');
const chaiHttp = require('chai-http');
const moment = require('moment');
chai.use(chaiHttp);
const server = require('./../src/server');
const knex = require('../src/util/knex');
jest.mock('jsdom');
jest.mock('axios');
jest.mock('../src/middleware/acl/checkJwt');
jest.mock('../src/templates/sendEmailTemplate');
const mocks = require('./mock.factories');
const { tableCleanup } = require('./testEnvironment');


describe('Create user', () => {
  let middleware;
  let email;
  let axios;
  beforeAll(() => {
    middleware = require('../src/middleware/acl/checkJwt');
    email = require('../src/templates/sendEmailTemplate');
    email.sendEmail.mockResolvedValue({});
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next()
    });
  })
  afterEach(async (done) => {
    await tableCleanup(knex);
    done();
  })

  afterAll(async (done) => {
    await knex.destroy();
    done();
  });

  function postCreateUser({ user_id, farm_id }, data, callback) {
    chai.request(server).post('/create_user')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .set('Content-Type', 'application/json')
      .send(data)
      .end(callback)
  }

  function fakeUser(farm_id, role_id) {
    const { email, first_name, last_name } = mocks.fakeUser();
    return {
      email,
      user_id: 'auth0|1291912991',
      user_metadata: {
        first_name,
        last_name,
      },
      farm_id,
      role_id,
      wage: {
        type: 'hourly',
        amount: 2000,
      },
      password: '123456',
      picture: 'http://image.com'
    }
  }

  describe('Authorization', () => {
    let user;
    let farm;
    beforeEach(async () => {
      let [{ user_id, farm_id }] = await mocks.userFarmFactory({}, { role_id: 1, status: 'Active' });
      user = user_id;
      farm = farm_id
      axios = require('axios');
      axios.mockImplementation(() => {
        return new Promise((resolve) =>
          resolve({ data: fakeUser(farm_id, 2), status: 201, user_id: '123914249120' })
        )
      });
    })

    test('Owner should be able to invite a user',async (done) => {
      postCreateUser({ user_id: user, farm_id: farm }, fakeUser(farm, 2), (err, res) => {
        expect(res.status).toBe(201);
        done();
      })
    })

    test('Manager should be able to invite a user',async (done) => {
      let [{ user_id }] = await mocks.userFarmFactory({promisedFarm: [{farm_id: farm}]}, { role_id: 2, status: 'Active' });
      postCreateUser({ user_id, farm_id: farm }, fakeUser(farm, 2), (err, res) => {
        expect(res.status).toBe(201);
        done();
      })
    })

    test('Worker should fail to invite a user',async (done) => {
      let [{ user_id }] = await mocks.userFarmFactory({promisedFarm: [{farm_id: farm}]}, { role_id: 3, status: 'Active' });
      postCreateUser({ user_id, farm_id: farm }, fakeUser(farm, 3), (err, res) => {
        expect(res.status).toBe(403);
        done();
      })
    })


  })
})
