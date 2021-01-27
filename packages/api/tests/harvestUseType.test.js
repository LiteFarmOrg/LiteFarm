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
const server = require('./../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment');
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks = require('./mock.factories');

describe('harvestUseType Tests', () => {
  let middleware;
  let owner;
  let farm;

  beforeAll(() => {
    token = global.token;
  });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  })

  function getHarvestUseTypeByFarmID({ user_id = owner.user_id, farm_id = farm.farm_id, url = `/log/harvest_use_types/farm/${farm.farm_id}` }, callback) {
    chai.request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function addHarvestUseType(data, { user_id = owner.user_id, farm_id = farm.farm_id, url = `/log/harvest_use_types/farm/${farm.farm_id}` }, callback) {
    chai.request(server).post(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({ promisedUser: [owner], promisedFarm: [farm] }, fakeUserFarm(1));

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next()
    });
  })

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('harvestUseType tests', () => {
    let worker;
    let manager;
    let unAuthorizedUser;
    let farmunAuthorizedUser;
   

    beforeEach(async () => {
      [worker] = await mocks.usersFactory();
      const [workerFarm] = await mocks.userFarmFactory({ promisedUser: [worker], promisedFarm: [farm] }, fakeUserFarm(3));
      [manager] = await mocks.usersFactory();
      const [managerFarm] = await mocks.userFarmFactory({ promisedUser: [manager], promisedFarm: [farm] }, fakeUserFarm(2));


      [unAuthorizedUser] = await mocks.usersFactory();
      [farmunAuthorizedUser] = await mocks.farmFactory();
      const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({ promisedUser: [unAuthorizedUser], promisedFarm: [farmunAuthorizedUser] }, fakeUserFarm(1));
    })

    describe('Get harvestUseType tests', () => {
      let newOwner;
      let worker;
      let manager;
      let unAuthorizedUser;
      let defaultState;
      let customUseType;

      beforeEach(async () => {
        [newOwner] = await mocks.usersFactory();
        const [newOwnerFarm] = await mocks.userFarmFactory({ promisedUser: [newOwner], promisedFarm: [farm] }, fakeUserFarm(1));
        [worker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory({ promisedUser: [worker], promisedFarm: [farm] }, fakeUserFarm(3));
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory({ promisedUser: [manager], promisedFarm: [farm] }, fakeUserFarm(2));
        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({ promisedUser: [unAuthorizedUser], promisedFarm: [farmunAuthorizedUser] }, fakeUserFarm(1));
        defaultState = await mocks.createDefaultState();
        [customUseType] = await mocks.harvestUseTypeFactory({ promisedFarm: farm });
      })

      test('Owner should get harvestUseType by farm id', async (done) => {
        getHarvestUseTypeByFarmID({ user_id: newOwner.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          for (let item of defaultState) {
            expect(res.body.some(el => el.harvest_use_type_name === item.harvest_use_type_name)).toBe(true);
          }
          done();
        });

      })

      test('Manager should get harvestUseType by farm id', async (done) => {
        getHarvestUseTypeByFarmID({ user_id: manager.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          for (let item of defaultState) {
            expect(res.body.some(el => el.harvest_use_type_name === item.harvest_use_type_name)).toBe(true);
          }
          done();
        });
      })

      test('Worker should get harvestUseType by farm id', async (done) => {
        getHarvestUseTypeByFarmID({ user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          for (let item of defaultState) {
            expect(res.body.some(el => el.harvest_use_type_name === item.harvest_use_type_name)).toBe(true);
          }
          done();
        });
      })

      test('Unauthorized user should not get harvestUseType by farm id', async (done) => {
        getHarvestUseTypeByFarmID({ user_id: unAuthorizedUser.user_id }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      })
    })

    describe('Add harvestUseType tests', () => {
      let newOwner;
      let worker;
      let manager;
      let unAuthorizedUser;
      let fakeHarvestUseType;
      let existingCustomUseType;

      beforeEach(async () => {
        [newOwner] = await mocks.usersFactory();
        const [newOwnerFarm] = await mocks.userFarmFactory({ promisedUser: [newOwner], promisedFarm: [farm] }, fakeUserFarm(1));
        [worker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory({ promisedUser: [worker], promisedFarm: [farm] }, fakeUserFarm(3));
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory({ promisedUser: [manager], promisedFarm: [farm] }, fakeUserFarm(2));
        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({ promisedUser: [unAuthorizedUser], promisedFarm: [farmunAuthorizedUser] }, fakeUserFarm(1));
        fakeHarvestUseType = mocks.fakeHarvestUseType();
        [existingCustomUseType] = await mocks.harvestUseTypeFactory({ promisedFarm: farm });
      })

      test('Owner should add harvestUseType', async (done) => {
        addHarvestUseType({ name: fakeHarvestUseType.harvest_use_type_name }, { user_id: newOwner.user_id }, (err, res) => {
          expect(res.status).toBe(201);
          expect(res.body.harvest_use_type_name).toBe(fakeHarvestUseType.harvest_use_type_name);
          expect(res.body.farm_id).toBe(farm.farm_id);
          done();
        });
      })

      test('Manager should add harvestUseType', async (done) => {
        addHarvestUseType({ name: fakeHarvestUseType.harvest_use_type_name }, { user_id: manager.user_id }, (err, res) => {
          expect(res.status).toBe(201);
          expect(res.body.harvest_use_type_name).toBe(fakeHarvestUseType.harvest_use_type_name);
          expect(res.body.farm_id).toBe(farm.farm_id);
          done();
        });
      })

      test('Worker should not add harvestUseType', async (done) => {
        addHarvestUseType({ name: fakeHarvestUseType.harvest_use_type_name }, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      })

      test('Unauthorized user should not add harvestUseType', async (done) => {
        addHarvestUseType({ name: fakeHarvestUseType.harvest_use_type_name }, { user_id: unAuthorizedUser.user_id }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      })

      test('Owner should fail to add duplicate harvestUseType', async (done) => {
        addHarvestUseType({ name: existingCustomUseType.harvest_use_type_name }, { user_id: newOwner.user_id }, (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      })

      test('Manager should fail to add duplicate harvestUseType', async (done) => {
        addHarvestUseType({ name: existingCustomUseType.harvest_use_type_name }, { user_id: manager.user_id }, (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      })

    })
  })
});
