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
const faker = require('faker');
chai.use(chaiHttp);
const server = require('./../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment');
jest.mock('jsdom');
jest.mock('bull');
jest.mock('../src/middleware/acl/checkJwt');
const { recordAQuery } = require('../src/controllers/organicCertifierSurveyController');
const mocks = require('./mock.factories');
const emailTemplate = require('../src/templates/sendEmailTemplate');
jest.mock('../src/templates/sendEmailTemplate');

const organicCertifierSurveyModel = require('../src/models/organicCertifierSurveyModel');

describe('organicCertifierSurvey Tests', () => {
  let middleware;
  let owner;
  let farm;
  let ownerFarm;

  beforeAll(() => {
    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next();
    });
  });


  function postRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).post(`/organic_certifier_survey`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function putRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).put(`/organic_certifier_survey`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function getExportRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).post(`/organic_certifier_survey/request_export`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getAllSupportedCertificationsRequest({ farm_id = farm.farm_id }, callback) {
    chai.request(server).get(`/organic_certifier_survey/${farm_id}/supported_certifications`)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function getAllSupportedCertifiersRequest({
    user_id = owner.user_id,
    farm_id = farm.farm_id,
  }, callback) {
    chai.request(server).get(`/organic_certifier_survey/${farm_id}/supported_certifiers`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .end(callback);
  }

  function deleteRequest({ user_id = owner.user_id, farm_id = farm.farm_id, survey_id }, callback) {
    chai.request(server).delete(`/organic_certifier_survey/${survey_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  function getFakeOrganicCertifierSurvey(farm_id = farm.farm_id, interested = true) {
    const organicCertifierSurvey = mocks.fakeOrganicCertifierSurvey();
    return ({
      ...organicCertifierSurvey,
      interested,
      certifier_id: organicCertifierSurvey.certifier_id,
      certification_id: organicCertifierSurvey.certification_id,
      farm_id,
    });
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [ownerFarm] = await mocks.userFarmFactory({ promisedUser: [owner], promisedFarm: [farm] }, fakeUserFarm(1));
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Get supported certifier and certification', function() {
    let organicCertifierSurvey;
    beforeEach(async () => {
      [organicCertifierSurvey] = await mocks.organicCertifierSurveyFactory({ promisedUserFarm: [ownerFarm] });
    });

    describe('Get supported certifier & certification', () => {
      let manager;

      beforeEach(async () => {
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory({
          promisedUser: [manager],
          promisedFarm: [farm],
        }, fakeUserFarm(2));
      });

      test('User should get all supported certifiers', async (done) => {
        console.log(organicCertifierSurvey);
        getAllSupportedCertifiersRequest({
          user_id: manager.user_id,
        }, (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });


    });

    describe('Get all supported certifications', () => {
      test('User should get all supported certifications', async (done) => {

        getAllSupportedCertificationsRequest({}, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].certification_type).toBe('Organic');
          done();
        });
      });
    });


  });

  // describe('Get organic certifier survey', () => {
  //   let organicCertifierSurvey;
  //   beforeEach(async () => {
  //     [organicCertifierSurvey] = await mocks.organicCertifierSurveyFactory({ promisedUserFarm: [ownerFarm] });
  //   })

  //   describe('Get organicCertifierSurvey authorization tests', () => {
  //     let worker;
  //     let manager;
  //     let extensionOfficer;
  //     let unAuthorizedUser;
  //     let farmunAuthorizedUser;

  //     beforeEach(async () => {
  //       [worker] = await mocks.usersFactory();
  //       const [workerFarm] = await mocks.userFarmFactory({
  //         promisedUser: [worker],
  //         promisedFarm: [farm],
  //       }, fakeUserFarm(3));
  //       [manager] = await mocks.usersFactory();
  //       const [managerFarm] = await mocks.userFarmFactory({
  //         promisedUser: [manager],
  //         promisedFarm: [farm],
  //       }, fakeUserFarm(2));
  //       [extensionOfficer] = await mocks.userFarmFactory();
  //       const [extensionOfficerFarm] = await mocks.userFarmFactory({
  //         promisedUser: [extensionOfficer],
  //         promisedFarm: [farm],
  //       }, fakeUserFarm(5));

  //       [unAuthorizedUser] = await mocks.usersFactory();
  //       [farmunAuthorizedUser] = await mocks.farmFactory();
  //       const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
  //         promisedUser: [unAuthorizedUser],
  //         promisedFarm: [farmunAuthorizedUser],
  //       }, fakeUserFarm(1));
  //     })
  //
  //     test('Owner should get all supported certifications', async (done) => {
  //       getAllSupportedCertificationsRequest({ }, (err, res) => {
  //         expect(res.status).toBe(200);
  //         expect(res.body.survey_id).toBe(organicCertifierSurvey.survey_id);
  //         done();
  //       });
  //     })
  //
  //     test('Manager should get organic certifier survey  by farm id', async (done) => {
  //       getAllSupportedCertifiersRequest({ user_id: manager.user_id }, (err, res) => {
  //         expect(res.status).toBe(200);
  //         expect(res.body.survey_id).toBe(organicCertifierSurvey.survey_id);
  //         done();
  //       });
  //     })
  //
  //     // test('Extension officer should get organic certifier survey  by farm id', async (done) => {
  //     //   getRequest({ user_id: extensionOfficer.user_id }, (err, res) => {
  //     //     expect(res.status).toBe(200);
  //     //     expect(res.body.survey_id).toBe(organicCertifierSurvey.survey_id);
  //     //     done();
  //     //   });
  //     // })
  //
  //     // test('Should get status 403 if an worker tries to get organic certifier survey  by farm id', async (done) => {
  //     //   getRequest({ user_id: worker.user_id }, (err, res) => {
  //     //     expect(res.status).toBe(403);
  //     //     done();
  //     //   });
  //     // })

  //     // test('Should get status 403 if an unauthorizedUser tries to get organic certifier survey  by farm id', async (done) => {
  //     //   getRequest({ user_id: unAuthorizedUser.user_id }, (err, res) => {
  //     //     expect(res.status).toBe(403);
  //     //     done();
  //     //   });
  //     // })


  //   })

  // })

  describe('Delete certifier survey', function() {
    let organicCertifierSurvey;
    beforeEach(async () => {
      [organicCertifierSurvey] = await mocks.organicCertifierSurveyFactory({ promisedUserFarm: [ownerFarm] });
    });

    describe('Delete certifier survey authorization tests', () => {
      let worker;
      let manager;
      let extensionOfficer;
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
        [extensionOfficer] = await mocks.userFarmFactory();
        const [extensionOfficerFarm] = await mocks.userFarmFactory({
          promisedUser: [extensionOfficer],
          promisedFarm: [farm],
        }, fakeUserFarm(5));

        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
          promisedUser: [unAuthorizedUser],
          promisedFarm: [farmunAuthorizedUser],
        }, fakeUserFarm(1));
      });

      test('Owner should delete a certifier survey', async (done) => {
        deleteRequest({ survey_id: organicCertifierSurvey.survey_id }, async (err, res) => {

          expect(res.status).toBe(200);
          const SurveyRes = await organicCertifierSurveyModel.query().context({ showHidden: true }).where('survey_id', organicCertifierSurvey.survey_id);
          expect(SurveyRes.length).toBe(1);
          expect(SurveyRes[0].deleted).toBe(true);
          done();
        });
      });

      test('Manager should delete a certifier survey', async (done) => {
        deleteRequest({ user_id: manager.user_id, survey_id: organicCertifierSurvey.survey_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const SurveyRes = await organicCertifierSurveyModel.query().context({ showHidden: true }).where('survey_id', organicCertifierSurvey.survey_id);
          expect(SurveyRes.length).toBe(1);
          expect(SurveyRes[0].deleted).toBe(true);
          done();
        });
      });

      test('should return 403 if an unauthorized user tries to delete a certifier survey', async (done) => {
        deleteRequest({
          user_id: unAuthorizedUser.user_id,
          survey_id: organicCertifierSurvey.survey_id,
        }, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('should return 403 if a worker tries to delete a certifier survey', async (done) => {
        deleteRequest({ user_id: worker.user_id, survey_id: organicCertifierSurvey.survey_id }, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Circumvent authorization by modifying farm_id', async (done) => {
        deleteRequest({
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id,
          survey_id: organicCertifierSurvey.survey_id,
        }, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });


    });


  });

  describe('Post organic certifier survey', () => {
    let fakeOrganicCertifierSurvey;

    beforeEach(async () => {
      fakeOrganicCertifierSurvey = getFakeOrganicCertifierSurvey();
    });

    test('should return 403 status if headers.farm_id is set to null', async (done) => {
      fakeOrganicCertifierSurvey.farm_id = null;
      postRequest(fakeOrganicCertifierSurvey, {}, (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

    test('should return 400 if certification_id and requested_certification are null', async (done) => {
      delete fakeOrganicCertifierSurvey.certification_id;
      delete fakeOrganicCertifierSurvey.requested_certification;
      postRequest(fakeOrganicCertifierSurvey, {}, (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('should return 400 if certification_id and requested_certification are not null', async (done) => {
      fakeOrganicCertifierSurvey.certification_id = 1;
      fakeOrganicCertifierSurvey.requested_certification = 'requested';
      postRequest(fakeOrganicCertifierSurvey, {}, (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('should return 400 if certifier_id and requested_certifier are null', async (done) => {
      delete fakeOrganicCertifierSurvey.certifier_id;
      delete fakeOrganicCertifierSurvey.requested_certifier;
      postRequest(fakeOrganicCertifierSurvey, {}, (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('should return 400 if certifier_id and requested_certifier are not null', async (done) => {
      fakeOrganicCertifierSurvey.certifier_id = 1;
      fakeOrganicCertifierSurvey.requested_certifier = 'requested';
      postRequest(fakeOrganicCertifierSurvey, {}, (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    describe('Post organicCertifierSurvey authorization tests', () => {

      let worker;
      let manager;
      let extensionOfficer;
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
        [extensionOfficer] = await mocks.userFarmFactory();
        const [extensionOfficerFarm] = await mocks.userFarmFactory({
          promisedUser: [extensionOfficer],
          promisedFarm: [farm],
        }, fakeUserFarm(5));

        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
          promisedUser: [unAuthorizedUser],
          promisedFarm: [farmunAuthorizedUser],
        }, fakeUserFarm(1));
      });

      test('Owner post certifiers', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, {}, async (err, res) => {
          expect(res.status).toBe(201);
          const organicCertifierSurveys = await organicCertifierSurveyModel.query().context({ showHidden: true }).where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].created_by_user_id).toBe(owner.user_id);
          expect(organicCertifierSurveys[0].certifiers).toEqual(fakeOrganicCertifierSurvey.certifiers);
          done();
        });
      });

      test('Manager post certifiers', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, { user_id: manager.user_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const organicCertifierSurveys = await organicCertifierSurveyModel.query().context({ showHidden: true }).where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].created_by_user_id).toBe(manager.user_id);
          expect(organicCertifierSurveys[0].certifiers).toEqual(fakeOrganicCertifierSurvey.certifiers);
          done();
        });
      });

      test('Extension officer post certifiers', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, { user_id: extensionOfficer.user_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const organicCertifierSurveys = await organicCertifierSurveyModel.query().context({ showHidden: true }).where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].created_by_user_id).toBe(extensionOfficer.user_id);
          expect(organicCertifierSurveys[0].certifiers).toEqual(fakeOrganicCertifierSurvey.certifiers);
          done();
        });
      });

      test('should return 403 status if organicCertifierSurvey is posted by worker', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, { user_id: worker.user_id }, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe('User does not have the following permission(s): add:organic_certifier_survey');
          done();
        });
      });

      test('should return 403 status if organicCertifierSurvey is posted by unauthorized user', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe('User does not have the following permission(s): add:organic_certifier_survey');
          done();
        });
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, {
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id,
        }, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

    });


  });

  describe('Export test', () => {
    function managementPlanDates(start, seed, completed=null, abandoned = null) {
      return {
        start_date: new Date(start),
        complete_date: completed ? new Date(completed) : null,
        abandon_date: abandoned ? new Date(abandoned) : null,
      }
    }

    test('Should get records from canadian farm that were active before the to_date and NOT completed before the from date' , async (done) => {
      const [{ farm_id, user_id }] = await mocks.userFarmFactory({}, fakeUserFarm());
      await mocks.organicCertifierSurveyFactory({ promisedUserFarm: [{farm_id, user_id}] }, mocks.fakeOrganicCertifierSurvey(farm_id, { certifier_id: 1 }));
      const cropVariety = await mocks.crop_varietyFactory({ promisedFarm: [{ farm_id }] }, mocks.fakeCropVariety({ organic: true }));
      const completeBeforeTheToDate = await mocks.crop_management_planFactory({
        promisedFarm: [{ farm_id }],
        promisedCropVariety: cropVariety,
        promisedManagementPlan: mocks.management_planFactory({
          promisedFarm: [{ farm_id }],
          promisedCropVariety: cropVariety,
        }, mocks.fakeManagementPlan(managementPlanDates('2021-01-20', '2021-01-01', '2021-01-30'))),
      }, mocks.fakeCropManagementPlan({ seed_date: new Date('2021-01-01') }));
      const notCompletedOrAbandoned = await mocks.crop_management_planFactory({
        promisedFarm: [{ farm_id }],
        promisedCropVariety: cropVariety,
        promisedManagementPlan: mocks.management_planFactory({
          promisedFarm: [{ farm_id }],
          promisedCropVariety: cropVariety,
        }, mocks.fakeManagementPlan(managementPlanDates('2021-03-22', '2021-03-22'))),
      }, mocks.fakeCropManagementPlan({ seed_date: new Date('2021-03-22') }));
      getExportRequest({
        from_date: '2021-02-01',
        to_date: '2021-05-20',
        email: faker.internet.email(),
        farm_id: farm_id
      }, {farm_id, user_id} , (err,res) => {
        expect(res.status).toBe(200);
        expect(res.body.recordD.length).toBe(1);
        done();
      })
    });

    test('Should get records from canadian farm that were active before the to_date and NOT abandoned' , async (done) => {
      const [{ farm_id, user_id }] = await mocks.userFarmFactory({}, fakeUserFarm());
      await mocks.organicCertifierSurveyFactory({ promisedUserFarm: [{farm_id, user_id}] }, mocks.fakeOrganicCertifierSurvey(farm_id, { certifier_id: 1 }));
      const cropVariety = await mocks.crop_varietyFactory({ promisedFarm: [{ farm_id }] }, mocks.fakeCropVariety({ organic: true }));
      const completeBeforeTheToDate = await mocks.crop_management_planFactory({
        promisedFarm: [{ farm_id }],
        promisedCropVariety: cropVariety,
        promisedManagementPlan: mocks.management_planFactory({
          promisedFarm: [{ farm_id }],
          promisedCropVariety: cropVariety,
        }, mocks.fakeManagementPlan(managementPlanDates('2021-01-20', '2021-01-01', null, '2021-01-30'))),
      }, mocks.fakeCropManagementPlan({ seed_date: new Date('2021-01-01') }));
      const notCompletedOrAbandoned = await mocks.crop_management_planFactory({
        promisedFarm: [{ farm_id }],
        promisedCropVariety: cropVariety,
        promisedManagementPlan: mocks.management_planFactory({
          promisedFarm: [{ farm_id }],
          promisedCropVariety: cropVariety,
        }, mocks.fakeManagementPlan(managementPlanDates('2021-03-22', '2021-03-22'))),
      }, mocks.fakeCropManagementPlan({ seed_date: new Date('2021-03-22') }));
      getExportRequest({
        from_date: '2021-02-01',
        to_date: '2021-05-20',
        email: faker.internet.email(),
        farm_id: farm_id
      }, {farm_id, user_id} , (err,res) => {
        expect(res.status).toBe(200);
        expect(res.body.recordD.length).toBe(1);
        done();
      })
    });

    test('Should get no records from canadian farm if no management plans (Possible failure scenario in the future)' , async (done) => {
      const [{ farm_id, user_id }] = await mocks.userFarmFactory({} , fakeUserFarm());
      await mocks.organicCertifierSurveyFactory({ promisedUserFarm: [{farm_id, user_id}] }, mocks.fakeOrganicCertifierSurvey(farm_id, { certifier_id: 1 }));
      getExportRequest({
        from_date: '2021-02-01',
        to_date: '2021-05-20',
        email: faker.internet.email(),
        farm_id: farm_id,
      }, { farm_id, user_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.recordD.length).toBe(0);
        done();
      })
    });

    describe('Record A test', () => {

      test('Should include management plan with a planned task within the reporting period', async (done) => {
        const [{ farm_id, user_id }] = await mocks.userFarmFactory({}, fakeUserFarm());
        const promisedFarm = [{ farm_id }];
        const [{ location_id }] = await mocks.locationFactory({ promisedFarm });
        const promisedLocation = [{ location_id }];
        const [{ crop_translation_key, crop_id }] = await mocks.cropFactory({ promisedFarm });
        const promisedCrop = [{ crop_id }];
        const [{ planting_management_plan_id }] = await mocks.planting_management_planFactory({
          promisedFarm,
          promisedLocation,
          promisedCrop,
        });
        const [{ task_type_id }] = await knex('task_type').insert({
          farm_id: null,
          task_name: 'Planting',
          task_translation_key: 'PLANT_TASK', ...mocks.baseProperties(user_id),
        }).returning('*');
        const promisedTaskType = [{ task_type_id }];
        const [{ task_id }] = await mocks.taskFactory({ promisedTaskType }, mocks.fakeTask({ due_date: '1000-01-01' }));
        const promisedTask = await mocks.taskFactory({}, mocks.fakeTask({ due_date: '2021-01-01' }));
        await mocks.management_tasksFactory({
          promisedTask,
          promisedPlantingManagementPlan: [{ planting_management_plan_id }],
        });
        await knex('plant_task').insert({ task_id, planting_management_plan_id });
        const recordA = await recordAQuery('2021-01-02', '2021-01-01', farm_id);
        expect(recordA.length).toBe(1);
        expect(recordA[0].crops).toStrictEqual([crop_translation_key]);
        done();
      });

      test('Should not include management plan with a planned task out of the reporting period', async (done) => {
        const [{ farm_id, user_id }] = await mocks.userFarmFactory({}, fakeUserFarm());
        const promisedFarm = [{ farm_id }];
        const [{ location_id }] = await mocks.locationFactory({ promisedFarm });
        const promisedLocation = [{ location_id }];
        const [{ crop_translation_key, crop_id }] = await mocks.cropFactory({ promisedFarm });
        const promisedCrop = [{ crop_id }];
        const [{ planting_management_plan_id }] = await mocks.planting_management_planFactory({
          promisedFarm,
          promisedLocation,
          promisedCrop,
        });
        const [{ task_type_id }] = await knex('task_type').insert({
          farm_id: null,
          task_name: 'Planting',
          task_translation_key: 'PLANT_TASK', ...mocks.baseProperties(user_id),
        }).returning('*');
        const promisedTaskType = [{ task_type_id }];
        const [{ task_id }] = await mocks.taskFactory({ promisedTaskType }, mocks.fakeTask({ due_date: '1000-01-01' }));
        const promisedTask = await mocks.taskFactory({}, mocks.fakeTask({ due_date: '2021-01-03' }));
        await mocks.management_tasksFactory({
          promisedTask,
          promisedPlantingManagementPlan: [{ planting_management_plan_id }],
        });
        await knex('plant_task').insert({ task_id, planting_management_plan_id });
        const recordA = await recordAQuery('2021-01-02', '2021-01-01', farm_id);
        expect(recordA.length).toBe(1);
        expect(recordA[0].crops.length).toBe(0);
        done();
      });

      test('Should include management plan with a completed task within the reporting period', async (done) => {
        const [{ farm_id, user_id }] = await mocks.userFarmFactory({}, fakeUserFarm());
        const promisedFarm = [{ farm_id }];
        const [{ location_id }] = await mocks.locationFactory({ promisedFarm });
        const promisedLocation = [{ location_id }];
        const [{ crop_translation_key, crop_id }] = await mocks.cropFactory({ promisedFarm });
        const promisedCrop = [{ crop_id }];
        const [{ planting_management_plan_id }] = await mocks.planting_management_planFactory({
          promisedFarm,
          promisedLocation,
          promisedCrop,
        });
        const [{ task_type_id }] = await knex('task_type').insert({
          farm_id: null,
          task_name: 'Planting',
          task_translation_key: 'PLANT_TASK', ...mocks.baseProperties(user_id),
        }).returning('*');
        const promisedTaskType = [{ task_type_id }];
        const [{ task_id }] = await mocks.taskFactory({ promisedTaskType }, mocks.fakeTask({ due_date: '1000-01-01' }));
        const promisedTask = await mocks.taskFactory({}, mocks.fakeTask({
          due_date: '2021-01-01',
          completed_time: new Date('2021-01-01'),
        }));
        await mocks.management_tasksFactory({
          promisedTask,
          promisedPlantingManagementPlan: [{ planting_management_plan_id }],
        });
        await knex('plant_task').insert({ task_id, planting_management_plan_id });
        const recordA = await recordAQuery('2021-01-02', '2021-01-01', farm_id);
        expect(recordA.length).toBe(1);
        expect(recordA[0].crops).toStrictEqual([crop_translation_key]);
        done();
      });

      test('Should not include management plan with a task completed out of the reporting period, but planned within the reporting period', async (done) => {
        const [{ farm_id, user_id }] = await mocks.userFarmFactory({}, fakeUserFarm());
        const promisedFarm = [{ farm_id }];
        const [{ location_id }] = await mocks.locationFactory({ promisedFarm });
        const promisedLocation = [{ location_id }];
        const [{ crop_translation_key, crop_id }] = await mocks.cropFactory({ promisedFarm });
        const promisedCrop = [{ crop_id }];
        const [{ planting_management_plan_id }] = await mocks.planting_management_planFactory({
          promisedFarm,
          promisedLocation,
          promisedCrop,
        });
        const [{ task_type_id }] = await knex('task_type').insert({
          farm_id: null,
          task_name: 'Planting',
          task_translation_key: 'PLANT_TASK', ...mocks.baseProperties(user_id),
        }).returning('*');
        const promisedTaskType = [{ task_type_id }];
        const [{ task_id }] = await mocks.taskFactory({ promisedTaskType }, mocks.fakeTask({ due_date: '1000-01-01' }));
        const promisedTask = await mocks.taskFactory({}, mocks.fakeTask({
          due_date: '2021-01-01',
          completed_time: new Date('2021-01-04'),
        }));
        await mocks.management_tasksFactory({
          promisedTask,
          promisedPlantingManagementPlan: [{ planting_management_plan_id }],
        });
        await knex('plant_task').insert({ task_id, planting_management_plan_id });
        const recordA = await recordAQuery('2021-01-02', '2021-01-01', farm_id);
        expect(recordA.length).toBe(1);
        expect(recordA[0].crops.length).toBe(0);
        done();
      });

      test('Should include already_in_ground management plan location', async (done) => {
        const [{ farm_id, user_id }] = await mocks.userFarmFactory({}, fakeUserFarm());
        const promisedFarm = [{ farm_id }];
        const [{ location_id }] = await mocks.locationFactory({ promisedFarm });
        const promisedLocation = [{ location_id }];
        const [{ crop_translation_key, crop_id }] = await mocks.cropFactory({ promisedFarm });
        const promisedCrop = [{ crop_id }];
        const [{ planting_management_plan_id }] = await mocks.planting_management_planFactory({
          promisedFarm,
          promisedLocation,
          promisedCrop,
        });
        const promisedTask = await mocks.taskFactory({}, mocks.fakeTask({ due_date: '2021-01-01' }));
        await mocks.management_tasksFactory({
          promisedTask,
          promisedPlantingManagementPlan: [{ planting_management_plan_id }],
        });
        const recordA = await recordAQuery('2021-01-02', '2021-01-01', farm_id);
        expect(recordA.length).toBe(1);
        expect(recordA[0].crops).toStrictEqual([crop_translation_key]);
        done();
      });

      test('When there is a completed transplant task before reporting period, should not include already_in_ground management plan location', async (done) => {
        const [{ farm_id, user_id }] = await mocks.userFarmFactory({}, fakeUserFarm());
        const promisedFarm = [{ farm_id }];
        const [{ location_id }] = await mocks.locationFactory({ promisedFarm });
        const promisedLocation = [{ location_id }];
        const [{ crop_translation_key, crop_id }] = await mocks.cropFactory({ promisedFarm });
        const promisedCrop = [{ crop_id }];
        const [{
          planting_management_plan_id,
          management_plan_id,
        }] = await mocks.planting_management_planFactory({ promisedFarm, promisedLocation, promisedCrop });
        const promisedTask = await mocks.taskFactory({}, mocks.fakeTask({ due_date: '2021-01-01' }));
        await mocks.management_tasksFactory({
          promisedTask,
          promisedPlantingManagementPlan: [{ planting_management_plan_id }],
        });
        const [transplantLocation] = await mocks.fieldFactory({ promisedFarm });
        const [transplantPlantingManagementPlan] = await knex('planting_management_plan').insert(mocks.fakePlantingManagementPlan({
          management_plan_id,
          location_id: transplantLocation.location_id,
        })).returning('*');
        const [{ task_type_id }] = await knex('task_type').insert({
          farm_id: null,
          task_name: 'Transplant task',
          task_translation_key: 'TRANSPLANT_TASK', ...mocks.baseProperties(user_id),
        }).returning('*');
        const promisedTaskType = [{ task_type_id }];
        const [{ task_id }] = await mocks.taskFactory({ promisedTaskType }, mocks.fakeTask({ completed_time: new Date('2020-12-31') }));
        await knex('transplant_task').insert({
          task_id,
          planting_management_plan_id: transplantPlantingManagementPlan.planting_management_plan_id,
        });
        const recordA = await recordAQuery('2021-01-02', '2021-01-01', farm_id);
        expect(recordA.length).toBe(2);
        for (const record of recordA) {
          if (record.location_id === location_id) {
            expect(record.crops.length).toBe(0);
          } else {
            expect(record.crops.length).toBe(1);
          }
        }
        done();
      });

      test('When there is a completed transplant task within reporting period, should include both already_in_ground management plan location and transplant location', async (done) => {
        const [{ farm_id, user_id }] = await mocks.userFarmFactory({}, fakeUserFarm());
        const promisedFarm = [{ farm_id }];
        const [{ location_id }] = await mocks.locationFactory({ promisedFarm });
        const promisedLocation = [{ location_id }];
        const [{ crop_translation_key, crop_id }] = await mocks.cropFactory({ promisedFarm });
        const promisedCrop = [{ crop_id }];
        const [{
          planting_management_plan_id,
          management_plan_id,
        }] = await mocks.planting_management_planFactory({ promisedFarm, promisedLocation, promisedCrop });
        const promisedTask = await mocks.taskFactory({}, mocks.fakeTask({ due_date: '2021-01-01' }));
        await mocks.management_tasksFactory({
          promisedTask,
          promisedPlantingManagementPlan: [{ planting_management_plan_id }],
        });
        const [transplantLocation] = await mocks.fieldFactory({ promisedFarm });
        const [transplantPlantingManagementPlan] = await knex('planting_management_plan').insert(mocks.fakePlantingManagementPlan({
          management_plan_id,
          location_id: transplantLocation.location_id,
        })).returning('*');
        const [{ task_type_id }] = await knex('task_type').insert({
          farm_id: null,
          task_name: 'Transplant task',
          task_translation_key: 'TRANSPLANT_TASK', ...mocks.baseProperties(user_id),
        }).returning('*');
        const promisedTaskType = [{ task_type_id }];
        const [{ task_id }] = await mocks.taskFactory({ promisedTaskType }, mocks.fakeTask({ completed_time: new Date('2021-01-01') }));
        await knex('transplant_task').insert({
          task_id,
          planting_management_plan_id: transplantPlantingManagementPlan.planting_management_plan_id,
        });
        const recordA = await recordAQuery('2021-01-02', '2021-01-01', farm_id);
        expect(recordA.length).toBe(2);
        for (const record of recordA) {
          if (record.location_id === location_id) {
            expect(record.crops.length).toBe(1);
          } else {
            expect(record.crops.length).toBe(1);
          }
        }
        done();
      });

      test('When there is a completed transplant task after reporting period, should only include already_in_ground management plan location', async (done) => {
        const [{ farm_id, user_id }] = await mocks.userFarmFactory({}, fakeUserFarm());
        const promisedFarm = [{ farm_id }];
        const [{ location_id }] = await mocks.locationFactory({ promisedFarm });
        const promisedLocation = [{ location_id }];
        const [{ crop_translation_key, crop_id }] = await mocks.cropFactory({ promisedFarm });
        const promisedCrop = [{ crop_id }];
        const [{
          planting_management_plan_id,
          management_plan_id,
        }] = await mocks.planting_management_planFactory({ promisedFarm, promisedLocation, promisedCrop });
        const promisedTask = await mocks.taskFactory({}, mocks.fakeTask({ due_date: '2021-01-01' }));
        await mocks.management_tasksFactory({
          promisedTask,
          promisedPlantingManagementPlan: [{ planting_management_plan_id }],
        });
        const [transplantLocation] = await mocks.fieldFactory({ promisedFarm });
        const [transplantPlantingManagementPlan] = await knex('planting_management_plan').insert(mocks.fakePlantingManagementPlan({
          management_plan_id,
          location_id: transplantLocation.location_id,
        })).returning('*');
        const [{ task_type_id }] = await knex('task_type').insert({
          farm_id: null,
          task_name: 'Transplant task',
          task_translation_key: 'TRANSPLANT_TASK', ...mocks.baseProperties(user_id),
        }).returning('*');
        const promisedTaskType = [{ task_type_id }];
        const [{ task_id }] = await mocks.taskFactory({ promisedTaskType }, mocks.fakeTask({
          due_date: '2021-01-01',
          completed_time: new Date('2021-01-04'),
        }));
        await knex('transplant_task').insert({
          task_id,
          planting_management_plan_id: transplantPlantingManagementPlan.planting_management_plan_id,
        });
        const recordA = await recordAQuery('2021-01-02', '2021-01-01', farm_id);
        expect(recordA.length).toBe(2);
        for (const record of recordA) {
          if (record.location_id === location_id) {
            expect(record.crops.length).toBe(1);
          } else {
            expect(record.crops.length).toBe(0);
          }
        }
        done();
      });

    });


  })

  // describe('Patch organic certifier survey', () => {
  //   let fakeOrganicCertifierSurvey;
  //   let organicCertifierSurvey;


  describe('Put organic certifier survey', () => {
    let fakeOrganicCertifierSurvey;

    beforeEach(async () => {
      [fakeOrganicCertifierSurvey] = await mocks.organicCertifierSurveyFactory({ promisedUserFarm: [ownerFarm] });
      fakeOrganicCertifierSurvey = {
        ...fakeOrganicCertifierSurvey, ...getFakeOrganicCertifierSurvey(),
        farm_id: farm.farm_id,
      };
    });

    test('should return 403 status if headers.farm_id is set to null', async (done) => {
      fakeOrganicCertifierSurvey.farm_id = null;
      putRequest(fakeOrganicCertifierSurvey, {}, (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

    test('should return 400 if certification_id and requested_certification are null', async (done) => {
      delete fakeOrganicCertifierSurvey.certification_id;
      delete fakeOrganicCertifierSurvey.requested_certification;
      putRequest(fakeOrganicCertifierSurvey, {}, (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('should return 400 if certification_id and requested_certification are not null', async (done) => {
      fakeOrganicCertifierSurvey.certification_id = 1;
      fakeOrganicCertifierSurvey.requested_certification = 'requested';
      putRequest(fakeOrganicCertifierSurvey, {}, (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('should return 400 if certifier_id and requested_certifier are null', async (done) => {
      delete fakeOrganicCertifierSurvey.certifier_id;
      delete fakeOrganicCertifierSurvey.requested_certifier;
      putRequest(fakeOrganicCertifierSurvey, {}, (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('should return 400 if certifier_id and requested_certifier are not null', async (done) => {
      fakeOrganicCertifierSurvey.certifier_id = 1;
      fakeOrganicCertifierSurvey.requested_certifier = 'requested';
      putRequest(fakeOrganicCertifierSurvey, {}, (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    describe('Put organicCertifierSurvey authorization tests', () => {

      let worker;
      let manager;
      let extensionOfficer;
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
        [extensionOfficer] = await mocks.userFarmFactory();
        const [extensionOfficerFarm] = await mocks.userFarmFactory({
          promisedUser: [extensionOfficer],
          promisedFarm: [farm],
        }, fakeUserFarm(5));

        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
          promisedUser: [unAuthorizedUser],
          promisedFarm: [farmunAuthorizedUser],
        }, fakeUserFarm(1));
      });

      test('Owner put certifiers', async (done) => {
        putRequest(fakeOrganicCertifierSurvey, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const organicCertifierSurveys = await organicCertifierSurveyModel.query().context({ showHidden: true }).where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].created_by_user_id).toBe(owner.user_id);
          expect(organicCertifierSurveys[0].certifiers).toEqual(fakeOrganicCertifierSurvey.certifiers);
          done();
        });
      });

      test('Manager put certifiers', async (done) => {
        putRequest(fakeOrganicCertifierSurvey, { user_id: manager.user_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const organicCertifierSurveys = await organicCertifierSurveyModel.query().context({ showHidden: true }).where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].certifiers).toEqual(fakeOrganicCertifierSurvey.certifiers);
          done();
        });
      });

      test('Extension officer put certifiers', async (done) => {
        putRequest(fakeOrganicCertifierSurvey, { user_id: extensionOfficer.user_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const organicCertifierSurveys = await organicCertifierSurveyModel.query().context({ showHidden: true }).where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].certifiers).toEqual(fakeOrganicCertifierSurvey.certifiers);
          done();
        });
      });

      test('should return 403 status if organicCertifierSurvey is puted by worker', async (done) => {
        putRequest(fakeOrganicCertifierSurvey, { user_id: worker.user_id }, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe('User does not have the following permission(s): edit:organic_certifier_survey');
          done();
        });
      });

      test('should return 403 status if organicCertifierSurvey is puted by unauthorized user', async (done) => {
        putRequest(fakeOrganicCertifierSurvey, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe('User does not have the following permission(s): edit:organic_certifier_survey');
          done();
        });
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        putRequest(fakeOrganicCertifierSurvey, {
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id,
        }, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

    });


  });


});
