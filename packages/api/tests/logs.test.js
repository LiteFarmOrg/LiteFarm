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
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
const mocks = require('./mock.factories');
const { tableCleanup } = require('./testEnvironment');

const fertilizerLogModel = require('../src/models/fertilizerTaskModel');
const pestControlLogModel = require('../src/models/pestControlTask');
const scoutingLogModel = require('../src/models/scoutingTaskModel');
const irrigationLogModel = require('../src/models/irrigationTaskModel');
const fieldWorkLogModel = require('../src/models/fieldWorkTaskModel');
const soilDataLogModel = require('../src/models/soilTaskModel');
const seedLogModel = require('../src/models/plantTaskModel');
const harvestLogModel = require('../src/models/harvestTaskModel');
const activityLogModel = require('../src/models/taskModel');
const activityFieldsModel = require('../src/models/locationTasksModel');
const activityCropsModel = require('../src/models/managementTasksModel');
const fertilizerModel = require('../src/models/fertilizerModel');
const fieldModel = require('../src/models/fieldModel');
const managementPlanModel = require('../src/models/managementPlanModel');
const pesticideModel = require('../src/models/pesiticideModel');
const diseaseModel = require('../src/models/diseaseModel');
const harvestUseModel = require('../src/models/harvestUseModel');


xdescribe('Log Tests', () => {
  let middleware;
  let owner;
  let farm;

  beforeAll(() => {
    token = global.token;
  });

  function postRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).post(`/log`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function getRequest({
    user_id = owner.user_id,
    farm_id = farm.farm_id,
    url = `/log/farm/${farm.farm_id}`,
  }, callback) {
    chai.request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function getRequestWithBody({
    user_id = owner.user_id,
    farm_id = farm.farm_id,
    url = `/log/farm/${farm.farm_id}`,
    body = { farm_id: farm.farm_id },
  }, callback) {
    chai.request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(body)
      .end(callback);
  }

  function deleteRequest({ user_id = owner.user_id, farm_id = farm.farm_id, activity_id: activity_id }, callback) {
    chai.request(server).delete(`/log/${activity_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function deleteRequestWithBody({
    user_id = owner.user_id,
    farm_id = farm.farm_id,
    activity_id: activity_id,
    body = { farm_id: farm.farm_id },
  }, callback) {
    chai.request(server).delete(`/log/${activity_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(body)
      .end(callback);
  }

  function putRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id, activity_id }, callback) {
    chai.request(server).put(`/log/${activity_id ? activity_id : data.activity_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback);
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  function newFakeActivityLog(activity_kind, user_id = owner.user_id) {
    const activityLog = mocks.fakeActivityLog();
    return ({ ...activityLog, user_id, activity_kind });
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm2] = await mocks.userFarmFactory({ promisedUser: [owner] }, fakeUserFarm(1));
    const [ownerFarm] = await mocks.userFarmFactory({ promisedUser: [owner], promisedFarm: [farm] }, fakeUserFarm(1));

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next();
    });
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Get && delete && put logs tests', () => {

    describe('FertilizerLog tests', () => {
      let fertilizerLog;
      let activityLog;
      let activityCropLog;
      let activityFieldLog;
      let crop;
      let field;
      let managementPlan;
      let cropVariety;
      let fertilizer;
      beforeEach(async () => {
        [fertilizer] = await mocks.fertilizerFactory({ promisedFarm: [farm] });
        [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [cropVariety] = await mocks.crop_varietyFactory({ promisedFarm: [farm], promisedCrop: [crop] });
        [managementPlan] = await mocks.management_planFactory({
          promisedCropVariety: [cropVariety],
          promisedField: [field],
        });
        [activityLog] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
          ...mocks.fakeActivityLog(),
          activity_kind: 'fertilizing',
        });
        [fertilizerLog] = await mocks.fertilizerLogFactory({
          promisedActivityLog: [activityLog],
          promisedFertilizer: [fertilizer],
        });
        [activityCropLog] = await mocks.activityCropsFactory({
          promisedActivityLog: [activityLog],
          promisedManagementPlan: [managementPlan],
        });
        [activityFieldLog] = await mocks.activityFieldsFactory({
          promisedActivityLog: [activityLog],
          promisedField: [field],
        });
      });


      describe('Get fertilizerLog tests', () => {


        test('Get by activity_id by test', async (done) => {
          getRequest({ user_id: owner.user_id, url: `/log/${activityLog.activity_id}` }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.fertilizerLog.fertilizer_id).toBe(fertilizer.fertilizer_id);
            done();
          });
        });

        test('Should get status 404 if activity_log is deleted', async (done) => {
          await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).findById(activityLog.activity_id).delete();
          getRequest({ user_id: owner.user_id, url: `/log/${activityLog.activity_id}` }, (err, res) => {
            expect(res.status).toBe(404);
            done();
          });
        });

        test('Get by farm_id should filter out deleted activity logs', async (done) => {
          await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).findById(activityLog.activity_id).delete();
          getRequest({ user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(0);
            done();
          });
        });

        test('Get by farm_id', async (done) => {
          let [activityLog1] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
            ...mocks.fakeActivityLog(),
            activity_kind: 'fertilizing',
          });
          let [fertilizerLog1] = await mocks.fertilizerLogFactory({
            promisedActivityLog: [activityLog1],
            promisedFertilizer: [fertilizer],
          });
          let [activityCropLog1] = await mocks.activityCropsFactory({
            promisedActivityLog: [activityLog1],
            promisedManagementPlan: [managementPlan],
          });
          let [activityFieldLog1] = await mocks.activityFieldsFactory({
            promisedActivityLog: [activityLog1],
            promisedField: [field],
          });
          getRequest({ user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].fertilizerLog.fertilizer_id).toBe(fertilizer.fertilizer_id);
            expect(res.body[0].managementPlan[0].field_crop_id).toBe(managementPlan.field_crop_id);
            expect(res.body[0].location[0].location_id).toBe(field.location_id);
            done();
          });
        });

        test('Get by farm_id should filter out logs from another farm', async (done) => {
          let [activityLog1] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
            ...mocks.fakeActivityLog(),
            activity_kind: 'fertilizing',
          });
          let [fertilizerLog1] = await mocks.fertilizerLogFactory({
            promisedActivityLog: [activityLog1],
            promisedFertilizer: [fertilizer],
          });
          let [activityCropLog1] = await mocks.activityCropsFactory({
            promisedActivityLog: [activityLog1],
            promisedManagementPlan: [managementPlan],
          });
          let [activityFieldLog1] = await mocks.activityFieldsFactory({
            promisedActivityLog: [activityLog1],
            promisedField: [field],
          });
          let [newUserFarm] = await mocks.userFarmFactory({ promisedUser: [owner] });
          getRequest({
            user_id: owner.user_id,
            farm_id: newUserFarm.farm_id,
            url: `/log/farm/${newUserFarm.farm_id}`,
          }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(0);
            done();
          });
        });

        test('Should get managementPlan/fertilizer/field through fertilizingLog even if those items are deleted', async (done) => {
          let [activityLog1] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
            ...mocks.fakeActivityLog(),
            activity_kind: 'fertilizing',
          });
          let [fertilizerLog1] = await mocks.fertilizerLogFactory({
            promisedActivityLog: [activityLog1],
            promisedFertilizer: [fertilizer],
          });
          let [activityCropLog1] = await mocks.activityCropsFactory({
            promisedActivityLog: [activityLog1],
            promisedManagementPlan: [managementPlan],
          });
          let [activityFieldLog1] = await mocks.activityFieldsFactory({
            promisedActivityLog: [activityLog1],
            promisedField: [field],
          });
          await fertilizerModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).findById(fertilizer.fertilizer_id).delete();
          await managementPlanModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).findById(managementPlan.field_crop_id).delete();
          await fieldModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).findById(field.location_id).delete();
          getRequest({ user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].fertilizerLog.fertilizer_id).toBe(fertilizer.fertilizer_id);
            expect(res.body[0].managementPlan[0].field_crop_id).toBe(managementPlan.field_crop_id);
            expect(res.body[0].location[0].location_id).toBe(field.location_id);
            done();
          });
        });

        describe('Get activityLog authorization tests', () => {
          let worker;
          let manager;
          let unAuthorizedUser;
          let farmunAuthorizedUser;

          beforeEach(async () => {
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
          });


          test('Owner should get by farm_id', async (done) => {
            getRequest({ user_id: worker.user_id }, (err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.length).toBe(1);
              expect(res.body[0].fertilizerLog.fertilizer_id).toBe(fertilizer.fertilizer_id);
              expect(res.body[0].managementPlan[0].field_crop_id).toBe(managementPlan.field_crop_id);
              expect(res.body[0].location[0].location_id).toBe(field.location_id);
              done();
            });
          });

          test('Manager should get by farm_id', async (done) => {
            getRequest({ user_id: manager.user_id }, (err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.length).toBe(1);
              expect(res.body[0].fertilizerLog.fertilizer_id).toBe(fertilizer.fertilizer_id);
              expect(res.body[0].managementPlan[0].field_crop_id).toBe(managementPlan.field_crop_id);
              expect(res.body[0].location[0].location_id).toBe(field.location_id);
              done();
            });
          });

          test('Worker should get by farm_id', async (done) => {
            getRequest({ user_id: worker.user_id }, (err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.length).toBe(1);
              expect(res.body[0].fertilizerLog.fertilizer_id).toBe(fertilizer.fertilizer_id);
              expect(res.body[0].managementPlan[0].field_crop_id).toBe(managementPlan.field_crop_id);
              expect(res.body[0].location[0].location_id).toBe(field.location_id);
              done();
            });
          });

          test('Should get status 403 when unauthorized user try to get log by farm_id', async (done) => {
            getRequest({ user_id: unAuthorizedUser.user_id }, (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Circumvent authorization by modifying farm_id', async (done) => {
            getRequest({ user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id }, (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Circumvent authorization by modifying farm_id in body', async (done) => {
            getRequestWithBody({
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              body: { farm_id: farmunAuthorizedUser.farm_id },
            }, (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });

          test('Should get status 403 when unauthorized user try to get log by activity_id', async (done) => {
            getRequest({ user_id: unAuthorizedUser.user_id, url: `/log/${activityLog.activity_id}` }, (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Circumvent authorization by modifying activity_id in header', async (done) => {
            getRequest({
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              url: `/log/${activityLog.activity_id}`,
            }, (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Circumvent authorization by modifying activity_id in body', async (done) => {
            getRequestWithBody({
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              url: `/log/${activityLog.activity_id}`,
              body: { farm_id: farmunAuthorizedUser.farm_id },
            }, (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });

        });


      });


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
          });

          test('Owner should delete a activityLog', async (done) => {
            deleteRequest({ activity_id: activityLog.activity_id }, async (err, res) => {
              expect(res.status).toBe(200);
              const activityLogRes = await activityLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog.activity_id);
              expect(activityLogRes.length).toBe(1);
              expect(activityLogRes[0].deleted).toBe(true);
              done();
            });
          });

          test('Manager should delete a activityLog', async (done) => {
            deleteRequest({ user_id: manager.user_id, activity_id: activityLog.activity_id }, async (err, res) => {
              expect(res.status).toBe(200);
              const activityLogRes = await activityLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog.activity_id);
              expect(activityLogRes.length).toBe(1);
              expect(activityLogRes[0].deleted).toBe(true);
              done();
            });
          });

          test('should return 403 if an unauthorized user tries to delete a activityLog', async (done) => {
            deleteRequest({
              user_id: unAuthorizedUser.user_id,
              activity_id: activityLog.activity_id,
            }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('should return 403 if a worker tries to delete an activityLog not owned by him', async (done) => {
            deleteRequest({ user_id: newWorker.user_id, activity_id: activityLog.activity_id }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Worker should delete activity owned by him', async (done) => {
            const [workerActivity] = await mocks.activityLogFactory({ promisedUser: [newWorker] }, {
              ...mocks.fakeActivityLog(),
              activity_kind: 'fertilizing',
            });
            await mocks.activityFieldsFactory({
              promisedField: [field],
              promisedActivityLog: [workerActivity],
            });
            deleteRequest({ user_id: newWorker.user_id, activity_id: workerActivity.activity_id }, async (err, res) => {
              expect(res.status).toBe(200);
              const activityLogRes = await activityLogModel.query().context({
                showHidden: true,
                user_id: newWorker.user_id,
              }).where('activity_id', workerActivity.activity_id);
              expect(activityLogRes.length).toBe(1);
              expect(activityLogRes[0].deleted).toBe(true);
              done();
            });
          });

          test('Circumvent authorization by modifying farm_id', async (done) => {
            deleteRequest({
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: activityLog.activity_id,
            }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Circumvent authorization by modifying farm_id in body', async (done) => {
            deleteRequestWithBody({
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: activityLog.activity_id,
              body: { farm_id: farmunAuthorizedUser.farm_id },
            }, async (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });
        });


      });


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
            user_id: owner.user_id,
            notes: fakeActivityLog.notes,
            quantity_kg: fakefertilizingLog.quantity_kg,
            crops: [{ field_crop_id: managementPlan.field_crop_id }],
            locations: [{ location_id: field.location_id }],
            fertilizer_id: fertilizer.fertilizer_id,
          };
        });

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
          let unauthorizedManagementPlan;
          let unauthorizedFertilizer;

          beforeEach(async () => {
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

            [unauthorizedFertilizer] = await mocks.fertilizerFactory({ promisedFarm: [farmunAuthorizedUser] });
            [unauthorizedCrop] = await mocks.cropFactory({ promisedFarm: [farmunAuthorizedUser] });
            let [weatherStation] = await mocks.weather_stationFactory();
            [unauthorizedField] = await mocks.fieldFactory({
              promisedFarm: [farmunAuthorizedUser],
              promisedStation: [weatherStation],
            });
            [unauthorizedManagementPlan] = await mocks.management_planFactory({
              promisedCrop: [unauthorizedCrop],
              promisedField: [unauthorizedField],
            });
            [unauthorizedActivityLog] = await mocks.activityLogFactory({ promisedUser: [unAuthorizedUser] }, {
              ...mocks.fakeActivityLog(),
              activity_kind: 'fertilizing',
            });
            [unauthorizedFertilizerLog] = await mocks.fertilizerLogFactory({
              promisedActivityLog: [unauthorizedActivityLog],
              promisedFertilizer: [unauthorizedFertilizer],
            });
            [unauthorizedActivityCropLog] = await mocks.activityCropsFactory({
              promisedActivityLog: [unauthorizedActivityLog],
              promisedManagementPlan: [unauthorizedManagementPlan],
            });
            [unauthorizedActivityFieldLog] = await mocks.activityFieldsFactory({
              promisedActivityLog: [unauthorizedActivityLog],
              promisedField: [unauthorizedField],
            });

          });

          test('Owner should edit a fertilizerLog', async (done) => {
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('user_id', owner.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
              const fertilizerLog = await fertilizerLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(fertilizerLog.length).toBe(1);
              expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
              done();
            });
          });

          test('Manager should edit a fertilizerLog', async (done) => {
            sampleRequestBody.user_id = manager.user_id;
            putRequest(sampleRequestBody, { user_id: manager.user_id }, async (err, res) => {
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('user_id', manager.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
              const fertilizerLog = await fertilizerLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(fertilizerLog.length).toBe(1);
              expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
              done();
            });
          });

          test('Worker should edit a fertilizerLog owned by the worker', async (done) => {
            const [workerActivity] = await mocks.activityLogFactory({ promisedUser: [worker] }, {
              ...mocks.fakeActivityLog(),
              activity_kind: 'fertilizing',
            });
            await mocks.activityFieldsFactory({
              promisedField: [field],
              promisedActivityLog: [workerActivity],
            });
            sampleRequestBody.activity_id = workerActivity.activity_id;
            sampleRequestBody.user_id = worker.user_id;
            putRequest(sampleRequestBody, {
              user_id: worker.user_id,
              activity_id: workerActivity.activity_id,
            }, async (err, res) => {
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().context({
                showHidden: true,
              }).where('user_id', worker.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
              const fertilizerLog = await fertilizerLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              done();
            });
          });

          test('Should return 403 if a worker tries to edit a fertilizerLog not owned by the worker', async (done) => {
            sampleRequestBody.user_id = worker.user_id;
            putRequest(sampleRequestBody, { user_id: worker.user_id }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          //TODO fail
          xtest('Should return 403 if body.user_id is different from header.user_id', async (done) => {
            sampleRequestBody.user_id = worker.user_id;
            putRequest(sampleRequestBody, { user_id: manager.user_id }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('should return 403 if an unauthorized user tries to edit a fertilizingLog', async (done) => {
            sampleRequestBody.user_id = unAuthorizedUser.user_id;
            putRequest(sampleRequestBody, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Circumvent authorization by modifying farm_id in header', async (done) => {
            sampleRequestBody.user_id = unAuthorizedUser.user_id;
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: activityLog.activity_id,
            }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Circumvent authorization by modifying farm_id in body and header', async (done) => {
            sampleRequestBody.user_id = unAuthorizedUser.user_id;
            sampleRequestBody.farm_id = farmunAuthorizedUser.farm_id;
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: activityLog.activity_id,
            }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Circumvent authorization by modifying farm_id, location_id, field_crop_id in body', async (done) => {
            sampleRequestBody.user_id = unAuthorizedUser.user_id;
            sampleRequestBody.farm_id = farmunAuthorizedUser.farm_id;
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: activityLog.activity_id,
            }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Circumvent authorization by modifying activity_id in body', async (done) => {
            sampleRequestBody.user_id = unAuthorizedUser.user_id;
            sampleRequestBody.activity_id = unauthorizedActivityLog.activity_id;
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: activityLog.activity_id,
            }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Circumvent authorization by modifying activity_id/field_crop_id/location_id/fertilizer_id in body', async (done) => {
            sampleRequestBody.user_id = unAuthorizedUser.user_id;
            sampleRequestBody.activity_id = unauthorizedActivityLog.activity_id;
            sampleRequestBody.locations = [{ location_id: unauthorizedField.location_id }];
            sampleRequestBody.crops = [{ field_crop_id: unauthorizedManagementPlan.field_crop_id }];
            sampleRequestBody.fertilizer_id = unauthorizedFertilizer.fertilizer_id;
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: activityLog.activity_id,
            }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Should return 400 if locations, managementPlans, and fertilizer reference a farm that the user does not have access to', async (done) => {
            sampleRequestBody.user_id = unAuthorizedUser.user_id;
            sampleRequestBody.activity_id = unauthorizedActivityLog.activity_id;
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: unauthorizedActivityLog.activity_id,
            }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Should return 400 if activity_id is set to an id that already exists', async (done) => {
            sampleRequestBody.user_id = unAuthorizedUser.user_id;
            sampleRequestBody.activity_id = activityLog.activity_id;
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: unauthorizedActivityLog.activity_id,
            }, async (err, res) => {
              //TODO should return 400
              expect(res.status).toBe(403);
              done();
            });
          });

        });


        describe('Put fertilizerLog tests with fertilizer/field/field_crop referencing different farms', () => {
          let fakefertilizingLog;
          let fakeActivityLog;
          let fertilizer1;
          let crop1;
          let field1;
          let managementPlan1;
          let sampleRequestBody;
          let newFarm;
          let newUserFarm;
          beforeEach(async () => {
            [newFarm] = await mocks.farmFactory();
            [newUserFarm] = await mocks.userFarmFactory({ promisedUser: [owner], promisedFarm: [newFarm] });
            fakeActivityLog = newFakeActivityLog('fertilizing');
            fakefertilizingLog = mocks.fakeFertilizerLog();
            [fertilizer1] = await mocks.fertilizerFactory({ promisedFarm: [newFarm] });
            [crop1] = await mocks.cropFactory({ promisedFarm: [newFarm] });
            let [weatherStation] = await mocks.weather_stationFactory();
            [field1] = await mocks.fieldFactory({ promisedFarm: [newFarm], promisedStation: [weatherStation] });
            [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

            sampleRequestBody = {
              activity_id: activityLog.activity_id,
              activity_kind: activityLog.activity_kind,
              date: fakeActivityLog.date,
              user_id: owner.user_id,
              notes: fakeActivityLog.notes,
              quantity_kg: fakefertilizingLog.quantity_kg,
              crops: [{ field_crop_id: managementPlan.field_crop_id }],
              locations: [{ location_id: field.location_id }],
              fertilizer_id: fertilizer.fertilizer_id,
            };
          });

          //TODO fail
          xtest('Should return 403 if field references a new farm', async (done) => {
            sampleRequestBody.locations = [sampleRequestBody.locations[0], { location_id: field1.location_id }];
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Should return 403 if field, managementPlan, and fertilizer reference a new farm', async (done) => {
            sampleRequestBody.locations = [{ location_id: field1.location_id }];
            sampleRequestBody.crops = [{ field_crop_id: managementPlan1.field_crop_id }];
            sampleRequestBody.fertilizer_id = fertilizer1.fertilizer_id;
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Should return 403 if field and managementPlan reference 2 farms', async (done) => {
            sampleRequestBody.crops = [sampleRequestBody.crops[0], { field_crop_id: managementPlan1.field_crop_id }];
            sampleRequestBody.locations = [sampleRequestBody.locations[0], { location_id: field1.location_id }];
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          //TODO fail
          xtest('Should return 403 if fertilizer references a new farm', async (done) => {
            sampleRequestBody.fertilizer_id = fertilizer1.fertilizer_id;
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Should return 403 if field_crop references a new farm', async (done) => {
            sampleRequestBody.crops = [sampleRequestBody.crops[0], { field_crop_id: managementPlan1.field_crop_id }];
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

        });

        describe('Put fertilizerLog tests with multiple field_crop and field', () => {
          let fakefertilizingLog;
          let fakeActivityLog1;
          let fertilizer1;
          let crop1;
          let field1;
          let managementPlan1;
          let sampleRequestBody;
          beforeEach(async () => {
            fakeActivityLog1 = newFakeActivityLog('fertilizing');
            fakefertilizingLog = mocks.fakeFertilizerLog();
            [fertilizer1] = await mocks.fertilizerFactory({ promisedFarm: [farm] });
            [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
            let [weatherStation] = await mocks.weather_stationFactory();
            [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
            [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

            sampleRequestBody = {
              activity_id: activityLog.activity_id,
              activity_kind: activityLog.activity_kind,
              date: fakeActivityLog1.date,
              user_id: owner.user_id,
              notes: fakeActivityLog1.notes,
              quantity_kg: fakefertilizingLog.quantity_kg,
              crops: [{ field_crop_id: managementPlan.field_crop_id }, { field_crop_id: managementPlan1.field_crop_id }],
              locations: [{ location_id: field.location_id }, { location_id: field1.location_id }],
              fertilizer_id: fertilizer1.fertilizer_id,
            };
          });

          test('Owner should put fertilizing log for a field', async (done) => {
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('user_id', owner.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog1.notes);
              const fertilizerLog = await fertilizerLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(fertilizerLog.length).toBe(1);
              expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer1.fertilizer_id);
              done();
            });
          });


          test('Owner should put fertilizing log for a garden', async (done) => {
            const [garden] = await mocks.gardenFactory({ promisedFarm: [farm] });

            sampleRequestBody.locations.push(garden);
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('user_id', owner.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog1.notes);
              const fertilizerLog = await fertilizerLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(fertilizerLog.length).toBe(1);
              expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer1.fertilizer_id);
              done();
            });
          });

          test('Owner should put fertilizing log for a bufferZone', async (done) => {
            const [bufferZone] = await mocks.buffer_zoneFactory({ promisedFarm: [farm] });

            sampleRequestBody.locations.push(bufferZone);
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('user_id', owner.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog1.notes);
              const fertilizerLog = await fertilizerLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(fertilizerLog.length).toBe(1);
              expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer1.fertilizer_id);
              done();
            });
          });

          test('Owner should put fertilizing log for a greenhouse', async (done) => {
            const [greenhouse] = await mocks.greenhouseFactory({ promisedFarm: [farm] });

            sampleRequestBody.locations.push(greenhouse);
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('user_id', owner.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog1.notes);
              const fertilizerLog = await fertilizerLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(fertilizerLog.length).toBe(1);
              expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer1.fertilizer_id);
              done();
            });
          });

          test('Owner should put fertilizing log for a greenhouse, a field, a garden, and a bufferZone', async (done) => {
            const [greenhouse] = await mocks.greenhouseFactory({ promisedFarm: [farm] });
            sampleRequestBody.locations.push(greenhouse);
            const [garden] = await mocks.gardenFactory({ promisedFarm: [farm] });
            sampleRequestBody.locations.push(garden);
            const [bufferZone] = await mocks.buffer_zoneFactory({ promisedFarm: [farm] });
            sampleRequestBody.locations.push(bufferZone);
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('user_id', owner.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog1.notes);
              const fertilizerLog = await fertilizerLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(fertilizerLog.length).toBe(1);
              expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer1.fertilizer_id);
              done();
            });
          });

          test('Should return 400 if log reference a barn', async (done) => {
            const [barn] = await mocks.barnFactory({ promisedFarm: [farm] });
            sampleRequestBody.locations.push(barn);
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });

          test('Should return 400 if log reference a ceremonial_area', async (done) => {
            const [ceremonial_area] = await mocks.ceremonial_areaFactory({ promisedFarm: [farm] });
            sampleRequestBody.locations.push(ceremonial_area);
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });
          test('Should return 400 if log reference a farm_site_boundary', async (done) => {
            const [farm_site_boundary] = await mocks.farm_site_boundaryFactory({ promisedFarm: [farm] });
            sampleRequestBody.locations.push(farm_site_boundary);
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });
          test('Should return 400 if log reference a surface_water', async (done) => {
            const [surface_water] = await mocks.surface_waterFactory({ promisedFarm: [farm] });
            sampleRequestBody.locations.push(surface_water);
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });
          test('Should return 400 if log reference a natural_area', async (done) => {
            const [natural_area] = await mocks.natural_areaFactory({ promisedFarm: [farm] });
            sampleRequestBody.locations.push(natural_area);
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });
          test('Should return 400 if log reference a residence', async (done) => {
            const [residence] = await mocks.residenceFactory({ promisedFarm: [farm] });
            sampleRequestBody.locations.push(residence);
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });
          test('Should return 400 if log reference a watercourse', async (done) => {
            const [watercourse] = await mocks.watercourseFactory({ promisedFarm: [farm] });
            sampleRequestBody.locations.push(watercourse);
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });
          test('Should return 400 if log reference a fence', async (done) => {
            const [fence] = await mocks.fenceFactory({ promisedFarm: [farm] });
            sampleRequestBody.locations.push(fence);
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });
          test('Should return 400 if log reference a gate', async (done) => {
            const [gate] = await mocks.gateFactory({ promisedFarm: [farm] });
            sampleRequestBody.locations.push(gate);
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });
          test('Should return 400 if log reference a water_valve', async (done) => {
            const [water_valve] = await mocks.water_valveFactory({ promisedFarm: [farm] });
            sampleRequestBody.locations.push(water_valve);
            putRequest(sampleRequestBody, {}, async (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });

          test('Owner should change fertilizerLog to a different field  ', async (done) => {
            sampleRequestBody.locations = [{ location_id: field1.location_id }];
            sampleRequestBody.crops = [{ field_crop_id: managementPlan1.field_crop_id }];
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('user_id', owner.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog1.notes);
              const fertilizerLog = await fertilizerLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(fertilizerLog.length).toBe(1);
              expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer1.fertilizer_id);
              const activityFieldLog = await activityFieldsModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(activityFieldLog.length).toBe(1);
              expect(activityFieldLog[0].location_id).toBe(field1.location_id);
              const activityCrops = await activityCropsModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(activityCrops.length).toBe(1);
              expect(activityCrops[0].field_crop_id).toBe(managementPlan1.field_crop_id);
              done();
            });
          });

          test('Owner should change fertilizerLog to a different field with 2 managementPlans', async (done) => {
            const [managementPlan2] = await mocks.management_planFactory({ promisedField: [field1] });
            sampleRequestBody.locations = [{ location_id: field1.location_id }];
            sampleRequestBody.crops = [{ field_crop_id: managementPlan1.field_crop_id }, { field_crop_id: managementPlan2.field_crop_id }];
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('user_id', owner.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog1.notes);
              const fertilizerLog = await fertilizerLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(fertilizerLog.length).toBe(1);
              expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer1.fertilizer_id);
              const activityFieldLog = await activityFieldsModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(activityFieldLog.length).toBe(1);
              expect(activityFieldLog[0].location_id).toBe(field1.location_id);
              const activityCrops = await activityCropsModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(activityCrops.length).toBe(2);
              expect(activityCrops[0].field_crop_id).toBe(managementPlan1.field_crop_id);
              done();
            });
          });

          test('Owner should put fertilizerLog tests with multiple field_crop and field', async (done) => {
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              expect(res.status).toBe(200);
              const activityLog = await activityLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('user_id', owner.user_id);
              expect(activityLog.length).toBe(1);
              expect(activityLog[0].notes).toBe(fakeActivityLog1.notes);
              const fertilizerLog = await fertilizerLogModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(fertilizerLog.length).toBe(1);
              expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer1.fertilizer_id);
              const activityFieldLog = await activityFieldsModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(activityFieldLog.length).toBe(2);
              expect(activityFieldLog[1].location_id).toBe(field1.location_id);
              const activityCrops = await activityCropsModel.query().context({
                showHidden: true,
                user_id: owner.user_id,
              }).where('activity_id', activityLog[0].activity_id);
              expect(activityCrops.length).toBe(2);
              expect(activityCrops[1].field_crop_id).toBe(managementPlan1.field_crop_id);
              done();
            });
          });

          //TODO fail

          xtest('Should return 400 if field_crops reference a field that is not in locations array', async (done) => {
            sampleRequestBody.field = [sampleRequestBody.locations[0]];
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });

          xtest('Should return 400 if field_crops reference a field that is not in locations in the database', async (done) => {
            sampleRequestBody.crops = [{ field_crop_id: managementPlan1.field_crop_id }];
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });

          xtest('Should return 400 if field reference a field that is not in managementPlan array', async (done) => {
            sampleRequestBody.crops = [sampleRequestBody.crops[0]];
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              expect(res.status).toBe(400);
              done();
            });
          });

          test('Should return 403 if field reference a field that is not in managementPlan in the database', async (done) => {
            sampleRequestBody.locations = [{ location_id: field1.location_id }];
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Should return 400 if body.crops is empty1', async (done) => {
            sampleRequestBody.crops = [{}];
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              //     //TODO should return 400
              expect(res.status).toBe(403);
              done();
            });
          });
          //TODO fail
          xtest('Should return 400 if body.crops is empty2', async (done) => {
            sampleRequestBody.crops = [];
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              //     //TODO should return 400
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Should return 400 if body.locations is empty1[{}]', async (done) => {
            sampleRequestBody.locations = [{}];
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              //TODO should return 400
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Should return 400 if body.locations is empty2[]', async (done) => {
            sampleRequestBody.locations = [];
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              //TODO should return 400
              expect(res.status).toBe(403);
              done();
            });
          });

          test('Should return 400 if body.crops is undefined', async (done) => {
            delete sampleRequestBody.crops;
            putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
              //TODO should return 400
              expect(res.status).toBe(404);
              done();
            });
          });

        });


      });

    });

    describe('pestControlLog tests', () => {
      let pestControlLog;
      let activityLog;
      let activityCropLog;
      let activityFieldLog;
      let crop;
      let field;
      let managementPlan;
      let pesticide;
      let disease;
      beforeEach(async () => {
        [pesticide] = await mocks.pesticideFactory({ promisedFarm: [farm] });
        [disease] = await mocks.diseaseFactory({ promisedFarm: [farm] });
        [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan] = await mocks.management_planFactory({ promisedCrop: [crop], promisedField: [field] });
        [activityLog] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
          ...mocks.fakeActivityLog(),
          activity_kind: 'pestControl',
        });
        [pestControlLog] = await mocks.pestControlLogFactory({
          promisedActivity: [activityLog],
          promisedPesticide: [pesticide],
          promisedDisease: [disease],
        });
        [activityCropLog] = await mocks.activityCropsFactory({
          promisedActivityLog: [activityLog],
          promisedManagementPlan: [managementPlan],
        });
        [activityFieldLog] = await mocks.activityFieldsFactory({
          promisedActivityLog: [activityLog],
          promisedField: [field],
        });
      });


      describe('Get pestControlLog tests', () => {


        test('Get by activity_id test', async (done) => {
          getRequest({ user_id: owner.user_id, url: `/log/${activityLog.activity_id}` }, (err, res) => {
            expect(res.status).toBe(200);

            expect(res.body.pestControlLog.pesticide_id).toBe(pesticide.pesticide_id);
            done();
          });
        });


        test('Get by farm_id', async (done) => {
          let [activityLog1] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
            ...mocks.fakeActivityLog(),
            activity_kind: 'pestControl',
          });
          let [pesticideLog1] = await mocks.pestControlLogFactory({
            promisedActivityLog: [activityLog1],
            promisedPesticide: [pesticide],
            promisedDisease: [disease],
          });
          let [activityCropLog1] = await mocks.activityCropsFactory({
            promisedActivityLog: [activityLog1],
            promisedManagementPlan: [managementPlan],
          });
          let [activityFieldLog1] = await mocks.activityFieldsFactory({
            promisedActivityLog: [activityLog1],
            promisedField: [field],
          });
          getRequest({ user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].pestControlLog.pesticide_id).toBe(pesticide.pesticide_id);
            expect(res.body[0].managementPlan[0].field_crop_id).toBe(managementPlan.field_crop_id);
            expect(res.body[0].location[0].location_id).toBe(field.location_id);
            done();
          });
        });

        test('Should get managementPlan/pesticide/disease/field through pestControlLog even if those items are deleted', async (done) => {
          let [activityLog1] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
            ...mocks.fakeActivityLog(),
            activity_kind: 'pestControl',
          });
          let [pesticideLog1] = await mocks.pestControlLogFactory({
            promisedActivityLog: [activityLog1],
            promisedPesticide: [pesticide],
            promisedDisease: [disease],
          });
          let [activityCropLog1] = await mocks.activityCropsFactory({
            promisedActivityLog: [activityLog1],
            promisedManagementPlan: [managementPlan],
          });
          let [activityFieldLog1] = await mocks.activityFieldsFactory({
            promisedActivityLog: [activityLog1],
            promisedField: [field],
          });
          await pesticideModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).findById(pesticide.pesticide_id).delete();
          await diseaseModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).findById(disease.disease_id).delete();
          await managementPlanModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).findById(managementPlan.field_crop_id).delete();
          await fieldModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).findById(field.location_id).delete();
          getRequest({ user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].pestControlLog.pesticide_id).toBe(pesticide.pesticide_id);
            expect(res.body[0].pestControlLog.target_disease_id).toBe(disease.disease_id);
            expect(res.body[0].managementPlan[0].field_crop_id).toBe(managementPlan.field_crop_id);
            expect(res.body[0].location[0].location_id).toBe(field.location_id);
            done();
          });
        });


      });


      describe('Put pestControlLog tests', () => {
        let pesticide1;
        let crop1;
        let field1;
        let managementPlan1;
        let sampleRequestBody;
        let fakeActivityLog;
        let fakePesticideControlLog;
        beforeEach(async () => {
          fakeActivityLog = mocks.fakeActivityLog();
          fakePesticideControlLog = mocks.fakePestControlLog();
          [pesticide1] = await mocks.pesticideFactory({ promisedFarm: [farm] });
          [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
          let [weatherStation] = await mocks.weather_stationFactory();
          [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
          [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

          sampleRequestBody = {
            activity_id: activityLog.activity_id,
            activity_kind: activityLog.activity_kind,
            date: fakeActivityLog.date,
            user_id: owner.user_id,
            notes: fakeActivityLog.notes,
            crops: [{ field_crop_id: managementPlan.field_crop_id }, { field_crop_id: managementPlan1.field_crop_id }],
            locations: [{ location_id: field.location_id }, { location_id: field1.location_id }],
            pesticide_id: pesticide1.pesticide_id,
            ...fakePesticideControlLog,

          };
        });

        test('Owner should put pestControlLog tests with multiple field_crop and field', async (done) => {
          putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', owner.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const pestControlLog = await pestControlLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(pestControlLog.length).toBe(1);
            expect(pestControlLog[0].pesticide_id).toBe(pesticide1.pesticide_id);
            const activityFieldLog = await activityFieldsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityFieldLog.length).toBe(2);
            expect(activityFieldLog[1].location_id).toBe(field1.location_id);
            const activityCrops = await activityCropsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityCrops.length).toBe(2);
            expect(activityCrops[1].field_crop_id).toBe(managementPlan1.field_crop_id);
            done();
          });
        });


      });

    });

    describe('harvestLog tests', () => {
      let harvestLog;
      let activityLog;
      let activityCropLog;
      let activityFieldLog;
      let crop;
      let field;
      let managementPlan;
      beforeEach(async () => {
        [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan] = await mocks.management_planFactory({ promisedCrop: [crop], promisedField: [field] });
        [activityLog] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
          ...mocks.fakeActivityLog(),
          activity_kind: 'harvest',
        });
        [harvestLog] = await mocks.harvestLogFactory({
          promisedActivity: [activityLog],
        });
        [activityCropLog] = await mocks.activityCropsFactory({
          promisedActivityLog: [activityLog],
          promisedManagementPlan: [managementPlan],
        });
        [activityFieldLog] = await mocks.activityFieldsFactory({
          promisedActivityLog: [activityLog],
          promisedField: [field],
        });
      });


      describe('Get harvestLog tests', () => {


        test('Get by activity_id test', async (done) => {
          getRequest({ user_id: owner.user_id, url: `/log/${activityLog.activity_id}` }, (err, res) => {
            expect(res.status).toBe(200);

            expect(res.body.notes).toBe(activityLog.notes);
            done();
          });
        });


        test('Get by farm_id', async (done) => {
          let [activityLog1] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
            ...mocks.fakeActivityLog(),
            activity_kind: 'harvest',
          });
          let [harvestLog1] = await mocks.harvestLogFactory({
            promisedActivityLog: [activityLog1],
          });
          let [activityCropLog1] = await mocks.activityCropsFactory({
            promisedActivityLog: [activityLog1],
            promisedManagementPlan: [managementPlan],
          });
          let [activityFieldLog1] = await mocks.activityFieldsFactory({
            promisedActivityLog: [activityLog1],
            promisedField: [field],
          });
          getRequest({ user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].notes).toBe(activityLog.notes);
            expect(res.body[0].managementPlan[0].field_crop_id).toBe(managementPlan.field_crop_id);
            expect(res.body[0].location[0].location_id).toBe(field.location_id);
            done();
          });
        });
      });


      describe('Put harvestLog tests', () => {
        // TODO update single locations tests
        let crop1;
        let field1;
        let managementPlan1;
        let sampleRequestBody;
        let fakeActivityLog;
        let fakeHarvestLog;
        beforeEach(async () => {
          fakeActivityLog = mocks.fakeActivityLog();
          fakeHarvestLog = mocks.fakeHarvestLog();
          [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
          let [weatherStation] = await mocks.weather_stationFactory();
          [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
          [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

          sampleRequestBody = {
            activity_id: activityLog.activity_id,
            activity_kind: activityLog.activity_kind,
            date: fakeActivityLog.date,
            user_id: owner.user_id,
            notes: fakeActivityLog.notes,
            selectedUseTypes: [],
            crops: [{ field_crop_id: managementPlan.field_crop_id }, { field_crop_id: managementPlan1.field_crop_id }],
            locations: [{ location_id: field.location_id }, { location_id: field1.location_id }],
            ...fakeHarvestLog,

          };
        });

        test('Owner should put harvestLog tests with multiple field_crop and field', async (done) => {
          putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', owner.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const harvestLog = await harvestLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(harvestLog.length).toBe(1);
            expect(harvestLog[0].quantity_kg).toBe(fakeHarvestLog.quantity_kg);
            const activityFieldLog = await activityFieldsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityFieldLog.length).toBe(2);
            expect(activityFieldLog[1].location_id).toBe(field1.location_id);
            const activityCrops = await activityCropsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityCrops.length).toBe(2);
            expect(activityCrops[1].field_crop_id).toBe(managementPlan1.field_crop_id);
            done();
          });
        });


      });

    });

    describe('seedLog tests', () => {
      let seedLog;
      let activityLog;
      let activityCropLog;
      let activityFieldLog;
      let crop;
      let field;
      let managementPlan;
      beforeEach(async () => {
        [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan] = await mocks.management_planFactory({ promisedCrop: [crop], promisedField: [field] });
        [activityLog] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
          ...mocks.fakeActivityLog(),
          activity_kind: 'seeding',
        });
        [seedLog] = await mocks.seedLogFactory({
          promisedActivity: [activityLog],
        });
        [activityCropLog] = await mocks.activityCropsFactory({
          promisedActivityLog: [activityLog],
          promisedManagementPlan: [managementPlan],
        });
        [activityFieldLog] = await mocks.activityFieldsFactory({
          promisedActivityLog: [activityLog],
          promisedField: [field],
        });
      });


      describe('Get seedLog tests', () => {


        test('Get by activity_id test', async (done) => {
          getRequest({ user_id: owner.user_id, url: `/log/${activityLog.activity_id}` }, (err, res) => {
            expect(res.status).toBe(200);

            expect(res.body.notes).toBe(activityLog.notes);
            done();
          });
        });


        test('Get by farm_id', async (done) => {
          let [activityLog1] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
            ...mocks.fakeActivityLog(),
            activity_kind: 'seeding',
          });
          let [seedLog1] = await mocks.seedLogFactory({
            promisedActivityLog: [activityLog1],
          });
          let [activityCropLog1] = await mocks.activityCropsFactory({
            promisedActivityLog: [activityLog1],
            promisedManagementPlan: [managementPlan],
          });
          let [activityFieldLog1] = await mocks.activityFieldsFactory({
            promisedActivityLog: [activityLog1],
            promisedField: [field],
          });
          getRequest({ user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].notes).toBe(activityLog.notes);
            expect(res.body[0].managementPlan[0].field_crop_id).toBe(managementPlan.field_crop_id);
            expect(res.body[0].location[0].location_id).toBe(field.location_id);
            done();
          });
        });
      });


      describe('Put seedLog tests', () => {
        // TODO update single locations tests
        let crop1;
        let field1;
        let managementPlan1;
        let sampleRequestBody;
        let fakeActivityLog;
        let fakeseedLog;
        beforeEach(async () => {
          fakeActivityLog = mocks.fakeActivityLog();
          fakeseedLog = mocks.fakeSeedLog();
          [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
          let [weatherStation] = await mocks.weather_stationFactory();
          [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
          [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

          sampleRequestBody = {
            activity_id: activityLog.activity_id,
            activity_kind: activityLog.activity_kind,
            date: fakeActivityLog.date,
            user_id: owner.user_id,
            notes: fakeActivityLog.notes,
            crops: [{ field_crop_id: managementPlan.field_crop_id }, { field_crop_id: managementPlan1.field_crop_id }],
            locations: [{ location_id: field.location_id }, { location_id: field1.location_id }],
            ...fakeseedLog,

          };
        });

        test('Owner should put seedLog tests with multiple field_crop and field', async (done) => {
          putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', owner.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const seedLog = await seedLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(seedLog.length).toBe(1);
            expect(seedLog[0].quantity_kg).toBe(fakeseedLog.quantity_kg);
            const activityFieldLog = await activityFieldsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityFieldLog.length).toBe(2);
            expect(activityFieldLog[1].location_id).toBe(field1.location_id);
            const activityCrops = await activityCropsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityCrops.length).toBe(2);
            expect(activityCrops[1].field_crop_id).toBe(managementPlan1.field_crop_id);
            done();
          });
        });


      });

    });

    describe('fieldWorkLog tests', () => {
      let fieldWorkLog;
      let activityLog;
      let activityCropLog;
      let activityFieldLog;
      let crop;
      let field;
      let managementPlan;
      beforeEach(async () => {
        [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan] = await mocks.management_planFactory({ promisedCrop: [crop], promisedField: [field] });
        [activityLog] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
          ...mocks.fakeActivityLog(),
          activity_kind: 'fieldWork',
        });
        [fieldWorkLog] = await mocks.fieldWorkLogFactory({
          promisedActivity: [activityLog],
        });
        [activityFieldLog] = await mocks.activityFieldsFactory({
          promisedActivityLog: [activityLog],
          promisedField: [field],
        });
      });


      describe('Get fieldWorkLog tests', () => {


        test('Get by activity_id test', async (done) => {
          getRequest({ user_id: owner.user_id, url: `/log/${activityLog.activity_id}` }, (err, res) => {
            expect(res.status).toBe(200);

            expect(res.body.notes).toBe(activityLog.notes);
            done();
          });
        });


        test('Get by farm_id', async (done) => {
          let [activityLog1] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
            ...mocks.fakeActivityLog(),
            activity_kind: 'fieldWork',
          });
          let [fieldWorkLog1] = await mocks.fieldWorkLogFactory({
            promisedActivityLog: [activityLog1],
          });
          let [activityCropLog1] = await mocks.activityCropsFactory({
            promisedActivityLog: [activityLog1],
            promisedManagementPlan: [managementPlan],
          });
          let [activityFieldLog1] = await mocks.activityFieldsFactory({
            promisedActivityLog: [activityLog1],
            promisedField: [field],
          });
          getRequest({ user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].notes).toBe(activityLog.notes);
            expect(res.body[0].managementPlan.length).toBe(0);
            expect(res.body[0].location[0].location_id).toBe(field.location_id);
            done();
          });
        });
      });


      describe('Put fieldWorkLog tests', () => {
        // TODO update single locations tests
        let crop1;
        let field1;
        let managementPlan1;
        let sampleRequestBody;
        let fakeActivityLog;
        let fakefieldWorkLog;
        beforeEach(async () => {
          fakeActivityLog = mocks.fakeActivityLog();
          fakefieldWorkLog = mocks.fakeFieldWorkLog();
          [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
          let [weatherStation] = await mocks.weather_stationFactory();
          [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
          [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

          sampleRequestBody = {
            activity_id: activityLog.activity_id,
            activity_kind: activityLog.activity_kind,
            date: fakeActivityLog.date,
            user_id: owner.user_id,
            notes: fakeActivityLog.notes,
            crops: [{ field_crop_id: managementPlan.field_crop_id }, { field_crop_id: managementPlan1.field_crop_id }],
            locations: [{ location_id: field.location_id }, { location_id: field1.location_id }],
            ...fakefieldWorkLog,

          };
        });

        test('Owner should put fieldWorkLog tests with multiple field_crop and field', async (done) => {
          sampleRequestBody.crops = [];
          putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', owner.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const fieldWorkLog = await fieldWorkLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(fieldWorkLog.length).toBe(1);
            expect(fieldWorkLog[0].quantity_kg).toBe(fakefieldWorkLog.quantity_kg);
            const activityFieldLog = await activityFieldsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityFieldLog.length).toBe(2);
            expect(activityFieldLog[1].location_id).toBe(field1.location_id);
            const activityCrops = await activityCropsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityCrops.length).toBe(0);
            done();
          });
        });

        test('Owner should put fieldWorkLog tests with a empty field', async (done) => {
          const [emptyField] = await mocks.fieldFactory({ promisedFarm: [farm] });
          sampleRequestBody.locations = [{ location_id: emptyField.location_id }];
          sampleRequestBody.crops = [];
          putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', owner.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const fieldWorkLog = await fieldWorkLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(fieldWorkLog.length).toBe(1);
            expect(fieldWorkLog[0].quantity_kg).toBe(fakefieldWorkLog.quantity_kg);
            const activityFieldLog = await activityFieldsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityFieldLog.length).toBe(1);
            expect(activityFieldLog[0].location_id).toBe(emptyField.location_id);
            const activityCrops = await activityCropsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityCrops.length).toBe(0);
            done();
          });
        });

        //TODO fail
        xtest('Should return 400 when managementPlans is not empty', async (done) => {
          putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
            expect(res.status).toBe(400);
            done();
          });
        });


      });

    });

    describe('soilDataLog tests', () => {
      let soilDataLog;
      let activityLog;
      let activityCropLog;
      let activityFieldLog;
      let crop;
      let field;
      let managementPlan;
      beforeEach(async () => {
        [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan] = await mocks.management_planFactory({ promisedCrop: [crop], promisedField: [field] });
        [activityLog] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
          ...mocks.fakeActivityLog(),
          activity_kind: 'soilData',
        });
        [soilDataLog] = await mocks.soilDataLogFactory({
          promisedActivity: [activityLog],
        });
        [activityFieldLog] = await mocks.activityFieldsFactory({
          promisedActivityLog: [activityLog],
          promisedField: [field],
        });
      });


      describe('Get soilDataLog tests', () => {


        test('Get by activity_id test', async (done) => {
          getRequest({ user_id: owner.user_id, url: `/log/${activityLog.activity_id}` }, (err, res) => {
            expect(res.status).toBe(200);

            expect(res.body.notes).toBe(activityLog.notes);
            done();
          });
        });


        test('Get by farm_id', async (done) => {
          let [activityLog1] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
            ...mocks.fakeActivityLog(),
            activity_kind: 'soilData',
          });
          let [soilDataLog1] = await mocks.soilDataLogFactory({
            promisedActivityLog: [activityLog1],
          });
          let [activityCropLog1] = await mocks.activityCropsFactory({
            promisedActivityLog: [activityLog1],
            promisedManagementPlan: [managementPlan],
          });
          let [activityFieldLog1] = await mocks.activityFieldsFactory({
            promisedActivityLog: [activityLog1],
            promisedField: [field],
          });
          getRequest({ user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].notes).toBe(activityLog.notes);
            expect(res.body[0].managementPlan.length).toBe(0);
            expect(res.body[0].location[0].location_id).toBe(field.location_id);
            done();
          });
        });
      });


      describe('Put soilDataLog tests', () => {
        // TODO update single locations tests
        let crop1;
        let field1;
        let managementPlan1;
        let sampleRequestBody;
        let fakeActivityLog;
        let fakeSoilDataLog;
        beforeEach(async () => {
          fakeActivityLog = mocks.fakeActivityLog();
          fakeSoilDataLog = mocks.fakeSoilDataLog();
          [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
          let [weatherStation] = await mocks.weather_stationFactory();
          [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
          [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

          sampleRequestBody = {
            activity_id: activityLog.activity_id,
            activity_kind: activityLog.activity_kind,
            date: fakeActivityLog.date,
            user_id: owner.user_id,
            notes: fakeActivityLog.notes,
            crops: [{ field_crop_id: managementPlan.field_crop_id }, { field_crop_id: managementPlan1.field_crop_id }],
            locations: [{ location_id: field.location_id }, { location_id: field1.location_id }],
            ...fakeSoilDataLog,

          };
        });

        test('Owner should put soilDataLog tests with multiple field_crop and field', async (done) => {
          sampleRequestBody.crops = [];
          putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', owner.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const soilDataLog = await soilDataLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(soilDataLog.length).toBe(1);
            expect(soilDataLog[0].quantity_kg).toBe(fakeSoilDataLog.quantity_kg);
            const activityFieldLog = await activityFieldsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityFieldLog.length).toBe(2);
            expect(activityFieldLog[1].location_id).toBe(field1.location_id);
            const activityCrops = await activityCropsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityCrops.length).toBe(0);
            done();
          });
        });

        //TODO fail
        xtest('Should return 400 when managementPlans is not empty', async (done) => {
          putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
            expect(res.status).toBe(400);
            done();
          });
        });


      });

    });


    describe('irrigationLog tests', () => {
      let irrigationLog;
      let activityLog;
      let activityCropLog;
      let activityFieldLog;
      let crop;
      let field;
      let managementPlan;
      beforeEach(async () => {
        [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan] = await mocks.management_planFactory({ promisedCrop: [crop], promisedField: [field] });
        [activityLog] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
          ...mocks.fakeActivityLog(),
          activity_kind: 'irrigation',
        });
        [irrigationLog] = await mocks.irrigationLogFactory({
          promisedActivity: [activityLog],
        });
        [activityCropLog] = await mocks.activityCropsFactory({
          promisedActivityLog: [activityLog],
          promisedManagementPlan: [managementPlan],
        });
        [activityFieldLog] = await mocks.activityFieldsFactory({
          promisedActivityLog: [activityLog],
          promisedField: [field],
        });
      });


      describe('Get irrigationLog tests', () => {


        test('Get by activity_id test', async (done) => {
          getRequest({ user_id: owner.user_id, url: `/log/${activityLog.activity_id}` }, (err, res) => {
            expect(res.status).toBe(200);

            expect(res.body.notes).toBe(activityLog.notes);
            done();
          });
        });


        test('Get by farm_id', async (done) => {
          let [activityLog1] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
            ...mocks.fakeActivityLog(),
            activity_kind: 'irrigation',
          });
          let [irrigationLog1] = await mocks.irrigationLogFactory({
            promisedActivityLog: [activityLog1],
          });
          let [activityCropLog1] = await mocks.activityCropsFactory({
            promisedActivityLog: [activityLog1],
            promisedManagementPlan: [managementPlan],
          });
          let [activityFieldLog1] = await mocks.activityFieldsFactory({
            promisedActivityLog: [activityLog1],
            promisedField: [field],
          });
          getRequest({ user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.map(activityLog => activityLog.activity_id)).toEqual([activityLog.activity_id, activityLog1.activity_id]);
            expect(res.body[0].managementPlan[0].field_crop_id).toBe(managementPlan.field_crop_id);
            expect(res.body[0].location[0].location_id).toBe(field.location_id);
            done();
          });
        });
      });


      describe('Put irrigationLog tests', () => {
        // TODO update single locations tests
        let crop1;
        let field1;
        let managementPlan1;
        let sampleRequestBody;
        let fakeActivityLog;
        let fakeIrrigationLog;
        beforeEach(async () => {
          fakeActivityLog = mocks.fakeActivityLog();
          fakeIrrigationLog = mocks.fakeIrrigationLog();
          [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
          let [weatherStation] = await mocks.weather_stationFactory();
          [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
          [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

          sampleRequestBody = {
            activity_id: activityLog.activity_id,
            activity_kind: activityLog.activity_kind,
            date: fakeActivityLog.date,
            user_id: owner.user_id,
            notes: fakeActivityLog.notes,
            crops: [{ field_crop_id: managementPlan.field_crop_id }, { field_crop_id: managementPlan1.field_crop_id }],
            locations: [{ location_id: field.location_id }, { location_id: field1.location_id }],
            ...fakeIrrigationLog,

          };
        });

        test('Owner should put irrigationLog tests with multiple field_crop and field', async (done) => {
          putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', owner.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const irrigationLog = await irrigationLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(irrigationLog.length).toBe(1);
            expect(irrigationLog[0].quantity_kg).toBe(fakeIrrigationLog.quantity_kg);
            const activityFieldLog = await activityFieldsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityFieldLog.length).toBe(2);
            expect(activityFieldLog[1].location_id).toBe(field1.location_id);
            const activityCrops = await activityCropsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityCrops.length).toBe(2);
            expect(activityCrops[1].field_crop_id).toBe(managementPlan1.field_crop_id);
            done();
          });
        });


      });

    });

    describe('scoutingLog tests', () => {
      let scoutingLog;
      let activityLog;
      let activityCropLog;
      let activityFieldLog;
      let crop;
      let field;
      let managementPlan;
      beforeEach(async () => {
        [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan] = await mocks.management_planFactory({ promisedCrop: [crop], promisedField: [field] });
        [activityLog] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
          ...mocks.fakeActivityLog(),
          activity_kind: 'scouting',
        });
        [scoutingLog] = await mocks.scoutingLogFactory({
          promisedActivity: [activityLog],
        });
        [activityCropLog] = await mocks.activityCropsFactory({
          promisedActivityLog: [activityLog],
          promisedManagementPlan: [managementPlan],
        });
        [activityFieldLog] = await mocks.activityFieldsFactory({
          promisedActivityLog: [activityLog],
          promisedField: [field],
        });
      });


      describe('Get scoutingLog tests', () => {


        test('Get by activity_id test', async (done) => {
          getRequest({ user_id: owner.user_id, url: `/log/${activityLog.activity_id}` }, (err, res) => {
            expect(res.status).toBe(200);

            expect(res.body.notes).toBe(activityLog.notes);
            done();
          });
        });


        test('Get by farm_id', async (done) => {
          let [activityLog1] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
            ...mocks.fakeActivityLog(),
            activity_kind: 'scouting',
          });
          let [scoutingLog1] = await mocks.scoutingLogFactory({
            promisedActivityLog: [activityLog1],
          });
          let [activityCropLog1] = await mocks.activityCropsFactory({
            promisedActivityLog: [activityLog1],
            promisedManagementPlan: [managementPlan],
          });
          let [activityFieldLog1] = await mocks.activityFieldsFactory({
            promisedActivityLog: [activityLog1],
            promisedField: [field],
          });
          getRequest({ user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].notes).toBe(activityLog.notes);
            expect(res.body[0].managementPlan[0].field_crop_id).toBe(managementPlan.field_crop_id);
            expect(res.body[0].location[0].location_id).toBe(field.location_id);
            done();
          });
        });
      });


      describe('Put scoutingLog tests', () => {
        // TODO update single locations tests
        let crop1;
        let field1;
        let managementPlan1;
        let sampleRequestBody;
        let fakeActivityLog;
        let fakeScoutingLog;
        beforeEach(async () => {
          fakeActivityLog = mocks.fakeActivityLog();
          fakeScoutingLog = mocks.fakeScoutingLog();
          [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
          let [weatherStation] = await mocks.weather_stationFactory();
          [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
          [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

          sampleRequestBody = {
            activity_id: activityLog.activity_id,
            activity_kind: activityLog.activity_kind,
            date: fakeActivityLog.date,
            user_id: owner.user_id,
            notes: fakeActivityLog.notes,
            crops: [{ field_crop_id: managementPlan.field_crop_id }, { field_crop_id: managementPlan1.field_crop_id }],
            locations: [{ location_id: field.location_id }, { location_id: field1.location_id }],
            ...fakeScoutingLog,

          };
        });

        test('Owner should put scoutingLog tests with multiple field_crop and field', async (done) => {
          putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', owner.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const scoutingLog = await scoutingLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(scoutingLog.length).toBe(1);
            expect(scoutingLog[0].quantity_kg).toBe(fakeScoutingLog.quantity_kg);
            const activityFieldLog = await activityFieldsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityFieldLog.length).toBe(2);
            expect(activityFieldLog[1].location_id).toBe(field1.location_id);
            const activityCrops = await activityCropsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityCrops.length).toBe(2);
            expect(activityCrops[1].field_crop_id).toBe(managementPlan1.field_crop_id);
            done();
          });
        });


      });

    });

    describe('otherLog tests', () => {
      let activityLog;
      let activityCropLog;
      let activityFieldLog;
      let crop;
      let field;
      let managementPlan;
      beforeEach(async () => {
        [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan] = await mocks.management_planFactory({ promisedCrop: [crop], promisedField: [field] });
        [activityLog] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
          ...mocks.fakeActivityLog(),
          activity_kind: 'other',
        });
        [activityCropLog] = await mocks.activityCropsFactory({
          promisedActivityLog: [activityLog],
          promisedManagementPlan: [managementPlan],
        });
        [activityFieldLog] = await mocks.activityFieldsFactory({
          promisedActivityLog: [activityLog],
          promisedField: [field],
        });
      });


      describe('Get otherLog tests', () => {


        test('Get by activity_id test', async (done) => {
          getRequest({ user_id: owner.user_id, url: `/log/${activityLog.activity_id}` }, (err, res) => {
            expect(res.status).toBe(200);

            expect(res.body.notes).toBe(activityLog.notes);
            done();
          });
        });


        test('Get by farm_id', async (done) => {
          let [activityLog1] = await mocks.activityLogFactory({ promisedUser: [owner] }, {
            ...mocks.fakeActivityLog(),
            activity_kind: 'other',
          });
          let [activityCropLog1] = await mocks.activityCropsFactory({
            promisedActivityLog: [activityLog1],
            promisedManagementPlan: [managementPlan],
          });
          let [activityFieldLog1] = await mocks.activityFieldsFactory({
            promisedActivityLog: [activityLog1],
            promisedField: [field],
          });
          getRequest({ user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].notes).toBe(activityLog.notes);
            expect(res.body[0].managementPlan[0].field_crop_id).toBe(managementPlan.field_crop_id);
            expect(res.body[0].location[0].location_id).toBe(field.location_id);
            done();
          });
        });
      });


      describe('Put otherLog tests', () => {
        // TODO update single locations tests
        let crop1;
        let field1;
        let managementPlan1;
        let sampleRequestBody;
        let fakeActivityLog;
        beforeEach(async () => {
          fakeActivityLog = mocks.fakeActivityLog();
          [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
          let [weatherStation] = await mocks.weather_stationFactory();
          [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
          [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

          sampleRequestBody = {
            activity_id: activityLog.activity_id,
            activity_kind: activityLog.activity_kind,
            date: fakeActivityLog.date,
            user_id: owner.user_id,
            notes: fakeActivityLog.notes,
            crops: [{ field_crop_id: managementPlan.field_crop_id }, { field_crop_id: managementPlan1.field_crop_id }],
            locations: [{ location_id: field.location_id }, { location_id: field1.location_id }],


          };
        });

        test('Owner should put otherLog tests with multiple field_crop and field', async (done) => {
          putRequest(sampleRequestBody, { user_id: owner.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', owner.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const activityFieldLog = await activityFieldsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityFieldLog.length).toBe(2);
            expect(activityFieldLog[1].location_id).toBe(field1.location_id);
            const activityCrops = await activityCropsModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(activityCrops.length).toBe(2);
            expect(activityCrops[1].field_crop_id).toBe(managementPlan1.field_crop_id);
            done();
          });
        });


      });

    });


  });


  describe('Post log', () => {

    describe('Post fertilizerLog', () => {
      let fakefertilizingLog;
      let fakeActivityLog;
      let fertilizer;
      let crop1;
      let field1;
      let managementPlan1;
      let sampleRequestBody;
      beforeEach(async () => {
        fakeActivityLog = newFakeActivityLog('fertilizing');
        fakefertilizingLog = mocks.fakeFertilizerLog();
        [fertilizer] = await mocks.fertilizerFactory({ promisedFarm: [farm] });
        [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

        sampleRequestBody = {
          activity_kind: fakeActivityLog.activity_kind,
          date: fakeActivityLog.date,
          user_id: fakeActivityLog.user_id,
          notes: fakeActivityLog.notes,
          quantity_kg: fakefertilizingLog.quantity_kg,
          crops: [{ field_crop_id: managementPlan1.field_crop_id }],
          locations: [{ location_id: field1.location_id }],
          fertilizer_id: fertilizer.fertilizer_id,
        };
      });

      //TODO fail
      xtest('Should return 400 when activity_kind does not fit req.body shape', async (done) => {
        sampleRequestBody.activity_kind = 'soilData';
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });

      xtest('Should return 400 when activity_kind does not fit req.body shape2', async (done) => {
        sampleRequestBody.activity_kind = 'fieldWork';
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });

      test('Should return 400 when pesticide does not exist', async (done) => {
        sampleRequestBody.activity_kind = 'pestControl';
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });

      test('Should return 400 when activity_kind is invalid', async (done) => {
        sampleRequestBody.activity_kind = 'invalid';
        postRequest(sampleRequestBody, {}, async (err, res) => {
          //TODO should return 400
          expect(res.status).toBe(404);
          done();
        });
      });

      test('Should return 400 when all locations do not exist', async (done) => {
        sampleRequestBody.locations = [{ location_id: 'invalid' }];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          //TODO should return 400
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Should return 400 when  only 1 field does not exist', async (done) => {
        sampleRequestBody.locations = [{ location_id: 'invalid' }, sampleRequestBody.locations[0]];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });
      //TODO fail
      xtest('Should return 403 when 1 of the 2 locations references a farm that the user does have access to', async (done) => {
        const [newField] = await mocks.fieldFactory();
        sampleRequestBody.locations = [{ location_id: newField.location_id }, sampleRequestBody.locations[0]];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          //     //TODO should return 400
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Should return 400 when all managementPlan do not exist', async (done) => {
        sampleRequestBody.crops = [{ field_crop_id: 1111111 }];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          //TODO error status
          expect(res.status).toBe(404);
          done();
        });
      });

      //TODO fail
      xtest('Should return 400 when 1 managementPlan references a field that is not in body.locations', async (done) => {
        const [newManagementPlan] = await mocks.management_planFactory({ promisedField: mocks.fieldFactory({ promisedFarm: [farm] }) });
        sampleRequestBody.crops = [{ field_crop_id: newManagementPlan.field_crop_id }, sampleRequestBody.crops[0]];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });

      xtest('Should return 403 when 1 managementPlan references a field that user does not have access to', async (done) => {
        const [newManagementPlan] = await mocks.management_planFactory();
        sampleRequestBody.crops = [{ field_crop_id: newManagementPlan.field_crop_id }, sampleRequestBody.crops[0]];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Should return 400 when 1 managementPlan does not exist', async (done) => {
        sampleRequestBody.crops = [{ field_crop_id: 1111111 }, sampleRequestBody.crops[0]];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          //TODO error status
          expect(res.status).toBe(404);
          done();
        });
      });

      test('Owner should post fertilizing log for a field', async (done) => {
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const fertilizerLog = await fertilizerLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(fertilizerLog.length).toBe(1);
          expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
          done();
        });
      });


      test('Owner should post fertilizing log for a garden', async (done) => {
        const [garden] = await mocks.gardenFactory({ promisedFarm: [farm] });

        sampleRequestBody.locations.push(garden);
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const fertilizerLog = await fertilizerLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(fertilizerLog.length).toBe(1);
          expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
          done();
        });
      });

      test('Owner should post fertilizing log for a bufferZone', async (done) => {
        const [bufferZone] = await mocks.buffer_zoneFactory({ promisedFarm: [farm] });

        sampleRequestBody.locations.push(bufferZone);
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const fertilizerLog = await fertilizerLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(fertilizerLog.length).toBe(1);
          expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
          done();
        });
      });

      test('Owner should post fertilizing log for a greenhouse', async (done) => {
        const [greenhouse] = await mocks.greenhouseFactory({ promisedFarm: [farm] });

        sampleRequestBody.locations.push(greenhouse);
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const fertilizerLog = await fertilizerLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(fertilizerLog.length).toBe(1);
          expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
          done();
        });
      });

      test('Owner should post fertilizing log for a greenhouse, a field, a garden, and a bufferZone', async (done) => {
        const [greenhouse] = await mocks.greenhouseFactory({ promisedFarm: [farm] });
        sampleRequestBody.locations.push(greenhouse);
        const [garden] = await mocks.gardenFactory({ promisedFarm: [farm] });
        sampleRequestBody.locations.push(garden);
        const [bufferZone] = await mocks.buffer_zoneFactory({ promisedFarm: [farm] });
        sampleRequestBody.locations.push(bufferZone);
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const fertilizerLog = await fertilizerLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(fertilizerLog.length).toBe(1);
          expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
          done();
        });
      });

      test('Should return 400 if log reference a barn', async (done) => {
        const [barn] = await mocks.barnFactory({ promisedFarm: [farm] });
        sampleRequestBody.locations.push(barn);
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });

      test('Should return 400 if log reference a ceremonial_area', async (done) => {
        const [ceremonial_area] = await mocks.ceremonial_areaFactory({ promisedFarm: [farm] });
        sampleRequestBody.locations.push(ceremonial_area);
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
      test('Should return 400 if log reference a farm_site_boundary', async (done) => {
        const [farm_site_boundary] = await mocks.farm_site_boundaryFactory({ promisedFarm: [farm] });
        sampleRequestBody.locations.push(farm_site_boundary);
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
      test('Should return 400 if log reference a surface_water', async (done) => {
        const [surface_water] = await mocks.surface_waterFactory({ promisedFarm: [farm] });
        sampleRequestBody.locations.push(surface_water);
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
      test('Should return 400 if log reference a natural_area', async (done) => {
        const [natural_area] = await mocks.natural_areaFactory({ promisedFarm: [farm] });
        sampleRequestBody.locations.push(natural_area);
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
      test('Should return 400 if log reference a residence', async (done) => {
        const [residence] = await mocks.residenceFactory({ promisedFarm: [farm] });
        sampleRequestBody.locations.push(residence);
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
      test('Should return 400 if log reference a watercourse', async (done) => {
        const [watercourse] = await mocks.watercourseFactory({ promisedFarm: [farm] });
        sampleRequestBody.locations.push(watercourse);
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
      test('Should return 400 if log reference a fence', async (done) => {
        const [fence] = await mocks.fenceFactory({ promisedFarm: [farm] });
        sampleRequestBody.locations.push(fence);
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
      test('Should return 400 if log reference a gate', async (done) => {
        const [gate] = await mocks.gateFactory({ promisedFarm: [farm] });
        sampleRequestBody.locations.push(gate);
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
      test('Should return 400 if log reference a water_valve', async (done) => {
        const [water_valve] = await mocks.water_valveFactory({ promisedFarm: [farm] });
        sampleRequestBody.locations.push(water_valve);
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });

      test('Owner should post and get many valid fertilizingLogs', async (done) => {
        let [crop2] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        let [field2] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        let [managementPlan2] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field1] });
        let [managementPlan3] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field2] });
        sampleRequestBody.locations = [{ location_id: field1.location_id }, { location_id: field2.location_id }];
        sampleRequestBody.crops = [{ field_crop_id: managementPlan1.field_crop_id }, { field_crop_id: managementPlan2.field_crop_id }, { field_crop_id: managementPlan3.field_crop_id }];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const fertilizerLog = await fertilizerLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(fertilizerLog.length).toBe(1);
          expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
          const activityFields = await activityFieldsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityFields.length).toBe(2);
          expect(activityFields[1].location_id).toBe(field2.location_id);
          const activityCropss = await activityCropsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityCropss.length).toBe(3);
          expect(activityCropss[1].field_crop_id).toBe(managementPlan2.field_crop_id);
          done();
        });
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
        });

        test('Manager should post and get a valid fertilizingLog', async (done) => {
          sampleRequestBody.user_id = manager.user_id;
          postRequest(sampleRequestBody, { user_id: manager.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', manager.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const fertilizerLog = await fertilizerLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(fertilizerLog.length).toBe(1);
            expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
            done();
          });
        });

        test('Worker should post and get a valid fertilizingLog', async (done) => {
          sampleRequestBody.user_id = workder.user_id;
          postRequest(sampleRequestBody, { user_id: workder.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', workder.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const fertilizerLog = await fertilizerLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(fertilizerLog.length).toBe(1);
            expect(fertilizerLog[0].fertilizer_id).toBe(fertilizer.fertilizer_id);
            done();
          });
        });

        //TODO fail
        xtest('Should return 403 when a manager tries to post a log for a worker', async (done) => {
          sampleRequestBody.user_id = workder.user_id;
          postRequest(sampleRequestBody, { user_id: manager.user_id }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('should return 403 status if fertilizingLog is posted by unauthorized user', async (done) => {
          sampleRequestBody.user_id = unAuthorizedUser.user_id;
          postRequest(sampleRequestBody, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          sampleRequestBody.user_id = unAuthorizedUser.user_id;
          postRequest(sampleRequestBody, {
            user_id: workder.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id in body', async (done) => {
          sampleRequestBody.user_id = unAuthorizedUser.user_id;
          sampleRequestBody.farm_id = farmunAuthorizedUser.farm_id;
          postRequest(sampleRequestBody, {
            user_id: workder.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

      });


    });


    describe('Post pestControlLog', () => {
      let fakePestControlLog;
      let fakeActivityLog;
      let pesticide;
      let crop1;
      let field1;
      let managementPlan1;
      let sampleRequestBody;
      let disease;
      beforeEach(async () => {
        fakeActivityLog = newFakeActivityLog('pestControl');
        fakePestControlLog = mocks.fakePestControlLog();
        [pesticide] = await mocks.pesticideFactory({ promisedFarm: [farm] });
        [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });
        [disease] = await mocks.diseaseFactory({ promisedFarm: [farm] });
        sampleRequestBody = {
          activity_kind: fakeActivityLog.activity_kind,
          date: fakeActivityLog.date,
          user_id: fakeActivityLog.user_id,
          notes: fakeActivityLog.notes,
          quantity_kg: fakePestControlLog.quantity_kg,
          type: fakePestControlLog.type,
          crops: [{ field_crop_id: managementPlan1.field_crop_id }],
          locations: [{ location_id: field1.location_id }],
          pesticide_id: pesticide.pesticide_id,
          target_disease_id: disease.disease_id,
        };

      });

      test('Owner should post and get a valid pestControlLog', async (done) => {
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const pestControlLog = await pestControlLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(pestControlLog.length).toBe(1);
          expect(pestControlLog[0].pesticide_id).toBe(pesticide.pesticide_id);
          done();
        });
      });

      test('Owner should post and get many valid pestControlLogs', async (done) => {
        let [crop2] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        let [field2] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        let [managementPlan2] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field1] });
        let [managementPlan3] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field2] });
        sampleRequestBody.locations = [{ location_id: field1.location_id }, { location_id: field2.location_id }];
        sampleRequestBody.crops = [{ field_crop_id: managementPlan1.field_crop_id }, { field_crop_id: managementPlan2.field_crop_id }, { field_crop_id: managementPlan3.field_crop_id }];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const pestControlLog = await pestControlLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(pestControlLog.length).toBe(1);
          expect(pestControlLog[0].pesticide_id).toBe(pesticide.pesticide_id);
          const activityFields = await activityFieldsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityFields.length).toBe(2);
          expect(activityFields[1].location_id).toBe(field2.location_id);
          const activityCropss = await activityCropsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityCropss.length).toBe(3);
          expect(activityCropss[1].field_crop_id).toBe(managementPlan2.field_crop_id);
          done();
        });
      });

      describe('Post log authorization tests', () => {

        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
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
        });

        test('Manager should post and get a valid pestControlLog', async (done) => {
          sampleRequestBody.user_id = manager.user_id;
          postRequest(sampleRequestBody, { user_id: manager.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', manager.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const pestControlLog = await pestControlLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(pestControlLog.length).toBe(1);
            expect(pestControlLog[0].pesticide_id).toBe(pesticide.pesticide_id);
            done();
          });
        });

        test('Worker should post and get a valid pestControlLog', async (done) => {
          sampleRequestBody.user_id = worker.user_id;
          postRequest(sampleRequestBody, { user_id: worker.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', worker.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const pestControlLog = await pestControlLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(pestControlLog.length).toBe(1);
            expect(pestControlLog[0].pesticide_id).toBe(pesticide.pesticide_id);
            done();
          });
        });

        test('should return 403 status if pestControlLog is posted by unauthorized user', async (done) => {
          sampleRequestBody.user_id = unAuthorizedUser.user_id;
          postRequest(sampleRequestBody, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          sampleRequestBody.user_id = unAuthorizedUser.user_id;
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id in body', async (done) => {
          sampleRequestBody.user_id = unAuthorizedUser.user_id;
          sampleRequestBody.farm_id = farmunAuthorizedUser.farm_id;
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

      });


    });


    describe('Post harvestLog', () => {
      let fakeHarvestLog;
      let fakeActivityLog;
      let crop1;
      let field1;
      let managementPlan1;
      let sampleRequestBody;
      let fakeHarvestUseType;
      let fakeHarvestUse;
      beforeEach(async () => {
        fakeActivityLog = newFakeActivityLog('harvest');
        fakeHarvestLog = mocks.fakeHarvestLog();
        [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });
        [fakeHarvestUseType] = await mocks.harvestUseTypeFactory({ promisedFarm: [farm] });
        fakeHarvestUse = mocks.fakeHarvestUse();
        fakeHarvestUseType.quantity_kg = fakeHarvestUse.quantity_kg;

        sampleRequestBody = {
          activity_kind: fakeActivityLog.activity_kind,
          date: fakeActivityLog.date,
          user_id: fakeActivityLog.user_id,
          notes: fakeActivityLog.notes,
          quantity_kg: fakeHarvestLog.quantity_kg,
          crops: [{ field_crop_id: managementPlan1.field_crop_id }],
          locations: [{ location_id: field1.location_id }],
          selectedUseTypes: [
            fakeHarvestUseType,
          ],
        };


      });

      test('Owner should post and get a valid harvestLog', async (done) => {
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const harvestLog = await harvestLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(harvestLog.length).toBe(1);
          expect(harvestLog[0].quantity_kg).toBe(fakeHarvestLog.quantity_kg);
          const harvestUse = await harvestUseModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('harvest_use_type_id', fakeHarvestUseType.harvest_use_type_id);
          expect(harvestLog.length).toBe(1);
          expect(harvestUse[0].quantity_kg).toBe(fakeHarvestUseType.quantity_kg);
          done();
        });
      });

      test('Owner should post and get many valid harvestLogs', async (done) => {
        let [crop2] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        let [field2] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        let [managementPlan2] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field1] });
        let [managementPlan3] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field2] });
        sampleRequestBody.locations = [{ location_id: field1.location_id }, { location_id: field2.location_id }];
        sampleRequestBody.crops = [{ field_crop_id: managementPlan1.field_crop_id }, { field_crop_id: managementPlan2.field_crop_id }, { field_crop_id: managementPlan3.field_crop_id }];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const harvestLog = await harvestLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(harvestLog.length).toBe(1);
          expect(harvestLog[0].quantity_kg).toBe(fakeHarvestLog.quantity_kg);
          const activityFields = await activityFieldsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityFields.length).toBe(2);
          expect(activityFields[1].location_id).toBe(field2.location_id);
          const activityCropss = await activityCropsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityCropss.length).toBe(3);
          expect(activityCropss[1].field_crop_id).toBe(managementPlan2.field_crop_id);
          const harvestUse = await harvestUseModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('harvest_use_type_id', fakeHarvestUseType.harvest_use_type_id);
          expect(harvestLog.length).toBe(1);
          expect(harvestUse[0].quantity_kg).toBe(fakeHarvestUseType.quantity_kg);
          done();
        });
      });

      describe('Post log authorization tests', () => {

        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
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
        });

        test('Manager should post and get a valid harvestLog', async (done) => {
          sampleRequestBody.user_id = manager.user_id;
          postRequest(sampleRequestBody, { user_id: manager.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', manager.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const harvestLog = await harvestLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(harvestLog.length).toBe(1);
            expect(harvestLog[0].quantity_kg).toBe(fakeHarvestLog.quantity_kg);
            const harvestUse = await harvestUseModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('harvest_use_type_id', fakeHarvestUseType.harvest_use_type_id);
            expect(harvestLog.length).toBe(1);
            expect(harvestUse[0].quantity_kg).toBe(fakeHarvestUseType.quantity_kg);
            done();
          });
        });

        test('Worker should post and get a valid harvestLog', async (done) => {
          sampleRequestBody.user_id = worker.user_id;
          postRequest(sampleRequestBody, { user_id: worker.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', worker.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const harvestLog = await harvestLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(harvestLog.length).toBe(1);
            expect(harvestLog[0].quantity_kg).toBe(fakeHarvestLog.quantity_kg);
            const harvestUse = await harvestUseModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('harvest_use_type_id', fakeHarvestUseType.harvest_use_type_id);
            expect(harvestLog.length).toBe(1);
            expect(harvestUse[0].quantity_kg).toBe(fakeHarvestUseType.quantity_kg);
            done();
          });
        });

        test('should return 403 status if harvestLog is posted by unauthorized user', async (done) => {
          postRequest(sampleRequestBody, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id in body', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

      });


    });


    describe('Post seedLog', () => {
      let fakeSeedLog;
      let fakeActivityLog;
      let crop1;
      let field1;
      let managementPlan1;
      let sampleRequestBody;
      beforeEach(async () => {
        fakeActivityLog = newFakeActivityLog('seeding');
        fakeSeedLog = mocks.fakeSeedLog();
        [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

        sampleRequestBody = {
          activity_kind: fakeActivityLog.activity_kind,
          date: fakeActivityLog.date,
          user_id: fakeActivityLog.user_id,
          notes: fakeActivityLog.notes,
          space_depth_cm: fakeSeedLog.space_depth_cm,
          space_length_cm: fakeSeedLog.space_length_cm,
          space_width_cm: fakeSeedLog.space_width_cm,
          'rate_seeds/m2': fakeSeedLog['rate_seeds/m2'],
          crops: [{ field_crop_id: managementPlan1.field_crop_id }],
          locations: [{ location_id: field1.location_id }],
        };

      });

      test('Owner should post and get a valid seedLog', async (done) => {
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const seedLog = await seedLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(seedLog.length).toBe(1);
          expect(seedLog[0].space_depth_cm).toBe(fakeSeedLog.space_depth_cm);
          done();
        });
      });

      test('Owner should post and get many valid seedLogs', async (done) => {
        let [crop2] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        let [field2] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        let [managementPlan2] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field1] });
        let [managementPlan3] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field2] });
        sampleRequestBody.locations = [{ location_id: field1.location_id }, { location_id: field2.location_id }];
        sampleRequestBody.crops = [{ field_crop_id: managementPlan1.field_crop_id }, { field_crop_id: managementPlan2.field_crop_id }, { field_crop_id: managementPlan3.field_crop_id }];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const seedLog = await seedLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(seedLog.length).toBe(1);
          expect(seedLog[0].space_depth_cm).toBe(fakeSeedLog.space_depth_cm);
          const activityFields = await activityFieldsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityFields.length).toBe(2);
          expect(activityFields[1].location_id).toBe(field2.location_id);
          const activityCropss = await activityCropsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityCropss.length).toBe(3);
          expect(activityCropss[1].field_crop_id).toBe(managementPlan2.field_crop_id);
          done();
        });
      });

      describe('Post log authorization tests', () => {

        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
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
        });

        test('Manager should post and get a valid seedLog', async (done) => {
          sampleRequestBody.user_id = manager.user_id;
          postRequest(sampleRequestBody, { user_id: manager.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', manager.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const seedLog = await seedLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(seedLog.length).toBe(1);
            expect(seedLog[0].space_depth_cm).toBe(fakeSeedLog.space_depth_cm);
            done();
          });
        });

        test('Worker should post and get a valid seedLog', async (done) => {
          sampleRequestBody.user_id = worker.user_id;
          postRequest(sampleRequestBody, { user_id: worker.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', worker.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const seedLog = await seedLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(seedLog.length).toBe(1);
            expect(seedLog[0].space_depth_cm).toBe(fakeSeedLog.space_depth_cm);
            done();
          });
        });

        test('should return 403 status if seedLog is posted by unauthorized user', async (done) => {
          postRequest(sampleRequestBody, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id in body', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

      });


    });


    describe('Post fieldWorkLog', () => {
      let fakeFieldWorkLog;
      let fakeActivityLog;
      let crop1;
      let field1;
      let managementPlan1;
      let sampleRequestBody;
      beforeEach(async () => {
        fakeActivityLog = newFakeActivityLog('fieldWork');
        fakeFieldWorkLog = mocks.fakeFieldWorkLog();
        [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

        sampleRequestBody = {
          activity_kind: fakeActivityLog.activity_kind,
          date: fakeActivityLog.date,
          user_id: fakeActivityLog.user_id,
          notes: fakeActivityLog.notes,
          type: fakeFieldWorkLog.type,
          crops: [], //TODO validate crops is empty
          locations: [{ location_id: field1.location_id }],
        };

      });

      test('Owner should post and get a valid fieldWorkLog', async (done) => {
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const fieldWorkLog = await fieldWorkLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(fieldWorkLog.length).toBe(1);
          expect(fieldWorkLog[0].type).toBe(fakeFieldWorkLog.type);
          done();
        });
      });

      test('Owner should post and get many valid fieldWorkLogs', async (done) => {
        let [crop2] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        let [field2] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        let [managementPlan2] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field1] });
        let [managementPlan3] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field2] });
        sampleRequestBody.locations = [{ location_id: field1.location_id }, { location_id: field2.location_id }];
        sampleRequestBody.crops = [{ field_crop_id: managementPlan1.field_crop_id }, { field_crop_id: managementPlan2.field_crop_id }, { field_crop_id: managementPlan3.field_crop_id }];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const fieldWorkLog = await fieldWorkLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(fieldWorkLog.length).toBe(1);
          expect(fieldWorkLog[0].type).toBe(fakeFieldWorkLog.type);
          const activityFields = await activityFieldsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityFields.length).toBe(2);
          expect(activityFields[1].location_id).toBe(field2.location_id);
          done();
        });
      });

      describe('Post log authorization tests', () => {

        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
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
        });

        test('Manager should post and get a valid fieldWorkLog', async (done) => {
          sampleRequestBody.user_id = manager.user_id;
          postRequest(sampleRequestBody, { user_id: manager.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', manager.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const fieldWorkLog = await fieldWorkLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(fieldWorkLog.length).toBe(1);
            expect(fieldWorkLog[0].type).toBe(fakeFieldWorkLog.type);
            done();
          });
        });

        test('Worker should post and get a valid fieldWorkLog', async (done) => {
          sampleRequestBody.user_id = worker.user_id;
          postRequest(sampleRequestBody, { user_id: worker.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', worker.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const fieldWorkLog = await fieldWorkLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(fieldWorkLog.length).toBe(1);
            expect(fieldWorkLog[0].type).toBe(fakeFieldWorkLog.type);
            done();
          });
        });

        test('should return 403 status if fieldWorkLog is posted by unauthorized user', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          postRequest(sampleRequestBody, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id in body', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          sampleRequestBody.farm_id = farmunAuthorizedUser.farm_id;
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

      });


    });


    describe('Post soilAnalysis', () => {
      let fakeSoilDataLog;
      let fakeActivityLog;
      let crop1;
      let field1;
      let managementPlan1;
      let sampleRequestBody;
      beforeEach(async () => {
        fakeActivityLog = newFakeActivityLog('soilData');
        fakeSoilDataLog = mocks.fakeSoilDataLog();
        [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });
        sampleRequestBody = {
          activity_kind: fakeActivityLog.activity_kind,
          date: fakeActivityLog.date,
          user_id: fakeActivityLog.user_id,
          notes: fakeActivityLog.notes,
          crops: [], //TODO validate crops is empty
          locations: [{ location_id: field1.location_id }],
          ...fakeSoilDataLog,
        };
      });

      test('Owner should post and get a valid soilDataLog', async (done) => {
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const soilDataLog = await soilDataLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(soilDataLog.length).toBe(1);
          expect(soilDataLog[0].inorganic_carbon).toBe(fakeSoilDataLog.inorganic_carbon);
          done();
        });
      });

      test('Owner should post and get many valid soilDataLogs', async (done) => {
        let [crop2] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        let [field2] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        let [managementPlan2] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field1] });
        let [managementPlan3] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field2] });
        sampleRequestBody.locations = [{ location_id: field1.location_id }, { location_id: field2.location_id }];
        sampleRequestBody.crops = [{ field_crop_id: managementPlan1.field_crop_id }, { field_crop_id: managementPlan2.field_crop_id }, { field_crop_id: managementPlan3.field_crop_id }];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const soilDataLog = await soilDataLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(soilDataLog.length).toBe(1);
          expect(soilDataLog[0].inorganic_carbon).toBe(fakeSoilDataLog.inorganic_carbon);
          const activityFields = await activityFieldsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityFields.length).toBe(2);
          expect(activityFields[1].location_id).toBe(field2.location_id);
          done();
        });
      });

      describe('Post log authorization tests', () => {

        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
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
        });

        test('Manager should post and get a valid soilDataLog', async (done) => {
          sampleRequestBody.user_id = manager.user_id;
          postRequest(sampleRequestBody, { user_id: manager.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', manager.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const soilDataLog = await soilDataLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(soilDataLog.length).toBe(1);
            expect(soilDataLog[0].inorganic_carbon).toBe(fakeSoilDataLog.inorganic_carbon);
            done();
          });
        });

        test('Worker should post and get a valid soilDataLog', async (done) => {
          sampleRequestBody.user_id = worker.user_id;
          postRequest(sampleRequestBody, { user_id: worker.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', worker.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const soilDataLog = await soilDataLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(soilDataLog.length).toBe(1);
            expect(soilDataLog[0].inorganic_carbon).toBe(fakeSoilDataLog.inorganic_carbon);
            done();
          });
        });

        test('should return 403 status if soilDataLog is posted by unauthorized user', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          postRequest(sampleRequestBody, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id in body', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          sampleRequestBody.farm_id = farmunAuthorizedUser.farm_id;
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

      });


    });


    describe('Post irrigationLog', () => {
      let fakeIrrigationLog;
      let fakeActivityLog;
      let crop1;
      let field1;
      let managementPlan1;
      let sampleRequestBody;
      beforeEach(async () => {
        fakeActivityLog = newFakeActivityLog('irrigation');
        fakeIrrigationLog = mocks.fakeIrrigationLog();
        [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

        sampleRequestBody = {
          activity_kind: fakeActivityLog.activity_kind,
          date: fakeActivityLog.date,
          user_id: fakeActivityLog.user_id,
          notes: fakeActivityLog.notes,
          crops: [{ field_crop_id: managementPlan1.field_crop_id }],
          locations: [{ location_id: field1.location_id }],
          ...fakeIrrigationLog,
        };
      });

      test('Owner should post and get a valid irrigationLog', async (done) => {
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const irrigationLog = await irrigationLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(irrigationLog.length).toBe(1);
          expect(irrigationLog[0].hours).toBe(fakeIrrigationLog.hours);
          done();
        });
      });

      //TODO async bug
      test('Owner should post and get many valid irrigationLogs', async (done) => {
        let [crop2] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        let [field2] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        let [managementPlan2] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field1] });
        let [managementPlan3] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field2] });
        sampleRequestBody.locations = [{ location_id: field1.location_id }, { location_id: field2.location_id }];
        sampleRequestBody.crops = [{ field_crop_id: managementPlan1.field_crop_id }, { field_crop_id: managementPlan2.field_crop_id }, { field_crop_id: managementPlan3.field_crop_id }];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const irrigationLog = await irrigationLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(irrigationLog.length).toBe(1);
          expect(irrigationLog[0].hours).toBe(fakeIrrigationLog.hours);
          const activityFields = await activityFieldsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityFields.length).toBe(2);
          expect(activityFields[1].location_id).toBe(field2.location_id);
          const activityCropss = await activityCropsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityCropss.length).toBe(3);
          expect(activityCropss[1].field_crop_id).toBe(managementPlan2.field_crop_id);
          done();
        });
      });

      describe('Post log authorization tests', () => {

        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
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
        });

        test('Manager should post and get a valid irrigationLog', async (done) => {
          sampleRequestBody.user_id = manager.user_id;
          postRequest(sampleRequestBody, { user_id: manager.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', manager.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const irrigationLog = await irrigationLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(irrigationLog.length).toBe(1);
            expect(irrigationLog[0].hours).toBe(fakeIrrigationLog.hours);
            done();
          });
        });

        test('Worker should post and get a valid irrigationLog', async (done) => {
          sampleRequestBody.user_id = worker.user_id;
          postRequest(sampleRequestBody, { user_id: worker.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', worker.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const irrigationLog = await irrigationLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(irrigationLog.length).toBe(1);
            expect(irrigationLog[0].hours).toBe(fakeIrrigationLog.hours);
            done();
          });
        });

        test('should return 403 status if irrigationLog is posted by unauthorized user', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          postRequest(sampleRequestBody, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id in body', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          sampleRequestBody.farm_id = farmunAuthorizedUser.farm_id;
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

      });


    });


    describe('Post scoutingLog', () => {
      let fakeScoutingLog;
      let fakeActivityLog;
      let crop1;
      let field1;
      let managementPlan1;
      let sampleRequestBody;
      beforeEach(async () => {
        fakeActivityLog = newFakeActivityLog('scouting');
        fakeScoutingLog = mocks.fakeScoutingLog();
        [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

        sampleRequestBody = {
          activity_kind: fakeActivityLog.activity_kind,
          date: fakeActivityLog.date,
          user_id: fakeActivityLog.user_id,
          notes: fakeActivityLog.notes,
          crops: [{ field_crop_id: managementPlan1.field_crop_id }],
          locations: [{ location_id: field1.location_id }],
          ...fakeScoutingLog,
        };

      });

      test('Owner should post and get a valid scoutingLog', async (done) => {
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const scoutingLog = await scoutingLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(scoutingLog.length).toBe(1);
          expect(scoutingLog[0].type).toBe(fakeScoutingLog.type);
          done();
        });
      });

      test('Owner should post and get many valid scoutingLogs', async (done) => {
        let [crop2] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        let [field2] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        let [managementPlan2] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field1] });
        let [managementPlan3] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field2] });
        sampleRequestBody.locations = [{ location_id: field1.location_id }, { location_id: field2.location_id }];
        sampleRequestBody.crops = [{ field_crop_id: managementPlan1.field_crop_id }, { field_crop_id: managementPlan2.field_crop_id }, { field_crop_id: managementPlan3.field_crop_id }];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const scoutingLog = await scoutingLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(scoutingLog.length).toBe(1);
          expect(scoutingLog[0].type).toBe(fakeScoutingLog.type);
          const activityFields = await activityFieldsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityFields.length).toBe(2);
          expect(activityFields[1].location_id).toBe(field2.location_id);
          const activityCropss = await activityCropsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityCropss.length).toBe(3);
          expect(activityCropss[1].field_crop_id).toBe(managementPlan2.field_crop_id);
          done();
        });
      });

      describe('Post log authorization tests', () => {

        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
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
        });

        test('Manager should post and get a valid scoutingLog', async (done) => {
          sampleRequestBody.user_id = manager.user_id;
          postRequest(sampleRequestBody, { user_id: manager.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', manager.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const scoutingLog = await scoutingLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(scoutingLog.length).toBe(1);
            expect(scoutingLog[0].type).toBe(fakeScoutingLog.type);
            done();
          });
        });

        test('Worker should post and get a valid scoutingLog', async (done) => {
          sampleRequestBody.user_id = worker.user_id;
          postRequest(sampleRequestBody, { user_id: worker.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', worker.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            const scoutingLog = await scoutingLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('activity_id', activityLog[0].activity_id);
            expect(scoutingLog.length).toBe(1);
            expect(scoutingLog[0].type).toBe(fakeScoutingLog.type);
            done();
          });
        });

        test('should return 403 status if scoutingLog is posted by unauthorized user', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          postRequest(sampleRequestBody, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id in body', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          sampleRequestBody.farm_id = farmunAuthorizedUser.farm_id;
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

      });


    });


    describe('Post otherLog', () => {
      let fakeActivityLog;
      let crop1;
      let field1;
      let managementPlan1;
      let sampleRequestBody;
      beforeEach(async () => {
        fakeActivityLog = newFakeActivityLog('other');
        [crop1] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        [field1] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        [managementPlan1] = await mocks.management_planFactory({ promisedCrop: [crop1], promisedField: [field1] });

        sampleRequestBody = {
          activity_kind: fakeActivityLog.activity_kind,
          date: fakeActivityLog.date,
          user_id: fakeActivityLog.user_id,
          notes: fakeActivityLog.notes,
          crops: [{ field_crop_id: managementPlan1.field_crop_id }],
          locations: [{ location_id: field1.location_id }],
        };
      });

      test('Owner should post and get a valid otherLog', async (done) => {
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          done();
        });
      });

      test('Owner should post and get many valid otherLogs', async (done) => {
        let [crop2] = await mocks.cropFactory({ promisedFarm: [farm] });
        let [weatherStation] = await mocks.weather_stationFactory();
        let [field2] = await mocks.fieldFactory({ promisedFarm: [farm], promisedStation: [weatherStation] });
        let [managementPlan2] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field1] });
        let [managementPlan3] = await mocks.management_planFactory({ promisedCrop: [crop2], promisedField: [field2] });
        sampleRequestBody.locations = [{ location_id: field1.location_id }, { location_id: field2.location_id }];
        sampleRequestBody.crops = [{ field_crop_id: managementPlan1.field_crop_id }, { field_crop_id: managementPlan2.field_crop_id }, { field_crop_id: managementPlan3.field_crop_id }];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const activityLog = await activityLogModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('user_id', owner.user_id);
          expect(activityLog.length).toBe(1);
          expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
          const activityFields = await activityFieldsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityFields.length).toBe(2);
          expect(activityFields[1].location_id).toBe(field2.location_id);
          const activityCropss = await activityCropsModel.query().context({
            showHidden: true,
            user_id: owner.user_id,
          }).where('activity_id', activityLog[0].activity_id);
          expect(activityCropss.length).toBe(3);
          expect(activityCropss[1].field_crop_id).toBe(managementPlan2.field_crop_id);
          done();
        });
      });

      describe('Post log authorization tests', () => {

        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
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
        });

        test('Manager should post and get a valid otherLog', async (done) => {
          sampleRequestBody.user_id = manager.user_id;
          postRequest(sampleRequestBody, { user_id: manager.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', manager.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            done();
          });
        });

        test('Worker should post and get a valid otherLog', async (done) => {
          sampleRequestBody.user_id = worker.user_id;
          postRequest(sampleRequestBody, { user_id: worker.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const activityLog = await activityLogModel.query().context({
              showHidden: true,
              user_id: owner.user_id,
            }).where('user_id', worker.user_id);
            expect(activityLog.length).toBe(1);
            expect(activityLog[0].notes).toBe(fakeActivityLog.notes);
            done();
          });
        });

        test('should return 403 status if otherLog is posted by unauthorized user', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          postRequest(sampleRequestBody, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id in body', async (done) => {
          sampleRequestBody.user_id = farmunAuthorizedUser.user_id;
          sampleRequestBody.farm_id = farmunAuthorizedUser.farm_id;
          postRequest(sampleRequestBody, {
            user_id: worker.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

      });


    });
  });
});
