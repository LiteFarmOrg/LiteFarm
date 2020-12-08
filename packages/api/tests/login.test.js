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
const moment = require('moment');
chai.use(chaiHttp);
const server = require('../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment');
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
jest.mock('../src/jobs/station_sync/mapping');
const mocks = require('./mock.factories');

describe('Sign Up Tests', () => {
  let middleware;
  let farm;
  let newOwner;

  beforeAll(() => {
    token = global.token;
  });

  afterAll((done) => { 
    server.close(() => {
	    done();
    });
  })

  // FUNCTIONS

  function getRequest({ email = newOwner.email }, callback) {
    chai.request(server)
      .get(`/login/user/${email}`)
      .set('email', email)
      .end(callback);
  }

  beforeEach(async () => {
    [ farm ] = await mocks.farmFactory();
    [ newOwner ] = await mocks.usersFactory();
    [ crop ] = await mocks.cropFactory({ promisedFarm: [ farm ] });

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next();
    });
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  // GET TESTS

  describe('Sign up tests', () => {
    test('Get status of user from email address should return 200 and SSO false', async (done) => {
	  const [user] = await mocks.usersFactory();
	  const name = user.first_name;
	  getRequest({ email: user.email}, (err, res) => {
	    expect(res.status).toBe(200);
		expect(res.body.exists).toBe(true);
		expect(res.body.sso).toBe(false);
		expect(res.body.user.first_name).toBe(name);
		done();
	  });
  });


    // xtest('Get status of user from email address should return 200 and SSO true', async (done) => {
    //   const [user] = await mocks.ssoUsersFactory();
    //   const name = user.first_name;

    //   getRequest({ email: user.email}, (err, res) => {
    //     expect(res.status).toBe(200);
    //     expect(res.body.exists).toBe(true);
    //     expect(res.body.sso).toBe(true);
    //     expect(res.body.user[0].first_name).toBe(name);
    //     done();
    //   });
    // });

    test('Get status of user from email address should return 200 and sso false because user does not exist', async (done) => {
      const user = {
        first_name: "Bobby",
        last_name: "McBobson",
        email: "bobby@gmail.com",
        user_id: "1234466",
        phone_number: "899-903-2343"
      };

      getRequest({ email: user.email }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.exists).toBe(false);
        expect(res.body.sso).toBe(false);
        done();
      });
    });
  });

});