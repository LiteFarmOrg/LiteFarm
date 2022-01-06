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
const moment = require('moment');
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
    email = require('../src/templates/sendEmailTemplate');
    email.sendEmail.mockClear();
  });

  function postRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .post(`/organic_certifier_survey`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function putRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .put(`/organic_certifier_survey`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function getExportRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .post(`/organic_certifier_survey/request_export`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function getAllSupportedCertificationsRequest({ farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .get(`/organic_certifier_survey/${farm_id}/supported_certifications`)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function getAllSupportedCertifiersRequest(
    { user_id = owner.user_id, farm_id = farm.farm_id },
    callback,
  ) {
    chai
      .request(server)
      .get(`/organic_certifier_survey/${farm_id}/supported_certifiers`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .end(callback);
  }

  function deleteRequest({ user_id = owner.user_id, farm_id = farm.farm_id, survey_id }, callback) {
    chai
      .request(server)
      .delete(`/organic_certifier_survey/${survey_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  function getFakeOrganicCertifierSurvey(farm_id = farm.farm_id, interested = true) {
    const organicCertifierSurvey = mocks.fakeOrganicCertifierSurvey();
    return {
      ...organicCertifierSurvey,
      interested,
      certifier_id: organicCertifierSurvey.certifier_id,
      certification_id: organicCertifierSurvey.certification_id,
      farm_id,
    };
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [ownerFarm] = await mocks.userFarmFactory(
      { promisedUser: [owner], promisedFarm: [farm] },
      fakeUserFarm(1),
    );
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Get supported certifier and certification', function () {
    let organicCertifierSurvey;
    beforeEach(async () => {
      [organicCertifierSurvey] = await mocks.organicCertifierSurveyFactory({
        promisedUserFarm: [ownerFarm],
      });
    });

    describe('Get supported certifier & certification', () => {
      let manager;

      beforeEach(async () => {
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [manager],
            promisedFarm: [farm],
          },
          fakeUserFarm(2),
        );
      });

      test('User should get all supported certifiers', async (done) => {
        getAllSupportedCertifiersRequest(
          {
            user_id: manager.user_id,
          },
          (err, res) => {
            expect(res.status).toBe(200);
            done();
          },
        );
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

  describe('Delete certifier survey', function () {
    let organicCertifierSurvey;
    beforeEach(async () => {
      [organicCertifierSurvey] = await mocks.organicCertifierSurveyFactory({
        promisedUserFarm: [ownerFarm],
      });
    });

    describe('Delete certifier survey authorization tests', () => {
      let worker;
      let manager;
      let extensionOfficer;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async () => {
        [worker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [worker],
            promisedFarm: [farm],
          },
          fakeUserFarm(3),
        );
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [manager],
            promisedFarm: [farm],
          },
          fakeUserFarm(2),
        );
        [extensionOfficer] = await mocks.userFarmFactory();
        const [extensionOfficerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [extensionOfficer],
            promisedFarm: [farm],
          },
          fakeUserFarm(5),
        );

        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
          {
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser],
          },
          fakeUserFarm(1),
        );
      });

      test('Owner should delete a certifier survey', async (done) => {
        deleteRequest({ survey_id: organicCertifierSurvey.survey_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const SurveyRes = await organicCertifierSurveyModel
            .query()
            .context({ showHidden: true })
            .where('survey_id', organicCertifierSurvey.survey_id);
          expect(SurveyRes.length).toBe(1);
          expect(SurveyRes[0].deleted).toBe(true);
          done();
        });
      });

      test('Manager should delete a certifier survey', async (done) => {
        deleteRequest(
          { user_id: manager.user_id, survey_id: organicCertifierSurvey.survey_id },
          async (err, res) => {
            expect(res.status).toBe(200);
            const SurveyRes = await organicCertifierSurveyModel
              .query()
              .context({ showHidden: true })
              .where('survey_id', organicCertifierSurvey.survey_id);
            expect(SurveyRes.length).toBe(1);
            expect(SurveyRes[0].deleted).toBe(true);
            done();
          },
        );
      });

      test('should return 403 if an unauthorized user tries to delete a certifier survey', async (done) => {
        deleteRequest(
          {
            user_id: unAuthorizedUser.user_id,
            survey_id: organicCertifierSurvey.survey_id,
          },
          async (err, res) => {
            expect(res.status).toBe(403);
            done();
          },
        );
      });

      test('should return 403 if a worker tries to delete a certifier survey', async (done) => {
        deleteRequest(
          { user_id: worker.user_id, survey_id: organicCertifierSurvey.survey_id },
          async (err, res) => {
            expect(res.status).toBe(403);
            done();
          },
        );
      });

      test('Circumvent authorization by modifying farm_id', async (done) => {
        deleteRequest(
          {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
            survey_id: organicCertifierSurvey.survey_id,
          },
          async (err, res) => {
            expect(res.status).toBe(403);
            done();
          },
        );
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
        const [workerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [worker],
            promisedFarm: [farm],
          },
          fakeUserFarm(3),
        );
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [manager],
            promisedFarm: [farm],
          },
          fakeUserFarm(2),
        );
        [extensionOfficer] = await mocks.userFarmFactory();
        const [extensionOfficerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [extensionOfficer],
            promisedFarm: [farm],
          },
          fakeUserFarm(5),
        );

        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
          {
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser],
          },
          fakeUserFarm(1),
        );
      });

      test('Owner post certifiers', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, {}, async (err, res) => {
          expect(res.status).toBe(201);
          const organicCertifierSurveys = await organicCertifierSurveyModel
            .query()
            .context({ showHidden: true })
            .where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].created_by_user_id).toBe(owner.user_id);
          expect(organicCertifierSurveys[0].certifiers).toEqual(
            fakeOrganicCertifierSurvey.certifiers,
          );
          done();
        });
      });

      test('Manager post certifiers', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, { user_id: manager.user_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const organicCertifierSurveys = await organicCertifierSurveyModel
            .query()
            .context({ showHidden: true })
            .where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].created_by_user_id).toBe(manager.user_id);
          expect(organicCertifierSurveys[0].certifiers).toEqual(
            fakeOrganicCertifierSurvey.certifiers,
          );
          done();
        });
      });

      test('Extension officer post certifiers', async (done) => {
        postRequest(
          fakeOrganicCertifierSurvey,
          { user_id: extensionOfficer.user_id },
          async (err, res) => {
            expect(res.status).toBe(201);
            const organicCertifierSurveys = await organicCertifierSurveyModel
              .query()
              .context({ showHidden: true })
              .where('farm_id', farm.farm_id);
            expect(organicCertifierSurveys.length).toBe(1);
            expect(organicCertifierSurveys[0].created_by_user_id).toBe(extensionOfficer.user_id);
            expect(organicCertifierSurveys[0].certifiers).toEqual(
              fakeOrganicCertifierSurvey.certifiers,
            );
            done();
          },
        );
      });

      test('should return 403 status if organicCertifierSurvey is posted by worker', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, { user_id: worker.user_id }, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe(
            'User does not have the following permission(s): add:organic_certifier_survey',
          );
          done();
        });
      });

      test('should return 403 status if organicCertifierSurvey is posted by unauthorized user', async (done) => {
        postRequest(
          fakeOrganicCertifierSurvey,
          { user_id: unAuthorizedUser.user_id },
          async (err, res) => {
            expect(res.status).toBe(403);
            expect(res.error.text).toBe(
              'User does not have the following permission(s): add:organic_certifier_survey',
            );
            done();
          },
        );
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        postRequest(
          fakeOrganicCertifierSurvey,
          {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          },
          async (err, res) => {
            expect(res.status).toBe(403);
            done();
          },
        );
      });
    });
  });

  describe('Export test', () => {
    function managementPlanDates(start, seed, completed = null, abandoned = null) {
      return {
        start_date: new Date(start),
        complete_date: completed ? new Date(completed) : null,
        abandon_date: abandoned ? new Date(abandoned) : null,
      };
    }

    test('Should get records from canadian farm that were active before the to_date and NOT completed before the from date', async (done) => {
      const [{ farm_id, user_id }] = await mocks.userFarmFactory({}, fakeUserFarm());
      await mocks.organicCertifierSurveyFactory(
        { promisedUserFarm: [{ farm_id, user_id }] },
        mocks.fakeOrganicCertifierSurvey(farm_id, { certifier_id: 1 }),
      );
      const cropVariety = await mocks.crop_varietyFactory(
        { promisedFarm: [{ farm_id }] },
        mocks.fakeCropVariety({ organic: true }),
      );
      const completeBeforeTheToDate = await mocks.crop_management_planFactory(
        {
          promisedFarm: [{ farm_id }],
          promisedCropVariety: cropVariety,
          promisedManagementPlan: mocks.management_planFactory(
            {
              promisedFarm: [{ farm_id }],
              promisedCropVariety: cropVariety,
            },
            mocks.fakeManagementPlan(managementPlanDates('2021-01-20', '2021-01-01', '2021-01-30')),
          ),
        },
        mocks.fakeCropManagementPlan({ seed_date: new Date('2021-01-01') }),
      );
      const notCompletedOrAbandoned = await mocks.crop_management_planFactory(
        {
          promisedFarm: [{ farm_id }],
          promisedCropVariety: cropVariety,
          promisedManagementPlan: mocks.management_planFactory(
            {
              promisedFarm: [{ farm_id }],
              promisedCropVariety: cropVariety,
            },
            mocks.fakeManagementPlan(managementPlanDates('2021-03-22', '2021-03-22')),
          ),
        },
        mocks.fakeCropManagementPlan({ seed_date: new Date('2021-03-22') }),
      );
      getExportRequest(
        {
          from_date: '2021-02-01',
          to_date: '2021-05-20',
          email: faker.internet.email(),
          farm_id: farm_id,
        },
        { farm_id, user_id },
        (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.recordD.length).toBe(1);
          done();
        },
      );
    });

    test('Should get records from canadian farm that were active before the to_date and NOT abandoned', async (done) => {
      const [{ farm_id, user_id }] = await mocks.userFarmFactory({}, fakeUserFarm());
      await mocks.organicCertifierSurveyFactory(
        { promisedUserFarm: [{ farm_id, user_id }] },
        mocks.fakeOrganicCertifierSurvey(farm_id, { certifier_id: 1 }),
      );
      const cropVariety = await mocks.crop_varietyFactory(
        { promisedFarm: [{ farm_id }] },
        mocks.fakeCropVariety({ organic: true }),
      );
      const completeBeforeTheToDate = await mocks.crop_management_planFactory(
        {
          promisedFarm: [{ farm_id }],
          promisedCropVariety: cropVariety,
          promisedManagementPlan: mocks.management_planFactory(
            {
              promisedFarm: [{ farm_id }],
              promisedCropVariety: cropVariety,
            },
            mocks.fakeManagementPlan(
              managementPlanDates('2021-01-20', '2021-01-01', null, '2021-01-30'),
            ),
          ),
        },
        mocks.fakeCropManagementPlan({ seed_date: new Date('2021-01-01') }),
      );
      const notCompletedOrAbandoned = await mocks.crop_management_planFactory(
        {
          promisedFarm: [{ farm_id }],
          promisedCropVariety: cropVariety,
          promisedManagementPlan: mocks.management_planFactory(
            {
              promisedFarm: [{ farm_id }],
              promisedCropVariety: cropVariety,
            },
            mocks.fakeManagementPlan(managementPlanDates('2021-03-22', '2021-03-22')),
          ),
        },
        mocks.fakeCropManagementPlan({ seed_date: new Date('2021-03-22') }),
      );
      getExportRequest(
        {
          from_date: '2021-02-01',
          to_date: '2021-05-20',
          email: faker.internet.email(),
          farm_id: farm_id,
        },
        { farm_id, user_id },
        (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.recordD.length).toBe(1);
          done();
        },
      );
    });

    test('Should get no records from canadian farm if no management plans (Possible failure scenario in the future)', async (done) => {
      const [{ farm_id, user_id }] = await mocks.userFarmFactory({}, fakeUserFarm());
      await mocks.organicCertifierSurveyFactory(
        { promisedUserFarm: [{ farm_id, user_id }] },
        mocks.fakeOrganicCertifierSurvey(farm_id, { certifier_id: 1 }),
      );
      getExportRequest(
        {
          from_date: '2021-02-01',
          to_date: '2021-05-20',
          email: faker.internet.email(),
          farm_id: farm_id,
        },
        { farm_id, user_id },
        (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.recordD.length).toBe(0);
          done();
        },
      );
    });

    describe('Record A data', () => {
      const MAY30 = '2020-05-30';
      const MAY31 = '2020-05-31';
      const JUNE01 = '2020-06-01';
      const JUNE02 = '2020-06-02';
      const JUNE15 = '2020-06-15';
      const JUNE30 = '2020-06-30';
      const JULY01 = '2020-07-01';
      const START_OF_DAY = 'T00:00:00Z';
      const END_OF_DAY = 'T23:59:59Z';
      const EXPECTED_CROP = 'crop "translation" key for testing';
      let farm_id;
      let user_id;
      let crop_id;
      let cropVariety;
      let location;
      let planting_management_plan_id;
      let exportIds;
      let exportOptions;
      let management_plan_id;

      beforeEach(async () => {
        [{ farm_id, user_id }] = await mocks.userFarmFactory({}, fakeUserFarm());
        exportIds = { farm_id, user_id };
        exportOptions = {
          from_date: JUNE01,
          to_date: JUNE30,
          email: faker.internet.email(),
          farm_id,
        };

        [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

        await mocks.areaFactory({ promisedFarm: [{ farm_id }], promisedLocation: [location] });

        await mocks.organicCertifierSurveyFactory(
          { promisedUserFarm: [{ farm_id, user_id }] },
          mocks.fakeOrganicCertifierSurvey(farm_id, { certifier_id: 1 }),
        );
        [{ crop_id }] = await mocks.cropFactory(
          { promisedFarm: [{ farm_id }], createdUser: [{ user_id }] },
          mocks.fakeCrop({ crop_translation_key: EXPECTED_CROP }),
        );
        [cropVariety] = await mocks.crop_varietyFactory(
          { promisedFarm: [{ farm_id }] },
          mocks.fakeCropVariety({ crop_variety_name: 'test', crop_id }),
        );

        [
          { planting_management_plan_id, management_plan_id },
        ] = await mocks.planting_management_planFactory({
          promisedFarm: [{ farm_id }],
          promisedLocation: [location],
          promisedCrop: [{ crop_id }],
          promisedCropVariety: [cropVariety],
        });
      });

      const createTask = async (options) => {
        const fakeTask = mocks.fakeTask({
          owner_user_id: user_id,
          assignee_user_id: user_id,
          planned_time: faker.date.future(),
          due_date: faker.date.future(),
          ...options,
        });

        const [{ task_id }] = await mocks.taskFactory(
          {
            promisedUser: [{ user_id }],
          },
          fakeTask,
        );

        return task_id;
      };

      const createManagementTaskWithinReportingPeriod = async () => {
        await createManagementTask({ due_date: JUNE01 });
      };

      const createManagementTask = async (options) => {
        const newTaskId = await createTask(options);
        await mocks.management_tasksFactory({
          promisedTask: [{ task_id: newTaskId }],
          promisedPlantingManagementPlan: [{ planting_management_plan_id }],
        });
      };

      const createTransplantTask = async (
        options,
        { management_plan_id: transplantTaskManagementPlanId = management_plan_id } = {},
      ) => {
        const [{ location_id }] = await mocks.fieldFactory({ promisedFarm: [{ farm_id }] });

        const [transplantMgtPlan] = await knex('planting_management_plan')
          .insert({
            ...mocks.fakePlantingManagementPlan({
              location_id,
              management_plan_id: transplantTaskManagementPlanId,
            }),
          })
          .returning('*');
        const task_id = await createTask(options);
        await mocks.transplant_taskFactory(
          { promisedTask: [{ task_id }] },
          { planting_management_plan_id: transplantMgtPlan.planting_management_plan_id },
        );
        const { management_plan_id } = transplantMgtPlan;
        return { management_plan_id };
      };

      const createPlantTask = async (options) => {
        const task_id = await createTask(options);
        await mocks.plant_taskFactory(
          { promisedTask: [{ task_id }] },
          { planting_management_plan_id },
        );
      };

      const testScenarios = [
        {
          include: {
            plant_task: true,
            in_ground: true,
            no_active_task: true,
            transplant_task: { plant_task: true, in_ground: true, transplant_task: true },
          },
          title: 'completed on report start date',
          options: { completed_time: `'${JUNE01}${START_OF_DAY}'` },
        },
        {
          include: {
            plant_task: true,
            in_ground: true,
            no_active_task: true,
            transplant_task: { plant_task: true, in_ground: true, transplant_task: true },
          },
          title: 'completed on report end date',
          options: { completed_time: `'${JUNE30}${END_OF_DAY}'` },
        },
        {
          include: {
            plant_task: true,
            in_ground: true,
            no_active_task: true,
            transplant_task: { plant_task: true, in_ground: true, transplant_task: true },
          },
          title: 'due on report start date',
          options: { due_date: JUNE01 },
        },
        {
          include: {
            plant_task: true,
            in_ground: true,
            no_active_task: true,
            transplant_task: { plant_task: true, in_ground: true, transplant_task: true },
          },
          title: 'due on report end date',
          options: { due_date: JUNE30 },
        },
        {
          include: {
            plant_task: true,
            in_ground: true,
            no_active_task: false,
            transplant_task: { plant_task: false, in_ground: false, transplant_task: true },
          },
          title: 'completed just before the report start date',
          options: { completed_time: `'${MAY31}${END_OF_DAY}'` },
        },
        {
          include: {
            plant_task: true,
            in_ground: true,
            no_active_task: false,
            transplant_task: { plant_task: true, in_ground: true, transplant_task: false },
          },
          title: 'completed just after the report end date',
          options: { completed_time: `'${JULY01}${START_OF_DAY}'` },
        },
        {
          include: {
            plant_task: true,
            in_ground: true,
            no_active_task: false,
            transplant_task: { plant_task: false, in_ground: false, transplant_task: true },
          },
          title: 'due just before the report start date',
          options: { due_date: MAY31 },
        },
        {
          include: {
            plant_task: true,
            in_ground: true,
            no_active_task: false,
            transplant_task: { plant_task: true, in_ground: true, transplant_task: false },
          },
          title: 'due just after the report end date',
          options: { due_date: JULY01 },
        },
      ];

      for (const scenario of testScenarios) {
        const include = scenario.include.plant_task;
        test(`Plant task location: should ${include ? '' : 'not '}include crops from plant tasks ${
          scenario.title
        }`, async (done) => {
          await createPlantTask(scenario.options);
          await createManagementTaskWithinReportingPeriod();

          getExportRequest(exportOptions, exportIds, (err, res) => {
            expect(err).toBeNull();
            expect(res.status).toBe(200);
            expect(res.body.recordA).toHaveLength(1);
            expect(res.body.recordA[0].crops).toHaveLength(include ? 1 : 0);
            if (include) expect(res.body.recordA[0].crops[0]).toEqual(EXPECTED_CROP);
            done();
          });
        });
      }

      for (const scenario of testScenarios) {
        const include = scenario.include.in_ground;
        test(`In ground management plan location: should ${
          include ? '' : 'not '
        }include crops from in ground management plan location ${scenario.title}`, async (done) => {
          await createManagementTaskWithinReportingPeriod();

          getExportRequest(exportOptions, exportIds, (err, res) => {
            expect(err).toBeNull();
            expect(res.status).toBe(200);
            expect(res.body.recordA).toHaveLength(1);
            expect(res.body.recordA[0].crops).toHaveLength(include ? 1 : 0);
            if (include) expect(res.body.recordA[0].crops[0]).toEqual(EXPECTED_CROP);
            done();
          });
        });
      }

      for (const scenario of testScenarios) {
        const include = scenario.include.no_active_task;
        test(`No active task: should ${
          include ? '' : 'not '
        }include crops from plant task location ${scenario.title}`, async (done) => {
          await createPlantTask(scenario.options);
          getExportRequest(exportOptions, exportIds, (err, res) => {
            expect(err).toBeNull();
            expect(res.status).toBe(200);
            expect(res.body.recordA).toHaveLength(1);
            expect(res.body.recordA[0].crops).toHaveLength(include ? 1 : 0);
            if (include) expect(res.body.recordA[0].crops[0]).toEqual(EXPECTED_CROP);
            done();
          });
        });
      }

      for (const scenario of testScenarios) {
        test(`Abandoned transplant tasks: should not include crops from abandoned transplant tasks ${scenario.title}`, async (done) => {
          await createTransplantTask({
            ...scenario.options,
            abandoned_time: `'${JULY01}${START_OF_DAY}'`,
          });
          await createManagementTaskWithinReportingPeriod();

          getExportRequest(exportOptions, exportIds, (err, res) => {
            expect(err).toBeNull();
            expect(res.status).toBe(200);
            expect(res.body.recordA).toHaveLength(2);
            for (const record of res.body.recordA) {
              if (record.location_id === location.location_id) {
                expect(record.crops.length).toBe(1);
              } else {
                expect(record.crops.length).toBe(0);
              }
            }
            done();
          });
        });
      }

      for (const scenario of testScenarios) {
        const include = scenario.include.transplant_task.transplant_task;
        test(`Transplant task with previous plant_task: should ${
          include ? '' : 'not '
        }include crops from transplant tasks ${scenario.title}`, async (done) => {
          await createPlantTask({ due_date: MAY30 });
          await createTransplantTask(scenario.options);

          await createManagementTaskWithinReportingPeriod();

          getExportRequest(exportOptions, exportIds, (err, res) => {
            expect(err).toBeNull();
            expect(res.status).toBe(200);
            expect(res.body.recordA).toHaveLength(2);
            for (const record of res.body.recordA) {
              if (record.location_id === location.location_id) {
                expect(record.crops.length).toBe(
                  scenario.include.transplant_task.plant_task ? 1 : 0,
                );
              } else {
                expect(record.crops.length).toBe(include ? 1 : 0);
              }
            }
            done();
          });
        });
      }

      for (const scenario of testScenarios) {
        const include = scenario.include.transplant_task.transplant_task;
        test(`Transplant task with in ground management plan: should ${
          include ? '' : 'not '
        }include crops from transplant tasks ${scenario.title}`, async (done) => {
          await createTransplantTask(scenario.options);

          await createManagementTaskWithinReportingPeriod();

          getExportRequest(exportOptions, exportIds, (err, res) => {
            expect(err).toBeNull();
            expect(res.status).toBe(200);
            expect(res.body.recordA).toHaveLength(2);
            for (const record of res.body.recordA) {
              if (record.location_id === location.location_id) {
                expect(record.crops.length).toBe(
                  scenario.include.transplant_task.in_ground ? 1 : 0,
                );
              } else {
                expect(record.crops.length).toBe(include ? 1 : 0);
              }
            }
            done();
          });
        });
      }

      for (const scenario of testScenarios) {
        test(`should not include crops from abandoned management tasks ${scenario.title}`, async (done) => {
          await createManagementTask({
            due_date: JUNE01,
            abandoned_time: `'${JULY01}${START_OF_DAY}'`,
          });

          getExportRequest(exportOptions, exportIds, (err, res) => {
            expect(err).toBeNull();
            expect(res.status).toBe(200);
            expect(res.body.recordA).toHaveLength(1);
            expect(res.body.recordA[0].crops).toHaveLength(0);
            done();
          });
        });
      }

      test(`should not include crops from in ground management plan pin location`, async (done) => {
        await createManagementTaskWithinReportingPeriod();
        await knex('planting_management_plan')
          .where({ planting_management_plan_id })
          .update({ pin_coordinate: { lat: 45, lng: 45 }, location_id: null });
        getExportRequest(exportOptions, exportIds, (err, res) => {
          expect(err).toBeNull();
          expect(res.status).toBe(200);
          expect(res.body.recordA).toHaveLength(1);
          expect(res.body.recordA[0].crops).toHaveLength(0);
          done();
        });
      });

      test(`No active task: should not include crops from in ground management plan location`, async (done) => {
        getExportRequest(exportOptions, exportIds, (err, res) => {
          expect(err).toBeNull();
          expect(res.status).toBe(200);
          expect(res.body.recordA).toHaveLength(1);
          expect(res.body.recordA[0].crops).toHaveLength(0);
          done();
        });
      });

      test(`Task before reporting period: should not include crops from in ground management plan location`, async (done) => {
        await createTask({ due_date: MAY31 });
        getExportRequest(exportOptions, exportIds, (err, res) => {
          expect(err).toBeNull();
          expect(res.status).toBe(200);
          expect(res.body.recordA).toHaveLength(1);
          expect(res.body.recordA[0].crops).toHaveLength(0);
          done();
        });
      });

      test(`Task after reporting period: should not include crops from in ground management plan location`, async (done) => {
        await createTask({ completed_time: `'${JULY01}${START_OF_DAY}'` });
        getExportRequest(exportOptions, exportIds, (err, res) => {
          expect(err).toBeNull();
          expect(res.status).toBe(200);
          expect(res.body.recordA).toHaveLength(1);
          expect(res.body.recordA[0].crops).toHaveLength(0);
          done();
        });
      });

      test(`Reporting period between two tasks: should include crops from in ground management plan location`, async (done) => {
        await createManagementTask({ completed_time: `'${MAY31}${START_OF_DAY}'` });
        await createManagementTask({ due_date: JULY01 });
        getExportRequest(exportOptions, exportIds, (err, res) => {
          expect(err).toBeNull();
          expect(res.status).toBe(200);
          expect(res.body.recordA).toHaveLength(1);
          expect(res.body.recordA[0].crops).toHaveLength(1);
          done();
        });
      });

      test('should not include wild crops for management plan completed before reporting period', async (done) => {
        await knex('management_plan')
          .where({ management_plan_id })
          .update({ complete_date: MAY31 });
        getExportRequest(exportOptions, exportIds, (err, res) => {
          expect(err).toBeNull();
          expect(res.status).toBe(200);
          expect(res.body.recordA).toHaveLength(1);
          expect(res.body.recordA[0].crops).toHaveLength(0);
          done();
        });
      });

      test('should include in ground management plan location/transplant task location for management plan completed after the start of reporting period', async (done) => {
        await knex('management_plan')
          .where({ management_plan_id })
          .update({ complete_date: JUNE02 });
        await createTransplantTask({ due_date: JUNE30 });
        getExportRequest(exportOptions, exportIds, (err, res) => {
          expect(err).toBeNull();
          expect(res.status).toBe(200);
          expect(res.body.recordA).toHaveLength(2);
          for (const record of res.body.recordA) {
            expect(record.crops).toHaveLength(1);
          }
          done();
        });
      });

      test('should include plant_task/transplant_task location for management plan completed after the start of reporting period', async (done) => {
        await knex('management_plan')
          .where({ management_plan_id })
          .update({ complete_date: JUNE02 });
        await createPlantTask({ due_date: JUNE01 });
        await createTransplantTask({ due_date: JUNE30 });
        getExportRequest(exportOptions, exportIds, (err, res) => {
          expect(err).toBeNull();
          expect(res.status).toBe(200);
          expect(res.body.recordA).toHaveLength(2);
          for (const record of res.body.recordA) {
            expect(record.crops).toHaveLength(1);
          }
          done();
        });
      });

      test('should exclude plant location when there are transplant tasks before start date', async (done) => {
        await createPlantTask({ due_date: JUNE01 });
        await createTransplantTask({ due_date: MAY31 });
        await createTransplantTask({ completed_time: JUNE01 });
        await createTransplantTask({ due_date: JUNE15 });
        getExportRequest(exportOptions, exportIds, (err, res) => {
          expect(err).toBeNull();
          expect(res.status).toBe(200);
          expect(res.body.recordA).toHaveLength(4);
          for (const record of res.body.recordA) {
            if (record.location_id === location.location_id) {
              expect(record.crops).toHaveLength(0);
            } else {
              expect(record.crops).toHaveLength(1);
            }
          }
          done();
        });
      });

      test('should not include wild crops for abandoned management plan', async (done) => {
        const [{ management_plan_id }] = await mocks.management_planFactory(
          {
            promisedFarm: [{ farm_id }],
            promisedCrop: [{ crop_id }],
            promisedCropVariety: [cropVariety],
          },
          { ...mocks.fakeManagementPlan(), abandon_date: MAY31 },
        );

        const [location] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });

        await mocks.planting_management_planFactory({
          promisedFarm: [{ farm_id }],
          promisedLocation: [location],
          promisedCrop: [{ crop_id }],
          promisedCropVariety: [cropVariety],
          promisedManagementPlan: [{ management_plan_id }],
        });

        getExportRequest(exportOptions, exportIds, (err, res) => {
          expect(err).toBeNull();
          expect(res.status).toBe(200);
          expect(res.body.recordA).toHaveLength(2);
          for (const record of res.body.recordA) {
            expect(record.crops).toHaveLength(0);
          }
          done();
        });
      });

      test('should not include transplanted crops for abandoned management plan', async (done) => {
        const [{ management_plan_id }] = await mocks.management_planFactory(
          {
            promisedFarm: [{ farm_id }],
            promisedCrop: [{ crop_id }],
            promisedCropVariety: [cropVariety],
          },
          { ...mocks.fakeManagementPlan(), abandon_date: JULY01 },
        );

        await createTransplantTask(
          { completed_time: `'${JUNE30}${START_OF_DAY}` },
          { management_plan_id },
        );

        const [location] = await mocks.fieldFactory({ promisedFarm: [{ farm_id }] });

        const [{ planting_management_plan_id }] = await knex('planting_management_plan')
          .insert({ management_plan_id, location_id: location.location_id })
          .returning('*');

        const task_id = await createTask({ completed_time: `'${JUNE01}${START_OF_DAY}` });
        await mocks.plant_taskFactory(
          { promisedTask: [{ task_id }] },
          { planting_management_plan_id },
        );

        getExportRequest(exportOptions, exportIds, (err, res) => {
          expect(err).toBeNull();
          expect(res.status).toBe(200);
          expect(res.body.recordA).toHaveLength(3);
          for (const record of res.body.recordA) {
            expect(record.crops).toHaveLength(0);
          }
          done();
        });
      });

      test('should exclude gate, water valve, farm site boundary, fence, surface water, and watercourse locations', async (done) => {
        await mocks.farm_site_boundaryFactory({ promisedFarm: [{ farm_id }] });
        await mocks.surface_waterFactory({ promisedFarm: [{ farm_id }] });
        await mocks.watercourseFactory({ promisedFarm: [{ farm_id }] });
        await mocks.gateFactory({ promisedFarm: [{ farm_id }] });
        await mocks.water_valveFactory({ promisedFarm: [{ farm_id }] });
        await mocks.fenceFactory({ promisedFarm: [{ farm_id }] });

        getExportRequest(exportOptions, exportIds, (err, res) => {
          expect(err).toBeNull();
          expect(res.status).toBe(200);
          expect(res.body.recordA).toHaveLength(1);
          done();
        });
      });

      const bufferZoneScenarios = [
        { hasCrops: true, title: 'with', category: 'Non-Organic' },
        { hasCrops: false, title: 'without', category: 'Non-Producing' },
      ];

      for (const scenario of bufferZoneScenarios) {
        test(`should categorize buffer zones ${scenario.title} crops as ${scenario.category}`, async (done) => {
          const [buffer] = await mocks.buffer_zoneFactory({ promisedFarm: [{ farm_id }] });

          if (scenario.hasCrops) {
            const [{ planting_management_plan_id }] = await mocks.planting_management_planFactory({
              promisedFarm: [{ farm_id }],
              promisedLocation: [buffer],
              promisedField: [buffer],
              promisedCrop: [{ crop_id }],
              promisedCropVariety: [cropVariety],
            });

            const task_id = await createTask({ due_date: JUNE01 });

            await mocks.management_tasksFactory({
              promisedTask: [{ task_id }],
              promisedPlantingManagementPlan: [{ planting_management_plan_id }],
            });
          }

          getExportRequest(exportOptions, exportIds, (err, res) => {
            expect(err).toBeNull();
            expect(res.status).toBe(200);
            expect(res.body.recordA).toHaveLength(2);
            for (const location of res.body.recordA) {
              // The buffer zone can be identified by an area of zero.
              if (location.area === 0) {
                if (scenario.hasCrops) {
                  expect(location.isNonOrganic).toBeTruthy();
                  expect(location.isNonProducing).toBeFalsy();
                } else {
                  expect(location.isNonOrganic).toBeFalsy();
                  expect(location.isNonProducing).toBeTruthy();
                }
              }
            }
            done();
          });
        });
      }
    });
  });

  // describe('Patch organic certifier survey', () => {
  //   let fakeOrganicCertifierSurvey;
  //   let organicCertifierSurvey;

  describe('Put organic certifier survey', () => {
    let fakeOrganicCertifierSurvey;

    beforeEach(async () => {
      [fakeOrganicCertifierSurvey] = await mocks.organicCertifierSurveyFactory({
        promisedUserFarm: [ownerFarm],
      });
      fakeOrganicCertifierSurvey = {
        ...fakeOrganicCertifierSurvey,
        ...getFakeOrganicCertifierSurvey(),
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
        const [workerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [worker],
            promisedFarm: [farm],
          },
          fakeUserFarm(3),
        );
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [manager],
            promisedFarm: [farm],
          },
          fakeUserFarm(2),
        );
        [extensionOfficer] = await mocks.userFarmFactory();
        const [extensionOfficerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [extensionOfficer],
            promisedFarm: [farm],
          },
          fakeUserFarm(5),
        );

        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
          {
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser],
          },
          fakeUserFarm(1),
        );
      });

      test('Owner put certifiers', async (done) => {
        putRequest(fakeOrganicCertifierSurvey, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const organicCertifierSurveys = await organicCertifierSurveyModel
            .query()
            .context({ showHidden: true })
            .where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].created_by_user_id).toBe(owner.user_id);
          expect(organicCertifierSurveys[0].certifiers).toEqual(
            fakeOrganicCertifierSurvey.certifiers,
          );
          done();
        });
      });

      test('Manager put certifiers', async (done) => {
        putRequest(fakeOrganicCertifierSurvey, { user_id: manager.user_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const organicCertifierSurveys = await organicCertifierSurveyModel
            .query()
            .context({ showHidden: true })
            .where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].certifiers).toEqual(
            fakeOrganicCertifierSurvey.certifiers,
          );
          done();
        });
      });

      test('Extension officer put certifiers', async (done) => {
        putRequest(
          fakeOrganicCertifierSurvey,
          { user_id: extensionOfficer.user_id },
          async (err, res) => {
            expect(res.status).toBe(200);
            const organicCertifierSurveys = await organicCertifierSurveyModel
              .query()
              .context({ showHidden: true })
              .where('farm_id', farm.farm_id);
            expect(organicCertifierSurveys.length).toBe(1);
            expect(organicCertifierSurveys[0].certifiers).toEqual(
              fakeOrganicCertifierSurvey.certifiers,
            );
            done();
          },
        );
      });

      test('should return 403 status if organicCertifierSurvey is puted by worker', async (done) => {
        putRequest(fakeOrganicCertifierSurvey, { user_id: worker.user_id }, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe(
            'User does not have the following permission(s): edit:organic_certifier_survey',
          );
          done();
        });
      });

      test('should return 403 status if organicCertifierSurvey is puted by unauthorized user', async (done) => {
        putRequest(
          fakeOrganicCertifierSurvey,
          { user_id: unAuthorizedUser.user_id },
          async (err, res) => {
            expect(res.status).toBe(403);
            expect(res.error.text).toBe(
              'User does not have the following permission(s): edit:organic_certifier_survey',
            );
            done();
          },
        );
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        putRequest(
          fakeOrganicCertifierSurvey,
          {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          },
          async (err, res) => {
            expect(res.status).toBe(403);
            done();
          },
        );
      });
    });
  });
});
