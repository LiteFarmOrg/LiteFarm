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

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const jsonwebtoken = require('jsonwebtoken');
const { sign } = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
let faker = require('faker');
const server = require('./../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment');
let { usersFactory, farmFactory, userFarmFactory } = require('./mock.factories');
const mocks = require('./mock.factories');
const { createToken, tokenType } = require('../src/util/jwt');
const checkGoogleJwt = require('../src/middleware/acl/checkGoogleJwt.js');
const sendEmailTemplate = require('../src/templates/sendEmailTemplate');
const userFarmModel = require('../src/models/userFarmModel');
const userModel = require('../src/models/userModel');
const emailMiddleware = require('../src/templates/sendEmailTemplate');
jest.mock('jsdom');
jest.mock('../src/util/jwt');
jest.mock('../src/templates/sendEmailTemplate');
jest.mock('../src/middleware/acl/checkGoogleJwt.js');

describe('JWT Tests', () => {
  let newUser;
  let accessToken;

  async function deleteFarmRequest(data, user, callback) {
    const token = await getAuthorizationHeader(data);
    chai.request(server).delete(`/farm/${data.farm_id}`)
      .set('farm_id', data.farm_id)
      .set('user_id', user)
      .set('Authorization', token)
      .end(callback);
  }

  function deleteFarmRequestWithoutToken(data, user, callback) {
    chai.request(server).delete(`/farm/${data.farm_id}`)
      .set('farm_id', data.farm_id)
      .set('user_id', user)
      .set('Authorization', 'token')
      .end(callback);
  }

  function postResetPasswordRequest(email, callback) {
    chai.request(server).post(`/password_reset/send_email`)
      .send({ email })
      .end(callback);
  }

  function getValidateRequest(resetPasswordToken, user_id, callback) {
    chai.request(server).get(`/password_reset/validate`)
      .set('user_id', user_id)
      .set('Authorization', `Bearer ${resetPasswordToken}`)
      .end(callback);
  }

  function putPasswordRequest(resetPasswordToken, user, callback) {
    chai.request(server).put(`/password_reset`)
      .set('user_id', user.user_id)
      .set('Authorization', `Bearer ${resetPasswordToken}`)
      .send(user)
      .end(callback);
  }

  async function insertPasswordRow({ password = 'password', reset_token_version, created_at = new Date(), user_id }) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const rows = await knex('password').insert({
      password_hash,
      reset_token_version,
      created_at,
      user_id,
    }).returning('*');
    return rows[0];
  }

  async function getAuthorizationHeader(user_id) {
    const token = await createToken('access', { user_id });
    return 'Bearer ' + token;
  }

  function validate(expected, res, status, received = undefined) {
    expect(res.status).toBe(status);
    received = received ? received : (res.body[0] || res.body);
    expect(Object.keys(received).length).toBeGreaterThan(0);
    for (const key of Object.keys(received)) {
      if (expected[key] && typeof expected[key] === 'string' || typeof expected[key] === 'number') {
        expect([key, received[key]]).toStrictEqual([key, expected[key]]);
      }
    }
  }

  afterAll((done) => {
    server.close(() => {
      done();
    });
  });


  beforeEach(async () => {
    let { createToken } = require('../src/util/jwt');
    createToken.mockImplementation(async (type, user) => {
      let localAccessToken = sign(user, tokenType[type], {
        expiresIn: '7d',
        algorithm: 'HS256',
      });
      accessToken = localAccessToken;
      return localAccessToken;
    });
    [newUser] = await usersFactory();
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Access jwt test', () => {
    test('should succeed on deleting a farm with valid token', async (done) => {
      const [farm] = await farmFactory();
      await userFarmFactory({ promisedUser: [newUser], promisedFarm: [farm] }, { role_id: 1, status: 'Active' });
      deleteFarmRequest(farm, newUser.user_id, async (err, res) => {
        expect(res.status).toBe(200);
        const [farmQuery] = await knex.select().from('farm').where({ farm_id: farm.farm_id });
        expect(farmQuery.deleted).toBe(true);
        done();
      });
    });

    test('should fail on deleting a farm without valid token', async (done) => {
      const [farm] = await farmFactory();
      await userFarmFactory({ promisedUser: [newUser], promisedFarm: [farm] }, { role_id: 1, status: 'Active' });
      deleteFarmRequestWithoutToken(farm, newUser.user_id, async (err, res) => {
        expect(res.status).toBe(401);
        const [farmQuery] = await knex.select().from('farm').where({ farm_id: farm.farm_id });
        expect(farmQuery.deleted).toBe(false);
        done();
      });
    });
  });

  describe('Reset password jwt test', () => {
    let resetPasswordToken;

    beforeEach(async (done) => {
      let { createToken } = require('../src/util/jwt');
      createToken.mockImplementation(async (type, user) => {
        if (user.reset_token_version === undefined) {
          user.reset_token_version = 4;
        }
        let localResetPasswordToken = sign(user, tokenType[type], {
          expiresIn: '1d',
          algorithm: 'HS256',
        });
        resetPasswordToken = localResetPasswordToken;
        return localResetPasswordToken;
      });

      resetPasswordToken = undefined;
      knex('password').delete();
      done();
    });
    test('Validate a valid token', async (done) => {
      const resetPasswordToken = await createToken('passwordReset', newUser);
      const user = jsonwebtoken.verify(resetPasswordToken, process.env.JWT_RESET_SECRET);
      expect(user.user_id).toEqual(newUser.user_id);
      done();
    });

    test('Should send a valid token through email when reset_token_version === 0', async (done) => {
      const oldRow = await insertPasswordRow({ reset_token_version: 0, user_id: newUser.user_id });
      postResetPasswordRequest(newUser.email, async (err, res) => {
        expect(res.status).toBe(200);
        const user = jsonwebtoken.verify(resetPasswordToken, process.env.JWT_RESET_SECRET);
        expect(user.reset_token_version).toBe(0);
        const { reset_token_version, created_at } = await knex('password').where({ user_id: newUser.user_id }).first();
        expect(reset_token_version).toBe(1);
        expect(created_at.getTime()).toBeGreaterThanOrEqual(oldRow.created_at.getTime());
        getValidateRequest(resetPasswordToken, newUser.user_id, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.isValid).toBe(true);
          done();
        });
      });
    });

    test('Should send a valid token through email when reset_token_version === 1', async (done) => {
      const oldRow = await insertPasswordRow({ reset_token_version: 1, user_id: newUser.user_id });
      postResetPasswordRequest(newUser.email, async (err, res) => {
        expect(res.status).toBe(200);
        const user = jsonwebtoken.verify(resetPasswordToken, process.env.JWT_RESET_SECRET);
        expect(user.reset_token_version).toBe(1);
        const { reset_token_version, created_at } = await knex('password').where({ user_id: newUser.user_id }).first();
        expect(reset_token_version).toBe(2);
        expect(created_at.getTime()).toBe(oldRow.created_at.getTime());
        getValidateRequest(resetPasswordToken, newUser.user_id, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.isValid).toBe(true);
          done();
        });
      });
    });

    test('Should send a valid token through email when reset_token_version === 2', async (done) => {
      const oldRow = await insertPasswordRow({ reset_token_version: 2, user_id: newUser.user_id });
      postResetPasswordRequest(newUser.email, async (err, res) => {
        expect(res.status).toBe(200);
        const user = jsonwebtoken.verify(resetPasswordToken, process.env.JWT_RESET_SECRET);
        expect(user.reset_token_version).toBe(2);
        const { reset_token_version, created_at } = await knex('password').where({ user_id: newUser.user_id }).first();
        expect(reset_token_version).toBe(3);
        expect(created_at.getTime()).toBe(oldRow.created_at.getTime());
        getValidateRequest(resetPasswordToken, newUser.user_id, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.isValid).toBe(true);
          done();
        });
      });
    });

    test('Should reject when reset_token_version === 3', async (done) => {
      const oldRow = await insertPasswordRow({ reset_token_version: 3, user_id: newUser.user_id });
      const tokenPayload = {
        user_id: newUser.user_id,
        email: newUser.email,
        reset_token_version: 0,
        created_at: new Date().getTime(),
      };
      let localResetPasswordToken = await createToken('passwordReset', tokenPayload);
      resetPasswordToken = undefined;
      postResetPasswordRequest(newUser.email, async (err, res) => {
        expect(res.status).toBe(400);
        expect(resetPasswordToken).toBe(undefined);
        const { reset_token_version, created_at } = await knex('password').where({ user_id: newUser.user_id }).first();
        expect(reset_token_version).toBe(oldRow.reset_token_version);
        expect(created_at.getTime()).toBe(oldRow.created_at.getTime());
        getValidateRequest(localResetPasswordToken, newUser.user_id, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.isValid).toBe(true);
          done();
        });
      });
    });

    test('Should reset reset_token_version and created_at when created_at is one day before current date', async (done) => {
      const oneDay = 1000 * 3600 * 24;
      const oldDate = new Date(new Date().getTime() - oneDay - 1);
      const oldRow = await insertPasswordRow({ reset_token_version: 1, user_id: newUser.user_id, created_at: oldDate });
      postResetPasswordRequest(newUser.email, async (err, res) => {
        expect(res.status).toBe(200);
        const user = jsonwebtoken.verify(resetPasswordToken, process.env.JWT_RESET_SECRET);
        expect(user.reset_token_version).toBe(0);
        const { reset_token_version, created_at } = await knex('password').where({ user_id: newUser.user_id }).first();
        expect(reset_token_version).toBe(1);
        expect(created_at.getTime()).toBeGreaterThan(oldRow.created_at.getTime());
        getValidateRequest(resetPasswordToken, newUser.user_id, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.isValid).toBe(true);
          done();
        });
      });
    });


    test('Should reset reset_token_version and created_at when reset token is used', async (done) => {
      const newPassword = 'newPassword';
      const oldRow = await insertPasswordRow({ reset_token_version: 2, user_id: newUser.user_id });
      postResetPasswordRequest(newUser.email, async (err, res) => {
        const verified = jsonwebtoken.verify(resetPasswordToken, process.env.JWT_RESET_SECRET);
        expect(verified.user_id).toBe(newUser.user_id);
        putPasswordRequest(resetPasswordToken, {
          password: newPassword,
          user_id: newUser.user_id,
        }, async (err, res) => {
          expect(res.status).toBe(200);
          const {
            reset_token_version,
            created_at,
            password_hash,
          } = await knex('password').where({ user_id: newUser.user_id }).first();
          const isMatch = await bcrypt.compare(newPassword, password_hash);
          expect(isMatch).toBeTruthy();
          expect(reset_token_version).toBe(0);
          expect(created_at.getTime()).toBeGreaterThan(oldRow.created_at.getTime());
          putPasswordRequest(resetPasswordToken, {
            password: newPassword,
            user_id: newUser.user_id,
          }, async (err, res) => {
            expect(res.status).toBe(401);
            done();
          });
        });
      });
    });

    test('Should reject when an invited user tries to get reset password token', async (done) => {
      const [invitedUser] = await mocks.usersFactory({...mocks.fakeUser(), status_id: 2});
      postResetPasswordRequest(invitedUser.email, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('Should reject when a pseudo user tries to get reset password token', async (done) => {
      const [pseudoUser] = await mocks.usersFactory({...mocks.fakeUser(), status_id: 1, email: `${faker.random.uuid()}@pseudo.com`});
      postResetPasswordRequest(pseudoUser.email, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('Should reject when an auth0 legacy user tries to get reset password token', async (done) => {
      const [invitedUser] = await mocks.usersFactory({...mocks.fakeUser(), status_id: 3});
      postResetPasswordRequest(newUser.email, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

  });

  describe('Accept invitation jwt test', () => {
    let invitationToken;
    let reqBody;
    let googleUser;

    function postAcceptInvitationWithPasswordRequest(invitationToken, callback) {
      chai.request(server).post(`/user/accept_invitation`)
        .set('Authorization', `Bearer ${invitationToken}`)
        .send(reqBody)
        .end(callback);
    }

    function putAcceptInvitationWithGoogleAccountRequest(invitationToken, callback) {
      delete reqBody.password;
      chai.request(server).put(`/user/accept_invitation`)
        .send({ ...reqBody, invite_token: invitationToken })
        .end(callback);
    }

    function getRequest({ email = user.email }, callback) {
      chai.request(server)
        .get(`/login/user/${email}`)
        .set('email', email)
        .end(callback);
    }

    function fakeGoogleTokenContent() {
      const user = mocks.fakeUser();
      return {
        sub: faker.random.number({min:100000000000000000000, max: 199999999999999999999}).toString(),
        email: faker.internet.email(user.first_name, user.last_name, 'gmail.com').toLowerCase(),
      };
    }

    function fakeReqBody() {
      const { first_name, last_name, gender, birth_year, language_preference } = mocks.fakeUser();
      return {
        first_name, last_name, gender, birth_year, language_preference,
        password: faker.internet.password(),
      };
    }

    beforeEach(async (done) => {
      let { createToken } = require('../src/util/jwt');
      createToken.mockImplementation(async (type, user) => {
        let localInvitationToken = sign(user, tokenType[type], {
          expiresIn: '7d',
          algorithm: 'HS256',
        });
        invitationToken = localInvitationToken;
        return localInvitationToken;
      });
      googleUser = fakeGoogleTokenContent();
      checkGoogleJwt.mockImplementation(async (req, res, next) => {
        req.user = {...googleUser};
        return next();
      });
      emailMiddleware.sendEmailTemplate.sendEmail.mockClear();
      invitationToken = undefined;
      reqBody = fakeReqBody();
      done();
    });
    test('Validate a valid token', async (done) => {
      const resetPasswordToken = await createToken('invite', newUser);
      const user = jsonwebtoken.verify(resetPasswordToken, tokenType.invite);
      expect(user.user_id).toEqual(newUser.user_id);
      done();
    });

    test('Should create password when user status is invited', async (done) => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 2 });
      const [userFarm] = await mocks.userFarmFactory({ promisedUser: [user] }, {
        ...mocks.fakeUserFarm(),
        status: 'Invited',
      });
      const {user_id, farm_id} = userFarm;
      getRequest(user, async (err, res) => {
        const verified = jsonwebtoken.verify(invitationToken, tokenType.invite);
        expect(verified.user_id).toBe(user.user_id);
        postAcceptInvitationWithPasswordRequest(invitationToken, async (err, res) => {
          const [resUser] = await userModel.query().where({ user_id: user.user_id });
          validate({ ...user, ...reqBody, status_id: 1 }, res, 201, resUser);
          const {
            password_hash,
          } = await knex('password').where({ user_id: user.user_id }).first();
          const isMatch = await bcrypt.compare(reqBody.password, password_hash);
          expect(isMatch).toBeTruthy();
          const [resUserFarm] = await knex('userFarm').where({user_id, farm_id});
          expect(resUserFarm.status).toBe('Active');
          postAcceptInvitationWithPasswordRequest(invitationToken, async (err, res) => {
            expect(res.status).toBe(401);
            done();
          });
        });
      });
    });

    test('User should accept invitation when birth year is undefined', async (done) => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 2 });
      const [userFarm] = await mocks.userFarmFactory({ promisedUser: [user] }, {
        ...mocks.fakeUserFarm(),
        status: 'Invited',
      });
      getRequest(user, async (err, res) => {
        delete reqBody.birth_year;
        postAcceptInvitationWithPasswordRequest(invitationToken, async (err, res) => {
          const [resUser] = await userModel.query().where({ user_id: user.user_id });
          validate({ ...user, ...reqBody, status_id: 1 }, res, 201, resUser);
          done();
        });
      });
    });

    test('Should return 401 when userFarm status Inactive', async (done) => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 2 });
      const [userFarm] = await mocks.userFarmFactory({ promisedUser: [user] }, {
        ...mocks.fakeUserFarm(),
        status: 'Invited',
      });
      getRequest(user, async (err, res) => {
        const {farm_id, user_id} = userFarm;
        delete reqBody.birth_year;
        await userFarmModel.query().findById([user_id,farm_id]).patch({status: 'Inactive'});
        postAcceptInvitationWithPasswordRequest(invitationToken, async (err, res) => {
          expect(res.status).toBe(401);
          done();
        });
      });
    });

    test('Should return 401 when userFarm status Active', async (done) => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 2 });
      const [userFarm] = await mocks.userFarmFactory({ promisedUser: [user] }, {
        ...mocks.fakeUserFarm(),
        status: 'Invited',
      });
      getRequest(user, async (err, res) => {
        const {farm_id, user_id} = userFarm;
        delete reqBody.birth_year;
        await userFarmModel.query().findById([user_id,farm_id]).patch({status: 'Active'});
        postAcceptInvitationWithPasswordRequest(invitationToken, async (err, res) => {
          expect(res.status).toBe(401);
          done();
        });
      });
    });

    test('Should modify user_id when login with google and user status is invited', async (done) => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 2, email: googleUser.email});
      const [userFarm] = await mocks.userFarmFactory({ promisedUser: [user] }, {
        ...mocks.fakeUserFarm(),
        status: 'Invited',
      });
      const [userFarm1] = await mocks.userFarmFactory({ promisedUser: [user] }, {
        ...mocks.fakeUserFarm(),
        status: 'Invited',
      });
      const {user_id, farm_id} = userFarm;
      getRequest(user, async (err, res) => {
        const verified = await jsonwebtoken.verify(invitationToken, tokenType.invite);
        expect(verified.user_id).toBe(user.user_id);
        const getUserFarmStatus = (farm_id) => verified.farm_id === farm_id ? 'Active': 'Invited';
        putAcceptInvitationWithGoogleAccountRequest(invitationToken, async (err, res) => {
          const oldUserRows = await userModel.query().where({ user_id: user.user_id });
          expect(oldUserRows.length).toBe(0);
          const [resUser] = await userModel.query().where({ user_id: googleUser.sub });
          validate({ ...user, ...reqBody, email: googleUser.email, user_id: googleUser.user_id, status_id: 1 }, res, 200, resUser);
          const oldUserFarms = await knex('userFarm').where({user_id});
          expect(oldUserFarms.length).toBe(0);
          const [resUserFarm] = await knex('userFarm').where({user_id: googleUser.sub, farm_id});
          expect(resUserFarm.status).toBe(getUserFarmStatus(farm_id));
          const [resUserFarm1] = await knex('userFarm').where({user_id: googleUser.sub, farm_id: userFarm1.farm_id});
          expect(resUserFarm1.status).toBe(getUserFarmStatus(userFarm1.farm_id));
          const emailTokens = await knex('emailToken').where({user_id: googleUser.sub});
          expect(emailTokens.length).toBe(2);
          const oldEmailTokens = await knex('emailToken').where({user_id});
          expect(oldEmailTokens.length).toBe(0);
          expect(resUserFarm1.status).toBe(getUserFarmStatus(userFarm1.farm_id));
          putAcceptInvitationWithGoogleAccountRequest(invitationToken, async (err, res) => {
            expect(res.status).toBe(401);
            done();
          });
        });
      });
    });

    test('Should modify user_id when pseudo user accept invitation with google account', async (done) => {
      const [user] = await mocks.usersFactory({ ...mocks.fakeUser(), status_id: 2, email: googleUser.email});
      const [userFarm] = await mocks.userFarmFactory({ promisedUser: [user] }, {
        ...mocks.fakeUserFarm(),
        status: 'Invited',
      });
      const [userFarm1] = await mocks.userFarmFactory({ promisedUser: [user] }, {
        ...mocks.fakeUserFarm(),
        status: 'Invited',
      });
      const [shift] = await mocks.shiftFactory({promisedUserFarm: [userFarm]});
      const [shift1] = await mocks.shiftFactory({promisedUserFarm: [userFarm1]});
      await knex('shift').where({created_by_user_id: user.user_id}).update({created_by_user_id: newUser.user_id});
      const {user_id, farm_id} = userFarm1;
      getRequest(user, async (err, res) => {
        const verified = await jsonwebtoken.verify(invitationToken, tokenType.invite);
        expect(verified.user_id).toBe(user.user_id);
        const userFarm1= await userFarmModel.query().where({user_id, farm_id}).first();
        expect(userFarm1.status).toBe('Invited');
        putAcceptInvitationWithGoogleAccountRequest(invitationToken, async (err, res) => {
          const oldUserRows = await userModel.query().where({ user_id: user.user_id });
          expect(oldUserRows.length).toBe(0);
          const [resUser] = await userModel.query().where({ user_id: googleUser.sub });
          validate({ ...user, ...reqBody, email: googleUser.email, user_id: googleUser.user_id, status_id: 1 }, res, 200, resUser);
          const oldShift = await knex('shift').where({user_id});
          expect(oldShift.length).toBe(0);
          const resShifts = await knex('shift').where({user_id: googleUser.sub});
          expect(resShifts.length).toBe(2);

          putAcceptInvitationWithGoogleAccountRequest(invitationToken, async (err, res) => {
            expect(res.status).toBe(401);
            done();
          });
        });
      });
    });

  });
});


