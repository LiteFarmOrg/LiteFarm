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
import moment from 'moment';
import bcrypt from 'bcryptjs';
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
import userModel from '../src/models/userModel.js';
import passwordModel from '../src/models/passwordModel.js';
import userFarmModel from '../src/models/userFarmModel.js';
import showedSpotlightModel from '../src/models/showedSpotlightModel.js';

describe('User Tests', () => {
  let token;
  let owner;
  let farm;
  let ownerFarm;

  beforeAll(() => {
    token = global.token;
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  function postUserRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }) {
    return chai
      .request(server)
      .post('/user')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function postPseudoUserRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }) {
    return chai
      .request(server)
      .post('/user/pseudo')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function getRequest({
    user_id = owner.user_id,
    farm_id = farm.farm_id,
    params_user_id = undefined,
  }) {
    return chai
      .request(server)
      .get(`/user/${params_user_id ? params_user_id : user_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  function putRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }) {
    return chai
      .request(server)
      .put(`/user/${user_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data);
  }

  function validate(expected, res, status, received = undefined) {
    expect(res.status).toBe(status);
    received = received ? received : res.body[0] || res.body;
    expect(Object.keys(received).length).toBeGreaterThan(0);
    for (const key of Object.keys(received)) {
      if (
        (expected[key] && typeof expected[key] === 'string') ||
        typeof expected[key] === 'number'
      ) {
        expect([key, received[key]]).toStrictEqual([key, expected[key]]);
      }
    }
  }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  function fakeUser(user_id) {
    const user = mocks.fakeUser();
    return { ...user, user_id };
  }

  beforeAll(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [ownerFarm] = await mocks.userFarmFactory(
      {
        promisedUser: [owner],
        promisedFarm: [farm],
      },
      fakeUserFarm(1),
    );
  });

  describe('Get && put user', () => {
    describe('Get user', () => {
      describe('Get user authorization tests', () => {
        let worker;
        let workerFarm;
        let manager;
        let managerFarm;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeAll(async () => {
          [worker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory(
            {
              promisedUser: [worker],
              promisedFarm: [farm],
            },
            fakeUserFarm(3),
          );
          [manager] = await mocks.usersFactory();
          [managerFarm] = await mocks.userFarmFactory(
            {
              promisedUser: [manager],
              promisedFarm: [farm],
            },
            fakeUserFarm(2),
          );

          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
            {
              promisedUser: [unAuthorizedUser],
              promisedFarm: [farmunAuthorizedUser],
            },
            fakeUserFarm(1),
          );
        });

        test('Workers should get user by user id', async () => {
          const res = await getRequest({ user_id: worker.user_id });
          expect(res.status).toBe(200);
          validate({ ...worker, ...workerFarm }, res, 200);
        });

        test('Owner should get user by user id', async () => {
          const res = await getRequest({ user_id: owner.user_id });
          validate({ ...owner, ...ownerFarm }, res, 200);
          expect(res.body.gender).toBe(owner.gender);
          expect(res.body.birth_year).toBe(owner.birth_year);
        });

        test('Manager should get user by user id', async () => {
          const res = await getRequest({ user_id: manager.user_id });
          validate({ ...manager, ...managerFarm }, res, 200);
        });

        test('Should get status 403 if an unauthorizedUser tries to get user by user_id', async () => {
          const res = await getRequest({
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser,
            params_user_id: owner.user_id,
          });

          expect(res.status).toBe(403);
        });
      });
    });

    describe('Put user', () => {
      describe('Put user authorization tests', () => {
        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;
        let owner;
        let ownerFarm;
        let sampleData;

        beforeAll(async () => {
          [owner] = await mocks.usersFactory();
          [ownerFarm] = await mocks.userFarmFactory(
            {
              promisedUser: [owner],
              promisedFarm: [farm],
            },
            fakeUserFarm(1),
          );
          [worker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory(
            {
              promisedUser: [worker],
              promisedFarm: [farm],
            },
            fakeUserFarm(3),
          );
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory(
            {
              promisedUser: [manager],
              promisedFarm: [farm],
            },
            fakeUserFarm(2),
          );

          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
            {
              promisedUser: [unAuthorizedUser],
              promisedFarm: [farmunAuthorizedUser],
            },
            fakeUserFarm(1),
          );
        });

        test('should edit and the area_used field by owner', async () => {
          sampleData = fakeUser(owner.user_id);
          sampleData.email = owner.email;
          const res = await putRequest(sampleData, { user_id: owner.user_id });
          const resUser = await userModel.query().findById(owner.user_id);
          validate(sampleData, res, 200, resUser);
        });

        test('should edit and the area_used field by manager', async () => {
          sampleData = fakeUser(manager.user_id);
          sampleData.email = owner.email;
          sampleData.email = manager.email;
          const res = await putRequest(sampleData, { user_id: manager.user_id });
          const resUser = await userModel.query().findById(manager.user_id);
          validate(sampleData, res, 200, resUser);
        });

        test('should edit and the area_used field by worker', async () => {
          sampleData = fakeUser(worker.user_id);
          sampleData.email = worker.email;
          const res = await putRequest(sampleData, { user_id: worker.user_id });
          const resUser = await userModel.query().findById(worker.user_id);
          validate(sampleData, res, 200, resUser);
        });

        test('should return 403 when unauthorized user tries to edit another user', async () => {
          sampleData = fakeUser(manager.user_id);

          const res = await putRequest(sampleData, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser,
          });

          expect(res.status).toBe(403);
        });

        test('should return 403 when a owner tries to edit another user', async () => {
          sampleData = fakeUser(manager.user_id);
          const res = await putRequest(sampleData, { user_id: owner.user_id });
          expect(res.status).toBe(403);
        });
      });
    });
  });

  describe('Post user', () => {
    describe('Post user authorization', () => {
      let worker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;
      let sampleData;

      beforeEach(async () => {
        const fakeuser = mocks.fakeUser();
        const fakeuserfarm = mocks.fakeUserFarm();
        const user_id = fakeuser.user_id;
        sampleData = {
          email: `${user_id}@pseudo.com`.toLowerCase(),
          first_name: fakeuser.first_name,
          last_name: fakeuser.last_name,
          farm_id: farm.farm_id,
          user_id: user_id,
          wage: { type: 'hourly', amount: 3 },
        };
      });

      beforeAll(async () => {
        [worker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [worker],
            promisedFarm: [farm],
          },
          fakeUserFarm(3),
        );
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [manager],
            promisedFarm: [farm],
          },
          fakeUserFarm(2),
        );

        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
          {
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser],
          },
          fakeUserFarm(1),
        );
      });

      test('Should post then get a valid user and user spotlight', async () => {
        const fakeUser = mocks.fakeUser();
        // don't need user_id or phone number when signing up user
        delete fakeUser.user_id;
        delete fakeUser.phone_number;

        const password = 'test password';
        fakeUser.password = password;
        const res = await postUserRequest(fakeUser, { user_id: manager.user_id });
        const user_id = res.body.user.user_id;
        const userSecret = await passwordModel
          .query()
          .select('*')
          .where('user_id', user_id)
          .first();
        const resUser = await userModel.query().select('*').where('user_id', user_id).first();
        validate(fakeUser, res, 201, resUser);
        expect(userSecret.password_hash).not.toBe(password);
        // check that the saved hash corresponds to the pw provided
        const isMatch = await bcrypt.compare(password, userSecret.password_hash);
        expect(isMatch).toBe(true);
        const showedSpotlight = await showedSpotlightModel.query().findById(user_id);
        expect(showedSpotlight.user_id).toBe(user_id);
      });

      xtest('Owner should post a pseudo user', async () => {
        const res = await postPseudoUserRequest(sampleData, {});
        const resUser = await userModel.query().where({ email: sampleData.email }).first();
        const resUserFarm = await userFarmModel
          .query()
          .where({ user_id: resUser.user_id, farm_id: farm.farm_id })
          .first();
        validate({ ...sampleData, role_id: 4 }, res, 201, { ...resUser, ...resUserFarm });
      });

      xtest('Manager should post a pseudo user', async () => {
        const res = await postPseudoUserRequest(sampleData, { user_id: manager.user_id });
        const resUser = await userModel.query().where({ email: sampleData.email }).first();
        const resUserFarm = await userFarmModel
          .query()
          .where({ user_id: resUser.user_id, farm_id: farm.farm_id })
          .first();
        validate({ ...sampleData, role_id: 4 }, res, 201, { ...resUser, ...resUserFarm });
      });

      test('Should return status 403 when a worker tries to post a pseudo user', async () => {
        const res = await postPseudoUserRequest(sampleData, { user_id: worker.user_id });
        expect(res.status).toBe(403);
      });

      test('Should return status 403 when a worker tries to post a pseudo user', async () => {
        const res = await postPseudoUserRequest(sampleData, { user_id: unAuthorizedUser.user_id });
        expect(res.status).toBe(403);
      });

      test('Circumvent authorization by modify farm_id', async () => {
        const res = await postPseudoUserRequest(sampleData, {
          user_id: unAuthorizedUser.user_id,
          farm_id: unAuthorizedUser.farm_id,
        });

        expect(res.status).toBe(403);
      });

      test('Should return 400 if user_id already exists', async () => {
        sampleData.user_id = unAuthorizedUser.user_id;
        const res = await postPseudoUserRequest(sampleData, {});
        expect(res.status).toBe(400);
      });
    });
  });
});
