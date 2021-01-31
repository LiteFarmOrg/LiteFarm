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
const { tableCleanup } = require('./testEnvironment')
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks = require('./mock.factories');


const organicCertifierSurveyModel = require('../src/models/organicCertifierSurveyModel');

describe('organicCertifierSurvey Tests', () => {
  let middleware;
  let owner;
  let farm;
  let ownerFarm;

  beforeAll(() => {
    token = global.token;
  });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  })

  function postRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).post(`/organic_certifier_survey`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getRequest({ user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).get(`/farm/${farm_id}/organic_certifier_survey`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function patchCertifierRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id, survey_id }, callback) {
    chai.request(server).patch(`/organic_certifier_survey/${survey_id}/certifiers`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function patchInterestedRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id, survey_id }, callback) {
    chai.request(server).patch(`/organic_certifier_survey/${survey_id}/interested`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function deleteRequest({user_id = owner.user_id, farm_id = farm.farm_id, survey_id}, callback) {
    chai.request(server).delete(`/organic_certifier_survey/${survey_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }
  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  function getFakeOrganicCertifierSurvey(farm_id = farm.farm_id) {
    const organicCertifierSurvey = mocks.fakeOrganicCertifierSurvey();
    return ({ certifiers: organicCertifierSurvey.certifiers, farm_id });
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [ownerFarm] = await mocks.userFarmFactory({ promisedUser: [owner], promisedFarm: [farm] }, fakeUserFarm(1));

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

  describe('Get organic certifier survey', () => {
    let organicCertifierSurvey;
    beforeEach(async () => {
      [organicCertifierSurvey] = await mocks.organicCertifierSurveyFactory({ promisedUserFarm: [ownerFarm] });
    })

    describe('Get organicCertifierSurvey authorization tests', () => {
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
      })

      test('Owner should get organic certifier survey  by farm id', async (done) => {
        getRequest({ user_id: owner.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.survey_id).toBe(organicCertifierSurvey.survey_id);
          done();
        });
      })

      test('Manager should get organic certifier survey  by farm id', async (done) => {
        getRequest({ user_id: manager.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.survey_id).toBe(organicCertifierSurvey.survey_id);
          done();
        });
      })

      test('Extension officer should get organic certifier survey  by farm id', async (done) => {
        getRequest({ user_id: extensionOfficer.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.survey_id).toBe(organicCertifierSurvey.survey_id);
          done();
        });
      })

      test('Should get status 403 if an worker tries to get organic certifier survey  by farm id', async (done) => {
        getRequest({ user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      })

      test('Should get status 403 if an unauthorizedUser tries to get organic certifier survey  by farm id', async (done) => {
        getRequest({ user_id: unAuthorizedUser.user_id }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      })


    })

  })

  describe('Delete certifier survey', function () {
    let organicCertifierSurvey;
    beforeEach(async () => {
      [organicCertifierSurvey] = await mocks.organicCertifierSurveyFactory({ promisedUserFarm: [ownerFarm] });
    })

    describe('Delete certifier survey authorization tests',()=>{
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
      })

      test('Owner should delete a certifier survey', async (done) => {
        deleteRequest({survey_id: organicCertifierSurvey.survey_id}, async (err, res) => {
          expect(res.status).toBe(200);
          const SurveyRes = await organicCertifierSurveyModel.query().context({showHidden: true}).where('survey_id',organicCertifierSurvey.survey_id);
          expect(SurveyRes.length).toBe(1);
          expect(SurveyRes[0].deleted).toBe(true);
          done();
        })
      });

      test('Manager should delete a certifier survey', async (done) => {
        deleteRequest({user_id:manager.user_id, survey_id: organicCertifierSurvey.survey_id}, async (err, res) => {
          expect(res.status).toBe(200);
          const SurveyRes = await organicCertifierSurveyModel.query().context({showHidden: true}).where('survey_id',organicCertifierSurvey.survey_id);
          expect(SurveyRes.length).toBe(1);
          expect(SurveyRes[0].deleted).toBe(true);
          done();
        })
      });

      test('should return 403 if an unauthorized user tries to delete a certifier survey', async (done) => {
        deleteRequest({user_id:unAuthorizedUser.user_id, survey_id: organicCertifierSurvey.survey_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      });

      test('should return 403 if a worker tries to delete a certifier survey', async (done) => {
        deleteRequest({user_id: worker.user_id, survey_id: organicCertifierSurvey.survey_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      });

      test('Circumvent authorization by modifying farm_id', async (done) => {
        deleteRequest({user_id:unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id, survey_id: organicCertifierSurvey.survey_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      });


    })


  })

  describe('Post organic certifier survey', () => {
    let fakeOrganicCertifierSurvey;

    beforeEach(async () => {
      fakeOrganicCertifierSurvey = getFakeOrganicCertifierSurvey();
    })

    test('should return 403 status if headers.farm_id is set to null', async (done) => {
      fakeOrganicCertifierSurvey.farm_id = null;
      postRequest(fakeOrganicCertifierSurvey, {}, (err, res) => {
        expect(res.status).toBe(403);
        done()
      })
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
      })

      test('Owner post certifiers', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, {}, async (err, res) => {
          expect(res.status).toBe(201);
          const organicCertifierSurveys = await organicCertifierSurveyModel.query().context({showHidden: true}).where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].created_by_user_id).toBe(owner.user_id);
          expect(organicCertifierSurveys[0].certifiers).toEqual(fakeOrganicCertifierSurvey.certifiers);
          done();
        })
      });

      test('Manager post certifiers', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, { user_id: manager.user_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const organicCertifierSurveys = await organicCertifierSurveyModel.query().context({showHidden: true}).where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].created_by_user_id).toBe(manager.user_id);
          expect(organicCertifierSurveys[0].certifiers).toEqual(fakeOrganicCertifierSurvey.certifiers);
          done();
        })
      });

      test('Extension officer post certifiers', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, { user_id: extensionOfficer.user_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const organicCertifierSurveys = await organicCertifierSurveyModel.query().context({showHidden: true}).where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].created_by_user_id).toBe(extensionOfficer.user_id);
          expect(organicCertifierSurveys[0].certifiers).toEqual(fakeOrganicCertifierSurvey.certifiers);
          done();
        })
      });

      test('should return 403 status if organicCertifierSurvey is posted by worker', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, { user_id: worker.user_id }, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe('User does not have the following permission(s): add:organic_certifier_survey');
          done()
        })
      });

      test('should return 403 status if organicCertifierSurvey is posted by unauthorized user', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, { user_id: unAuthorizedUser.user_id }, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe('User does not have the following permission(s): add:organic_certifier_survey');
          done()
        })
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        postRequest(fakeOrganicCertifierSurvey, {
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id,
        }, async (err, res) => {
          expect(res.status).toBe(403);
          done()
        })
      });

    })


  });

  describe('Patch organic certifier survey', () => {
    let fakeOrganicCertifierSurvey;
    let organicCertifierSurvey;

    beforeEach(async () => {
      fakeOrganicCertifierSurvey = getFakeOrganicCertifierSurvey();
      [organicCertifierSurvey] = await mocks.organicCertifierSurveyFactory({ promisedUserFarm: [ownerFarm] }, {
        ...mocks.fakeOrganicCertifierSurvey(),
        interested: true,
      });

    })

    test('Owner should patch interested', async (done) => {
      patchInterestedRequest({ interested: false }, { survey_id: organicCertifierSurvey.survey_id }, async (err, res) => {
        expect(res.status).toBe(200);
        const organicCertifierSurveys = await organicCertifierSurveyModel.query().context({showHidden: true}).where('farm_id', farm.farm_id);
        expect(organicCertifierSurveys.length).toBe(1);
        expect(organicCertifierSurveys[0].created_by_user_id).toBe(owner.user_id);
        expect(organicCertifierSurveys[0].interested).toBe(false);
        done();
      })
    });

    describe('Patch organicCertifierSurvey authorization tests', () => {

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
      })

      test('Owner should patch certifiers', async (done) => {
        patchCertifierRequest(fakeOrganicCertifierSurvey, { survey_id: organicCertifierSurvey.survey_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const organicCertifierSurveys = await organicCertifierSurveyModel.query().context({showHidden: true}).where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].created_by_user_id).toBe(owner.user_id);
          expect(organicCertifierSurveys[0].certifiers).toEqual(fakeOrganicCertifierSurvey.certifiers);
          done();
        })
      });

      test('Manager should patch certifiers', async (done) => {
        patchCertifierRequest(fakeOrganicCertifierSurvey, {
          user_id: manager.user_id,
          survey_id: organicCertifierSurvey.survey_id,
        }, async (err, res) => {
          expect(res.status).toBe(200);
          const organicCertifierSurveys = await organicCertifierSurveyModel.query().context({showHidden: true}).where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].created_by_user_id).toBe(owner.user_id);
          expect(organicCertifierSurveys[0].updated_by_user_id).toBe(manager.user_id);
          expect(organicCertifierSurveys[0].certifiers).toEqual(fakeOrganicCertifierSurvey.certifiers);
          done();
        })
      });

      test('Extension should officer patch certifiers', async (done) => {
        patchCertifierRequest(fakeOrganicCertifierSurvey, {
          user_id: extensionOfficer.user_id,
          survey_id: organicCertifierSurvey.survey_id,
        }, async (err, res) => {
          expect(res.status).toBe(200);
          const organicCertifierSurveys = await organicCertifierSurveyModel.query().context({showHidden: true}).where('farm_id', farm.farm_id);
          expect(organicCertifierSurveys.length).toBe(1);
          expect(organicCertifierSurveys[0].created_by_user_id).toBe(owner.user_id);
          expect(organicCertifierSurveys[0].updated_by_user_id).toBe(extensionOfficer.user_id);
          expect(organicCertifierSurveys[0].certifiers).toEqual(fakeOrganicCertifierSurvey.certifiers);
          done();
        })
      });

      test('should return 403 status if organicCertifierSurvey is posted by worker', async (done) => {
        patchCertifierRequest(fakeOrganicCertifierSurvey, {
          user_id: worker.user_id,
          survey_id: organicCertifierSurvey.survey_id,
        }, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe('User does not have the following permission(s): edit:organic_certifier_survey');
          done()
        })
      });

      test('should return 403 status if organicCertifierSurvey is posted by unauthorized user', async (done) => {
        patchCertifierRequest(fakeOrganicCertifierSurvey, {
          user_id: unAuthorizedUser.user_id,
          survey_id: organicCertifierSurvey.survey_id,
        }, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe('User does not have the following permission(s): edit:organic_certifier_survey');
          done()
        })
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        patchCertifierRequest(fakeOrganicCertifierSurvey, {
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id,
          survey_id: organicCertifierSurvey.survey_id,
        }, async (err, res) => {
          expect(res.status).toBe(403);
          done()
        })
      });

    })


  });

});
