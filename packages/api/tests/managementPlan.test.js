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
chai.use(chaiHttp);
const server = require('./../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment');
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
const mocks = require('./mock.factories');
const faker = require('faker');
const lodash = require('lodash');


const managementPlanModel = require('../src/models/managementPlanModel');
const locationModel = require('../src/models/locationModel');
const cropManagementPlanModel = require('../src/models/cropManagementPlanModel');


describe('ManagementPlan Tests', () => {
  let middleware;
  let owner;
  let field;
  let farm;
  let farmunAuthorizedUser;

  beforeAll(() => {
    token = global.token;
  });

  beforeAll(async () => {
    await mocks.populateTaskTypes();
  });


  function postManagementPlanRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).post(`/management_plan`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function getRequest(url, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function patchManagementPlanRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    const { management_plan_id } = data;
    chai.request(server).patch(`/management_plan/${management_plan_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback);
  }

  function deleteRequest(url, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).delete(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function completeManagementPlanRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    const { management_plan_id } = data;
    chai.request(server).patch(`/management_plan/${management_plan_id}/complete`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback);
  }

  function abandonManagementPlanRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    const { management_plan_id } = data;
    chai.request(server).patch(`/management_plan/${management_plan_id}/abandon`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback);
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({
      promisedUser: [owner],
      promisedFarm: [farm],
    }, fakeUserFarm(1));
    const [location] = await mocks.locationFactory({ promisedFarm: [farm] });
    await mocks.fieldFactory({
      promisedLocation: [location],
    });
    field = await locationModel.query().context({ showHidden: true }).whereNotDeleted().findById(location.location_id)
      .withGraphFetched(`[
          figure.[area], field]`);

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

  describe('Get && delete && put managementPlan', () => {
    let transplantManagementPlan;
    let seedManagementPlan;
    let worker;
    let workerFarm;
    let crop;
    let cropVariety;
    let unAuthorizedUser;
    beforeEach(async () => {
      [crop] = await mocks.cropFactory({ promisedFarm: [farm] }, {
        ...mocks.fakeCrop(),
        crop_common_name: 'crop',
        user_added: true,
      });
      [cropVariety] = await mocks.crop_varietyFactory({ promisedFarm: [farm], promisedCrop: [crop] });
      [transplantManagementPlan] = await mocks.crop_management_planFactory({
        promisedField: [field],
        promisedCropVariety: [cropVariety],
      }, {
        cropManagementPlan: {
          ...mocks.fakeCropManagementPlan(),
          needs_transplant: true,
        },
      });
      [seedManagementPlan] = await mocks.crop_management_planFactory({
        promisedField: [field],
        promisedCropVariety: [cropVariety],
      }, {
        cropManagementPlan: {
          ...mocks.fakeCropManagementPlan(),
          needs_transplant: false,
        },
      });

      [worker] = await mocks.usersFactory();
      [workerFarm] = await mocks.userFarmFactory({ promisedUser: [worker], promisedFarm: [farm] }, fakeUserFarm(3));

      [unAuthorizedUser] = await mocks.usersFactory();
      [farmunAuthorizedUser] = await mocks.farmFactory();
      const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
        promisedUser: [unAuthorizedUser],
        promisedFarm: [farmunAuthorizedUser],
      }, fakeUserFarm(1));

    });


    describe('Get managementPlan', () => {
      const assetManagementPlans = (res, count) => {
        for (const management_plan of res.body) {
          expect(res.body.length).toBe(count);
          expect(['BROADCAST_METHOD', 'CONTAINER_METHOD', 'BED_METHOD', 'ROW_METHOD']).toContain(management_plan.crop_management_plan.planting_management_plans[0].planting_method);
          if (management_plan.crop_management_plan.planting_method === 'BROADCAST_METHOD') {
            expect(management_plan.crop_management_plan.planting_management_plans[0].management_plan_id).toBe(seedManagementPlan.management_plan_id);
            expect(management_plan.crop_management_plan.planting_management_plans[1]).toBeUndefined();
          } else if (management_plan.crop_management_plan.planting_type === 'CONTAINER_METHOD') {
            expect(management_plan.crop_management_plan.planting_management_plans[0].management_plan_id).toBe(seedManagementPlan.management_plan_id);
            expect(management_plan.crop_management_plan.planting_management_plans[1]?.management_plan_id).toBe(seedManagementPlan.management_plan_id);
          }
        }
      };
      test('Workers should get managementPlan by farm id', async (done) => {
        getRequest(`/management_plan/farm/${farm.farm_id}`, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          assetManagementPlans(res, 2);
          done();
        });
      });

      test('Workers should get managementPlan by date', async (done) => {
        getRequest(`/management_plan/farm/date/${farm.farm_id}/${moment().format('YYYY-MM-DD')}`, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          assetManagementPlans(res, 2);
          done();
        });
      });

      test('Workers should get managementPlan by id', async (done) => {
        getRequest(`/management_plan/${transplantManagementPlan.management_plan_id}`, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.crop_management_plan.planting_management_plans[1].management_plan_id).toBe(transplantManagementPlan.management_plan_id);
          done();
        });
      });

      describe('Get managementPlan authorization tests', () => {
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

        test('Owner should get managementPlan by farm id', async (done) => {
          getRequest(`/management_plan/farm/${farm.farm_id}`, { user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            assetManagementPlans(res, 2);
            done();
          });
        });

        test('Manager should get managementPlan by farm id', async (done) => {
          getRequest(`/management_plan/farm/${farm.farm_id}`, { user_id: manager.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            assetManagementPlans(res, 2);
            done();
          });
        });

        test('Should get status 403 if an unauthorizedUser tries to get managementPlan by farm id', async (done) => {
          getRequest(`/management_plan/farm/${farm.farm_id}`, { user_id: unAuthorizedUser.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          getRequest(`/management_plan/farm/${farm.farm_id}`, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });


      });
    });


    describe('Delete managementPlan', function() {

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
        [extensionOfficer] = await mocks.usersFactory();
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

      test('should delete a managementPlan by owner', async (done) => {
        deleteRequest(`/management_plan/${transplantManagementPlan.management_plan_id}`, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const managementPlanRes = await managementPlanModel.query().context({ showHidden: true }).where('management_plan_id', transplantManagementPlan.management_plan_id);
          expect(managementPlanRes.length).toBe(1);
          expect(managementPlanRes[0].deleted).toBe(true);
          done();
        });
      });

      test('should delete a managementPlan by manager', async (done) => {
        deleteRequest(`/management_plan/${transplantManagementPlan.management_plan_id}`, { user_id: manager.user_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const managementPlanRes = await managementPlanModel.query().context({ showHidden: true }).where('management_plan_id', transplantManagementPlan.management_plan_id);
          expect(managementPlanRes.length).toBe(1);
          expect(managementPlanRes[0].deleted).toBe(true);
          done();
        });
      });

      test('should delete a managementPlan by extension officer', async (done) => {
        deleteRequest(`/management_plan/${transplantManagementPlan.management_plan_id}`, { user_id: extensionOfficer.user_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const managementPlanRes = await managementPlanModel.query().context({ showHidden: true }).where('management_plan_id', transplantManagementPlan.management_plan_id);
          expect(managementPlanRes.length).toBe(1);
          expect(managementPlanRes[0].deleted).toBe(true);
          done();
        });
      });

      test('should return 403 if an unauthorized user tries to delete a managementPlan', async (done) => {
        deleteRequest(`/management_plan/${transplantManagementPlan.management_plan_id}`, { user_id: unAuthorizedUser.user_id }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('should return 403 if a worker tries to delete a managementPlan', async (done) => {
        deleteRequest(`/management_plan/${transplantManagementPlan.management_plan_id}`, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });

      test('Circumvent authorization by modifying farm_id', async (done) => {
        deleteRequest(`/management_plan/${transplantManagementPlan.management_plan_id}`, {
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id,
        }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        });
      });
    });

    describe('patch managementPlan', () => {
      function getFakeManagementPlan() {
        return {
          name: faker.lorem.words(),
          notes: faker.lorem.words(),
          crop_management_plan: { estimated_yield: faker.random.number(10000), harvest_date: 'shouldBeDiscarded' },
          management_plan_id: transplantManagementPlan.management_plan_id,
        };
      }

      async function expectManagementPlanPatched(res, expected) {
        expect(res.status).toBe(200);
        const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).findById(expected.management_plan_id).first();
        expect(newManagementPlan.name).toBe(expected.name);
        const newCropManagementPlan = await cropManagementPlanModel.query().context({ showHidden: true }).findById(expected.management_plan_id).first();
        expect(newCropManagementPlan.estimated_yield).toBe(expected.crop_management_plan.estimated_yield);
      }

      xtest('should be able to edit management plan', async (done) => {
        const reqBody = getFakeManagementPlan();
        patchManagementPlanRequest(reqBody, {}, async (err, res) => {
          await expectManagementPlanPatched(res, reqBody);
          done();
        });
      });

      describe('patch managementPlan authorization tests', () => {
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
        //TODO: Owner test
        test('should edit and the area_used field by manager', async (done) => {
          const reqBody = getFakeManagementPlan();
          patchManagementPlanRequest(reqBody, { user_id: manager.user_id }, async (err, res) => {
            await expectManagementPlanPatched(res, reqBody);
            done();
          });
        });

        test('should return 403 when unauthorized user tries to edit managementPlan', async (done) => {
          const reqBody = getFakeManagementPlan();
          patchManagementPlanRequest(reqBody, { user_id: unAuthorizedUser.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('should return 403 when a worker tries to edit managementPlan', async (done) => {
          const reqBody = getFakeManagementPlan();
          patchManagementPlanRequest(reqBody, { user_id: worker.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          const reqBody = getFakeManagementPlan();
          patchManagementPlanRequest(reqBody, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

      });
    });


    describe('Complete/abandon management plan', () => {
      function getCompleteReqBody(isAbandonReq, props = {}) {
        return {
          [isAbandonReq ? 'abandon_date' : 'complete_date']: '2021-01-01',
          complete_notes: faker.lorem.words(),
          rating: faker.random.arrayElement([1, 2, 3, 4, 5, 0, null, undefined]),
          abandon_reason: isAbandonReq ? faker.lorem.words() : undefined,
          management_plan_id: transplantManagementPlan.management_plan_id,
          ...props,
        };
      }

      async function getFinalPlantingManagementPlan(cropManagementPlan) {
        return knex('planting_management_plan').where({
          is_final_planting_management_plan: true,
          management_plan_id: cropManagementPlan.management_plan_id,
        });
      }

      test('Abandon management plan', async (done) => {
        const reqBody = getCompleteReqBody(true);
        abandonManagementPlanRequest(reqBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('management_plan_id', transplantManagementPlan.management_plan_id).first();
          expect(newManagementPlan.complete_notes).toBe(reqBody.complete_notes);
          expect(newManagementPlan.abandon_reason).toBe(reqBody.abandon_reason);
          done();
        });
      });

      test('Complete management plan', async (done) => {
        const reqBody = getCompleteReqBody();
        completeManagementPlanRequest(reqBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('management_plan_id', transplantManagementPlan.management_plan_id).first();
          expect(newManagementPlan.complete_notes).toBe(reqBody.complete_notes);
          done();
        });
      });

      test('Complete management plan with completed and abandoned tasks', async (done) => {
        const reqBody = getCompleteReqBody();
        const abandonedTask = await mocks.management_tasksFactory({
          promisedManagementPlan: [transplantManagementPlan],
          promisedTask: mocks.taskFactory({ promisedUser: [owner] }, { ...mocks.fakeTask({ abandoned_time: faker.date.past() }) }),
        });
        const completedTask = await mocks.management_tasksFactory({
          promisedManagementPlan: [transplantManagementPlan],
          promisedTask: mocks.taskFactory({ promisedUser: [owner] }, { ...mocks.fakeTask({ abandoned_time: faker.date.past() }) }),
        });

        completeManagementPlanRequest(reqBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('management_plan_id', transplantManagementPlan.management_plan_id).first();
          expect(newManagementPlan.complete_notes).toBe(reqBody.complete_notes);
          done();
        });
      });
      const getDateInputFormat = (date) => moment(date).utc().format('YYYY-MM-DD');


      test('Abandon management plan with one pending task that reference this management plan and another management_plan', async (done) => {
        const reqBody = getCompleteReqBody();
        const [plantingManagementPlan] = await getFinalPlantingManagementPlan(transplantManagementPlan);
        const [managementTaskToBeDeleted] = await mocks.management_tasksFactory({
          promisedPlantingManagementPlan: [plantingManagementPlan],
          promisedTask: mocks.taskFactory({ promisedUser: [owner] }, { ...mocks.fakeTask() }),
        });

        const [managementTaskToKeep] = await mocks.management_tasksFactory({
          promisedPlantingManagementPlan: mocks.planting_management_planFactory({ promisedFarm: [farm] }),
          promisedTask: [managementTaskToBeDeleted],
        });

        const [anotherManagementTask] = await mocks.management_tasksFactory({
          promisedPlantingManagementPlan: mocks.planting_management_planFactory({ promisedFarm: [farm] }),
        });

        abandonManagementPlanRequest(reqBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('management_plan_id', transplantManagementPlan.management_plan_id).first();
          expect(newManagementPlan.complete_notes).toBe(reqBody.complete_notes);
          const deletedManagementPlan = await knex('management_tasks').where(lodash.pick(managementTaskToBeDeleted, ['planting_management_plan_id', 'task_id'])).first();
          expect(deletedManagementPlan).toBeUndefined();
          const keptManagementTask0 = await knex('management_tasks').where(lodash.pick(managementTaskToKeep, ['planting_management_plan_id', 'task_id'])).first();
          expect(keptManagementTask0).toBeDefined();
          const keptManagementTask1 = await knex('management_tasks').where(lodash.pick(anotherManagementTask, ['planting_management_plan_id', 'task_id'])).first();
          expect(keptManagementTask1).toBeDefined();
          done();
        });
      });

      test('Abandon management plan with two pending task that reference this management plan and another management_plan', async (done) => {
        const reqBody = getCompleteReqBody(true);
        const [plantingManagementPlan] = await getFinalPlantingManagementPlan(transplantManagementPlan);
        const [managementTaskToBeDeleted] = await mocks.management_tasksFactory({
          promisedPlantingManagementPlan: [plantingManagementPlan],
          promisedTask: mocks.taskFactory({ promisedUser: [owner] }, { ...mocks.fakeTask() }),
        });

        const [managementTaskToKeep] = await mocks.management_tasksFactory({
          promisedManagementPlan: mocks.crop_management_planFactory({ promisedFarm: [farm] }),
          promisedTask: [managementTaskToBeDeleted],
        });

        const [taskToAbandon] = await mocks.management_tasksFactory({
          promisedPlantingManagementPlan: [plantingManagementPlan],
          promisedTask: mocks.taskFactory({ promisedUser: [owner] }, { ...mocks.fakeTask() }),
        });

        const [anotherManagementTask] = await mocks.management_tasksFactory({
          promisedManagementPlan: mocks.crop_management_planFactory({ promisedFarm: [farm] }),
        });

        abandonManagementPlanRequest(reqBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('management_plan_id', transplantManagementPlan.management_plan_id).first();
          expect(newManagementPlan.complete_notes).toBe(reqBody.complete_notes);
          const deletedManagementPlan = await knex('management_tasks').where(lodash.pick(managementTaskToBeDeleted, ['planting_management_plan_id', 'task_id'])).first();
          expect(deletedManagementPlan).toBeUndefined();
          const keptManagementTask0 = await knex('management_tasks').where(lodash.pick(managementTaskToKeep, ['planting_management_plan_id', 'task_id'])).first();
          expect(keptManagementTask0).toBeDefined();
          const keptManagementTask1 = await knex('management_tasks').where(lodash.pick(anotherManagementTask, ['planting_management_plan_id', 'task_id'])).first();
          expect(keptManagementTask1).toBeDefined();
          const keptManagementTask2 = await knex('management_tasks').where(lodash.pick(taskToAbandon, ['planting_management_plan_id', 'task_id'])).first();
          expect(keptManagementTask2).toBeDefined();
          const abandonedTask = await knex('task').where(lodash.pick(taskToAbandon, ['task_id'])).first();
          expect(getDateInputFormat(abandonedTask.abandoned_time)).toBe(reqBody.abandon_date);
          done();
        });
      });

      test('Abandon management plan with one pending task that reference this management plan and no location', async (done) => {
        const reqBody = getCompleteReqBody(true);
        const [plantingManagementPlan] = await getFinalPlantingManagementPlan(transplantManagementPlan);
        const [task] = await mocks.management_tasksFactory({
          promisedPlantingManagementPlan: [plantingManagementPlan],
          promisedTask: mocks.taskFactory({ promisedUser: [owner] }, { ...mocks.fakeTask() }),
        });
        abandonManagementPlanRequest(reqBody, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('management_plan_id', transplantManagementPlan.management_plan_id).first();
          expect(newManagementPlan.complete_notes).toBe(reqBody.complete_notes);
          const newTask = await knex('task').where('task_id', task.task_id).first();
          expect(getDateInputFormat(newTask.abandoned_time)).toBe(reqBody.abandon_date);
          // expect(newTask.abandon_reason).toBe('Crop management plan abandoned');
          done();
        });
      });

      test('Should return 400 when complete management plan with pending tasks', async (done) => {
        const reqBody = getCompleteReqBody();
        const [plantingManagementPlan] = await getFinalPlantingManagementPlan(transplantManagementPlan);
        const pendingTask = await mocks.management_tasksFactory({
          promisedPlantingManagementPlan: [plantingManagementPlan],
        });

        completeManagementPlanRequest(reqBody, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });


    });

  });

  describe('POST management plan', () => {
    let userFarm;
    let field;
    let crop;
    let cropVariety;

    const fakeMethodMap = {
      broadcast_method: mocks.fakeBroadcastMethod,
      container_method: mocks.fakeContainerMethod,
      row_method: mocks.fakeRowMethod,
      bed_method: mocks.fakeBedMethod,
    };

    beforeEach(async () => {
      [userFarm] = await mocks.userFarmFactory({}, { role_id: 1, status: 'Active' });
      [field] = await mocks.fieldFactory({ promisedFarm: [userFarm] });
      [crop] = await mocks.cropFactory({ promisedFarm: [userFarm] });
      [cropVariety] = await mocks.crop_varietyFactory({ promisedFarm: [userFarm], promisedCrop: [crop] });
    });

    function getBody(finalMethod = 'broadcast_method', initialMethod, { already_in_ground = false } = {}) {
      return {
        crop_variety_id: cropVariety.crop_variety_id,
        ...mocks.fakeManagementPlan(),
        crop_management_plan: {
          ...mocks.fakeCropManagementPlan(),
          needs_transplant: !!initialMethod,
          already_in_ground,
          planting_management_plans: [finalMethod, initialMethod].reduce((planting_methods, method, index) => {
            return method ? [...planting_methods, {
              ...mocks.fakePlantingManagementPlan(),
              location_id: field.location_id,
              is_final_planting_management_plan: index === 0,
              planting_task_type: initialMethod && index === 1 ? 'TRANSPLANT_TASK' : 'PLANT_TASK',
              planting_method: method.toUpperCase(),
              [method]: fakeMethodMap[method](),
            }] : planting_methods;
          }, []),
        },
      };
    }

    async function expectPlantingMethodPosted(res, final_planting_method, initial_planting_method) {
      expect(res.status).toBe(201);
      const { management_plan_id } = res.body.management_plan;
      const { already_in_ground, for_cover, needs_transplant } = res.body.management_plan.crop_management_plan;
      if (!already_in_ground) {
        const { planting_management_plan_id } = await knex('planting_management_plan').where({
          management_plan_id: res.body.management_plan.management_plan_id,
          planting_task_type: 'PLANT_TASK',
        }).first();
        const plantingMethod = await knex(final_planting_method).where({ planting_management_plan_id }).first();
        expect(plantingMethod).toBeDefined();

        const plant_task = await knex('plant_task').where({ planting_management_plan_id }).first();
        expect(plant_task).toBeDefined();
      }
      if (initial_planting_method) {
        const { planting_management_plan_id } = await knex('planting_management_plan').where({
          management_plan_id: res.body.management_plan.management_plan_id,
          planting_task_type: 'TRANSPLANT_TASK',
        }).first();
        const plantingMethod = await knex(initial_planting_method).where({ planting_management_plan_id }).first();
        expect(plantingMethod).toBeDefined();

        const transplant_task = await knex('transplant_task').where({ planting_management_plan_id }).first();
        expect(transplant_task).toBeDefined();
      }

      const { planting_management_plan_id } = await knex('planting_management_plan').where({
        management_plan_id: res.body.management_plan.management_plan_id,
        planting_task_type: needs_transplant ? 'TRANSPLANT_TASK' : 'PLANT_TASK',
      }).first();
      if (for_cover) {
        const fieldWorkTask = await knex('management_tasks').join('field_work_task', 'field_work_task.task_id', 'management_tasks.task_id').where({ planting_management_plan_id }).first();
        expect(fieldWorkTask).toBeDefined();
      } else {
        const harvestTask = await knex('management_tasks').join('harvest_task', 'harvest_task.task_id', 'management_tasks.task_id').where({ planting_management_plan_id }).first();
        expect(harvestTask).toBeDefined();
      }
    }

    test('should create a broadcast management plan with required data', async (done) => {
      postManagementPlanRequest(getBody('broadcast_method'), userFarm, async (err, res) => {
        await expectPlantingMethodPosted(res, 'broadcast_method');
        done();
      });
    });

    test('should create a broadcast management plan with 100% planted', async (done) => {
      const broadcastData = getBody('broadcast_method');
      const { total_area } = await knex('location').join('figure', 'figure.location_id', 'location.location_id').join('area', 'figure.figure_id', 'area.figure_id').where('location.location_id', field.location_id).first();
      broadcastData.crop_management_plan.planting_management_plans[0].broadcast_method.percentage_planted = 100;
      broadcastData.crop_management_plan.planting_management_plans[0].broadcast_method.area_used = total_area;
      postManagementPlanRequest(broadcastData, userFarm, async (err, res) => {
        await expectPlantingMethodPosted(res, 'broadcast_method');
        done();
      });
    });

    test('should create a broadcast management plan with transplant', async (done) => {
      postManagementPlanRequest(getBody('broadcast_method', 'container_method'), userFarm, async (err, res) => {
        await expectPlantingMethodPosted(res, 'broadcast_method', 'container_method');
        done();
      });
    });

    test('should create a container management plan with required data', async (done) => {
      postManagementPlanRequest(getBody('container_method'), userFarm, async (err, res) => {
        await expectPlantingMethodPosted(res, 'container_method');
        done();
      });
    });

    test('should create a container management plan with transplant', async (done) => {
      postManagementPlanRequest(getBody('container_method', 'container_method'), userFarm, async (err, res) => {
        await expectPlantingMethodPosted(res, 'container_method', 'container_method');
        done();
      });
    });

    test('should create a rows management plan', async (done) => {
      postManagementPlanRequest(getBody('row_method'), userFarm, async (err, res) => {
        await expectPlantingMethodPosted(res, 'row_method');
        done();
      });
    });

    //TODO: post management plan middle ware that checks there are maximum 1 plant_task and 1 transplant_task
    xtest('should not allow multiple types of plantation', async (done) => {
      const managementPlantWith4plantingManagementPlan = getBody('broadcast_method', 'container_method');
      managementPlantWith4plantingManagementPlan.crop_management_plan.planting_management_plans = [...managementPlantWith4plantingManagementPlan.crop_management_plan.planting_management_plans, ...managementPlantWith4plantingManagementPlan.crop_management_plan.planting_management_plans];
      postManagementPlanRequest(managementPlantWith4plantingManagementPlan, userFarm, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

  });


});
