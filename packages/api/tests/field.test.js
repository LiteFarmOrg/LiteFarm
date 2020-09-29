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
const Knex = require('knex')
const environment = process.env.TEAMCITY_DOCKER_NETWORK ? 'pipeline' : 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);
const { tableCleanup } = require('./testEnvironment')
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
jest.mock('../src/jobs/station_sync/mapping')
const mocks = require('./mock.factories');

const fieldModel = require('../src/models/fieldModel');

describe('Field Tests', () => {
  // GLOBAL CONSTANTS
  let middleware;
  let farm;
  let newOwner;
  let newManager1;
  let newWorker1;
  let unAuthorizedUser1;
  let farmunAuthorizedUser1;
  let ownerFarmunAuthorizedUser1;

  beforeAll(() => {
    token = global.token;
  });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  })

  // FUNCTIONS

  function postFieldRequest(data, { user_id = newOwner.user_id, farm_id = farm.field_id }, callback) {
    chai.request(server).post('/field')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function putFieldRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    const { field_id } = data;
    chai.request(server).put(`/field/${field_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback)
  }

  function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).get(`/field/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function getFakeField(farm_id = farm.farm_id) {
    const field = mocks.fakeFieldForTests();
    return ({ ...field, farm_id });
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  function deleteRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    const { field_id } = data;
    chai.request(server).delete(`/field/${field_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }


  // GLOBAL BEFOREEACH
  beforeEach(async () => {
    [newOwner] = await mocks.usersFactory();
    [newManager1] = await mocks.usersFactory();
    [newWorker1] = await mocks.usersFactory();

    [farm] = await mocks.farmFactory();

    [unAuthorizedUser1] = await mocks.usersFactory();
    [farmunAuthorizedUser1] = await mocks.farmFactory();
    [ownerFarmunAuthorizedUser1] = await mocks.userFarmFactory({
      promisedUser: [unAuthorizedUser1],
      promisedFarm: [farmunAuthorizedUser1]
    }, fakeUserFarm(1));

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next()
    });
  })

  afterAll(async (done) => {
    await tableCleanup(knex);
    done();
  });


  // POST TESTS
  describe('Post field tests', () => {
    let fakeField;
    let fakeField1;
    let ownerFarm;
    let newManager;
    let managerFarm;
    let newWorker;
    let workerFarm;

    let unAuthorizedUser;
    let farmunAuthorizedUser;
    let ownerFarmunAuthorizedUser;
    let unauthorizedField;

    beforeEach(async () => {
      fakeField = getFakeField();
      fakeField.grid_points = [
        { lat: '49.2578263', lng: '-123.1939439' },
        { lat: '49.1785762', lng: '-123.2760843' },
        { lat: '49.2578263', lng: '-123.1939439' }
      ]

      fakeField1 = getFakeField();
      [ownerFarm] = await mocks.userFarmFactory({ promisedUser: [newOwner], promisedFarm: [farm] }, fakeUserFarm(1));
      [newManager] = await mocks.usersFactory();
      [managerFarm] = await mocks.userFarmFactory({
        promisedUser: [newManager],
        promisedFarm: [farm]
      }, fakeUserFarm(2));
      [newWorker] = await mocks.usersFactory();
      [workerFarm] = await mocks.userFarmFactory({ promisedUser: [newWorker], promisedFarm: [farm] }, fakeUserFarm(3));

      [unAuthorizedUser] = await mocks.usersFactory();
      [farmunAuthorizedUser] = await mocks.farmFactory();
      [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
        promisedUser: [unAuthorizedUser],
        promisedFarm: [farmunAuthorizedUser]
      }, fakeUserFarm(1));
      [unauthorizedField] = await mocks.fieldFactory({ promisedFarm: [ownerFarmunAuthorizedUser] });
      delete unauthorizedField.station_id;
      unauthorizedField.grid_points = [
        { lat: '49.2578263', lng: '-123.1939439' },
        { lat: '49.1785762', lng: '-123.2760843' },
        { lat: '49.2578263', lng: '-123.1939439' }
      ]


    })

    test('Owner should post and get valid field', async (done) => {
      postFieldRequest(fakeField, { user_id: newOwner.user_id, farm_id: ownerFarm.farm_id }, async (err, res) => {
        expect(res.status).toBe(201);
        const fields = await fieldModel.query().where('farm_id', farm.farm_id);
        expect(fields.length).toBe(1);
        expect(fields[0].field_name).toBe(fakeField.field_name);
        done();
      })
    })

    test('Manager should post and get a valid field', async (done) => {
      postFieldRequest(fakeField, { user_id: newManager.user_id, farm_id: managerFarm.farm_id }, async (err, res) => {
        expect(res.status).toBe(201);
        const fields = await fieldModel.query().where('farm_id', farm.farm_id);
        expect(fields.length).toBe(1);
        expect(fields[0].field_name).toBe(fakeField.field_name);
        done();
      })
    });

    test('Worker should not post and get a valid field', async (done) => {
      postFieldRequest(fakeField, { user_id: newWorker.user_id, farm_id: workerFarm.farm_id }, async (err, res) => {
        expect(res.status).toBe(403);
        expect(res.error.text).toBe("User does not have the following permission(s): add:fields");
        done();
      })
    });

    test('should not create field without field name', async (done) => {
      fakeField.field_name = "";
      postFieldRequest(fakeField, { user_id: newManager.user_id, farm_id: managerFarm.farm_id }, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      })
    });

    test('should not create field without field points', async (done) => {
      fakeField1.grid_points = [{}];
      postFieldRequest(fakeField1, { user_id: newManager.user_id, farm_id: managerFarm.farm_id }, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      })
    });

    test('should not create field with name and only 2 field points', async (done) => {
      postFieldRequest(fakeField1, { user_id: newManager.user_id, farm_id: managerFarm.farm_id }, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      })
    });

    test('should return 403 when unauthorized user tries to create field with name and 3 points', async (done) => {
      putFieldRequest(unauthorizedField, { user_id: unAuthorizedUser.user_id }, (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

  })

  // PUT TESTS
  describe('Put field tests', () => {
    let ownerFarm;
    let ownerField;

    let newManager;
    let managerFarm;
    let managerField;

    let newWorker;
    let workerFarm;
    let workerField;

    let unAuthorizedUser;
    let farmunAuthorizedUser;
    let ownerFarmunAuthorizedUser;
    let unauthorizedField;

    test('Owner should update field_name', async (done) => {
      [ownerFarm] = await mocks.userFarmFactory({ promisedUser: [newOwner], promisedFarm: [farm] }, fakeUserFarm(1));
      [ownerField] = await mocks.fieldFactory({ promisedFarm: [ownerFarm] });
      delete ownerField.station_id;

      ownerField.field_name = "My new field name -- owner";
      putFieldRequest(ownerField, {}, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].field_name).toBe("My new field name -- owner");
        done();
      });
    })

    test('Manager should update field_name', async (done) => {

      [newManager] = await mocks.usersFactory();
      [managerFarm] = await mocks.userFarmFactory({
        promisedUser: [newManager],
        promisedFarm: [farm]
      }, fakeUserFarm(2));
      [managerField] = await mocks.fieldFactory({ promisedFarm: [managerFarm] });
      delete managerField.station_id;

      managerField.field_name = "My new field name -- manager";

      putFieldRequest(managerField, { user_id: newManager.user_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].field_name).toBe("My new field name -- manager");
        done();
      });
    })

    test('should return 403 when a worker tries to edit field_name', async (done) => {

      [newWorker] = await mocks.usersFactory();
      [workerFarm] = await mocks.userFarmFactory({ promisedUser: [newWorker], promisedFarm: [farm] }, fakeUserFarm(3));
      [workerField] = await mocks.fieldFactory({ promisedFarm: [workerFarm] });
      delete workerField.station_id;
      workerField.field_name = "My new field name -- worker";

      putFieldRequest(workerField, { user_id: newWorker.user_id }, (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

    test('should return 403 when unauthorized user tries to edit field_name', async (done) => {
      [unAuthorizedUser] = await mocks.usersFactory();
      [farmunAuthorizedUser] = await mocks.farmFactory();
      [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
        promisedUser: [unAuthorizedUser],
        promisedFarm: [farmunAuthorizedUser]
      }, fakeUserFarm(1));
      [unauthorizedField] = await mocks.fieldFactory({ promisedFarm: [ownerFarmunAuthorizedUser] });
      delete unauthorizedField.station_id;

      unauthorizedField.field_name = "My new field name -- unauthorized";

      putFieldRequest(unauthorizedField, { user_id: unAuthorizedUser.user_id }, (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

    test('should return 403 when user changes field name to blank', async (done) => {
      [newManager] = await mocks.usersFactory();
      [managerFarm] = await mocks.userFarmFactory({
        promisedUser: [newManager],
        promisedFarm: [farm]
      }, fakeUserFarm(2));
      [managerField] = await mocks.fieldFactory({ promisedFarm: [managerFarm] });
      delete managerField.station_id;

      managerField.field_name = "";

      putFieldRequest(managerField, { user_id: newManager.user_id }, (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

  })

  // GET TESTS
  describe('Get field tests', () => {
    let ownerFarm1;
    let ownerField1;

    let workerFarm1;
    let workerField1;

    beforeEach(async () => {
      [ownerFarm1] = await mocks.userFarmFactory({ promisedUser: [newOwner], promisedFarm: [farm] }, fakeUserFarm(1));
      [ownerField1] = await mocks.fieldFactory({ promisedFarm: [ownerFarm1] });
      [managerFarm1] = await mocks.userFarmFactory({
        promisedUser: [newManager1],
        promisedFarm: [farm]
      }, fakeUserFarm(2));
      [managerField1] = await mocks.fieldFactory({ promisedFarm: [managerFarm1] });
      [workerFarm1] = await mocks.userFarmFactory({
        promisedUser: [newWorker1],
        promisedFarm: [farm]
      }, fakeUserFarm(3));
      [workerField1] = await mocks.fieldFactory({ promisedFarm: [workerFarm1] });
    });

    test('Owner should get field by farm id', async (done) => {
      getRequest({ user_id: newOwner.user_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].farm_id).toBe(ownerField1.farm_id);
        done();
      });
    })

    test('Manager should get field by farm id', async (done) => {
      getRequest({ user_id: newManager1.user_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].farm_id).toBe(managerField1.farm_id);
        done();
      });
    })

    test('Worker should get field by farm id', async (done) => {

      getRequest({ user_id: newWorker1.user_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].farm_id).toBe(workerField1.farm_id);
        done();
      });
    })

    test('Should get status 403 if an unauthorizedUser tries to get field by farm id', async (done) => {
      getRequest({ user_id: unAuthorizedUser1.user_id }, (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    })


  })

  describe('Delete field tests', () => {
    let managerUser;
    let managerFarm;
    let managerUserFarm;

    let ownerUser;
    let ownerFarm;
    let ownerUserFarm;

    let workerUser;
    let workerFarm;
    let workerUserFarm;

    let unAuthorizedUser2;
    let farmunAuthorizedUser2;
    let ownerFarmunAuthorizedUser2;


    beforeEach(async () => {
      [managerUser] = await mocks.usersFactory();
      [managerFarm] = await mocks.farmFactory();
      [managerUserFarm] = await mocks.userFarmFactory({
        promisedUser: [managerUser],
        promisedFarm: [managerFarm]
      }, fakeUserFarm(2));

      [ownerUser] = await mocks.usersFactory();
      [ownerFarm] = await mocks.farmFactory();
      [ownerUserFarm] = await mocks.userFarmFactory({
        promisedUser: [ownerUser],
        promisedFarm: [ownerFarm]
      }, fakeUserFarm(1));

      [workerUser] = await mocks.usersFactory();
      [workerFarm] = await mocks.farmFactory();
      [workerUserFarm] = await mocks.userFarmFactory({
        promisedUser: [workerUser],
        promisedFarm: [workerFarm]
      }, fakeUserFarm(3));

      [unAuthorizedUser2] = await mocks.usersFactory();
      [farmunAuthorizedUser2] = await mocks.farmFactory();
    });

    test('Manager should delete their field', async (done) => {
      let fieldToBeDeleted;
      [fieldToBeDeleted] = await mocks.fieldFactory({ promisedFarm: [managerFarm] });
      deleteRequest(fieldToBeDeleted, {
        user_id: managerUser.user_id,
        farm_id: managerFarm.farm_id
      }, async (err, res) => {
        expect(res.status).toBe(200);
        const [deletedField] = await fieldModel.query().where('field_id', fieldToBeDeleted.field_id);
        expect(deletedField.deleted).toBe(true);
        done();
      });
    })

    test('Owner should delete their field', async (done) => {
      let fieldToBeDeleted;
      [fieldToBeDeleted] = await mocks.fieldFactory({ promisedFarm: [ownerFarm] });
      deleteRequest(fieldToBeDeleted, { user_id: ownerUser.user_id, farm_id: ownerFarm.farm_id }, async (err, res) => {
        expect(res.status).toBe(200);
        const [deletedField] = await fieldModel.query().where('field_id', fieldToBeDeleted.field_id);
        expect(deletedField.deleted).toBe(true);
        done();
      });
    })

    test('should return 403 if a worker tries to delete a field', async (done) => {
      let fieldToBeDeleted;
      [fieldToBeDeleted] = await mocks.fieldFactory({ promisedFarm: [workerFarm] });
      deleteRequest(fieldToBeDeleted, {
        user_id: workerUser.user_id,
        farm_id: workerFarm.farm_id
      }, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    })

    test('should return 403 if unauthorized user tries to delete a field', async (done) => {
      let fieldToBeDeleted;
      [fieldToBeDeleted] = await mocks.fieldFactory({ promisedFarm: [farmunAuthorizedUser2] });
      deleteRequest(fieldToBeDeleted, {
        user_id: unAuthorizedUser2.user_id,
        farm_id: farmunAuthorizedUser2.farm_id
      }, async (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    })


  })
})
