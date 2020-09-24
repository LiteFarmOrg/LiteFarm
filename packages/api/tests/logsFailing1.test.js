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
const fieldModel = require('../src/models/fieldModel');
const fieldCropModel = require('../src/models/fieldCropModel');
const pesticideModel = require('../src/models/pesiticideModel');
const diseaseModel = require('../src/models/diseaseModel');


describe('Log Failing Tests', () => {
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
    await knex.raw(`
    DELETE FROM "fieldCrop";
    DELETE FROM "field";
    DELETE FROM "weather_station";
    `);
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
    await tableCleanup(knex);
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
        let [weatherStation] = await mocks.weather_stationFactory();
        [field] = await mocks.fieldFactory({promisedFarm: [farm], promisedStation: [weatherStation]});
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





      describe('Put fertilizerLog tests', () => {
        // TODO update single fields tests
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
            crops: [{field_crop_id: fieldCrop.field_crop_id}],
            fields: [{field_id: field.field_id}],
            fertilizer_id: fertilizer.fertilizer_id
          }
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
            let [weatherStation] = await mocks.weather_stationFactory();
            [unauthorizedField] = await mocks.fieldFactory({
              promisedFarm: [farmunAuthorizedUser],
              promisedStation: [weatherStation]
            });
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



          test('Should return 400 if fields, fieldCrops, and fertilizer reference a farm that the user does not have access to', async (done) => {
            sampleRequestBody.user_id = unAuthorizedUser.user_id;
            sampleRequestBody.activity_id = unauthorizedActivityLog.activity_id;
            putRequest(sampleRequestBody, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              activity_id: unauthorizedActivityLog.activity_id
            }, async (err, res) => {
              console.log(activityLog.deleted, res.error);
              expect(res.status).toBe(403);
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
            let [weatherStation] = await mocks.weather_stationFactory();
            [field1] = await mocks.fieldFactory({promisedFarm: [newFarm], promisedStation: [weatherStation]});
            [fieldCrop1] = await mocks.fieldCropFactory({promisedCrop: [crop1], promisedField: [field1]});

            sampleRequestBody = {
              activity_id: activityLog.activity_id,
              activity_kind: activityLog.activity_kind,
              date: fakeActivityLog.date,
              user_id: owner.user_id,
              notes: fakeActivityLog.notes,
              quantity_kg: fakefertilizingLog.quantity_kg,
              crops: [{field_crop_id: fieldCrop.field_crop_id}],
              fields: [{field_id: field.field_id}],
              fertilizer_id: fertilizer.fertilizer_id
            }
          });

          test('Should return 403 if field references a new farm', async (done) => {
            sampleRequestBody.fields = [sampleRequestBody.fields[0], {field_id: field1.field_id}];
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(403);
              done();
            })
          });

          test('Should return 403 if field, fieldCrop, and fertilizer reference a new farm', async (done) => {
            sampleRequestBody.fields = [{field_id: field1.field_id}];
            sampleRequestBody.crops = [{field_crop_id: fieldCrop1.field_crop_id}];
            sampleRequestBody.fertilizer_id = fertilizer1.fertilizer_id;
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(403);
              done();
            })
          });

          test('Should return 403 if field and fieldCrop reference 2 farms', async (done) => {
            sampleRequestBody.crops = [sampleRequestBody.crops[0], {field_crop_id: fieldCrop1.field_crop_id}];
            sampleRequestBody.fields = [sampleRequestBody.fields[0], {field_id: field1.field_id}];
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(403);
              done();
            })
          });

          test('Should return 403 if fertilizer references a new farm', async (done) => {
            sampleRequestBody.fertilizer_id = fertilizer1.fertilizer_id;
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(403);
              done();
            })
          });

          test('Should return 403 if field_crop references a new farm', async (done) => {
            sampleRequestBody.crops = [sampleRequestBody.crops[0], {field_crop_id: fieldCrop1.field_crop_id}];
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(403);
              done();
            })
          });

        })

        describe('Put fertilizerLog tests with multiple field_crop and field', () => {
          let fakefertilizingLog;
          let fakeActivityLog1;
          let fertilizer1;
          let crop1;
          let field1;
          let fieldCrop1;
          let sampleRequestBody;
          beforeEach(async () => {
            fakeActivityLog1 = newFakeActivityLog('fertilizing');
            fakefertilizingLog = mocks.fakeFertilizerLog();
            [fertilizer1] = await mocks.fertilizerFactory({promisedFarm: [farm]});
            [crop1] = await mocks.cropFactory({promisedFarm: [farm]});
            let [weatherStation] = await mocks.weather_stationFactory();
            [field1] = await mocks.fieldFactory({promisedFarm: [farm], promisedStation: [weatherStation]});
            [fieldCrop1] = await mocks.fieldCropFactory({promisedCrop: [crop1], promisedField: [field1]});

            sampleRequestBody = {
              activity_id: activityLog.activity_id,
              activity_kind: activityLog.activity_kind,
              date: fakeActivityLog1.date,
              user_id: owner.user_id,
              notes: fakeActivityLog1.notes,
              quantity_kg: fakefertilizingLog.quantity_kg,
              crops: [{field_crop_id: fieldCrop.field_crop_id}, {field_crop_id: fieldCrop1.field_crop_id}],
              fields: [{field_id: field.field_id}, {field_id: field1.field_id}],
              fertilizer_id: fertilizer1.fertilizer_id
            }
          });



          test('Should return 400 if field_crops reference a field that is not in fields array', async (done) => {
            sampleRequestBody.field = [sampleRequestBody.fields[0]]
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

          test('Should return 400 if field_crops reference a field that is not in fields in the database', async (done) => {
            sampleRequestBody.crops = [{field_crop_id: fieldCrop1.field_crop_id}];
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

          test('Should return 400 if field reference a field that is not in fieldCrop array', async (done) => {
            sampleRequestBody.crops = [sampleRequestBody.crops[0]]
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

          test('Should return 400 if field reference a field that is not in fieldCrop in the database', async (done) => {
            sampleRequestBody.fields = [{field_id: field1.field_id}];
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              expect(res.status).toBe(400);
              done();
            })
          });

          test('Should return 400 if body.crops is empty1', async (done) => {
            sampleRequestBody.crops = [{}];
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              //TODO should return 400
              expect(res.status).toBe(403);
              done();
            })
          });

          test('Should return 400 if body.crops is empty2', async (done) => {
            sampleRequestBody.crops = [];
            putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
              console.log(fakefertilizingLog, res.error);
              //TODO should return 400
              expect(res.status).toBe(403);
              done();
            })
          });



        })

      })

    })




    describe('fieldWorkLog tests', () => {
      let fieldWorkLog;
      let activityLog;
      let activityCropLog;
      let activityFieldLog;
      let crop;
      let field;
      let fieldCrop;
      beforeEach(async () => {
        [crop] = await mocks.cropFactory({promisedFarm: [farm]});
        let [weatherStation] = await mocks.weather_stationFactory();
        [field] = await mocks.fieldFactory({promisedFarm: [farm], promisedStation: [weatherStation]});
        [fieldCrop] = await mocks.fieldCropFactory({promisedCrop: [crop], promisedField: [field]});
        [activityLog] = await mocks.activityLogFactory({promisedUser: [owner]}, {
          ...mocks.fakeActivityLog(),
          activity_kind: 'fieldWork'
        });
        [fieldWorkLog] = await mocks.fieldWorkLogFactory({
          promisedActivity: [activityLog],
        });
        [activityFieldLog] = await mocks.activityFieldLogFactory({
          promisedActivityLog: [activityLog],
          promisedField: [field]
        });
      })




      describe('Put fieldWorkLog tests', () => {
        // TODO update single fields tests
        let crop1;
        let field1;
        let fieldCrop1;
        let sampleRequestBody;
        let fakeActivityLog;
        let fakefieldWorkLog;
        beforeEach(async () => {
          fakeActivityLog = mocks.fakeActivityLog();
          fakefieldWorkLog = mocks.fakeFieldWorkLog();
          [crop1] = await mocks.cropFactory({promisedFarm: [farm]});
          let [weatherStation] = await mocks.weather_stationFactory();
          [field1] = await mocks.fieldFactory({promisedFarm: [farm], promisedStation: [weatherStation]});
          [fieldCrop1] = await mocks.fieldCropFactory({promisedCrop: [crop1], promisedField: [field1]});

          sampleRequestBody = {
            activity_id: activityLog.activity_id,
            activity_kind: activityLog.activity_kind,
            date: fakeActivityLog.date,
            user_id: owner.user_id,
            notes: fakeActivityLog.notes,
            crops: [{field_crop_id: fieldCrop.field_crop_id}, {field_crop_id: fieldCrop1.field_crop_id}],
            fields: [{field_id: field.field_id}, {field_id: field1.field_id}],
            ...fakefieldWorkLog

          }
        })



        test('Should return 400 when fieldCrops is not empty', async (done) => {
          putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
            console.log(fakefieldWorkLog, res.error);
            expect(res.status).toBe(400);
            done();
          })
        });


      })

    })

    describe('soilDataLog tests', () => {
      let soilDataLog;
      let activityLog;
      let activityCropLog;
      let activityFieldLog;
      let crop;
      let field;
      let fieldCrop;
      beforeEach(async () => {
        [crop] = await mocks.cropFactory({promisedFarm: [farm]});
        let [weatherStation] = await mocks.weather_stationFactory();
        [field] = await mocks.fieldFactory({promisedFarm: [farm], promisedStation: [weatherStation]});
        [fieldCrop] = await mocks.fieldCropFactory({promisedCrop: [crop], promisedField: [field]});
        [activityLog] = await mocks.activityLogFactory({promisedUser: [owner]}, {
          ...mocks.fakeActivityLog(),
          activity_kind: 'soilData'
        });
        [soilDataLog] = await mocks.soilDataLogFactory({
          promisedActivity: [activityLog],
        });
        [activityFieldLog] = await mocks.activityFieldLogFactory({
          promisedActivityLog: [activityLog],
          promisedField: [field]
        });
      })




      describe('Put soilDataLog tests', () => {
        // TODO update single fields tests
        let crop1;
        let field1;
        let fieldCrop1;
        let sampleRequestBody;
        let fakeActivityLog;
        let fakeSoilDataLog;
        beforeEach(async () => {
          fakeActivityLog = mocks.fakeActivityLog();
          fakeSoilDataLog = mocks.fakeSoilDataLog();
          [crop1] = await mocks.cropFactory({promisedFarm: [farm]});
          let [weatherStation] = await mocks.weather_stationFactory();
          [field1] = await mocks.fieldFactory({promisedFarm: [farm], promisedStation: [weatherStation]});
          [fieldCrop1] = await mocks.fieldCropFactory({promisedCrop: [crop1], promisedField: [field1]});

          sampleRequestBody = {
            activity_id: activityLog.activity_id,
            activity_kind: activityLog.activity_kind,
            date: fakeActivityLog.date,
            user_id: owner.user_id,
            notes: fakeActivityLog.notes,
            crops: [{field_crop_id: fieldCrop.field_crop_id}, {field_crop_id: fieldCrop1.field_crop_id}],
            fields: [{field_id: field.field_id}, {field_id: field1.field_id}],
            ...fakeSoilDataLog

          }
        })



        test('Should return 400 when fieldCrops is not empty', async (done) => {
          putRequest(sampleRequestBody, {user_id: owner.user_id}, async (err, res) => {
            console.log(fakeSoilDataLog, res.error);
            expect(res.status).toBe(400);
            done();
          })
        });


      })

    })







  })


  describe('Post log', () => {

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
        let [weatherStation] = await mocks.weather_stationFactory();
        [field1] = await mocks.fieldFactory({promisedFarm: [farm], promisedStation: [weatherStation]});
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

      test('Should return 400 when activity_kind does not fit req.body shape', async (done) => {
        sampleRequestBody.activity_kind = "soilData";
        postRequest(sampleRequestBody, {}, async (err, res) => {
          console.log(fakefertilizingLog, res.error);
          expect(res.status).toBe(400);
          done();
        })
      });

      test('Should return 400 when activity_kind does not fit req.body shape2', async (done) => {
        sampleRequestBody.activity_kind = "fieldWork";
        postRequest(sampleRequestBody, {}, async (err, res) => {
          console.log(fakefertilizingLog, res.error);
          expect(res.status).toBe(400);
          done();
        })
      });



      test('Should return 403 when 1 of the 2 fields references a farm that the user does have access to', async (done) => {
        const [newField] = await mocks.fieldFactory();
        sampleRequestBody.fields = [{field_id: newField.field_id}, sampleRequestBody.fields[0]];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          console.log(fakefertilizingLog, res.error);
          //TODO should return 400
          expect(res.status).toBe(403);
          done();
        })
      });



      test('Should return 400 when 1 fieldCrop references a field that is not in body.fields', async (done) => {
        const [newFieldCrop] = await mocks.fieldCropFactory({promisedField: mocks.fieldFactory({promisedFarm: [farm]})})
        sampleRequestBody.crops = [{field_crop_id: newFieldCrop.field_crop_id}, sampleRequestBody.crops[0]];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          console.log(fakefertilizingLog, res.error);
          expect(res.status).toBe(400);
          done();
        })
      });

      test('Should return 403 when 1 fieldCrop references a field that user does not have access to', async (done) => {
        const [newFieldCrop] = await mocks.fieldCropFactory();
        sampleRequestBody.crops = [{field_crop_id: newFieldCrop.field_crop_id}, sampleRequestBody.crops[0]];
        postRequest(sampleRequestBody, {}, async (err, res) => {
          console.log(fakefertilizingLog, res.error);
          expect(res.status).toBe(403);
          done();
        })
      });






    });
  });
});
