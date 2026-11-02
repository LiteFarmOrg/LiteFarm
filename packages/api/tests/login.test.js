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
chai.use(chaiHttp);
import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
jest.mock('../src/jobs/station_sync/mapping.js');
jest.mock('../src/middleware/acl/checkGoogleJwt.js');
jest.mock('../src/templates/sendEmailTemplate.js', () => ({
  sendEmail: jest.fn(),
  emails: { INVITATION: { path: 'invitation_to_farm_email' } },
}));
import mocks from './mock.factories.js';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import * as emailMiddleware from '../src/templates/sendEmailTemplate.js';
import checkGoogleJwt from '../src/middleware/acl/checkGoogleJwt.js';

describe('Sign Up Tests', () => {
  let _token;
  let _crop;
  let farm;
  let newOwner;

  beforeAll(() => {
    _token = global.token;
  });

  // FUNCTIONS

  async function getRequest({ email = newOwner.email }, callback) {
    return chai
      .request(server)
      .get(`/login/user/${email}`)
      .set('email', email)
      .then((res) => callback(null, res))
      .catch((_err) => callback(_err));
  }

  beforeEach(async () => {
    [farm] = await mocks.farmFactory();
    [newOwner] = await mocks.usersFactory();
    [_crop] = await mocks.cropFactory({ promisedFarm: [farm] });
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
      await getRequest({ email: user.email }, (_err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.exists).toBe(true);
        expect(res.body.sso).toBe(false);
        expect(res.body.first_name).toBe(name);
        expect(res.body.language).toBe('en'); // Default language
      });
    });

    test('Get status of user from email address should return 200 and SSO true', async () => {
      const [user] = await mocks.usersFactory(mocks.fakeSSOUser());
      const name = user.first_name;
      await getRequest({ email: user.email }, (_err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.exists).toBe(true);
        expect(res.body.sso).toBe(true);
        expect(res.body.first_name).toBe(name);
      });
    });

    test('Get status of user from email address should return 200 and sso false because user does not exist', async () => {
      const user = {
        first_name: 'Bobby',
        last_name: 'McBobson',
        email: 'bobby@gmail.com',
        user_id: '1234466',
        phone_number: '899-903-2343',
      };

      await getRequest({ email: user.email }, (_err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.exists).toBe(false);
        expect(res.body.sso).toBe(false);
      });
    });
  });

  describe('Exists', () => {
    test('should send missing invitation to user if checks existance and has no farms', async () => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 2 });
      const [_userFarm] = await mocks.userFarmFactory(
        { promisedUser: [user] },
        { status: 'Invited' },
      );
      await getRequest({ email: user.email }, (_err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.exists).toBe(false);
        expect(res.body.invited).toBe(true);
        expect(emailMiddleware.sendEmail).toHaveBeenCalled();
      });
    });

    test('should send missing invitation(s) to user if checks existance and has no farms but many invites', async () => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 2 });
      const [_userFarm1] = await mocks.userFarmFactory(
        { promisedUser: [user] },
        { status: 'Invited' },
      );
      const [_userFarm2] = await mocks.userFarmFactory(
        { promisedUser: [user] },
        { status: 'Invited' },
      );
      const [_userFarm3] = await mocks.userFarmFactory(
        { promisedUser: [user] },
        { status: 'Invited' },
      );
      const [_userFarm4] = await mocks.userFarmFactory(
        { promisedUser: [user] },
        { status: 'Invited' },
      );
      await getRequest({ email: user.email }, (_err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.exists).toBe(false);
        expect(res.body.invited).toBe(true);
        expect(emailMiddleware.sendEmail).toHaveBeenCalledTimes(4);
      });
    });

    test('should send a password reset email to user if he was legacy ', async () => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 3 });
      const [_userFarm1] = await mocks.userFarmFactory({ promisedUser: [user] });
      await getRequest({ email: user.email }, (_err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.exists).toBe(false);
        expect(res.body.expired).toBe(true);
        expect(emailMiddleware.sendEmail).toHaveBeenCalledTimes(1);
      });
    });

    test('should resend a password reset email to user if he was legacy ', async () => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 3 });
      const [_userFarm1] = await mocks.userFarmFactory({ promisedUser: [user] });
      await getRequest({ email: user.email }, async (_err, _res) => {
        await getRequest({ email: user.email }, (_err2, res2) => {
          expect(res2.status).toBe(200);
          expect(res2.body.exists).toBe(false);
          expect(res2.body.expired).toBe(true);
          expect(emailMiddleware.sendEmail).toHaveBeenCalledTimes(2);
        });
      });
    });

    test('should reject when a pseudo user tries to login', async () => {
      const [user] = await mocks.usersFactory({
        ...mocks.fakeUser(),
        status_id: 1,
        email: `${faker.datatype.uuid()}@pseudo.com`,
      });
      const [_userFarm1] = await mocks.userFarmFactory({ promisedUser: [user] });
      await getRequest({ email: user.email }, (_err, res) => {
        expect(res.status).toBe(400);
        expect(emailMiddleware.sendEmail).toHaveBeenCalledTimes(0);
      });
    });

    test('should fail at the 4th request of a user who had a pending invitation', async () => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 2 });
      const [userFarm] = await mocks.userFarmFactory(
        { promisedUser: [user] },
        { status: 'Invited' },
      );
      const { user_id, farm_id } = userFarm;
      await getRequest({ email: user.email }, async () => {
        const [emailTokenRow] = await knex('emailToken').where({ user_id, farm_id });
        expect(emailTokenRow.times_sent).toBe(1);
        await getRequest({ email: user.email }, async () => {
          const [emailTokenRow] = await knex('emailToken').where({ user_id, farm_id });
          expect(emailTokenRow.times_sent).toBe(2);
          await getRequest({ email: user.email }, async () => {
            const [emailTokenRow] = await knex('emailToken').where({ user_id, farm_id });
            expect(emailTokenRow.times_sent).toBe(3);
            await getRequest({ email: user.email }, async (_err, res) => {
              expect(res.status).toBe(200);
              const [emailTokenRow] = await knex('emailToken').where({ user_id, farm_id });
              expect(emailTokenRow.times_sent).toBe(3);
              expect(res.body.exists).toBe(false);
              expect(res.body.invited).toBe(true);
              expect(emailMiddleware.sendEmail).toHaveBeenCalledTimes(3);
            });
          });
        });
      });
    });
  });

  describe('Login with password', () => {
    const password = 'Password1!';

    async function createUserWithPassword(consent) {
      const [user] = await mocks.usersFactory(mocks.fakeUser(), consent);
      const passwordHash = await bcrypt.hash(password, 10);
      await knex('password').insert({ user_id: user.user_id, password_hash: passwordHash });
      return user;
    }

    function postLoginRequest(email) {
      return chai
        .request(server)
        .post('/login')
        .send({
          user: { email, password },
          screenSize: { screen_width: 1440, screen_height: 900 },
        });
    }

    test('Should return the user consent', async () => {
      const user = await createUserWithPassword(mocks.fakeUserConsent({ consent_version: '9.0' }));

      const res = await postLoginRequest(user.email);
      expect(res.status).toBe(200);
      expect(res.body.user.consent).toEqual({
        user_id: user.user_id,
        consent_version: '9.0',
        consented_at: null,
      });
    });

    test('Should return null consent when the user has not consented', async () => {
      // User without consent
      const user = await createUserWithPassword(null);

      const res = await postLoginRequest(user.email);
      expect(res.status).toBe(200);
      expect(res.body.user.consent).toBeNull();
    });
  });

  describe('Login with Google', () => {
    let googleUser;

    beforeEach(() => {
      // Mocks the payload of a verified Google ID token
      googleUser = {
        sub: faker.datatype.number({ min: 100000000, max: 999999999 }).toString(),
        email: faker.internet.email().toLowerCase(),
        given_name: faker.name.firstName(),
        family_name: faker.name.lastName(),
      };
      checkGoogleJwt.mockImplementation(async (req, _res, next) => {
        req.auth = { ...googleUser };
        return next();
      });
    });

    function postGoogleLoginRequest() {
      return chai.request(server).post('/login/google').send({ language_preference: 'en' });
    }

    test('Should return the consent of an existing Google user', async () => {
      await mocks.usersFactory(
        { ...mocks.fakeUser(), user_id: googleUser.sub, email: googleUser.email },
        mocks.fakeUserConsent({ consent_version: '9.0' }),
      );

      const res = await postGoogleLoginRequest();
      expect(res.status).toBe(201);
      expect(res.body.user.consent).toEqual({
        user_id: googleUser.sub,
        consent_version: '9.0',
        consented_at: null,
      });
    });

    test('Should return null consent for a new Google user', async () => {
      const res = await postGoogleLoginRequest();
      expect(res.status).toBe(201);
      expect(res.body.isSignUp).toBe(true);
      expect(res.body.user.consent).toBeNull();
    });
  });
});
