import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import server from './../src/server.js';
import knex from '../src/util/knex.js';
// import emailMiddleware from '../src/templates/sendEmailTemplate.js';
jest.mock('jsdom');
jest.mock('axios');
import axios from 'axios';

jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
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
  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  async function postCreateUser({ user_id, farm_id }, data, callback) {
    return chai
      .request(server)
      .post('/user/invite')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .set('Content-Type', 'application/json')
      .send(data)
      .then((res) => callback(null, res))
      .catch((_err) => callback(_err));
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

  beforeEach(async () => {
    axios.mockClear();
  });

  describe('Authorization', () => {
    let user;
    let farm;
    beforeEach(async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { role_id: 1, status: 'Active' },
      );
      user = user_id;
      farm = farm_id;
      axios.mockResolvedValueOnce(() => {
        return new Promise((resolve) =>
          resolve({ data: fakeUser(farm_id, 2), status: 201, user_id: '123914249120' }),
        );
      });
    });

    test('Owner should be able to invite a user', async () => {
      await postCreateUser({ user_id: user, farm_id: farm }, fakeUser(farm, 2), (_err, res) => {
        expect(res.status).toBe(201);
      });
    });

    test('Manager should be able to invite a user', async () => {
      const [{ user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id: farm }] },
        { role_id: 2, status: 'Active' },
      );
      await postCreateUser({ user_id, farm_id: farm }, fakeUser(farm, 2), (_err, res) => {
        expect(res.status).toBe(201);
      });
    });

    test('Worker should fail to invite a user', async () => {
      const [{ user_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id: farm }] },
        { role_id: 3, status: 'Active' },
      );
      await postCreateUser({ user_id, farm_id: farm }, fakeUser(farm, 3), (_err, res) => {
        expect(res.status).toBe(403);
      });
    });
  });
});
