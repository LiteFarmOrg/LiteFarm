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
const jsonwebtoken = require('jsonwebtoken');
const { sign } = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
chai.use(chaiHttp);
const server = require('./../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment');
let { usersFactory, farmFactory, userFarmFactory } = require('./mock.factories');
const { createAccessTokenSync, createResetPasswordToken } = require('../src/util/jwt');
jest.mock('jsdom');
jest.mock('../src/util/jwt');

describe('JWT Tests', () => {
  let newUser;
  let accessToken;
  function deleteFarmRequest(data, user, callback) {
    chai.request(server).delete(`/farm/${data.farm_id}`)
      .set('farm_id', data.farm_id)
      .set('user_id', user)
      .set('Authorization', getAuthorizationHeader(data))
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

  function putPasswordRequet(resetPasswordToken, user, callback) {
    chai.request(server).put(`/password_reset`)
      .set('user_id', user.user_id)
      .set('Authorization', `Bearer ${resetPasswordToken}`)
      .send(user)
      .end(callback);
  }

  async function insertPasswordRow({ password = 'password', reset_token_version, created_at = new Date(), user_id }) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const rows = await knex('password').insert({ password_hash, reset_token_version, created_at, user_id }).returning('*');
    return rows[0];
  }

  function getAuthorizationHeader(user_id) {
    return 'Bearer ' + createAccessTokenSync({ user_id });
  }

  afterAll((done) => {
    server.close(() => {
      done();
    });
  });



  beforeEach(async () => {
    let { createAccessToken, createAccessTokenSync } = require('../src/util/jwt');
    createAccessToken.mockImplementation(async (user) => {
      let localAccessToken = sign(user, process.env.JWT_SECRET, {
        expiresIn: '7d',
        algorithm: 'HS256',
      });
      accessToken = localAccessToken;
      return localAccessToken;
    });

    createAccessTokenSync.mockImplementation( (user) => {
      let localAccessToken = sign(user, process.env.JWT_SECRET, {
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
      let { createResetPasswordToken } = require('../src/util/jwt');
      createResetPasswordToken.mockImplementation(async (user) => {
        if (user.reset_token_version === undefined) {
          user.reset_token_version = 4;
        }
        let localResetPasswordToken = sign(user, process.env.JWT_RESET_SECRET, {
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
      const resetPasswordToken = await createResetPasswordToken(newUser);
      const user = jsonwebtoken.verify(resetPasswordToken, process.env.JWT_RESET_SECRET);
      console.log(user);
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
        console.log(oldRow);
        expect(created_at.getTime()).toBeGreaterThan(oldRow.created_at.getTime());
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
      postResetPasswordRequest(newUser.email, async (err, res) => {
        expect(res.status).toBe(429);
        expect(resetPasswordToken).toBe(undefined);
        const { reset_token_version, created_at } = await knex('password').where({ user_id: newUser.user_id }).first();
        expect(reset_token_version).toBe(oldRow.reset_token_version);
        expect(created_at.getTime()).toBe(oldRow.created_at.getTime());
        getValidateRequest(resetPasswordToken, newUser.user_id, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.isValid).toBe(false);
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
        putPasswordRequet(resetPasswordToken, { password: newPassword, user_id: newUser.user_id }, async (err, res) => {
          console.log(res,resetPasswordToken);
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
          putPasswordRequet(resetPasswordToken, { password: newPassword, user_id: newUser.user_id }, async (err, res) => {
            expect(res.status).toBe(401);
            done();
          });
        });
      });
    });

  });
});


