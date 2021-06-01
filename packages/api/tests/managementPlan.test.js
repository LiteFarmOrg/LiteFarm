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
    chai.request(server).post('/management_plan')
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

  function fakeManagementPlan(cropVariety) {
    const managementPlan = mocks.fakeManagementPlan();
    const area_used = managementPlan.area_used < field.figure.area.total_area ? managementPlan.area_used : field.figure.area.total_area;
    return ({
      ...managementPlan,
      crop_variety_id: cropVariety.crop_variety_id,
      location_id: field.location_id,
      area_used,
    });
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
  })

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
      [transplantManagementPlan] = await mocks.management_planFactory({
        promisedField: [field],
        promisedCropVariety: [cropVariety],
      }, { ...mocks.fakeManagementPlan(), needs_transplant: true });
      [seedManagementPlan] = await mocks.management_planFactory({
        promisedField: [field],
        promisedCropVariety: [cropVariety],
      }, { ...mocks.fakeManagementPlan(), needs_transplant: false });
      await mocks.broadcastFactory({ promisedField: [field], promisedManagementPlan: [seedManagementPlan] });
      await mocks.containerFactory({ promisedField: [field], promisedManagementPlan: [transplantManagementPlan] });
      [worker] = await mocks.usersFactory();
      [workerFarm] = await mocks.userFarmFactory({ promisedUser: [worker], promisedFarm: [farm] }, fakeUserFarm(3));

      [unAuthorizedUser] = await mocks.usersFactory();
      [farmunAuthorizedUser] = await mocks.farmFactory();
      const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
        promisedUser: [unAuthorizedUser],
        promisedFarm: [farmunAuthorizedUser],
      }, fakeUserFarm(1));

    })


    describe('Get managementPlan', () => {
      test('Workers should get managementPlan by farm id', async (done) => {
        getRequest(`/management_plan/farm/${farm.farm_id}`, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].crop_management_plan.broadcast.management_plan_id).toBe(seedManagementPlan.management_plan_id);
          expect(res.body[0].transplant_container).toBeNull();
          expect(res.body[1].crop_management_plan.container.management_plan_id).toBe(transplantManagementPlan.management_plan_id);
          expect(res.body[1].transplant_container.management_plan_id).toBe(transplantManagementPlan.management_plan_id);
          done();
        });
      });

      test('Workers should get managementPlan by date', async (done) => {
        getRequest(`/management_plan/farm/date/${farm.farm_id}/${moment().format('YYYY-MM-DD')}`, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].management_plan_id).toBe(transplantManagementPlan.management_plan_id);
          done();
        });
      });

      test('Workers should get managementPlan by id', async (done) => {
        getRequest(`/management_plan/${transplantManagementPlan.management_plan_id}`, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.management_plan_id).toBe(transplantManagementPlan.management_plan_id);
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
            promisedFarm: [farm]
          }, fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser],
          }, fakeUserFarm(1));
        })

        test('Owner should get managementPlan by farm id', async (done) => {
          getRequest(`/management_plan/farm/${farm.farm_id}`, { user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body[0].management_plan_id).toBe(transplantManagementPlan.management_plan_id);
            done();
          });
        });

        test('Manager should get managementPlan by farm id', async (done) => {
          getRequest(`/management_plan/farm/${farm.farm_id}`, { user_id: manager.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body[0].management_plan_id).toBe(transplantManagementPlan.management_plan_id);
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
        })


      })
    })


    describe('Delete managementPlan', function() {

      let worker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

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
          promisedFarm: [farmunAuthorizedUser],
        }, fakeUserFarm(1));
      })

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

    describe('Put managementPlan', () => {
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
            promisedFarm: [farm]
          }, fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser]
          }, fakeUserFarm(1));
        })
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

      })
    });


  })

  describe('Post managementPlan', () => {
    let crop;
    let cropVariety;
    beforeEach(async () => {
      [crop] = await mocks.cropFactory({ promisedFarm: [farm] }, {
        ...mocks.fakeCrop(),
        crop_common_name: 'crop',
        user_added: true,
      });
      [cropVariety] = await mocks.crop_varietyFactory({ promisedFarm: [farm], promisedCrop: [crop] }, {
        ...mocks.fakeCropVariety(),
        crop_variety_name: 'crop_variety',
      });
    });

    test('should return 400 status if managementPlan is posted w/o crop_id', async (done) => {
      let managementPlan = fakeManagementPlan(cropVariety);
      delete managementPlan.crop_variety_id;
      postManagementPlanRequest(managementPlan, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.crop_variety_id[0].keyword).toBe('required');
        done();
      });
    });

    test('should return 400 status if managementPlan is posted w/o area_used', async (done) => {
      let managementPlan = fakeManagementPlan(cropVariety);
      delete managementPlan.area_used;
      postManagementPlanRequest(managementPlan, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.area_used[0].keyword).toBe('required');
        done();
      });
    });

    test('should return 400 status if managementPlan is posted w/o estimated_revenue', async (done) => {
      let managementPlan = fakeManagementPlan(cropVariety);
      delete managementPlan.estimated_revenue;
      postManagementPlanRequest(managementPlan, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_revenue[0].keyword).toBe('required');
        done();
      });
    });

    test('should return 400 status if managementPlan is posted w/o estimated_production', async (done) => {
      let managementPlan = fakeManagementPlan(cropVariety);
      delete managementPlan.estimated_production;
      postManagementPlanRequest(managementPlan, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_production[0].keyword).toBe('required');
        done();
      });
    });

    test('should return 400 status if managementPlan is posted w/ area > field.figure.area.total_area', async (done) => {
      let managementPlan = fakeManagementPlan(cropVariety);
      managementPlan.area_used = field.figure.area.total_area + 1;
      managementPlan.estimated_production = 1;
      managementPlan.estimated_revenue = 1;
      postManagementPlanRequest(managementPlan, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(res.error.text).toBe('Area needed is greater than the field\'s area');
        done();
      });
    });

    test('should return 400 status if managementPlan is posted w/ area < 0', async (done) => {
      let managementPlan = fakeManagementPlan(cropVariety);
      managementPlan.area_used = -1;
      managementPlan.estimated_production = 1;
      managementPlan.estimated_revenue = 1;
      postManagementPlanRequest(managementPlan, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.area_used[0].message).toBe('should be >= 0');
        done();
      });
    });

    test('should return 400 status if asset type is fence', async (done) => {
      let managementPlan = fakeManagementPlan(cropVariety);
      managementPlan.estimated_revenue = 1;
      managementPlan.area_used = field.figure.area.total_area * 0.25;
      managementPlan.estimated_production = 1;
      const [fence] = await mocks.fenceFactory({ promisedLocation: mocks.locationFactory({ promisedFarm: [farm] }) });
      managementPlan.location_id = fence.location_id;
      postManagementPlanRequest(managementPlan, {}, async (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('Should post then get a valid fieldcrop (bed size and percentage)', async (done) => {
      let managementPlan = fakeManagementPlan(cropVariety);
      managementPlan.estimated_revenue = 1;
      managementPlan.area_used = field.figure.area.total_area * 0.25;
      managementPlan.estimated_production = 1;
      postManagementPlanRequest(managementPlan, {}, async (err, res) => {
        expect(res.status).toBe(201);
        const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('crop_variety_id', cropVariety.crop_variety_id).first();
        expect(newManagementPlan.field_id).toBe(field.field_id);
        done();
      });
    });

    test('should return 400 status if managementPlan is posted w/ estimated_revenue < 0', async (done) => {
      let managementPlan = fakeManagementPlan(cropVariety);
      managementPlan.estimated_revenue = -1;
      managementPlan.area_used = field.figure.area.total_area * 0.25;
      managementPlan.estimated_production = 1;
      postManagementPlanRequest(managementPlan, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_revenue[0].message).toBe('should be >= 0');
        done();
      });
    });

    test('Should post then get an expired crop', async (done) => {
      let managementPlan = fakeManagementPlan(cropVariety);
      managementPlan.estimated_revenue = 1;
      managementPlan.area_used = field.figure.area.total_area * 0.25;
      managementPlan.estimated_production = 1;
      managementPlan.start_date = moment().subtract(50, 'd').toDate();
      managementPlan.harvest_date = moment().subtract(20, 'd').toDate();
      postManagementPlanRequest(managementPlan, {}, async (err, res) => {
        expect(res.status).toBe(201);
        const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('crop_variety_id', cropVariety.crop_variety_id).first();
        expect(newManagementPlan.field_id).toBe(field.field_id);
        done();
      });
    });

    describe('Post managementPlan authorization', () => {
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
          promisedFarm: [farm]
        }, fakeUserFarm(2));


        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
          promisedUser: [unAuthorizedUser],
          promisedFarm: [farmunAuthorizedUser]
        }, fakeUserFarm(1));
      })

      test('Should post then get a valid fieldcrop by a manager', async (done) => {
        let managementPlan = fakeManagementPlan(cropVariety);
        managementPlan.estimated_revenue = 1;
        managementPlan.area_used = field.figure.area.total_area * 0.25;
        managementPlan.estimated_production = 1;
        postManagementPlanRequest(managementPlan, { user_id: manager.user_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const newManagementPlan = await managementPlanModel.query().context({ showHidden: true }).where('crop_variety_id', cropVariety.crop_variety_id).first();
          expect(newManagementPlan.field_id).toBe(field.field_id);
          done();
        });
      });

      test('Should return status 403 when a worker tries to post a valid fieldcrop', async (done) => {
        let managementPlan = fakeManagementPlan(cropVariety);
        managementPlan.estimated_revenue = 1;
        managementPlan.area_used = field.figure.area.total_area * 0.25;
        managementPlan.estimated_production = 1;
        postManagementPlanRequest(managementPlan, { user_id: worker.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          },
        );
      });

      test('Should return status 403 when an unauthorized user tries to post a valid fieldcrop', async (done) => {
        let managementPlan = fakeManagementPlan(cropVariety);
        managementPlan.estimated_revenue = 1;
        managementPlan.area_used = field.figure.area.total_area * 0.25;
        managementPlan.estimated_production = 1;
        postManagementPlanRequest(managementPlan, { user_id: unAuthorizedUser.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          },
        );
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        let managementPlan = fakeManagementPlan(cropVariety);
        managementPlan.estimated_revenue = 1;
        managementPlan.area_used = field.figure.area.total_area * 0.25;
        managementPlan.estimated_production = 1;
        postManagementPlanRequest(managementPlan, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          },
        );
      });

    });

  })

});
