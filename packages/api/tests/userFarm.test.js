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
let faker = require('faker');
const userFarmModel = require('../src/models/userFarmModel');
const userModel = require('../src/models/userModel');

describe('User Farm Tests', () => {
  let middleware;

  function getUserFarmsOfUserRequest({user_id}, callback) {
    chai.request(server).get(`/user_farm/user/${user_id}`)
      .end(callback);
  }

  // note: the object that is sent should be adjusted to not include consent_version
  function updateUserFarmConsentRequest({user_id, farm_id, params_user_id, params_farm_id}, callback) {
    chai.request(server).patch(`/user_farm/consent/farm/${params_farm_id || farm_id}/user/${params_user_id || user_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send({has_consent: true, consent_version: '3.0'})
      .end(callback);
  }

  function updateOnboarding(targetUser, {user_id, farm_id}, callback) {
    chai.request(server).patch(`/user_farm/onboarding/farm/${farm_id}/user/${user_id}`)
      .send({step_one: targetUser.step_one, step_one_end: targetUser.step_one_end, step_two: targetUser.step_two, step_two_end: targetUser.step_two_end, step_three: targetUser.step_three, step_three_end: targetUser.step_three_end, step_four: targetUser.step_four, step_four_end: targetUser.step_four_end, step_five: targetUser.step_five, step_five_end: targetUser.step_five_end})
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

  function getUserFarmsOfFarmRequest({user_id, farm_id}, callback) {
    chai.request(server).get(`/user_farm/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function getActiveUserFarmsOfFarmRequest({user_id, farm_id}, callback) {
    chai.request(server).get(`/user_farm/active/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  // TODO: eventually change how role is passed into endpoint
  function updateRoleRequest(role_id, {user_id, farm_id}, target_user_id, callback) {
    chai.request(server).patch(`/user_farm/role/farm/${farm_id}/user/${target_user_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send({role_id})
      .end(callback);
  }

  function updateStatusRequest(status, {user_id, farm_id}, target_user_id, callback) {
    chai.request(server).patch(`/user_farm/status/farm/${farm_id}/user/${target_user_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send({status})
      .end(callback);
  }

  function updateWageRequest(wage, {user_id, farm_id}, target_user_id, callback) {
    chai.request(server).patch(`/user_farm/wage/farm/${farm_id}/user/${target_user_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send({wage})
      .end(callback);
  }

  function invitePseudoUserRequest(data, {user_id, farm_id, params_user_id, params_farm_id}, callback) {
    chai.request(server).post(`/user_farm/invite/farm/${params_farm_id || farm_id}/user/${params_user_id || user_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
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

  // initialize a user and a farm
  async function setupUserFarm({role_id=1, status='Active', has_consent=true}) {
    const userFarmInfo = {
      role_id,
      status,
      has_consent
    }
    let [ farm ] = await mocks.farmFactory();
    let [ user ] = await mocks.usersFactory();
    await mocks.userFarmFactory({ promisedUser: [user], promisedFarm: [farm]}, userFarmInfo);
    return {user, farm};
  }

  // generate user to a given farm
  async function createUserFarmAtFarm({role_id=1, status='Active', has_consent=true}, farm) {
    const userFarmInfo = {
      role_id,
      status,
      has_consent
    }
    const [ user ] = await mocks.usersFactory();
    await mocks.userFarmFactory({ promisedUser: [user], promisedFarm: [farm]}, userFarmInfo);
    return user;
  }

  // add given user to a newly generated farm
  async function createUserFarmForUser({role_id=1, status='Active', has_consent=true}, user) {
    const userFarmInfo = {
      role_id,
      status,
      has_consent
    }
    const [ farm ] = await mocks.farmFactory();
    await mocks.userFarmFactory({ promisedUser: [user], promisedFarm: [farm]}, userFarmInfo);
    return farm;
  }

  async function setupFarmWithVariousUsers() {
    const {user: owner, farm} = await setupUserFarm({role_id: 1});
    const manager = await createUserFarmAtFarm({role_id: 2}, farm);
    const worker = await createUserFarmAtFarm({role_id: 3}, farm);
    const inactiveUser = await createUserFarmAtFarm({role_id: 3, status: 'Inactive'}, farm);
    return { owner, manager, worker, inactiveUser, farm };
  }

  beforeEach(async () => {
    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next();
    });
  });

  afterAll(async (done) => {
    console.time('cleanup')
    await tableCleanup(knex);
    console.timeEnd('cleanup')
    console.time('destroy')

    await knex.destroy();
    console.timeEnd('destroy')
    console.log('calling done');
    done();
  });

  test('Get all user farms of a user', async (done) => {
    const {user, farm} = await setupUserFarm({});
    const farm2 = await createUserFarmForUser({}, user);
    const farm3 = await createUserFarmForUser({}, user);

    getUserFarmsOfUserRequest({user_id: user.user_id}, async (err, res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      done();
    });
  });

  test('Update consent status for user farm', async (done) => {
    const {user: owner, farm} = await setupUserFarm({});
    const noConsentUser = await createUserFarmAtFarm({role_id: 3, has_consent: false}, farm);
    let targetUser = await userFarmModel.query().where('user_id', noConsentUser.user_id).first();
    expect(targetUser.has_consent).toBe(false);
    updateUserFarmConsentRequest({user_id: noConsentUser.user_id, farm_id: farm.farm_id}, async (err, res) => {
      expect(res.status).toBe(200);
      targetUser = await userFarmModel.query().where('user_id', noConsentUser.user_id).first();
      expect(targetUser.has_consent).toBe(true);
      done();
    });
  });

  test('Invited user should not update userFarm', async (done) => {
    const {user: owner, farm} = await setupUserFarm({});
    const noConsentUser = await createUserFarmAtFarm({role_id: 3, has_consent: false, status: 'Invited'}, farm);
    let targetUser = await userFarmModel.query().where('user_id', noConsentUser.user_id).first();
    expect(targetUser.has_consent).toBe(false);
    updateUserFarmConsentRequest({user_id: noConsentUser.user_id, farm_id: farm.farm_id}, async (err, res) => {
      expect(res.status).toBe(403);
      done();
    });
  });

  test('Inactive user should not update userFarm', async (done) => {
    const {user: owner, farm} = await setupUserFarm({});
    const noConsentUser = await createUserFarmAtFarm({role_id: 3, has_consent: false, status: 'Inactive'}, farm);
    let targetUser = await userFarmModel.query().where('user_id', noConsentUser.user_id).first();
    expect(targetUser.has_consent).toBe(false);
    updateUserFarmConsentRequest({user_id: noConsentUser.user_id, farm_id: farm.farm_id}, async (err, res) => {
      expect(res.status).toBe(403);
      done();
    });
  });

  test('Owner should not accept/reject consent on behalf of another user', async (done) => {
    const {user: owner, farm} = await setupUserFarm({});
    const noConsentUser = await createUserFarmAtFarm({role_id: 3, has_consent: false, status: 'Invited'}, farm);
    let targetUser = await userFarmModel.query().where('user_id', noConsentUser.user_id).first();
    expect(targetUser.has_consent).toBe(false);
    updateUserFarmConsentRequest({user_id: owner.user_id, farm_id: farm.farm_id, params_user_id:noConsentUser}, async (err, res) => {
      expect(res.status).toBe(403);
      done();
    });
  });

  test('Update step_one of farm', async (done) => {
    const {user: owner, farm} = await setupUserFarm({});
    let targetUser = await userFarmModel.query().where('user_id', owner.user_id).first();
    expect(targetUser.step_one).toBe(false);
    targetUser.step_one = true;
    targetUser.step_one_end = '2020-10-21 14:43:06.718035-07';
    updateOnboarding(targetUser,{user_id: owner.user_id, farm_id: farm.farm_id}, async (err, res) => {
      expect(res.status).toBe(200);
      targetUser1 = await userFarmModel.query().where('user_id', owner.user_id).first();
      expect(targetUser1.step_one).toBe(true);
      expect(targetUser1.step_one_end).toBe(targetUser.step_one_end);
      done();
    });
  });

  test('Update step_two of farm', async (done) => {
    const {user: owner, farm} = await setupUserFarm({});
    let targetUser = await userFarmModel.query().where('user_id', owner.user_id).first();
    expect(targetUser.step_two).toBe(false);
    targetUser.step_two = true;
    targetUser.step_two_end = '2020-10-21 14:43:06.718035-07';
    updateOnboarding(targetUser,{user_id: owner.user_id, farm_id: farm.farm_id}, async (err, res) => {
      expect(res.status).toBe(200);
      targetUser1 = await userFarmModel.query().where('user_id', owner.user_id).first();
      expect(targetUser1.step_two).toBe(true);
      expect(targetUser1.step_two_end).toBe(targetUser.step_two_end);
      done();
    });
  });

  test('Update step_three of farm', async (done) => {
    const {user: owner, farm} = await setupUserFarm({});
    let targetUser = await userFarmModel.query().where('user_id', owner.user_id).first();
    expect(targetUser.step_three).toBe(false);
    targetUser.step_three = true;
    targetUser.step_three_end = '2020-10-21 14:43:06.718035-07';
    updateOnboarding(targetUser,{user_id: owner.user_id, farm_id: farm.farm_id}, async (err, res) => {
      expect(res.status).toBe(200);
      targetUser1 = await userFarmModel.query().where('user_id', owner.user_id).first();
      expect(targetUser1.step_three).toBe(true);
      expect(targetUser1.step_three_end).toBe(targetUser.step_three_end);
      done();
    });
  });

  test('Update step_four of farm', async (done) => {
    const {user: owner, farm} = await setupUserFarm({});
    let targetUser = await userFarmModel.query().where('user_id', owner.user_id).first();
    expect(targetUser.step_four).toBe(false);
    targetUser.step_four = true;
    targetUser.step_four_end = '2020-10-21 14:43:06.718035-07';
    updateOnboarding(targetUser,{user_id: owner.user_id, farm_id: farm.farm_id}, async (err, res) => {
      expect(res.status).toBe(200);
      targetUser1 = await userFarmModel.query().where('user_id', owner.user_id).first();
      expect(targetUser1.step_four).toBe(true);
      expect(targetUser1.step_four_end).toBe(targetUser.step_four_end);
      done();
    });
  });

  test('Update step_five of farm', async (done) => {
    const {user: owner, farm} = await setupUserFarm({});
    let targetUser = await userFarmModel.query().where('user_id', owner.user_id).first();
    expect(targetUser.step_five).toBe(false);
    targetUser.step_five = true;
    targetUser.step_five_end = '2020-10-21 14:43:06.718035-07';
    updateOnboarding(targetUser,{user_id: owner.user_id, farm_id: farm.farm_id}, async (err, res) => {
      expect(res.status).toBe(200);
      targetUser1 = await userFarmModel.query().where('user_id', owner.user_id).first();
      expect(targetUser1.step_five).toBe(true);
      expect(targetUser1.step_five_end).toBe(targetUser.step_five_end);
      done();
    });
  });

  describe('Get user farm info by farm: authorization tests', () => {
    describe('Get all user farm info', () => {
      test('Owner should get all user farm info', async (done) => {
        const {owner, farm} = await setupFarmWithVariousUsers();
        getUserFarmsOfFarmRequest({user_id: owner.user_id, farm_id: farm.farm_id}, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(4);
          // check if sensitive info can be accessed
          expect(res.body[0].address).toBeDefined();
          for(const userFarm of res.body){
            if(userFarm.user_id === owner.user_id){
              expect(userFarm.gender).toBe(owner.gender);
              expect(userFarm.birth_year).toBe(owner.birth_year);
            }else{
              expect(userFarm.gender).toBeUndefined();
              expect(userFarm.birth_year).toBeUndefined();
            }
          }
          done();
        });
      });

      test('Manager should get all user farm info', async (done) => {
        const {manager, farm} = await setupFarmWithVariousUsers();
        getUserFarmsOfFarmRequest({user_id: manager.user_id, farm_id: farm.farm_id}, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(4);
          // check if sensitive info can be accessed
          expect(res.body[0].address).toBeDefined();
          done();
        });
      });

      test('Worker should get all user farm limited info', async (done) => {
        const {worker, farm} = await setupFarmWithVariousUsers();
        getUserFarmsOfFarmRequest({user_id: worker.user_id, farm_id: farm.farm_id}, async (err, res) => {
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
        const {farm} = await setupFarmWithVariousUsers();
        const {user: unauthorizedUser, farm2} = await setupUserFarm({role_id: 1});
        getUserFarmsOfFarmRequest({user_id: unauthorizedUser.user_id, farm_id: farm.farm_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });
    });

    describe('Get active user farm info', () => {
      test('Owner should get active user farm info', async (done) => {
        const {owner, farm} = await setupFarmWithVariousUsers();
        getActiveUserFarmsOfFarmRequest({user_id: owner.user_id, farm_id: farm.farm_id}, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(3);
          // check if sensitive info can be accessed
          expect(res.body[0].address).toBeDefined();
          done();
        });
      });

      test('Manager should get active user farm info', async (done) => {
        const {manager, farm} = await setupFarmWithVariousUsers();
        getActiveUserFarmsOfFarmRequest({user_id: manager.user_id, farm_id: farm.farm_id}, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(3);
          // check if sensitive info can be accessed
          expect(res.body[0].address).toBeDefined();
          done();
        });
      });

      test('Worker should get active user farm limited info', async (done) => {
        const {worker, farm} = await setupFarmWithVariousUsers();
        getActiveUserFarmsOfFarmRequest({user_id: worker.user_id, farm_id: farm.farm_id}, async (err, res) => {
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
        const {farm} = await setupFarmWithVariousUsers();
        const {user: unauthorizedUser, farm: farm2} = await setupUserFarm({role_id: 1});
        getActiveUserFarmsOfFarmRequest({user_id: unauthorizedUser.user_id, farm_id: farm.farm_id}, async (err, res) => {
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
        const {user: owner, farm} = await setupUserFarm({});
        const worker = await createUserFarmAtFarm({role_id: 3}, farm);
        const target_role = 'Manager';
        const target_role_id = 2;
        const target_user_id = worker.user_id;
        updateRoleRequest(target_role_id, {user_id: owner.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.role_id).toBe(target_role_id);
          done();
        });
      });

      test('Manager should update user farm role', async (done) => {
        const {user: manager, farm} = await setupUserFarm({role_id: 2});
        const worker = await createUserFarmAtFarm({role_id: 3}, farm);
        const target_role = 'Manager';
        const target_role_id = 2;
        const target_user_id = worker.user_id;
        updateRoleRequest(target_role_id, {user_id: manager.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.role_id).toBe(target_role_id);
          done();
        });
      });

      test('Return 403 if worker tries to update user farm role', async (done) => {
        const {manager, worker, farm} = await setupFarmWithVariousUsers();
        const target_role = 'Worker';
        const target_role_id = 3;
        const target_user_id = manager.user_id;
        updateRoleRequest(target_role, {user_id: worker.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Return 403 if unauthorized user tries to update user farm role', async (done) => {
        const {manager, farm} = await setupFarmWithVariousUsers();
        const {user: unauthorizedUser, farm2} = await setupUserFarm({role_id: 1});
        const target_role = 'Worker';
        const target_role_id = 3;
        const target_user_id = manager.user_id;
        updateRoleRequest(target_role, {user_id: unauthorizedUser.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Return 400 if last owner/Manager tries to set themselves as standard worker', async (done) => {
        const {owner, manager, farm} = await setupFarmWithVariousUsers();
        const target_role = 'Worker';
        const target_role_id = 3;
        let target_user_id = manager.user_id;
        // turn manager to worker
        updateRoleRequest(target_role_id, {user_id: owner.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          let updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.role_id).toBe(target_role_id);
          target_user_id = owner.user_id;
          // try to turn owner to worker
          updateRoleRequest(target_role, {user_id: owner.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
            expect(res.status).toBe(400);
            done();
          });
        });
      });

      test('Return 404 if owner tries to update user farm role that is not part of their farm', async (done) => {
        const {user: owner, farm} = await setupUserFarm({});
        const {user: unauthorizedUser, farm: farm2} = await setupUserFarm({});
        const target_role = 'Manager';
        const target_role_id = 2;
        const target_user_id = unauthorizedUser.user_id;
        updateRoleRequest(target_role_id, {user_id: owner.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(404);
          done();
        });
      });
    });

    describe('Update user farm status', () => {
      test('Owner should update user farm status', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const worker = await createUserFarmAtFarm({role_id: 3}, farm);
        const target_status = 'Inactive';
        const target_user_id = worker.user_id;
        updateStatusRequest(target_status, {user_id: owner.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.status).toBe(target_status);
          done();
        });
      });

      test('Manager should update user farm status', async (done) => {
        const {user: manager, farm} = await setupUserFarm({role_id: 2});
        const worker = await createUserFarmAtFarm({role_id: 3}, farm);
        const target_status = 'Inactive';
        const target_user_id = worker.user_id;
        updateStatusRequest(target_status, {user_id: manager.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.status).toBe(target_status);
          done();
        });
      });

      test('Return 403 if worker tries to update user farm status', async (done) => {
        const {user: manager, farm} = await setupUserFarm({role_id: 2});
        const worker = await createUserFarmAtFarm({role_id: 3}, farm);
        const target_status = 'Inactive';
        const target_user_id = manager.user_id;
        updateStatusRequest(target_status, {user_id: worker.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Return 403 if unauthorized user tries to update user farm status', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const {user: unauthorizedUser, farm: farm2} = await setupUserFarm({role_id: 1});
        const target_status = 'Inactive';
        const target_user_id = owner.user_id;
        updateStatusRequest(target_status, {user_id: unauthorizedUser.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Allowed status change: Inactive -> Invited', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const inactiveUser = await createUserFarmAtFarm({role_id: 3, status: 'Inactive'}, farm);
        const target_status = 'Invited';
        const target_user_id = inactiveUser.user_id;
        updateStatusRequest(target_status, {user_id: owner.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.status).toBe(target_status);
          done();
        });
      });

      test('Allowed status change: Inactive -> Active', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const inactiveUser = await createUserFarmAtFarm({role_id: 3, status: 'Inactive'}, farm);
        const target_status = 'Active';
        const target_user_id = inactiveUser.user_id;
        updateStatusRequest(target_status, {user_id: owner.user_id , farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });
    });

      test('Allowed status change: Invited -> Inactive', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const invitedUser = await createUserFarmAtFarm({role_id: 3, status: 'Invited'}, farm);
        const target_status = 'Inactive';
        const target_user_id = invitedUser.user_id;
        updateStatusRequest(target_status, {user_id: owner.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.status).toBe(target_status);
          done();
        });
      });

      test('Forbidden status change: Invited -> Active', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const invitedUser = await createUserFarmAtFarm({role_id: 3, status: 'Invited'}, farm);
        const target_status = 'Active';
        const target_user_id = invitedUser.user_id;
        updateStatusRequest(target_status, {user_id: owner.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });

      test('Forbidden status change: Active -> Invited', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const worker = await createUserFarmAtFarm({role_id: 3}, farm);
        const target_status = 'Invited';
        const target_user_id = worker.user_id;
        updateStatusRequest(target_status, {user_id: owner.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });

      test('Allowed status change: Active -> Inactive', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const worker = await createUserFarmAtFarm({role_id: 3}, farm);
        const target_status = 'Inactive';
        const target_user_id = worker.user_id;
        updateStatusRequest(target_status, {user_id: owner.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.status).toBe(target_status);
          done();
        });
      });

    describe('Update user farm wage', () => {
      test('Owner should update user farm wage', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const worker = await createUserFarmAtFarm({role_id: 3}, farm);
        const wage = {
          type: 'hourly',
          amount: 23,
        };
        const target_user_id = worker.user_id;
        updateWageRequest(wage, {user_id: owner.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.wage).toEqual(wage);
          done();
        });
      });

      test('Manager should update user farm wage', async (done) => {
        const {user: manager, farm} = await setupUserFarm({role_id: 2});
        const worker = await createUserFarmAtFarm({role_id: 3}, farm);
        const wage = {
          type: 'annually',
          amount: 50000,
        };
        const target_user_id = worker.user_id;
        updateWageRequest(wage, {user_id: manager.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(200);
          const updatedUserFarm = await userFarmModel.query().where('farm_id', farm.farm_id).andWhere('user_id', target_user_id).first();
          expect(updatedUserFarm.wage).toEqual(wage);
          done();
        });
      });

      test('Return 403 if worker tries to update user farm wage', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const worker = await createUserFarmAtFarm({role_id: 3}, farm);
        const wage = {
          type: 'hourly',
          amount: 50000,
        };
        const target_user_id = worker.user_id;
        updateWageRequest(wage, {user_id: worker.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Return 403 if unauthorized user tries to update user farm wage', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const worker = await createUserFarmAtFarm({role_id: 3}, farm);
        const {user: unauthorizedUser, farm: farm2} = await setupUserFarm({role_id: 1});
        const wage = {
          type: 'hourly',
          amount: 23,
        };
        const target_user_id = worker.user_id;
        updateWageRequest(wage, {user_id: unauthorizedUser.user_id, farm_id: farm.farm_id}, target_user_id, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });
    });

    describe('Invite pseudo user test', () => {
      test('Should invite a pseudo user when email does not exist in user table', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const [psedoUserFarm] = await mocks.userFarmFactory({promisedFarm: [farm]}, { ...mocks.fakeUserFarm(), role_id: 4 });
        const email = faker.internet.email().toLowerCase();
        const {wage, role_id} = mocks.fakeUserFarm();
        invitePseudoUserRequest({ email, role_id, wage }, {user_id: owner.user_id, farm_id: farm.farm_id, params_user_id: psedoUserFarm.user_id}, async (err, res) => {
          expect(res.status).toBe(201);
          const updatedUserFarm = await userFarmModel.query().findById([psedoUserFarm.user_id, psedoUserFarm.farm_id]);
          const updatedUser = await userModel.query().findById(psedoUserFarm.user_id);
          expect(updatedUser.email).toBe(email);
          expect(updatedUser.status_id).toBe(2);
          expect(updatedUserFarm.wage).toEqual(wage);
          expect(updatedUserFarm.role_id).toBe(role_id);
          done();
        });
      });

      test('Should give access of a pseudo farm to an existing account when email exists in user table', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const [psedoUserFarm] = await mocks.userFarmFactory({promisedFarm: [farm]}, { ...mocks.fakeUserFarm(), role_id: 4 });
        const [shift0] = await mocks.shiftFactory({promisedUserFarm: [psedoUserFarm]}, {...mocks.fakeShift(), created_by_user_id: owner.user_id, updated_by_user_id: owner.user_id});
        const [shift1] = await mocks.shiftFactory({promisedUserFarm: [psedoUserFarm]}, {...mocks.fakeShift(), created_by_user_id: owner.user_id, updated_by_user_id: owner.user_id});
        const email = faker.internet.email().toLowerCase();
        const [existingUser] = await mocks.usersFactory({ ...mocks.fakeUser(), email, user_id: `existing user ${psedoUserFarm.user_id}` })
        const {wage, role_id} = mocks.fakeUserFarm();
        invitePseudoUserRequest({ email, role_id, wage }, {user_id: owner.user_id, farm_id: farm.farm_id, params_user_id: psedoUserFarm.user_id}, async (err, res) => {
          expect(res.status).toBe(201);
          const oldUserFarm = await userFarmModel.query().findById([psedoUserFarm.user_id, psedoUserFarm.farm_id]);
          const oldUser = await userModel.query().findById(psedoUserFarm.user_id);
          expect(oldUser).toBeUndefined();
          expect(oldUserFarm).toBeUndefined();
          const updatedUserFarm = await userModel.query().join('userFarm', 'userFarm.user_id', 'users.user_id').where({'users.user_id':existingUser.user_id, 'userFarm.farm_id': farm.farm_id }).first().select('*');
          expect(updatedUserFarm.email).toBe(email);
          expect(updatedUserFarm.status_id).toBe(1);
          expect(updatedUserFarm.wage).toEqual(wage);
          expect(updatedUserFarm.role_id).toBe(role_id);
          const updatedShift0 = await knex('shift').where({shift_id: shift0.shift_id}).first();
          expect(updatedShift0.user_id).toBe(existingUser.user_id);
          const updatedShift1 = await knex('shift').where({shift_id: shift1.shift_id}).first();
          expect(updatedShift1.user_id).toBe(existingUser.user_id);
          done();
        });
      });

      test('Should merge a pseudo user to an existing userFarm when user is already a member of the farm', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const [psedoUserFarm] = await mocks.userFarmFactory({promisedFarm: [farm]}, { ...mocks.fakeUserFarm(), role_id: 4 });
        const [shift0] = await mocks.shiftFactory({promisedUserFarm: [psedoUserFarm]}, {...mocks.fakeShift(), created_by_user_id: owner.user_id, updated_by_user_id: owner.user_id});
        const [shift1] = await mocks.shiftFactory({promisedUserFarm: [psedoUserFarm]}, {...mocks.fakeShift(), created_by_user_id: owner.user_id, updated_by_user_id: owner.user_id});
        const email = faker.internet.email().toLowerCase();
        const [existingUser] = await mocks.usersFactory({ ...mocks.fakeUser(), email });
        const [existringUserFarm] = await mocks.userFarmFactory({promisedFarm: [farm], promisedUser: [existingUser]});
        const [existingShift] = await mocks.shiftFactory({promisedUserFarm: [existringUserFarm]});
        const {wage, role_id} = mocks.fakeUserFarm();
        invitePseudoUserRequest({ email, role_id, wage }, {user_id: owner.user_id, farm_id: farm.farm_id, params_user_id: psedoUserFarm.user_id}, async (err, res) => {
          expect(res.status).toBe(201);
          const oldUserFarm = await userFarmModel.query().findById([psedoUserFarm.user_id, psedoUserFarm.farm_id]);
          const oldUser = await userModel.query().findById(psedoUserFarm.user_id);
          expect(oldUser).toBeUndefined();
          expect(oldUserFarm).toBeUndefined();
          const updatedUserFarm = await userModel.query().join('userFarm', 'userFarm.user_id', 'users.user_id').where({'users.user_id':existingUser.user_id, 'userFarm.farm_id': farm.farm_id }).first().select('*');
          expect(updatedUserFarm.email).toBe(email);
          expect(updatedUserFarm.status_id).toBe(1);
          expect(updatedUserFarm.wage).toEqual(wage);
          expect(updatedUserFarm.role_id).toBe(role_id);
          const updatedShifts = await knex('shift').where({user_id: existingUser.user_id});
          expect(updatedShifts.length).toBe(3);
          done();
        });
      });

      test('Should return 400 if user is not a pseudo User', async (done) => {
        const {user: owner, farm} = await setupUserFarm({role_id: 1});
        const [managerFarm] = await mocks.userFarmFactory({promisedFarm: [farm]}, { ...mocks.fakeUserFarm(), role_id: 2 });
        const { email } = await userModel.query().findById(managerFarm.user_id);
        const {wage, role_id} = mocks.fakeUserFarm();
        invitePseudoUserRequest({ email, role_id, wage }, {user_id: owner.user_id, farm_id: farm.farm_id, params_user_id: managerFarm.user_id}, async (err, res) => {
          expect(res.status).toBe(400);
          const userFarm = await userFarmModel.query().findById([managerFarm.user_id, managerFarm.farm_id]);
          delete userFarm.created_at;
          delete managerFarm.created_at;
          expect(userFarm).toEqual(managerFarm);
          done();
        });
      });
    })
  });
});
