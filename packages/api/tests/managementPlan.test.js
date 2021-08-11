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

const managementPlanModel = require('../src/models/managementPlanModel');
const locationModel = require('../src/models/locationModel');
describe('ManagementPlan Tests', () => {
  let middleware;
  let owner;
  let field;
  let farm;
  let farmunAuthorizedUser;

  beforeAll(() => {
    token = global.token;
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

  function putManagementPlanRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    const { management_plan_id } = data;
    chai.request(server).put(`/management_plan/${management_plan_id}`)
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
        deleteRequest(`/management_plan/${transplantManagementPlan.management_plan_id}`, {}, async (err, res) => {
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

    xdescribe('Put managementPlan', () => {
      test('should be able to edit the area_used field', async (done) => {
        transplantManagementPlan.area_used = field.figure.area.total_area * 0.1;
        putManagementPlanRequest(transplantManagementPlan, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('crop_variety_id', cropVariety.crop_variety_id).first();
          expect(Math.floor(newManagementPlan.area_used)).toBe(Math.floor(transplantManagementPlan.area_used));
          done();
        });
      });

      test('should return status 400 and if area_used is bigger than the field', async (done) => {
        transplantManagementPlan.area_used = field.figure.area.total_area + 1;
        putManagementPlanRequest(transplantManagementPlan, {}, async (err, res) => {
          expect(res.status).toBe(400);
          expect(res.error.text).toBe('Area needed is greater than the field\'s area');
          done();
        });
      });

      test('should be able to change location_id asset type is greenhouse', async (done) => {
        const [greenhouse] = await mocks.greenhouseFactory({ promisedLocation: mocks.locationFactory({ promisedFarm: [farm] }) });
        transplantManagementPlan.location_id = greenhouse.location_id;
        transplantManagementPlan.area_used = 0;
        putManagementPlanRequest(transplantManagementPlan, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('crop_variety_id', cropVariety.crop_variety_id).first();
          expect(Math.floor(newManagementPlan.area_used)).toBe(Math.floor(transplantManagementPlan.area_used));
          done();
        });
      });

      test('should be able to change location_id asset type is bufferzone', async (done) => {
        const [bufferZone] = await mocks.buffer_zoneFactory({ promisedLocation: mocks.locationFactory({ promisedFarm: [farm] }) });
        transplantManagementPlan.location_id = bufferZone.location_id;
        transplantManagementPlan.area_used = 999999;
        putManagementPlanRequest(transplantManagementPlan, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('crop_variety_id', cropVariety.crop_variety_id).first();
          expect(Math.floor(newManagementPlan.area_used)).toBe(Math.floor(transplantManagementPlan.area_used));
          done();
        });
      });

      test('should return 400 if asset type is residential area', async (done) => {
        const [residence] = await mocks.residenceFactory({ promisedLocation: mocks.locationFactory({ promisedFarm: [farm] }) });
        transplantManagementPlan.location_id = residence.location_id;
        transplantManagementPlan.area_used = 999999;
        putManagementPlanRequest(transplantManagementPlan, {}, async (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });

      test('should edit and the estimated_production field', async (done) => {
        transplantManagementPlan.area_used = field.figure.area.total_area * 0.1;
        transplantManagementPlan.estimated_production = 1;
        putManagementPlanRequest(transplantManagementPlan, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('crop_variety_id', cropVariety.crop_variety_id).first();
          expect(newManagementPlan.estimated_production).toBe(1);
          done();
        });
      });

      test('should edit and the estimated_revenue field', async (done) => {
        transplantManagementPlan.area_used = field.figure.area.total_area * 0.1;
        transplantManagementPlan.estimated_revenue = 1;
        putManagementPlanRequest(transplantManagementPlan, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('crop_variety_id', cropVariety.crop_variety_id).first();
          expect(newManagementPlan.estimated_revenue).toBe(1);
          done();
        });
      });

      test('Expired route should filter out non-expired managementPlan', async (done) => {
        let managementPlan = mocks.fakeManagementPlan();
        managementPlan.area_used = field.figure.area.total_area * 0.1;
        managementPlan.harvest_date = moment().add(10, 'd').toDate();
        await mocks.management_planFactory({}, managementPlan);
        getRequest(`/management_plan/expired/farm/${farm.farm_id}`, {}, (err, res) => {
          expect(res.status).toBe(404);
          done();
        });
      });

      test('should change the harvest_date to a future date', async (done) => {
        transplantManagementPlan.area_used = field.figure.area.total_area * 0.1;
        transplantManagementPlan.harvest_date = moment().add(10, 'd').toDate();
        putManagementPlanRequest(transplantManagementPlan, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('crop_variety_id', cropVariety.crop_variety_id).first();
          expect(newManagementPlan.harvest_date.toDateString()).toBe(transplantManagementPlan.harvest_date.toDateString());
          done();
        });
      });

      test('should change the harvest_date to a historical date', async (done) => {
        transplantManagementPlan.area_used = field.figure.area.total_area * 0.1;
        transplantManagementPlan.harvest_date = moment().subtract(10, 'd').toDate();
        putManagementPlanRequest(transplantManagementPlan, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('crop_variety_id', cropVariety.crop_variety_id).first();
          expect(newManagementPlan.harvest_date.toDateString()).toBe(transplantManagementPlan.harvest_date.toDateString());
          done();
        });
      });

      test('Expired route should not filter out non-expired managementPlan', async (done) => {
        let managementPlan = mocks.fakeManagementPlan();
        managementPlan.area_used = field.figure.area.total_area * 0.1;
        managementPlan.harvest_date = moment().subtract(10, 'd').toDate();
        await mocks.management_planFactory({ promisedCrop: [crop], promisedField: [field] }, managementPlan);
        getRequest(`/management_plan/expired/farm/${farm.farm_id}`, {}, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(1);
          done();
        });
      });

      describe('Put managementPlan authorization tests', () => {
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
          transplantManagementPlan.area_used = field.figure.area.total_area * 0.1;
          putManagementPlanRequest(transplantManagementPlan, { user_id: manager.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('crop_variety_id', cropVariety.crop_variety_id).first();
            expect(Math.floor(newManagementPlan.area_used)).toBe(Math.floor(transplantManagementPlan.area_used));
            done();
          });
        });

        test('should return 403 when unauthorized user tries to edit managementPlan', async (done) => {
          transplantManagementPlan.estimated_revenue = 1;
          putManagementPlanRequest(transplantManagementPlan, { user_id: unAuthorizedUser.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('should return 403 when a worker tries to edit managementPlan', async (done) => {
          transplantManagementPlan.estimated_revenue = 1;
          putManagementPlanRequest(transplantManagementPlan, { user_id: worker.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          transplantManagementPlan.estimated_revenue = 1;
          putManagementPlanRequest(transplantManagementPlan, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
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

    function getBody(finalMethod = 'broadcast_method', initialMethod) {
      return {
        crop_variety_id: cropVariety.crop_variety_id,
        ...mocks.fakeManagementPlan(),
        crop_management_plan: {
          ...mocks.fakeCropManagementPlan(),
          needs_transplant: false,
          planting_management_plans: [finalMethod, initialMethod].reduce((planting_methods, method, index) => {
            return method ? [...planting_methods, {
              ...mocks.fakePlantingManagementPlan(),
              location_id: field.location_id,
              is_final_planting_management_plan: index === 0,
              planting_method: method.toUpperCase(),
              [method]: fakeMethodMap[method](),
            }] : planting_methods;
          }, []),
        },
      };
    }

    async function expectPlantingMethodPosted(res, final_planting_method, initial_planting_method) {
      expect(res.status).toBe(201);
      const { planting_management_plan_id } = await knex('planting_management_plan').where({
        management_plan_id: res.body.management_plan_id,
        is_final_planting_management_plan: true,
      }).first();
      const plantingMethod = await knex(final_planting_method).where({ planting_management_plan_id }).first();
      expect(plantingMethod).toBeDefined();
      if (initial_planting_method) {
        const { planting_management_plan_id } = await knex('planting_management_plan').where({
          management_plan_id: res.body.management_plan_id,
          is_final_planting_management_plan: false,
        }).first();
        const initialPlantingMethod = await knex(initial_planting_method).where({ planting_management_plan_id }).first();
        expect(initialPlantingMethod).toBeDefined();
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

    test('should not allow multiple types of plantation', async (done) => {
      const managementPlantWith4plantingManagementPlan = getBody('broadcast_method', 'container_method');
      managementPlantWith4plantingManagementPlan.crop_management_plan.planting_management_plans = [...managementPlantWith4plantingManagementPlan.crop_management_plan.planting_management_plans, ...managementPlantWith4plantingManagementPlan.crop_management_plan.planting_management_plans];
      postManagementPlanRequest(managementPlantWith4plantingManagementPlan, userFarm, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

  });

});
