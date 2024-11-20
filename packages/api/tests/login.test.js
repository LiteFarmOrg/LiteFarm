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
chai.use(chaiHttp);
import server from '../src/server.js';
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
jest.mock('../src/jobs/station_sync/mapping.js');
jest.mock('../src/templates/sendEmailTemplate.js', () => ({
  sendEmail: jest.fn(),
  emails: { INVITATION: { path: 'invitation_to_farm_email' } },
}));
import mocks from './mock.factories.js';
import { faker } from '@faker-js/faker';
import * as emailMiddleware from '../src/templates/sendEmailTemplate.js';

describe('Sign Up Tests', () => {
  let token;
  let crop;
  let farm;
  let newOwner;

  beforeAll(() => {
    token = global.token;
  });

  // FUNCTIONS

  function getRequest({ email = newOwner.email }) {
    return chai.request(server).get(`/login/user/${email}`).set('email', email);
  }

  beforeEach(async () => {
    [farm] = await mocks.farmFactory();
    [newOwner] = await mocks.usersFactory();
    [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
    emailMiddleware.sendEmail.mockClear();
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  // GET TESTS

  describe('Sign up tests', () => {
    test('Get status of user from email address should return 200 and SSO false', async () => {
      const [user] = await mocks.usersFactory();
      const name = user.first_name;
      const res = await getRequest({ email: user.email });
      expect(res.status).toBe(200);
      expect(res.body.exists).toBe(true);
      expect(res.body.sso).toBe(false);
      expect(res.body.first_name).toBe(name);
      expect(res.body.language).toBe('en'); // Default language
    });

    test('Get status of user from email address should return 200 and SSO true', async () => {
      const [user] = await mocks.usersFactory(mocks.fakeSSOUser());
      const name = user.first_name;
      const res = await getRequest({ email: user.email });
      expect(res.status).toBe(200);
      expect(res.body.exists).toBe(true);
      expect(res.body.sso).toBe(true);
      expect(res.body.first_name).toBe(name);
    });

    test('Get status of user from email address should return 200 and sso false because user does not exist', async () => {
      const user = {
        first_name: 'Bobby',
        last_name: 'McBobson',
        email: 'bobby@gmail.com',
        user_id: '1234466',
        phone_number: '899-903-2343',
      };

      const res = await getRequest({ email: user.email });
      expect(res.status).toBe(200);
      expect(res.body.exists).toBe(false);
      expect(res.body.sso).toBe(false);
    });
  });

  describe('Exists', () => {
    test('should send missing invitation to user if checks existance and has no farms', async () => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 2 });
      const [userFarm] = await mocks.userFarmFactory(
        { promisedUser: [user] },
        { status: 'Invited' },
      );
      const res = await getRequest({ email: user.email });
      expect(res.status).toBe(200);
      expect(res.body.exists).toBe(false);
      expect(res.body.invited).toBe(true);
      expect(emailMiddleware.sendEmail).toHaveBeenCalled();
    });

    test('should send missing invitation(s) to user if checks existance and has no farms but many invites', async () => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 2 });
      const [userFarm1] = await mocks.userFarmFactory(
        { promisedUser: [user] },
        { status: 'Invited' },
      );
      const [userFarm2] = await mocks.userFarmFactory(
        { promisedUser: [user] },
        { status: 'Invited' },
      );
      const [userFarm3] = await mocks.userFarmFactory(
        { promisedUser: [user] },
        { status: 'Invited' },
      );
      const [userFarm4] = await mocks.userFarmFactory(
        { promisedUser: [user] },
        { status: 'Invited' },
      );
      const res = await getRequest({ email: user.email });
      expect(res.status).toBe(200);
      expect(res.body.exists).toBe(false);
      expect(res.body.invited).toBe(true);
      expect(emailMiddleware.sendEmail).toHaveBeenCalledTimes(4);
    });

    test('should send a password reset email to user if he was legacy ', async () => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 3 });
      const [userFarm1] = await mocks.userFarmFactory({ promisedUser: [user] });
      const res = await getRequest({ email: user.email });
      expect(res.status).toBe(200);
      expect(res.body.exists).toBe(false);
      expect(res.body.expired).toBe(true);
      expect(emailMiddleware.sendEmail).toHaveBeenCalledTimes(1);
    });

    test('should resend a password reset email to user if he was legacy ', async () => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 3 });
      const [userFarm1] = await mocks.userFarmFactory({ promisedUser: [user] });
      const res = await getRequest({ email: user.email });
      const res2 = await getRequest({ email: user.email });
      expect(res2.status).toBe(200);
      expect(res2.body.exists).toBe(false);
      expect(res2.body.expired).toBe(true);
      expect(emailMiddleware.sendEmail).toHaveBeenCalledTimes(2);
    });

    test('should reject when a pseudo user tries to login', async () => {
      const [user] = await mocks.usersFactory({
        ...mocks.fakeUser(),
        status_id: 1,
        email: `${faker.datatype.uuid()}@pseudo.com`,
      });
      const [userFarm1] = await mocks.userFarmFactory({ promisedUser: [user] });
      const res = await getRequest({ email: user.email });
      expect(res.status).toBe(400);
      expect(emailMiddleware.sendEmail).toHaveBeenCalledTimes(0);
    });

    test('should fail at the 4th request of a user who had a pending invitation', async () => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 2 });
      const [userFarm] = await mocks.userFarmFactory(
        { promisedUser: [user] },
        { status: 'Invited' },
      );
      const { user_id, farm_id } = userFarm;
      await getRequest({ email: user.email });
      const [emailTokenRow] = await knex('emailToken').where({ user_id, farm_id });
      expect(emailTokenRow.times_sent).toBe(1);

      {
        await getRequest({ email: user.email });
        const [emailTokenRow] = await knex('emailToken').where({ user_id, farm_id });
        expect(emailTokenRow.times_sent).toBe(2);

        {
          await getRequest({ email: user.email });
          const [emailTokenRow] = await knex('emailToken').where({ user_id, farm_id });
          expect(emailTokenRow.times_sent).toBe(3);

          {
            const res = await getRequest({ email: user.email });
            expect(res.status).toBe(200);
            const [emailTokenRow] = await knex('emailToken').where({ user_id, farm_id });
            expect(emailTokenRow.times_sent).toBe(3);
            expect(res.body.exists).toBe(false);
            expect(res.body.invited).toBe(true);
            expect(emailMiddleware.sendEmail).toHaveBeenCalledTimes(3);
          }
        }
      }
    });
  });
});
