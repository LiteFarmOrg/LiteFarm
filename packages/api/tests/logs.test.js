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
const Knex = require('knex')
const environment = 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks = require('./mock.factories');
const {tableCleanup} = require('./testEnvironment')

const fertilizerLogModel = require('../src/models/fertilizerLogModel');
const pestControlLogModel = require('../src/models/pestControlLogModel');
const scoutingLogModel = require('../src/models/scoutingLogModel');
const irrigationLogModel = require('../src/models/irrigationLogModel');
const fieldWorkLogModel = require('../src/models/fieldWorkLogModel');
const soilDataLogModel = require('../src/models/soilDataLogModel');
const seedLogModel = require('../src/models/seedLogModel');
const harvestLogModel = require('../src/models/harvestLogModel');
const activityLogModel = require('../src/models/activityLogModel');
const activityFieldsModel = require('../src/models/activityFieldsModel');
const activityCropsModel = require('../src/models/activityCropsModel');
const fertilizerModel = require('../src/models/fertilizerModel');
const {logServices} = require('../src/controllers/logController');
const fieldModel = require('../src/models/fieldModel');
const fieldCropModel = require('../src/models/fieldCropModel');


describe('Log Tests', () => {
  let middleware;
  let owner;
  let farm;

  beforeAll(() => {
    token = global.token;
  });

  function postRequest(data, {user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).post(`/log`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getRequest({user_id = owner.user_id, farm_id = farm.farm_id, url = `/log/farm/${farm.farm_id}`}, callback) {
    chai.request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function getRequestWithBody({user_id = owner.user_id, farm_id = farm.farm_id, url = `/log/farm/${farm.farm_id}`, body = {farm_id: farm.farm_id}}, callback) {
    chai.request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(body)
      .end(callback)
  }

  function deleteRequest({user_id = owner.user_id, farm_id = farm.farm_id, activity_id: activity_id}, callback) {
    chai.request(server).delete(`/log/${activity_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function deleteRequestWithBody({user_id = owner.user_id, farm_id = farm.farm_id, activity_id: activity_id, body = {farm_id: farm.farm_id}}, callback) {
    chai.request(server).delete(`/log/${activity_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(body)
      .end(callback)
  }

  function putRequest(data, {user_id = owner.user_id, farm_id = farm.farm_id, activity_id}, callback) {
    chai.request(server).put(`/log/${activity_id ? activity_id : data.activity_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback)
  }

  function fakeUserFarm(role = 1) {
    return ({...mocks.fakeUserFarm(), role_id: role});
  }

  function newFakeActivityLog(activity_kind, user_id = owner.user_id) {
    const activityLog = mocks.fakeActivityLog();
    return ({...activityLog, user_id, activity_kind});
  }

  beforeEach(async () => {
    await tableCleanup(knex);
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({promisedUser: [owner], promisedFarm: [farm]}, fakeUserFarm(1));

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next()
    });
  })

  afterAll(async () => {
    // await tableCleanup(knex);
  });

  describe('Get && delete && put logs tests', () => {

    describe('FertilizerLog tests', () => {
      let fertilizerLog;
      let activityLog;
      let activityCropLog;
      let activityFieldLog;
      let crop;
      let field;
      let fieldCrop;
      let fertilizer;
      beforeEach(async () => {
        [fertilizer] = await mocks.fertilizerFactory({promisedFarm: [farm]});
        [crop] = await mocks.cropFactory({promisedFarm: [farm]});
        [field] = await mocks.fieldFactory({promisedFarm: [farm]});
        [fieldCrop] = await mocks.fieldCropFactory({promisedCrop: [crop], promisedField: [field]});
        [activityLog] = await mocks.activityLogFactory({promisedUser: [owner]}, {
          ...mocks.fakeActivityLog(),
          activity_kind: 'fertilizing'
        });
        [fertilizerLog] = await mocks.fertilizerLogFactory({
          promisedActivityLog: [activityLog],
          promisedFertilizer: [fertilizer]
        });
        [activityCropLog] = await mocks.activityCropsLogFactory({
          promisedActivityLog: [activityLog],
          promisedFieldCrop: [fieldCrop]
        });
        [activityFieldLog] = await mocks.activityFieldLogFactory({
          promisedActivityLog: [activityLog],
          promisedField: [field]
        });
      })


      describe('Get fertilizerLog tests', () => {


        test('Get by activity_id by test', async (done) => {
          getRequest({user_id: owner.user_id, url: `/log/${activityLog.activity_id}`}, (err, res) => {
            console.log(res.error, res.body);
            expect(res.status).toBe(200);
            expect(res.body.fertilizerLog.fertilizer_id).toBe(fertilizer.fertilizer_id);
            done();
          });
        })

        test('Should get status 403 if activity_log is deleted', async (done) => {
          await activityLogModel.query().findById(activityLog.activity_id).del();
          getRequest({user_id: owner.user_id, url: `/log/${activityLog.activity_id}`}, (err, res) => {
            console.log(res.error, res.body);
            expect(res.status).toBe(404);
            done();
          });
        })

        test('Get by farm_id should filter out deleted activity logs', async (done) => {
          await activityLogModel.query().findById(activityLog.activity_id).del();
          getRequest({user_id: owner.user_id}, (err, res) => {
            console.log(res.error, res.body);
            expect(res.status).toBe(200);
            expect(Object.keys(res.body[0]).length).toBe(0);
            done();
          });
        })

        test('Get by farm_id', async (done) => {
          let [activityLog1] = await mocks.activityLogFactory({promisedUser: [owner]}, {
            ...mocks.fakeActivityLog(),
            activity_kind: 'fertilizing'
          });
          let [fertilizerLog1] = await mocks.fertilizerLogFactory({
            promisedActivityLog: [activityLog1],
            promisedFertilizer: [fertilizer]
          });
          let [activityCropLog1] = await mocks.activityCropsLogFactory({
            promisedActivityLog: [activityLog1],
            promisedFieldCrop: [fieldCrop]
          });
          let [activityFieldLog1] = await mocks.activityFieldLogFactory({
            promisedActivityLog: [activityLog1],
            promisedField: [field]
          });
          getRequest({user_id: owner.user_id}, (err, res) => {
            console.log(res.error, res.body);
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].fertilizerLog.fertilizer_id).toBe(fertilizer.fertilizer_id);
            expect(res.body[0].fieldCrop[0].field_crop_id).toBe(fieldCrop.field_crop_id);
            expect(res.body[0].field[0].field_id).toBe(field.field_id);
            done();
          });
        })

        test('Should get fieldCrop/fertilizer/field through fertilizingLog even if those items are deleted', async (done) => {
          let [activityLog1] = await mocks.activityLogFactory({promisedUser: [owner]}, {
            ...mocks.fakeActivityLog(),
            activity_kind: 'fertilizing'
          });
          let [fertilizerLog1] = await mocks.fertilizerLogFactory({
            promisedActivityLog: [activityLog1],
            promisedFertilizer: [fertilizer]
          });
          let [activityCropLog1] = await mocks.activityCropsLogFactory({
            promisedActivityLog: [activityLog1],
            promisedFieldCrop: [fieldCrop]
          });
          let [activityFieldLog1] = await mocks.activityFieldLogFactory({
            promisedActivityLog: [activityLog1],
            promisedField: [field]
          });
          await fertilizerModel.query().findById(fertilizer.fertilizer_id).del();
          await fieldCropModel.query().findById(fieldCrop.field_crop_id).del();
          await fieldModel.query().findById(field.field_id).del();
          getRequest({user_id: owner.user_id}, (err, res) => {
            console.log(res.error, res.body);
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].fertilizerLog.fertilizer_id).toBe(fertilizer.fertilizer_id);
            expect(res.body[0].fieldCrop[0].field_crop_id).toBe(fieldCrop.field_crop_id);
            expect(res.body[0].field[0].field_id).toBe(field.field_id);
            done();
          });
        })

        describe('Get activityLog authorization tests', () => {
          let newWorker;
          let worker;
          let unAuthorizedUser;
          let farmunAuthorizedUser;

          beforeEach(async () => {
            [newWorker] = await mocks.usersFactory();
            const [workerFarm] = await mocks.userFarmFactory({
              promisedUser: [newWorker],
              promisedFarm: [farm]
            }, fakeUserFarm(3));
            [worker] = await mocks.usersFactory();
            const [managerFarm] = await mocks.userFarmFactory({
              promisedUser: [worker],
              promisedFarm: [farm]
            }, fakeUserFarm(2));


            [unAuthorizedUser] = await mocks.usersFactory();
            [farmunAuthorizedUser] = await mocks.farmFactory();
            const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
              promisedUser: [unAuthorizedUser],
              promisedFarm: [farmunAuthorizedUser]
            }, fakeUserFarm(1));
          })


          test('Owner should get by farm_id', async (done) => {
            getRequest({user_id: owner.user_id}, (err, res) => {
              console.log(res.error, res.body);
              expect(res.status).toBe(200);
              expect(res.body.length).toBe(1);
              expect(res.body[0].fertilizerLog.fertilizer_id).toBe(fertilizer.fertilizer_id);
              expect(res.body[0].fieldCrop[0].field_crop_id).toBe(fieldCrop.field_crop_id);
              expect(res.body[0].field[0].field_id).toBe(field.field_id);
              done();
            });
          })

          test('Manager should get by farm_id', async (done) => {
            getRequest({user_id: worker.user_id}, (err, res) => {
              console.log(res.error, res.body);
              expect(res.status).toBe(200);
              expect(res.body.length).toBe(1);
              expect(res.body[0].fertilizerLog.fertilizer_id).toBe(fertilizer.fertilizer_id);
              expect(res.body[0].fieldCrop[0].field_crop_id).toBe(fieldCrop.field_crop_id);
              expect(res.body[0].field[0].field_id).toBe(field.field_id);
              done();
            });
          })

          test('Worker should get by farm_id', async (done) => {
            getRequest({user_id: worker.user_id}, (err, res) => {
              console.log(res.error, res.body);
              expect(res.status).toBe(200);
              expect(res.body.length).toBe(1);
              expect(res.body[0].fertilizerLog.fertilizer_id).toBe(fertilizer.fertilizer_id);
              expect(res.body[0].fieldCrop[0].field_crop_id).toBe(fieldCrop.field_crop_id);
              expect(res.body[0].field[0].field_id).toBe(field.field_id);
              done();
            });
          })

          test('Should get status 403 when unauthorized user try to get log by farm_id', async (done) => {
            getRequest({user_id: unAuthorizedUser.user_id}, (err, res) => {
              console.log(res.error, res.body);
              expect(res.status).toBe(403);
              done();
            });
          })

          test('Circumvent authorization by modifying farm_id', async (done) => {
            getRequest({user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id}, (err, res) => {
              console.log(res.error, res.body);
              expect(res.status).toBe(403);
              done();
            });
          })

          test('Circumvent authorization by modifying farm_id in body', async (done) => {
            getRequestWithBody({
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              body: {farm_id: farmunAuthorizedUser.farm_id}
            }, (err, res) => {
              console.log(res.error, res.body);
              expect(res.status).toBe(400);
              done();
            });
          })

          test('Should get status 403 when unauthorized user try to get log by activity_id', async (done) => {
            getRequest({user_id: unAuthorizedUser.user_id, url: `/log/${activityLog.activity_id}`}, (err, res) => {
              console.log(res.error, res.body);
              expect(res.status).toBe(403);
              done();
            });
          })

          test('Circumvent authorization by modifying activity_id in header', async (done) => {
            getRequest({
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              url: `/log/${activityLog.activity_id}`
            }, (err, res) => {
              console.log(res.error, res.body);
              expect(res.status).toBe(403);
              done();
            });
          })

          test('Circumvent authorization by modifying activity_id in body', async (done) => {
            getRequestWithBody({
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              url: `/log/${activityLog.activity_id}`,
              body: {farm_id: farmunAuthorizedUser.farm_id}
            }, (err, res) => {
              console.log(res.error, res.body);
              expect(res.status).toBe(400);
              done();
            });
          })

        })


      })


      describe('Delete fertilizerLog tests', () => {
        describe('Delete activityLog authorization tests', () => {
          let newWorker;
          let manager;
          let unAuthorizedUser;
          let farmunAuthorizedUser;

          beforeEach(async () => {
            [newWorker] = await mocks.usersFactory();
            const [workerFarm] = await mocks.userFarmFactory({
              promisedUser: [newWorker],
              promisedFarm: [farm]
            }, fakeUserFarm(3));
            [manager] = await mocks.usersFactory();
            const [managerFarm] = await mocks.userFarmFactory({
              promisedUser: [manager],
              promisedFarm: [farm]
            }, fakeUserFarm(2));


            [unAuthorizedUser] = await mocks.usersFactory();
            [farmunAuthorizedUser] = await mocks.farmFactory();
            const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
              promisedUser: [unAuthorizedUser],
              promisedFarm: [farmunAuthorizedUser]
            }, fakeUserFarm(1));
          })

          test('Owner should delete a activityLog', async (done) => {
            deleteRequest({activity_id: activityLog.activity_id}, async (err, res) => {
              console.log(activityLog.deleted, res.error);
              expect(res.status).toBe(200);
              const activityLogRes = await activityLogModel.query().where('activity_id', activityLog.activity_id);
              expect(activityLogRes.length).toBe(1);
              expect(activityLogRes[0].deleted).toBe(true);
              done();
            })
          });

          test('Manager should delete a activityLog', async (done) => {
            deleteRequest({user_id: manager.user_id, activity_id: activityLog.activity_id}, async (err, res) => {
              console.log(activityLog.deleted, res.error);
              expect(res.status).toBe(200);
              const activityLogRes = await activityLogModel.query().where('activity_id', activityLog.activity_id);
              expect(activityLogRes.length).toBe(1);
              expect(activityLogRes[0].deleted).toBe(true);
              done();
            })
          });

          test('should return 403 if an unauthorized user tries to delete a activityLog', async (done) => {
            deleteRequest({
              user_id: unAuthorizedUser.user_id,
              activity_id: activityLog.activity_id
            }, async (err, res) => {
              console.log(activityLog.deleted, res.error);
              expect(res.status).toBe(403);
              done();
            })
          });

          test('should return 403 if a worker tries to delete a activityLog', async (done) => {
            deleteRequest({user_id: newWorker.user_id, activity_id: activityLog.activity_id}, async (err, res) => {
              console.log(activityLog.deleted, res.error);
              expect(res.status).toBe(403);
              done();
            })
          });

          test('Circumvent authorization by modifying farm_id', async (done) => {
            deleteRequest({
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: activityLog.activity_id
            }, async (err, res) => {
              console.log(activityLog.deleted, res.error);
              expect(res.status).toBe(403);
              done();
            })
          })

          test('Circumvent authorization by modifying farm_id in body', async (done) => {
            deleteRequestWithBody({
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: activityLog.activity_id,
              body: {farm_id: farmunAuthorizedUser.farm_id}
            }, async (err, res) => {
              console.log(activityLog.deleted, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });
        })


      })


      describe('Put fertilizerLog tests', () => {
        let sampleRequestBody;
        let fakeActivityLog;
        let fakefertilizingLog;
        beforeEach(async () => {
          fakeActivityLog = mocks.fakeActivityLog();
          fakefertilizingLog = mocks.fakeFertilizerLog();
          sampleRequestBody = {
            activity_id: activityLog.activity_id,
            activity_kind: activityLog.activity_kind,
            date: fakeActivityLog.date,
            user_id: fakeActivityLog.user_id,
            notes: fakeActivityLog.notes,
            quantity_kg: fakefertilizingLog.quantity_kg,
            crops: [{field_crop_id: fieldCrop.field_crop_id}],
            fields: [{field_id: field.field_id}],
            fertilizer_id: fertilizer.fertilizer_id
          }
        })

        describe('Put fertilizerLog tests with multiple field_crop and field', () => {
          let fakefertilizingLog;
          let fakeActivityLog;
          let fertilizer1;
          let crop1;
          let field1;
          let fieldCrop1;
          let sampleRequestBody;
          beforeEach(async () => {
            fakeActivityLog = newFakeActivityLog('fertilizing');
            fakefertilizingLog = mocks.fakeFertilizerLog();
            [fertilizer1] = await mocks.fertilizerFactory({promisedFarm: [farm]});
            [crop1] = await mocks.cropFactory({promisedFarm: [farm]});
            [field1] = await mocks.fieldFactory({promisedFarm: [farm]});
            [fieldCrop1] = await mocks.fieldCropFactory({promisedCrop: [crop1], promisedField: [field1]});

            sampleRequestBody = {
              activity_id: activityLog.activity_id,
              activity_kind: activityLog.activity_kind,
              date: fakeActivityLog.date,
              user_id: fakeActivityLog.user_id,
              notes: fakeActivityLog.notes,
              quantity_kg: fakefertilizingLog.quantity_kg,
              crops: [{field_crop_id: fieldCrop.field_crop_id}, {field_crop_id: fieldCrop1.field_crop_id}],
              fields: [{field_id: field.field_id}, {field_id: field1.field_id}],
              fertilizer_id: fertilizer1.fertilizer_id
            }
          });

          test('Owner should put fertilizerLog tests with multiple field_crop and field', async (done) => {
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().where('user_id', owner.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
              const fertilizerLog = await fertilizerLogModel.query().where('activity_id', activityLog[0].activity_id);
              expect(fertilizerLog.length).toBe(1);
              expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer1.fertilizer_id);
              const activityFieldLog = await activityFieldsModel.query().where('activity_id', activityLog[0].activity_id);
              expect(activityFieldLog.length).toBe(2);
              expect(activityFieldLog[1].field_id).toBe(field1.field_id);
              const activityCrops = await activityCropsModel.query().where('activity_id', activityLog[0].activity_id);
              expect(activityCrops.length).toBe(2);
              expect(activityCrops[1].field_crop_id).toBe(fieldCrop1.field_crop_id);
              done();
            })
          });

          test('Should return 400 if field_crops reference a field that is not in fields array', async (done) => {
            sampleRequestBody.field = [sampleRequestBody.fields[0]]
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

          test('Should return 400 if field reference a field that is not in crop array', async (done) => {
            sampleRequestBody.crops = [sampleRequestBody.crops[0]]
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

        })


        describe('Put fertilizerLog tests with fertilizer/field/field_crop referencing different farms', () => {
          let fakefertilizingLog;
          let fakeActivityLog;
          let fertilizer1;
          let crop1;
          let field1;
          let fieldCrop1;
          let sampleRequestBody;
          let newFarm;
          let newUserFarm;
          beforeEach(async () => {
            [newFarm] = await mocks.farmFactory();
            [newUserFarm] = await mocks.userFarmFactory({promisedUser: [owner], promisedFarm: [newFarm]})
            fakeActivityLog = newFakeActivityLog('fertilizing');
            fakefertilizingLog = mocks.fakeFertilizerLog();
            [fertilizer1] = await mocks.fertilizerFactory({promisedFarm: [newFarm]});
            [crop1] = await mocks.cropFactory({promisedFarm: [newFarm]});
            [field1] = await mocks.fieldFactory({promisedFarm: [newFarm]});
            [fieldCrop1] = await mocks.fieldCropFactory({promisedCrop: [crop1], promisedField: [field1]});

            sampleRequestBody = {
              activity_id: activityLog.activity_id,
              activity_kind: activityLog.activity_kind,
              date: fakeActivityLog.date,
              user_id: fakeActivityLog.user_id,
              notes: fakeActivityLog.notes,
              quantity_kg: fakefertilizingLog.quantity_kg,
              crops: [{field_crop_id: fieldCrop.field_crop_id}],
              fields: [{field_id: field.field_id}],
              fertilizer_id: fertilizer.fertilizer_id
            }
          });

          test('Should return 400 if fertilizer references a new farm', async (done) => {
            sampleRequestBody.fertilizer_id = fertilizer1.fertilizer_id;
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

          test('Should return 400 if field_crop references a new farm', async (done) => {
            sampleRequestBody.crops = [sampleRequestBody.crops[0], {field_crop_id: fieldCrop1.field_crop_id}];
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

          test('Should return 400 if field references a new farm', async (done) => {
            sampleRequestBody.fields = [sampleRequestBody.fields[0], {field_id: field1.field_id}];
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

          test('Should return 400 if field, fieldCrop, and fertilizer reference a new farm', async (done) => {
            sampleRequestBody.fields = [{field_id: field1.field_id}];
            sampleRequestBody.crops = [{field_crop_id: fieldCrop1.field_crop_id}];
            sampleRequestBody.fertilizer_id = fertilizer1.fertilizer_id;
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

          test('Should return 400 if field and fieldCrop reference 2 farms', async (done) => {
            sampleRequestBody.crops = [sampleRequestBody.crops[0], {field_crop_id: fieldCrop1.field_crop_id}];
            sampleRequestBody.fields = [sampleRequestBody.fields[0], {field_id: field1.field_id}];
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

        })


        describe('Put fertilizerLog authorization tests', () => {
          let worker;
          let manager;
          let unAuthorizedUser;
          let farmunAuthorizedUser;

          let unauthorizedFertilizerLog;
          let unauthorizedActivityLog;
          let unauthorizedActivityCropLog;
          let unauthorizedActivityFieldLog;
          let unauthorizedCrop;
          let unauthorizedField;
          let unauthorizedFieldCrop;
          let unauthorizedFertilizer;

          beforeEach(async () => {
            [worker] = await mocks.usersFactory();
            const [workerFarm] = await mocks.userFarmFactory({
              promisedUser: [worker],
              promisedFarm: [farm]
            }, fakeUserFarm(3));
            [manager] = await mocks.usersFactory();
            const [managerFarm] = await mocks.userFarmFactory({
              promisedUser: [manager],
              promisedFarm: [farm]
            }, fakeUserFarm(2));


            [unAuthorizedUser] = await mocks.usersFactory();
            [farmunAuthorizedUser] = await mocks.farmFactory();
            const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
              promisedUser: [unAuthorizedUser],
              promisedFarm: [farmunAuthorizedUser]
            }, fakeUserFarm(1));

            [unauthorizedFertilizer] = await mocks.fertilizerFactory({promisedFarm: [farmunAuthorizedUser]});
            [unauthorizedCrop] = await mocks.cropFactory({promisedFarm: [farmunAuthorizedUser]});
            [unauthorizedField] = await mocks.fieldFactory({promisedFarm: [farmunAuthorizedUser]});
            [unauthorizedFieldCrop] = await mocks.fieldCropFactory({
              promisedCrop: [unauthorizedCrop],
              promisedField: [unauthorizedField]
            });
            [unauthorizedActivityLog] = await mocks.activityLogFactory({promisedUser: [unAuthorizedUser]}, {
              ...mocks.fakeActivityLog(),
              activity_kind: 'fertilizing'
            });
            [unauthorizedFertilizerLog] = await mocks.fertilizerLogFactory({
              promisedActivityLog: [unauthorizedActivityLog],
              promisedFertilizer: [unauthorizedFertilizer]
            });
            [unauthorizedActivityCropLog] = await mocks.activityCropsLogFactory({
              promisedActivityLog: [unauthorizedActivityLog],
              promisedFieldCrop: [unauthorizedFieldCrop]
            });
            [unauthorizedActivityFieldLog] = await mocks.activityFieldLogFactory({
              promisedActivityLog: [unauthorizedActivityLog],
              promisedField: [unauthorizedField]
            });

          })

          test('Owner should edit a fertilizerLog', async (done) => {
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().where('user_id', owner.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
              const fertilizerLog = await fertilizerLogModel.query().where('activity_id', activityLog[0].activity_id);
              expect(fertilizerLog.length).toBe(1);
              expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
              done();
            })
          });

          test('Manager should edit a fertilizerLog', async (done) => {
            putRequest(sampleRequestBody, {user_id: manager.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().where('user_id', owner.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
              const fertilizerLog = await fertilizerLogModel.query().where('activity_id', activityLog[0].activity_id);
              expect(fertilizerLog.length).toBe(1);
              expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
              done();
            })
          });

          test('Worker should edit a fertilizerLog', async (done) => {
            putRequest(sampleRequestBody, {user_id: worker.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().where('user_id', owner.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
              const fertilizerLog = await fertilizerLogModel.query().where('activity_id', activityLog[0].activity_id);
              expect(fertilizerLog.length).toBe(1);
              expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
              done();
            })
          });

          test('should return 403 if an unauthorized user tries to edit a fertilizingLog', async (done) => {
            putRequest(sampleRequestBody, {user_id: unAuthorizedUser.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(403);
              done();
            })
          });

          test('Circumvent authorization by modifying farm_id in header', async (done) => {
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: activityLog.activity_id
            }, async (err, res) => {
              console.log(activityLog.deleted, res.error);
              expect(res.status).toBe(403);
              done();
            })
          });

          test('Circumvent authorization by modifying farm_id in body and header', async (done) => {
            sampleRequestBody.farm_id = farmunAuthorizedUser.farm_id;
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: activityLog.activity_id
            }, async (err, res) => {
              console.log(activityLog.deleted, res.error);
              expect(res.status).toBe(403);
              done();
            })
          });

          test('Circumvent authorization by modifying farm_id, field_id, field_crop_id in body', async (done) => {
            sampleRequestBody.farm_id = farmunAuthorizedUser.farm_id;
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: activityLog.activity_id
            }, async (err, res) => {
              console.log(activityLog.deleted, res.error);
              expect(res.status).toBe(403);
              done();
            })
          });

          test('Circumvent authorization by modifying activity_id in body', async (done) => {
            sampleRequestBody.activity_id = unauthorizedActivityLog.activity_id;
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: activityLog.activity_id
            }, async (err, res) => {
              console.log(activityLog.deleted, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

          test('Circumvent authorization by modifying activity_id/field_crop_id/field_id/fertilizer_id in body', async (done) => {
            sampleRequestBody.activity_id = unauthorizedActivityLog.activity_id;
            sampleRequestBody.fields = [{field_id: unauthorizedField.field_id}];
            sampleRequestBody.crops = [{field_crop_id: unauthorizedFieldCrop.field_crop_id}];
            sampleRequestBody.fertilizer_id = unauthorizedFertilizer.fertilizer_id;
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: activityLog.activity_id
            }, async (err, res) => {
              console.log(activityLog.deleted, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

          test('Should return 400 if fields, fieldCrops, and fertilizer reference a farm that the user does not have access to', async (done) => {
            sampleRequestBody.activity_id = unauthorizedActivityLog.activity_id;
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: unauthorizedActivityLog.activity_id
            }, async (err, res) => {
              console.log(activityLog.deleted, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

          test('Should return 400 if activity_id is set to an id that already exists', async (done) => {
            sampleRequestBody.activity_id = activityLog.activity_id;
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: unauthorizedActivityLog.activity_id
            }, async (err, res) => {
              console.log(activityLog.deleted, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

        })


      })

    })


  })


  describe('Post log', () => {

    let fakepestControlLog;
    let fakescoutingLog;
    let fakeirrigationLog;
    let fakeharvestLog;
    let fakeseedingLog;
    let fakefieldWorkLog;
    let fakeweatherDataLog;
    let fakesoilDataLog;
    let fakeotherLog;
    let fakeActivityLog;
    beforeEach(async () => {

    })

    describe('Post fertilizerLog', () => {
      let fakefertilizingLog;
      let fakeActivityLog;
      let fertilizer;
      let crop1;
      let field1;
      let fieldCrop1;
      let sampleRequestBody;
      beforeEach(async () => {
        fakeActivityLog = newFakeActivityLog('fertilizing');
        fakefertilizingLog = mocks.fakeFertilizerLog();
        [fertilizer] = await mocks.fertilizerFactory({promisedFarm: [farm]});
        [crop1] = await mocks.cropFactory({promisedFarm: [farm]});
        [field1] = await mocks.fieldFactory({promisedFarm: [farm]});
        [fieldCrop1] = await mocks.fieldCropFactory({promisedCrop: [crop1], promisedField: [field1]});

        sampleRequestBody = {
          activity_kind: fakeActivityLog.activity_kind,
          date: fakeActivityLog.date,
          user_id: fakeActivityLog.user_id,
          notes: fakeActivityLog.notes,
          quantity_kg: fakefertilizingLog.quantity_kg,
          crops: [{field_crop_id: fieldCrop1.field_crop_id}],
          fields: [{field_id: field1.field_id}],
          fertilizer_id: fertilizer.fertilizer_id
        }
      })

      test('Owner should post and get a valid fertilizingLog', async (done) => {
        postRequest(sampleRequestBody, {}, async (err, res) => {
          console.log(fakefertilizingLog, res.error);
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const fertilizerLog = await fertilizerLogModel.query().where('activity_id', activityLog[0].activity_id);
          expect(fertilizerLog.length).toBe(1);
          expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
          done();
        })
      });

      test('Owner should post and get many valid fertilizingLogs', async (done) => {
        let [crop2] = await mocks.cropFactory({promisedFarm: [farm]});
        let [field2] = await mocks.fieldFactory({promisedFarm: [farm]});
        let [fieldCrop2] = await mocks.fieldCropFactory({promisedCrop: [crop2], promisedField: [field1]});
        let [fieldCrop3] = await mocks.fieldCropFactory({promisedCrop: [crop2], promisedField: [field2]});
        sampleRequestBody.fields = [{field_id: field1.field_id}, {field_id: field2.field_id}];
        sampleRequestBody.crops = [{field_crop_id: fieldCrop1.field_crop_id}, {field_crop_id: fieldCrop2.field_crop_id}, {field_crop_id: fieldCrop3.field_crop_id}]
        postRequest(sampleRequestBody, {}, async (err, res) => {
          console.log(fakefertilizingLog, res.error);
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const fertilizerLog = await fertilizerLogModel.query().where('activity_id', activityLog[0].activity_id);
          expect(fertilizerLog.length).toBe(1);
          expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
          done();
        })
      });

      describe('Post log authorization tests', () => {

        let workder;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
          [workder] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory({
            promisedUser: [workder],
            promisedFarm: [farm]
          }, fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory({
            promisedUser: [manager],
            promisedFarm: [farm]
          }, fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser]
          }, fakeUserFarm(1));
        })

        test('Manager should post and get a valid fertilizingLog', async (done) => {
          postRequest(sampleRequestBody, {user_id: manager.user_id}, async (err, res) => {
            console.log(fakefertilizingLog, res.error);
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().where('user_id', owner.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const fertilizerLog = await fertilizerLogModel.query().where('activity_id', activityLog[0].activity_id);
            expect(fertilizerLog.length).toBe(1);
            expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
            done();
          })
        });

        test('Worker should post and get a valid fertilizingLog', async (done) => {
          postRequest(sampleRequestBody, {user_id: workder.user_id}, async (err, res) => {
            console.log(fakefertilizingLog, res.error);
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().where('user_id', owner.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const fertilizerLog = await fertilizerLogModel.query().where('activity_id', activityLog[0].activity_id);
            expect(fertilizerLog.length).toBe(1);
            expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
            done();
          })
        });

        test('should return 403 status if fertilizingLog is posted by unauthorized user', async (done) => {
          postRequest(sampleRequestBody, {user_id: unAuthorizedUser.user_id}, async (err, res) => {
            console.log(fakefertilizingLog, res.error);
            expect(res.status).toBe(403);
            done();
          })
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          postRequest(sampleRequestBody, {
            user_id: workder.user_id,
            farm_id: farmunAuthorizedUser.farm_id
          }, async (err, res) => {
            console.log(fakefertilizingLog, res.error);
            expect(res.status).toBe(403);
            done();
          })
        });

        test('Circumvent authorization by modifying farm_id in body', async (done) => {
          sampleRequestBody.farm_id = farmunAuthorizedUser.farm_id;
          postRequest(sampleRequestBody, {
            user_id: workder.user_id,
            farm_id: farmunAuthorizedUser.farm_id
          }, async (err, res) => {
            console.log(fakefertilizingLog, res.error);
            expect(res.status).toBe(403);
            done();
          })
        });

      })


    });
  });
});
