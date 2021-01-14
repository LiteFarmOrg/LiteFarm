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
const moment = require('moment')
const bcrypt = require('bcryptjs');
chai.use(chaiHttp);
const server = require('./../src/server');
const { Model } = require('objection');
const knex = Model.knex();
const { tableCleanup } = require('./testEnvironment')
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks = require('./mock.factories');

const userModel = require('../src/models/userModel');
const passwordModel = require('../src/models/passwordModel');
const userFarmModel = require('../src/models/userFarmModel');

describe('User Tests', () => {
  let middleware;
  let owner;
  let farm;
  let ownerFarm;

  beforeAll(() => {
    token = global.token;
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  })

  function postUserRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).post('/user')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function postPseudoUserRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).post('/user/pseudo')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getRequest({ user_id = owner.user_id, farm_id = farm.farm_id, params_user_id = undefined }, callback) {
    chai.request(server).get(`/user/${params_user_id ? params_user_id : user_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function putRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).put(`/user/${user_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback)
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

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  function fakeUser(user_id) {
    const user = mocks.fakeUser();
    return ({ ...user, user_id });
  }

  beforeAll(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [ownerFarm] = await mocks.userFarmFactory({
      promisedUser: [owner],
      promisedFarm: [farm],
    }, fakeUserFarm(1));

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next()
    });
  })

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
          const [workerFarm] = await mocks.userFarmFactory({
            promisedUser: [worker],
            promisedFarm: [farm],
          }, fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          [managerFarm] = await mocks.userFarmFactory({
            promisedUser: [manager],
            promisedFarm: [farm],
          }, fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser],
          }, fakeUserFarm(1));
        })

        test('Workers should get user by user id', async (done) => {
          getRequest({ user_id: worker.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            validate({ ...worker, ...workerFarm }, res, 200);
            done();
          });
        })

        test('Owner should get user by user id', async (done) => {
          getRequest({ user_id: owner.user_id }, (err, res) => {
            validate({ ...owner, ...ownerFarm }, res, 200);
            expect(res.body.gender).toBe(owner.gender);
            expect(res.body.birth_year).toBe(owner.birth_year);
            done();
          });
        })

        test('Manager should get user by user id', async (done) => {
          getRequest({ user_id: manager.user_id }, (err, res) => {
            validate({ ...manager, ...managerFarm }, res, 200);
            done();
          });
        })

        test('Should get status 403 if an unauthorizedUser tries to get user by user_id', async (done) => {
          getRequest({
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser,
            params_user_id: owner.user_id,
          }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        })

      })
    })

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
          [ownerFarm] = await mocks.userFarmFactory({
            promisedUser: [owner],
            promisedFarm: [farm],
          }, fakeUserFarm(1));
          [worker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory({
            promisedUser: [worker],
            promisedFarm: [farm],
          }, fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory({
            promisedUser: [manager],
            promisedFarm: [farm],
          }, fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser],
          }, fakeUserFarm(1));
        })

        test('should edit and the area_used field by owner', async (done) => {
          sampleData = fakeUser(owner.user_id);
          sampleData.email = owner.email;
          putRequest(sampleData, { user_id: owner.user_id }, async (err, res) => {
            const resUser = await userModel.query().findById(owner.user_id);
            validate(sampleData, res, 200, resUser);
            done();
          })
        });

        test('should edit and the area_used field by manager', async (done) => {
          sampleData = fakeUser(manager.user_id);          sampleData.email = owner.email;
          sampleData.email = manager.email;
          putRequest(sampleData, { user_id: manager.user_id }, async (err, res) => {
            const resUser = await userModel.query().findById(manager.user_id);
            validate(sampleData, res, 200, resUser);
            done();
          })
        });

        test('should edit and the area_used field by worker', async (done) => {
          sampleData = fakeUser(worker.user_id);
          sampleData.email = worker.email;
          putRequest(sampleData, { user_id: worker.user_id }, async (err, res) => {
            const resUser = await userModel.query().findById(worker.user_id);
            validate(sampleData, res, 200, resUser);
            done();
          })
        });

        test('should return 403 when unauthorized user tries to edit another user', async (done) => {
          sampleData = fakeUser(manager.user_id);
          putRequest(sampleData, { user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('should return 403 when a owner tries to edit another user', async (done) => {
          sampleData = fakeUser(manager.user_id);
          putRequest(sampleData, { user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

      })
    });


  })

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
          'last_name': fakeuser.last_name,
          'farm_id': farm.farm_id,
          user_id: user_id,
          'wage': { 'type': 'hourly', 'amount': 3 },
        }
      })

      beforeAll(async () => {
        [worker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory({
          promisedUser: [worker],
          promisedFarm: [farm],
        }, fakeUserFarm(3));
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory({
          promisedUser: [manager],
          promisedFarm: [farm],
        }, fakeUserFarm(2));


        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
          promisedUser: [unAuthorizedUser],
          promisedFarm: [farmunAuthorizedUser],
        }, fakeUserFarm(1));
      })

      test('Should post then get a valid user', async (done) => {
        const fakeUser = mocks.fakeUser();

        // don't need user_id or phone number when signing up user
        delete fakeUser.user_id;
        delete fakeUser.phone_number;

        const password = "test password"
        fakeUser.password = password;
        postUserRequest(fakeUser, { user_id: manager.user_id }, async (err, res) => {
          const user_id = res.body.user.user_id;
          const userSecret = await passwordModel.query().select('*').where('user_id', user_id).first();
          const resUser = await userModel.query().select('*').where('user_id', user_id).first();
          validate(fakeUser, res, 201, resUser);
          expect(userSecret.password_hash).not.toBe(password);
          // check that the saved hash corresponds to the pw provided
          const isMatch = await bcrypt.compare(password, userSecret.password_hash);
          expect(isMatch).toBe(true);
          done();
        })
      });

      test('Owner should post a pseudo user', async (done) => {
        postPseudoUserRequest(sampleData, {}, async (err, res) => {
          console.log(sampleData.email)
          const resUser = await userModel.query().where({email: sampleData.email}).first();
          const resUserFarm = await userFarmModel.query().where({user_id: resUser.user_id, farm_id: farm.farm_id}).first();
          validate({ ...sampleData, role_id:4 }, res,201, {...resUser, ...resUserFarm});
          done();
        })
      });

      test('Manager should post a pseudo user', async (done) => {
        postPseudoUserRequest(sampleData, {user_id: manager.user_id}, async (err, res) => {
          const resUser = await userModel.query().where({email: sampleData.email}).first();
          const resUserFarm = await userFarmModel.query().where({user_id: resUser.user_id, farm_id: farm.farm_id}).first();
          validate({ ...sampleData, role_id:4 }, res,201, {...resUser, ...resUserFarm});
          done();
        })
      });

      test('Should return status 403 when a worker tries to post a pseudo user', async (done) => {
        postPseudoUserRequest(sampleData, {user_id: worker.user_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      });

      test('Should return status 403 when a worker tries to post a pseudo user', async (done) => {
        postPseudoUserRequest(sampleData, {user_id: unAuthorizedUser.user_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        postPseudoUserRequest(sampleData, {user_id: unAuthorizedUser.user_id, farm_id: unAuthorizedUser.farm_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      });

      test('Should return 400 if user_id already exists', async (done) => {
        sampleData.user_id = unAuthorizedUser.user_id;
        postPseudoUserRequest(sampleData, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        })
      });

    });

  })



});
