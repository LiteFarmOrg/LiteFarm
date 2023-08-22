import chai from 'chai';
import chaiHttp from 'chai-http';
import moment from 'moment';
chai.use(chaiHttp);
import server from './../src/server.js';
import knex from '../src/util/knex.ts';
// import emailMiddleware from '../src/templates/sendEmailTemplate.js';
jest.mock('jsdom');
jest.mock('axios');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
jest.mock('../src/templates/sendEmailTemplate.js', () => ({
  sendEmail: jest.fn(),
  emails: { INVITATION: { path: 'invitation_to_farm_email' } },
}));
import mocks from './mock.factories.js';
import { tableCleanup } from './testEnvironment.js';

describe('Invite user', () => {
  let axios;

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  function postCreateUser({ user_id, farm_id }, data, callback) {
    chai
      .request(server)
      .post('/user/invite')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .set('Content-Type', 'application/json')
      .send(data)
      .end(callback);
  }

  function fakeUser(farm_id, role_id) {
    const { email, first_name, last_name } = mocks.fakeUser();
    return {
      email,
      user_id: 'auth0|1291912991',
      first_name,
      last_name,
      farm_id,
      role_id,
      wage: {
        type: 'hourly',
        amount: 2000,
      },
    };
  }

  describe('Authorization', () => {
    let user;
    let farm;
    beforeEach(async () => {
      let [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { role_id: 1, status: 'Active' },
      );
      user = user_id;
      farm = farm_id;
      axios = require('axios');
      axios.mockImplementation(() => {
        return new Promise((resolve) =>
          resolve({ data: fakeUser(farm_id, 2), status: 201, user_id: '123914249120' }),
        );
      });
    });

    test('Owner should be able to invite a user', async (done) => {
      postCreateUser({ user_id: user, farm_id: farm }, fakeUser(farm, 2), (err, res) => {
        expect(res.status).toBe(201);
        done();
      });
    });

    test('Manager should be able to invite a user', async (done) => {
      let [{ user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id: farm }] },
        { role_id: 2, status: 'Active' },
      );
      postCreateUser({ user_id, farm_id: farm }, fakeUser(farm, 2), (err, res) => {
        expect(res.status).toBe(201);
        done();
      });
    });

    test('Worker should fail to invite a user', async (done) => {
      let [{ user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id: farm }] },
        { role_id: 3, status: 'Active' },
      );
      postCreateUser({ user_id, farm_id: farm }, fakeUser(farm, 3), (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });
  });
});
