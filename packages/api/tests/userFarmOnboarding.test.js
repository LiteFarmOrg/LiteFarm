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
const { farm } = require('../../webapp/src/apiConfig');

describe('User Farm Tests', () => {
  let middleware;

//   function getUserFarmsOfUserRequest({user_id}, callback) {
//     chai.request(server).get(`/user_farm/user/${user_id}`)
//       .end(callback);
//   }

//   // note: the object that is sent should be adjusted to not include consent_version
//   function updateUserFarmConsentRequest({user_id, farm_id}, callback) {
//     chai.request(server).patch(`/user_farm/consent/farm/${farm_id}/user/${user_id}`)
//       .send({has_consent: true, consent_version: '3.0'})
//       .end(callback);
//   }

//   function addUserFarmRequest(data, {user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
//     chai.request(server).post(`/user_farm`)
//       .set('Content-Type', 'application/json')
//       .set('user_id', user_id)
//       .set('farm_id', farm_id)
//       .send(data)
//       .end(callback);
//   }

//   function getUserFarmsOfFarmRequest({user_id, farm_id}, callback) {
//     chai.request(server).get(`/user_farm/farm/${farm_id}`)
//       .set('user_id', user_id)
//       .set('farm_id', farm_id)
//       .end(callback);
//   }

//   function getActiveUserFarmsOfFarmRequest({user_id, farm_id}, callback) {
//     chai.request(server).get(`/user_farm/active/farm/${farm_id}`)
//       .set('user_id', user_id)
//       .set('farm_id', farm_id)
//       .end(callback);
//   }

//   // TODO: eventually change how role is passed into endpoint
//   function updateRoleRequest(role, {user_id, farm_id}, target_user_id, callback) {
//     chai.request(server).patch(`/user_farm/role/farm/${farm_id}/user/${target_user_id}`)
//       .set('user_id', user_id)
//       .set('farm_id', farm_id)
//       .send({role})
//       .end(callback);
//   }

//   function updateStatusRequest(status, {user_id, farm_id}, target_user_id, callback) {
//     chai.request(server).patch(`/user_farm/status/farm/${farm_id}/user/${target_user_id}`)
//       .set('user_id', user_id)
//       .set('farm_id', farm_id)
//       .send({status})
//       .end(callback);
//   }

//   function updateWageRequest(wage, {user_id, farm_id}, target_user_id, callback) {
//     chai.request(server).patch(`/user_farm/wage/farm/${farm_id}/user/${target_user_id}`)
//       .set('user_id', user_id)
//       .set('farm_id', farm_id)
//       .send({wage})
//       .end(callback);
//   }

//   function fakeUserFarm(role_id=1, status='Active', has_consent=true) {
//     return ({
//       ...mocks.fakeUserFarm(),
//       role_id,
//       status,
//       has_consent
//     });
//   }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
}

async function returnUserFarms(role) {
    const [ mainFarm ] = await mocks.farmFactory();
    const [ user ] = await mocks.usersFactory();
    const [ userFarm ] = await mocks.userFarmFactory(
        {
            promisedUser: [ user ],
            promisedFarm: [ mainFarm ]
        },
        fakeUserFarm(role)
    );
    return { userFarm, user };
}

//   // initialize a user and a farm
//   async function setupUserFarm({role_id=1, status='Active', has_consent=true}) {
//     const userFarmInfo = {
//       role_id,
//       status,
//       has_consent
//     }
//     let [ farm ] = await mocks.farmFactory();
//     let [ user ] = await mocks.usersFactory();
//     await mocks.userFarmFactory({ promisedUser: [user], promisedFarm: [farm]}, userFarmInfo);
//     return {user, farm};
//   }

//   // generate user to a given farm
//   async function createUserFarmAtFarm({role_id=1, status='Active', has_consent=true}, farm) {
//     const userFarmInfo = {
//       role_id,
//       status,
//       has_consent
//     }
//     const [ user ] = await mocks.usersFactory();
//     await mocks.userFarmFactory({ promisedUser: [user], promisedFarm: [farm]}, userFarmInfo);
//     return user;
//   }

//   // add given user to a newly generated farm
//   async function createUserFarmForUser({role_id=1, status='Active', has_consent=true}, user) {
//     const userFarmInfo = {
//       role_id,
//       status,
//       has_consent
//     }
//     const [ farm ] = await mocks.farmFactory();
//     await mocks.userFarmFactory({ promisedUser: [user], promisedFarm: [farm]}, userFarmInfo);
//     return farm;
//   }

//   async function setupFarmWithVariousUsers() {
//     const {user: owner, farm} = await setupUserFarm({role_id: 1});
//     const manager = await createUserFarmAtFarm({role_id: 2}, farm);
//     const worker = await createUserFarmAtFarm({role_id: 3}, farm);
//     const inactiveUser = await createUserFarmAtFarm({role_id: 3, status: 'Inactive'}, farm);
//     return { owner, manager, worker, inactiveUser, farm };
//   }

  beforeEach(async () => {
    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
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

  test('Update consent status for user farm', async (done) => {

    const {userFarm, user} = await returnUserFarms(1);
    console.log(userFarm)
    console.log(user) 
    done();
    // const {user: owner, farm} = await setupUserFarm({});
    // const noConsentUser = await createUserFarmAtFarm({role_id: 3, has_consent: false}, farm);
    // let targetUser = await userFarmModel.query().where('user_id', noConsentUser.user_id).first();
    // expect(targetUser.has_consent).toBe(false);
    // updateUserFarmConsentRequest({user_id: noConsentUser.user_id, farm_id: farm.farm_id}, async (err, res) => {
    //   expect(res.status).toBe(200);
    //   targetUser = await userFarmModel.query().where('user_id', noConsentUser.user_id).first();
    //   expect(targetUser.has_consent).toBe(true);
    //   done();
    // });
  });
});
