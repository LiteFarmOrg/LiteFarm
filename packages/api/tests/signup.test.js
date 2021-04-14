/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (signup.test.js) is part of LiteFarm.
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
const chai_assert = chai.assert;    // Using Assert style
const chai_expect = chai.expect;    // Using Expect style
const chai_should = chai.should();  // Using Should style
const server = require('./../src/server');
const dummySignUp = require('./dummySignUp')
const knex = require('../src/util/knex');
jest.mock('jsdom')
jest.mock('../src/middleware/acl/isSelf')


xdescribe('These are tests for auth0 signup and user creation', () => {
  let testSignUpToken = null;
  let oauth_user_id = null;
  let userID = null;

  afterAll(async () => {
    let email = 'test1234_signup@usertest.com';
    await knex('users').where({ email }).delete();
    await knex.destroy();
    done();
  })


  beforeAll(async () => {
    middleware = require('../src/middleware/acl/isSelf');
    middleware.mockImplementation((req, res, next) => {
      return next()
    });
  })

  test('POST user to DB', (done) => {
    console.log(userID);
    chai.request(server).post('/user/')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer ' + testSignUpToken)
      .send({ ...dummySignUp.validUserAdd, user_id: userID })
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(201);
        done();
      });
  });

  test('GET user added from DB with userID gives 200', (done) => {
    chai.request(server).get('/user/' + userID)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer ' + testSignUpToken)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.body.first_name).to.equal(dummySignUp.validUserAdd.first_name)
        chai_expect(res.body.last_name).to.equal(dummySignUp.validUserAdd.last_name)
        chai_expect(res.body.email).to.equal(dummySignUp.validUserAdd.email)
        // chai_expect(res.body[0].user_id).to.equal(userID)
        chai_expect(res.body).to.not.deep.equal([]);
        chai_expect(res.status).to.equal(200);
        done();
      });
  });

  test('GET user added from DB with userID gives 200', (done) => {
    chai.request(server).get('/user/'  + userID)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer ' + testSignUpToken)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.body).to.deep.equal({ ...dummySignUp.validUserAdd, user_id: userID, "phone_number": null });
        chai_expect(res.status).to.equal(200);
        done();
      });
  });

});
