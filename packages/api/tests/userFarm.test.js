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
chai.use(chaiHttp);
const server = require('./../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment');
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
jest.mock('../src/templates/sendEmailTemplate');
const mocks  = require('./mock.factories');
const userFarmModel = require('../src/models/userFarmModel');
const userModel = require('../src/models/userModel');

xdescribe('User Farm Tests', () => {
  let middleware;
  let owner;
  let worker;
  let inactiveWorker;
  let manager;
  let unauthorizedUser;

  let farm;
  let unauthorizedFarm;

  beforeAll((done) => {
    token = global.token;
    done();
  });

  function getUserFarmsOfUserRequest({user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).get(`/user_farm/user/${user_id}`)
      .set('farm_id', farm_id)
      .end(callback);
  }

  // note: the object that is sent should be adjusted to not include consent_version
  function updateUserFarmConsentRequest({user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).patch(`/user_farm/consent/farm/${farm_id}/user/${user_id}`)
      .send({has_consent: true, consent_version: '3.0'})
      .end(callback);
  }

  function addUserFarmRequest(data, {user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).post(`/user_farm`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function getUserFarmsOfFarmRequest({user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).get(`/user_farm/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function getActiveUserFarmsOfFarmRequest({user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).get(`/user_farm/active/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  // TODO: eventually change how role is passed into endpoint
  function updateRoleRequest(role, {user_id = owner.user_id, farm_id = farm.farm_id}, target_user_id, callback) {
    chai.request(server).patch(`/user_farm/role/farm/${farm_id}/user/${target_user_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send({role})
      .end(callback);
  }

  function updateStatusRequest(status, {user_id = owner.user_id, farm_id = farm.farm_id}, target_user_id, callback) {
    chai.request(server).patch(`/user_farm/status/farm/${farm_id}/user/${target_user_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send({status})
      .end(callback);
  }

  function updateWageRequest(wage, {user_id = owner.user_id, farm_id = farm.farm_id}, target_user_id, callback) {
    chai.request(server).patch(`/user_farm/wage/farm/${farm_id}/user/${target_user_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send({wage})
      .end(callback);
  }

  function fakeUserFarm(role_id=1, status='Active', has_consent=true) {
    return ({
      ...mocks.fakeUserFarm(),
      role_id,
      status,
      has_consent
    });
  }

  beforeEach(async (done) => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({promisedUser:[owner], promisedFarm:[farm]}, fakeUserFarm(1));

    [manager] = await mocks.usersFactory();
    const [managerFarm] = await mocks.userFarmFactory({promisedUser:[manager], promisedFarm:[farm]}, fakeUserFarm(2));
    [worker] = await mocks.usersFactory();
    const [workerFarm] = await mocks.userFarmFactory({promisedUser:[worker], promisedFarm:[farm]}, fakeUserFarm(3));
    [inactiveWorker] = await mocks.usersFactory();
    const [inactiveWorkerFarm] = await mocks.userFarmFactory({promisedUser:[inactiveWorker], promisedFarm:[farm]}, fakeUserFarm(3, 'Inactive'));


    [unauthorizedUser] = await mocks.usersFactory();
    [unauthorizedFarm] = await mocks.farmFactory();
    const [unauthorizedUserFarm] = await mocks.userFarmFactory({promisedUser:[unauthorizedUser], promisedFarm:[unauthorizedFarm]}, fakeUserFarm(1));

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next();
    });
    done();
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  test('Get all user farms of a user', async (done) => {
    [farm2] = await mocks.farmFactory();
    [farm3] = await mocks.farmFactory();
    const [workerFarm2] = await mocks.userFarmFactory({promisedUser:[worker], promisedFarm:[farm2]}, fakeUserFarm(3));
    const [workerFarm3] = await mocks.userFarmFactory({promisedUser:[worker], promisedFarm:[farm3]}, fakeUserFarm(3));
    getUserFarmsOfUserRequest({user_id: worker.user_id}, async (err, res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body[0].farm_id).toBe(farm.farm_id);
      expect(res.body[1].farm_id).toBe(farm2.farm_id);
      expect(res.body[2].farm_id).toBe(farm3.farm_id);
      done();
    });
  });

  test('Update consent status for user farm', async (done) => {
    [noConsentUser] = await mocks.usersFactory();
    const [noConsentUserFarm] = await mocks.userFarmFactory({promisedUser:[noConsentUser], promisedFarm:[farm]}, fakeUserFarm(3, 'Active', false));
    let targetUser = await userFarmModel.query().where('user_id', noConsentUser.user_id).first();
    expect(targetUser.has_consent).toBe(false);
    updateUserFarmConsentRequest({user_id: noConsentUser.user_id}, async (err, res) => {
      expect(res.status).toBe(200);
      targetUser = await userFarmModel.query().where('user_id', noConsentUser.user_id).first();
      expect(targetUser.has_consent).toBe(true);
      done();
    });
  });

  describe('Get user farm info by farm: authorization tests', () => {
    describe('Get all user farm info', () => {
      test('Owner should get all user farm info', async (done) => {
        getUserFarmsOfFarmRequest({user_id: owner.user_id}, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(4);
          // check if sensitive info can be accessed
          expect(res.body[0].address).toBeDefined();
          done();
        });
      });

      test('Manager should get all user farm info', async (done) => {
        getUserFarmsOfFarmRequest({user_id: manager.user_id}, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(4);
          // check if sensitive info can be accessed
          expect(res.body[0].address).toBeDefined();
          done();
        });
      });

      test('Worker should get all user farm limited info', async (done) => {
        getUserFarmsOfFarmRequest({user_id: worker.user_id}, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(4);
          // check if sensitive info can be accessed
          expect(res.body[0].address).toBeUndefined();
          // check if worker can view appropriate info
          expect(res.body[0].first_name).toBeDefined();
          expect(res.body[0].last_name).toBeDefined();
          expect(res.body[0].profile_picture).toBeDefined();
          expect(res.body[0].phone_number).toBeDefined();
          expect(res.body[0].email).toBeDefined();
          expect(res.body[0].role).toBeDefined();
          expect(res.body[0].status).toBeDefined();
          done();
        });
      });

      test('Return 403 if unauthorized user tries to get any user farm info', async (done) => {
        getUserFarmsOfFarmRequest({user_id: unauthorizedUser.user_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });
    });

    describe('Get active user farm info', () => {
      test('Owner should get active user farm info', async (done) => {
        getActiveUserFarmsOfFarmRequest({user_id: owner.user_id}, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(3);
          // check if sensitive info can be accessed
          expect(res.body[0].address).toBeDefined();
          done();
        });
      });

      test('Manager should get active user farm info', async (done) => {
        getActiveUserFarmsOfFarmRequest({user_id: manager.user_id}, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(3);
          // check if sensitive info can be accessed
          expect(res.body[0].address).toBeDefined();
          done();
        });
      });

      test('Worker should get active user farm limited info', async (done) => {
        getActiveUserFarmsOfFarmRequest({user_id: worker.user_id}, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(3);
          // check if sensitive info can be accessed
          expect(res.body[0].address).toBeUndefined();
          // check if worker can view appropriate info
          expect(res.body[0].first_name).toBeDefined();
          expect(res.body[0].last_name).toBeDefined();
          expect(res.body[0].profile_picture).toBeDefined();
          expect(res.body[0].phone_number).toBeDefined();
          expect(res.body[0].email).toBeDefined();
          expect(res.body[0].role).toBeDefined();
          expect(res.body[0].status).toBeDefined();
          done();
        });
      });

      test('Return 403 if unauthorized user tries to get active user farm info', async (done) => {
        getActiveUserFarmsOfFarmRequest({user_id: unauthorizedUser.user_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });
    });
  });

  xdescribe('Add user farm: authorization tests', () => {
    let userFarmToAdd;
    beforeEach(async () => {
      userFarmToAdd = fakeUserFarm();
    });

    test('Owner should successfully add user farm', async (done) => {
      addUserFarmRequest(userFarmToAdd, {user_id: owner.user_id}, async (err, res) => {
        expect(res.status).toBe(201);
        const addedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id);
        addedUserFarm = addedUserFarm[addedUserFarm.length - 1];
        expect(addedUserFarm.role_id).toBe(userFarmToAdd.role_id);
        expect(addedUserFarm.status).toBe(userFarmToAdd.status);
        expect(addedUserFarm.has_consent).toBe(userFarmToAdd.has_consent);
        done();
      });
    });
  });

  describe('Update user farm: authorization tests', () => {
    describe('Update user farm role', () => {
      // TODO: eventually change how role is passed into endpoint
      test('Owner should update user farm role', async (done) => {
        const target_role = 'Manager';
        const target_role_id = 2;
        const target_user_id = worker.user_id;
        updateRoleRequest(target_role, {user_id: owner.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.role_id).toBe(target_role_id);
          done();
        });
      });

      test('Manager should update user farm role', async (done) => {
        const target_role = 'Manager';
        const target_role_id = 2;
        const target_user_id = worker.user_id;
        updateRoleRequest(target_role, {user_id: manager.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.role_id).toBe(target_role_id);
          done();
        });
      });

      test('Return 403 if worker tries to update user farm role', async (done) => {
        const target_role = 'Worker';
        const target_role_id = 3;
        const target_user_id = manager.user_id;
        updateRoleRequest(target_role, {user_id: worker.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Return 403 if unauthorized user tries to update user farm role', async (done) => {
        const target_role = 'Worker';
        const target_role_id = 3;
        const target_user_id = manager.user_id;
        updateRoleRequest(target_role, {user_id: unauthorizedUser.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Return 400 if last owner/Manager tries to set themselves as standard worker', async (done) => {
        const target_role = 'Worker';
        const target_role_id = 3;
        let target_user_id = manager.user_id;
        // turn manager to worker
        updateRoleRequest(target_role, {user_id: owner.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          let updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.role_id).toBe(target_role_id);
          target_user_id = owner.user_id;
          // try to turn owner to worker
          updateRoleRequest(target_role, {user_id: owner.user_id}, target_user_id, async (err, res) => {
            expect(res.status).toBe(400);
            done();
          });
        });
      });

      test('Return 404 if owner tries to update user farm role that is not part of their farm', async (done) => {
        const target_role = 'Manager';
        const target_role_id = 2;
        const target_user_id = unauthorizedUser.user_id;
        updateRoleRequest(target_role, {user_id: owner.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(404);
          done();
        });
      });
    });

    describe('Update user farm status', () => {
      test('Owner should update user farm status', async (done) => {
        const target_status = 'Inactive';
        const target_user_id = worker.user_id;
        updateStatusRequest(target_status, {user_id: owner.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.status).toBe(target_status);
          done();
        });
      });

      test('Manager should update user farm status', async (done) => {
        const target_status = 'Inactive';
        const target_user_id = worker.user_id;
        updateStatusRequest(target_status, {user_id: manager.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.status).toBe(target_status);
          done();
        });
      });

      test('Return 403 if worker tries to update user farm status', async (done) => {
        const target_status = 'Inactive';
        const target_user_id = manager.user_id;
        updateStatusRequest(target_status, {user_id: worker.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Return 403 if unauthorized user tries to update user farm status', async (done) => {
        const target_status = 'Inactive';
        const target_user_id = manager.user_id;
        updateStatusRequest(target_status, {user_id: unauthorizedUser.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Allowed status change: Inactive -> Active', async (done) => {
        [inactiveUser] = await mocks.usersFactory();
        const [inactiveUserFarm] = await mocks.userFarmFactory({promisedUser:[inactiveUser], promisedFarm:[farm]}, fakeUserFarm(3, 'Inactive', true));

        const target_status = 'Active';
        const target_user_id = inactiveUser.user_id;
        updateStatusRequest(target_status, {user_id: owner.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.status).toBe(target_status);
          done();
        });
      });
      
      test('Allowed status change: Invited -> Inactive', async (done) => {
        [invitedUser] = await mocks.usersFactory();
        const [invitedUserFarm] = await mocks.userFarmFactory({promisedUser:[invitedUser], promisedFarm:[farm]}, fakeUserFarm(3, 'Invited', true));

        const target_status = 'Inactive';
        const target_user_id = invitedUser.user_id;
        updateStatusRequest(target_status, {user_id: owner.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.status).toBe(target_status);
          done();
        });
      });

      test('Allowed status change: Invited -> Active', async (done) => {
        [invitedUser] = await mocks.usersFactory();
        const [invitedUserFarm] = await mocks.userFarmFactory({promisedUser:[invitedUser], promisedFarm:[farm]}, fakeUserFarm(3, 'Invited', true));

        const target_status = 'Active';
        const target_user_id = invitedUser.user_id;
        updateStatusRequest(target_status, {user_id: owner.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.status).toBe(target_status);
          done();
        });
      });

      test('Forbidden status change: Active -> Invited', async (done) => {
        const target_status = 'Invited';
        const target_user_id = worker.user_id;
        updateStatusRequest(target_status, {user_id: owner.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });

      test('Forbidden status change: Inactive -> Invited', async (done) => {
        [inactiveUser] = await mocks.usersFactory();
        const [inactiveUserFarm] = await mocks.userFarmFactory({promisedUser:[inactiveUser], promisedFarm:[farm]}, fakeUserFarm(3, 'Inactive', true));

        const target_status = 'Invited';
        const target_user_id = inactiveUser.user_id;
        updateStatusRequest(target_status, {user_id: owner.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
    });

    describe('Update user farm wage', () => {
      test('Owner should update user farm wage', async (done) => {
        const wage = {
          type: 'hourly',
          amount: 23,
        };
        const target_user_id = worker.user_id;
        updateWageRequest(wage, {user_id: owner.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.wage).toEqual(wage);
          done();
        });
      });

      test('Manager should update user farm wage', async (done) => {
        const wage = {
          type: 'annually',
          amount: 50000,
        };
        const target_user_id = worker.user_id;
        updateWageRequest(wage, {user_id: manager.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.wage).toEqual(wage);
          done();
        });
      });

      test('Return 403 if worker tries to update user farm wage', async (done) => {
        const wage = {
          type: 'hourly',
          amount: 50000,
        };
        const target_user_id = worker.user_id;
        updateWageRequest(wage, {user_id: worker.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Return 403 if unauthorized user tries to update user farm wage', async (done) => {
        const wage = {
          type: 'hourly',
          amount: 23,
        };
        const target_user_id = worker.user_id;
        updateWageRequest(wage, {user_id: unauthorizedUser.user_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });
    });
  });
});
