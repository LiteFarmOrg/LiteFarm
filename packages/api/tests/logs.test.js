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
const environment = 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks = require('./mock.factories');
const {tableCleanup} = require('./testEnvironment')

const activityCropsModel = require('../src/models/activityCropsModel');
const fertilizerLogModel = require('../src/models/fertilizerLogModel');
const pestControlLogModel = require('../src/models/pestControlLogModel');
const scoutingLogModel = require('../src/models/scoutingLogModel');
const irrigationLogModel = require('../src/models/irrigationLogModel');
const fieldWorkLogModel = require('../src/models/fieldWorkLogModel');
const soilDataLogModel = require('../src/models/soilDataLogModel');
const seedLogModel = require('../src/models/seedLogModel');
const harvestLogModel = require('../src/models/harvestLogModel');
const activityLogModel = require('../src/models/activityLogModel');
const fertilizerModel = require('../src/models/fertilizerModel');
const {logServices} = require('../src/controllers/logController');
const fieldModel = require('../src/models/fieldModel');
const fieldCropModel = require('../src/models/fieldCropModel');


describe('taskType Tests', () => {
  let middleware;
  let newOwner;
  let farm;

  beforeAll(() => {
    token = global.token;
  });

  function postRequest(data, {user_id = newOwner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).post(`/log`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getRequest({user_id = newOwner.user_id, farm_id = farm.farm_id, url = `/log/farm/${farm.farm_id}`}, callback) {
    chai.request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function deleteRequest({user_id = newOwner.user_id, farm_id = farm.farm_id, activity_id: activity_id}, callback) {
    chai.request(server).delete(`/log/${activity_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function fakeUserFarm(role = 1) {
    return ({...mocks.fakeUserFarm(), role_id: role});
  }

  function newFakeActivityLog(activity_kind, user_id = newOwner.user_id) {
    const activityLog = mocks.fakeActivityLog();
    return ({...activityLog, user_id, activity_kind});
  }

  beforeEach(async () => {
    // await tableCleanup(knex);
    [newOwner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({promisedUser: [newOwner], promisedFarm: [farm]}, fakeUserFarm(1));

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next()
    });
  })

  afterAll(async () => {
    await tableCleanup(knex);
  });

  describe('Get && delete logs tests', () => {
    describe('Get fertilizerLog tests', () => {
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
        [activityLog] = await mocks.activityLogFactory({promisedUser: [newOwner]}, {
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

      test('Get by activity_id by test', async (done) => {
        getRequest({user_id: newOwner.user_id, url: `/log/${activityLog.activity_id}`}, (err, res) => {
          console.log(res.error, res.body);
          expect(res.status).toBe(200);
          expect(res.body.fertilizerLog.fertilizer_id).toBe(fertilizer.fertilizer_id);
          done();
        });
      })

      test('Should get status 403 if activity_log is deleted', async (done) => {
        await activityLogModel.query().findById(activityLog.activity_id).del();
        getRequest({user_id: newOwner.user_id, url: `/log/${activityLog.activity_id}`}, (err, res) => {
          console.log(res.error, res.body);
          expect(res.status).toBe(404);
          done();
        });
      })

      test('Get by farm_id should filter out deleted activity logs', async (done) => {
        await activityLogModel.query().findById(activityLog.activity_id).del();
        getRequest({user_id: newOwner.user_id}, (err, res) => {
          console.log(res.error, res.body);
          expect(res.status).toBe(200);
          expect(Object.keys(res.body[0]).length).toBe(0);
          done();
        });
      })

      test('Get by farm_id', async (done) => {
        [activityLog] = await mocks.activityLogFactory({promisedUser: [newOwner]}, {
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
        getRequest({user_id: newOwner.user_id}, (err, res) => {
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
        [activityLog] = await mocks.activityLogFactory({promisedUser: [newOwner]}, {
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
        await fertilizerModel.query().findById(fertilizer.fertilizer_id).del();
        await fieldCropModel.query().findById(fieldCrop.field_crop_id).del();
        await fieldModel.query().findById(field.field_id).del();
        getRequest({user_id: newOwner.user_id}, (err, res) => {
          console.log(res.error, res.body);
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(2);
          expect(res.body[0].fertilizerLog.fertilizer_id).toBe(fertilizer.fertilizer_id);
          expect(res.body[0].fieldCrop[0].field_crop_id).toBe(fieldCrop.field_crop_id);
          expect(res.body[0].field[0].field_id).toBe(field.field_id);
          done();
        });
      })
    })

    describe('Get fieldCrop authorization tests', () => {
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

      test('Owner should get taskType by farm id', async (done) => {
        getRequest({user_id: newOwner.user_id}, (err, res) => {
          console.log(res.error, res.body);
          expect(res.status).toBe(200);
          expect(res.body[0].activity_id).toBe(taskType.activity_id);
          done();
        });
      })

      test('Manager should get taskType by farm id', async (done) => {
        getRequest({user_id: manager.user_id}, (err, res) => {
          console.log(res.error, res.body);
          expect(res.status).toBe(200);
          expect(res.body[0].activity_id).toBe(taskType.activity_id);
          done();
        });
      })

      test('Worker should get taskType by farm id', async (done) => {
        getRequest({user_id: newWorker.user_id}, (err, res) => {
          console.log(res.error, res.body);
          expect(res.status).toBe(200);
          expect(res.body[0].activity_id).toBe(taskType.activity_id);
          done();
        });
      })


      test('Should get status 403 if an unauthorizedUser tries to get taskType by farm_id', async (done) => {
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


      test('Owner should get taskType by log_id', async (done) => {
        getRequest({user_id: newOwner.user_id, url: `/task_type/${taskType.activity_id}`}, (err, res) => {
          console.log(res.error, res.body);
          expect(res.status).toBe(200);
          expect(res.body[0].activity_id).toBe(taskType.activity_id);
          done();
        });
      })

      test('Manager should get taskType by log_id', async (done) => {
        getRequest({user_id: manager.user_id, url: `/task_type/${taskType.activity_id}`}, (err, res) => {
          console.log(res.error, res.body);
          expect(res.status).toBe(200);
          expect(res.body[0].activity_id).toBe(taskType.activity_id);
          done();
        });
      })

      test('Worker should get taskType by log_id', async (done) => {
        getRequest({user_id: newWorker.user_id, url: `/task_type/${taskType.activity_id}`}, (err, res) => {
          console.log(res.error, res.body);
          expect(res.status).toBe(200);
          expect(res.body[0].activity_id).toBe(taskType.activity_id);
          done();
        });
      })


      test('Should get status 403 if an unauthorizedUser tries to get taskType by log_id', async (done) => {
        getRequest({user_id: unAuthorizedUser.user_id, url: `/task_type/${taskType.activity_id}`}, (err, res) => {
          console.log(res.error, res.body);
          expect(res.status).toBe(403);
          done();
        });
      })

      test('Get taskType by log_id circumvent authorization by modifying farm_id', async (done) => {
        getRequest({
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id,
          url: `/task_type/${taskType.activity_id}`
        }, (err, res) => {
          console.log(res.error, res.body);
          expect(res.status).toBe(403);
          done();
        });
      })


    })

    describe('Delete log tests', function () {
      describe('Delete activityLog (fertilizingLog) tests', ()=>{
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
          [activityLog] = await mocks.activityLogFactory({promisedUser: [newOwner]}, {
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
            deleteRequest({user_id: unAuthorizedUser.user_id, activity_id: activityLog.activity_id}, async (err, res) => {
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
          const activityLog = await activityLogModel.query().where('user_id', newOwner.user_id);
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
          const activityLog = await activityLogModel.query().where('user_id', newOwner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const fertilizerLog = await fertilizerLogModel.query().where('activity_id', activityLog[0].activity_id);
          expect(fertilizerLog.length).toBe(1);
          expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
          done();
        })
      });

      describe('Post log authorization tests', () => {

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

        test('Owner should post and get a valid crop', async (done) => {
          postRequest(fakeTaskType, {}, async (err, res) => {
            console.log(fakeTaskType, res.error);
            expect(res.status).toBe(201);
            const taskTypes = await activityLogModel.query().where('farm_id', farm.farm_id);
            expect(taskTypes.length).toBe(1);
            expect(taskTypes[0].task_name).toBe(fakeTaskType.task_name);
            done();
          })
        });

        test('Manager should post and get a valid crop', async (done) => {
          postRequest(fakeTaskType, {user_id: manager.user_id}, async (err, res) => {
            console.log(fakeTaskType, res.error);
            expect(res.status).toBe(201);
            const taskTypes = await activityLogModel.query().where('farm_id', farm.farm_id);
            expect(taskTypes.length).toBe(1);
            expect(taskTypes[0].task_name).toBe(fakeTaskType.task_name);
            done();
          })
        });

        test('should return 403 status if taskType is posted by worker', async (done) => {
          postRequest(fakeTaskType, {user_id: newWorker.user_id}, async (err, res) => {
            console.log(fakeTaskType, res.error);
            expect(res.status).toBe(403);
            expect(res.error.text).toBe("User does not have the following permission(s): add:task_types");
            done()
          })
        });

        test('should return 403 status if taskType is posted by unauthorized user', async (done) => {
          postRequest(fakeTaskType, {user_id: unAuthorizedUser.user_id}, async (err, res) => {
            console.log(fakeTaskType, res.error);
            expect(res.status).toBe(403);
            expect(res.error.text).toBe("User does not have the following permission(s): add:task_types");
            done()
          })
        });

        test('Circumvent authorization by modify farm_id', async (done) => {
          postRequest(fakeTaskType, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id
          }, async (err, res) => {
            console.log(fakeTaskType, res.error);
            expect(res.status).toBe(403);
            done()
          })
        });

      })


    });
  });
});
