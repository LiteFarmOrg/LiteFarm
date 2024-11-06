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

import chai from 'chai';

import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import server from './../src/server.js';
import knex from '../src/util/knex.js';
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';
import { faker } from '@faker-js/faker';
import { tableCleanup } from './testEnvironment.js';
import cropVarietyModel from '../src/models/cropVarietyModel.js';

describe('CropVariety Tests', () => {
  let middleware;
  let newOwner;
  let farm;
  let token;

  beforeAll(() => {
    token = global.token;
  });

  function postCropVarietyRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    return chai
      .request(server)
      .post('/crop_variety')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function getRequest(url, { user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    return chai.request(server).get(url).set('user_id', user_id).set('farm_id', farm_id);
  }

  function putCropVarietyRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    const { crop_variety_id } = data;

    return chai
      .request(server)
      .put(`/crop_variety/${crop_variety_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data);
  }

  function deleteRequest(url, { user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    return chai.request(server).delete(url).set('user_id', user_id).set('farm_id', farm_id);
  }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  function fakeCropVariety(crop_id, farm_id = farm.farm_id) {
    const cropVariety = mocks.fakeCropVariety();
    return { ...cropVariety, farm_id, crop_id };
  }

  beforeEach(async () => {
    [newOwner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory(
      {
        promisedUser: [newOwner],
        promisedFarm: [farm],
      },
      fakeUserFarm(1),
    );
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('Get && delete && put cropVariety', () => {
    let cropVariety;
    let worker;
    let workerFarm;

    beforeEach(async () => {
      [cropVariety] = await mocks.crop_varietyFactory(
        { promisedFarm: [farm] },
        {
          ...mocks.fakeCropVariety(),
          crop_variety_name: 'cropVariety',
        },
      );
      [worker] = await mocks.usersFactory();
      [workerFarm] = await mocks.userFarmFactory(
        { promisedUser: [worker], promisedFarm: [farm] },
        fakeUserFarm(3),
      );
    });

    describe('Get cropVariety', () => {
      test('Workers should get cropVariety by farm id', async () => {
        const res = await getRequest(`/crop_variety/farm/${farm.farm_id}`, {
          user_id: worker.user_id,
        });
        expect(res.status).toBe(200);
        expect(res.body[0].crop_variety_id).toBe(cropVariety.crop_variety_id);
      });

      test('Workers should get cropVariety by id', async () => {
        const res = await getRequest(`/crop_variety/${cropVariety.crop_variety_id}`, {
          user_id: worker.user_id,
        });

        expect(res.status).toBe(200);
        expect(res.body.crop_variety_id).toBe(cropVariety.crop_variety_id);
      });

      test('Should filter out deleted cropVariety', async () => {
        await cropVarietyModel
          .query()
          .context(newOwner)
          .findById(cropVariety.crop_variety_id)
          .delete();

        const res = await getRequest(`/crop_variety/${cropVariety.crop_variety_id}`, {
          user_id: worker.user_id,
        });

        expect(res.status).toBe(404);
      });

      describe('Get cropVariety authorization tests', () => {
        let worker;
        let manager;
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

        test('Owner should get cropVariety by farm id', async () => {
          const res = await getRequest(`/crop_variety/${cropVariety.crop_variety_id}`, {
            user_id: newOwner.user_id,
          });

          expect(res.status).toBe(200);
          expect(res.body.crop_variety_id).toBe(cropVariety.crop_variety_id);
        });

        test('Manager should get cropVariety by farm id', async () => {
          const res = await getRequest(`/crop_variety/${cropVariety.crop_variety_id}`, {
            user_id: manager.user_id,
          });

          expect(res.status).toBe(200);
          expect(res.body.crop_variety_id).toBe(cropVariety.crop_variety_id);
        });

        test('Should get status 403 if an unauthorizedUser tries to get cropVariety by farm id', async () => {
          const res = await getRequest(`/crop_variety/${cropVariety.crop_variety_id}`, {
            user_id: unAuthorizedUser.user_id,
          });

          expect(res.status).toBe(403);
        });

        test('Circumvent authorization by modifying farm_id', async () => {
          const res = await getRequest(`/crop_variety/${cropVariety.crop_variety_id}`, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          });

          expect(res.status).toBe(403);
        });
      });
    });

    describe('Delete cropVariety', function () {
      let cropVarietyNotInUse;

      beforeEach(async () => {
        [cropVarietyNotInUse] = await mocks.crop_varietyFactory(
          { promisedFarm: [farm] },
          {
            ...mocks.fakeCropVariety(),
            crop_variety_name: 'cropVarietyNotInUse',
          },
        );
      });

      test('should delete a cropVariety that is not in use', async () => {
        const res = await deleteRequest(`/crop_variety/${cropVarietyNotInUse.crop_variety_id}`, {});
        expect(res.status).toBe(200);
        const cropVarietysDeleted = await cropVarietyModel
          .query()
          .whereDeleted()
          .context({ showHidden: true })
          .where('farm_id', farm.farm_id);
        expect(cropVarietysDeleted.length).toBe(1);
        expect(cropVarietysDeleted[0].deleted).toBe(true);
        expect(cropVarietysDeleted[0].crop_variety_name).toBe(
          cropVarietyNotInUse.crop_variety_name,
        );
      });

      test('Should delete a cropVariety referenced by a completed management plan', async () => {
        const [{ farm_id, user_id }] = await mocks.userFarmFactory(
          {},
          { status: 'Active', role_id: 1 },
        );
        const [{ crop_variety_id, management_plan_id }] = await mocks.management_planFactory(
          {
            promisedFarm: [{ farm_id }],
          },
          {
            complete_date: new Date('December 18, 1995 03:24:00'),
          },
        );
        const res = await deleteRequest(`/crop_variety/${crop_variety_id}`, { user_id, farm_id });
        expect(res.status).toBe(200);
        const cropVarietiesDeleted = await cropVarietyModel
          .query()
          .whereDeleted()
          .context({ showHidden: true })
          .where('farm_id', farm_id);
        expect(cropVarietiesDeleted.length).toBe(1);
        expect(cropVarietiesDeleted[0].deleted).toBe(true);
        expect(cropVarietiesDeleted[0].crop_variety_id).toBe(crop_variety_id);
        const managementPlan = await knex('management_plan').where({ management_plan_id }).first();
        expect(managementPlan.deleted).toBe(true);
      });

      test('Should delete a cropVariety referenced by a abandoned management plan', async () => {
        const [{ farm_id, user_id }] = await mocks.userFarmFactory(
          {},
          { status: 'Active', role_id: 1 },
        );
        const [{ crop_variety_id, management_plan_id }] = await mocks.management_planFactory(
          {
            promisedFarm: [{ farm_id }],
          },
          {
            abandon_date: new Date('December 18, 1995 03:24:00'),
          },
        );
        const res = await deleteRequest(`/crop_variety/${crop_variety_id}`, { user_id, farm_id });
        expect(res.status).toBe(200);
        const cropVarietiesDeleted = await cropVarietyModel
          .query()
          .whereDeleted()
          .context({ showHidden: true })
          .where('farm_id', farm_id);
        expect(cropVarietiesDeleted.length).toBe(1);
        expect(cropVarietiesDeleted[0].deleted).toBe(true);
        expect(cropVarietiesDeleted[0].crop_variety_id).toBe(crop_variety_id);
        const managementPlan = await knex('management_plan').where({ management_plan_id }).first();
        expect(managementPlan.deleted).toBe(true);
      });

      test('Management plan with any complete date or abandon date is considered completed or abandoned', async () => {
        const [{ farm_id, user_id }] = await mocks.userFarmFactory(
          {},
          { status: 'Active', role_id: 1 },
        );
        const [{ crop_variety_id }] = await mocks.management_planFactory(
          {
            promisedFarm: [{ farm_id }],
          },
          {
            abandon_date: new Date(faker.date.future()),
          },
        );
        const res = await deleteRequest(`/crop_variety/${crop_variety_id}`, { user_id, farm_id });
        expect(res.status).toBe(200);
        const cropVarietiesDeleted = await cropVarietyModel
          .query()
          .whereDeleted()
          .context({ showHidden: true })
          .where('farm_id', farm_id);
        expect(cropVarietiesDeleted.length).toBe(1);
        expect(cropVarietiesDeleted[0].deleted).toBe(true);
        expect(cropVarietiesDeleted[0].crop_variety_id).toBe(crop_variety_id);
      });

      test('Should not delete a cropVariety that is part of an active management plan', async () => {
        const [{ farm_id, user_id }] = await mocks.userFarmFactory(
          {},
          { status: 'Active', role_id: 1 },
        );
        const [managementPlan] = await mocks.management_planFactory(
          {
            promisedFarm: [{ farm_id }],
          },
          {},
        );
        const res = await deleteRequest(`/crop_variety/${managementPlan.crop_variety_id}`, {
          user_id,
          farm_id,
        });
        expect(res.status).toBe(400);
        const cropVarietyNotDeleted = await cropVarietyModel
          .query()
          .whereDeleted()
          .context({ showHidden: false })
          .where('farm_id', farm_id);
        expect(cropVarietyNotDeleted.length).toBe(0);
      });

      describe('Delete cropVariety Authorization test', () => {
        let worker;
        let manager;
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

        test('Manager should delete a cropVariety that has past management plan', async () => {
          const [{ farm_id, user_id }] = await mocks.userFarmFactory(
            {},
            { status: 'Active', role_id: 2 },
          );
          const [{ crop_variety_id }] = await mocks.management_planFactory(
            {
              promisedFarm: [{ farm_id }],
            },
            {
              start_date: new Date('December 17, 1995 03:24:00'),
              complete_date: new Date('December 18, 1995 03:24:00'),
            },
          );
          console.log(crop_variety_id);
          const response = await deleteRequest(`/crop_variety/${crop_variety_id}`, {
            user_id,
            farm_id,
          });
          expect(response.status).toBe(200);
          const cropVarietiesDeleted = await cropVarietyModel
            .query()
            .whereDeleted()
            .context({ showHidden: true })
            .where('farm_id', farm_id);
          expect(cropVarietiesDeleted.length).toBe(1);
          expect(cropVarietiesDeleted[0].deleted).toBe(true);
          expect(cropVarietiesDeleted[0].crop_variety_id).toBe(crop_variety_id);
        });

        test('should return 403 if unauthorized user tries to delete a cropVariety that is not in use', async () => {
          const res = await deleteRequest(`/crop_variety/${cropVarietyNotInUse.crop_variety_id}`, {
            user_id: unAuthorizedUser.user_id,
          });

          expect(res.status).toBe(403);
        });

        test('Circumvent authorization by modifying farm_id', async () => {
          const res = await deleteRequest(`/crop_variety/${cropVarietyNotInUse.crop_variety_id}`, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          });

          expect(res.status).toBe(403);
        });

        test('should return 403 if a worker tries to delete a cropVariety that is not in use', async () => {
          const res = await deleteRequest(`/crop_variety/${cropVarietyNotInUse.crop_variety_id}`, {
            user_id: worker.user_id,
          });

          expect(res.status).toBe(403);
        });
      });

      describe('Put cropVariety', () => {
        test('Owner should be able to edit a cropVariety', async () => {
          const newCropVariety = { ...cropVariety, ...mocks.fakeCropVariety() };
          const res = await putCropVarietyRequest(newCropVariety, {});
          expect(res.status).toBe(200);
          const cropVarietyRes = await cropVarietyModel
            .query()
            .where('crop_variety_id', cropVariety.crop_variety_id)
            .first();
          expect(cropVarietyRes.crop_variety_name).toBe(newCropVariety.crop_variety_name);
        });

        describe('Put cropVariety authorization tests', () => {
          let worker;
          let manager;
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

          test('Manager should be able to edit a cropVariety', async () => {
            const newCropVariety = { ...cropVariety, ...mocks.fakeCropVariety() };
            const res = await putCropVarietyRequest(newCropVariety, { user_id: manager.user_id });
            expect(res.status).toBe(200);
            const cropVarietyRes = await cropVarietyModel
              .query()
              .where('crop_variety_id', cropVariety.crop_variety_id)
              .first();
            expect(cropVarietyRes.crop_variety_name).toBe(newCropVariety.crop_variety_name);
          });

          test('should return 403 when a worker tries to edit cropVariety', async () => {
            const newCropVariety = { ...cropVariety, ...mocks.fakeCropVariety() };
            const res = await putCropVarietyRequest(newCropVariety, { user_id: worker.user_id });
            expect(res.status).toBe(403);
            const cropVarietyRes = await cropVarietyModel
              .query()
              .where('crop_variety_id', cropVariety.crop_variety_id)
              .first();
            expect(cropVarietyRes.crop_variety_name).toBe(cropVariety.crop_variety_name);
          });

          test('should return 403 when an unauthorized tries to edit cropVariety', async () => {
            const newCropVariety = { ...cropVariety, ...mocks.fakeCropVariety() };
            const res = await putCropVarietyRequest(newCropVariety, {
              user_id: unAuthorizedUser.user_id,
            });
            expect(res.status).toBe(403);
            const cropVarietyRes = await cropVarietyModel
              .query()
              .where('crop_variety_id', cropVariety.crop_variety_id)
              .first();
            expect(cropVarietyRes.crop_variety_name).toBe(cropVariety.crop_variety_name);
          });

          test('Circumvent authorization by modifying farm_id', async () => {
            const newCropVariety = { ...cropVariety, ...mocks.fakeCropVariety() };

            const res = await putCropVarietyRequest(newCropVariety, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
            });

            expect(res.status).toBe(403);
            const cropVarietyRes = await cropVarietyModel
              .query()
              .where('crop_variety_id', cropVariety.crop_variety_id)
              .first();
            expect(cropVarietyRes.crop_variety_name).toBe(cropVariety.crop_variety_name);
          });
        });
      });
    });
  });

  describe('Post cropVariety', () => {
    let crop;
    beforeEach(async () => {
      [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
    });

    test('should return 400 status if cropVariety is posted w/o crop_variety_name', async () => {
      const cropVariety = fakeCropVariety(crop.crop_id);
      delete cropVariety.crop_variety_name;
      const res = await postCropVarietyRequest(cropVariety, {});
      expect(res.status).toBe(400);
      expect(JSON.parse(res.error.text).error.data.crop_variety_name[0].keyword).toBe('required');
    });

    test('should return 403 status if headers.farm_id is set to null', async () => {
      const cropVariety = fakeCropVariety(crop.crop_id);
      cropVariety.farm_id = null;
      const res = await postCropVarietyRequest(cropVariety, {});
      expect(res.status).toBe(403);
    });

    test('should post and get a valid cropVariety', async () => {
      const cropVariety = fakeCropVariety(crop.crop_id);
      cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;
      delete cropVariety.nutrient_credits;
      const res = await postCropVarietyRequest(cropVariety, {});
      expect(res.status).toBe(201);
      const cropVarietys = await knex('crop_variety').where('farm_id', farm.farm_id);
      expect(cropVarietys.length).toBe(1);
      expect(cropVarietys[0].crop_variety_name).toBe(cropVariety.crop_variety_name);
      expect(cropVarietys[0].nutrient_credits).toBe(crop.nutrient_credits);
    });

    test('should post and get a valid cropVariety with null compliance info', async () => {
      const cropVariety = fakeCropVariety(crop.crop_id);
      cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;
      cropVariety.compliance_file_url = '';
      cropVariety.organic = null;
      cropVariety.treated = null;
      cropVariety.genetically_engineered = null;
      cropVariety.searched = null;
      const res = await postCropVarietyRequest(cropVariety, {});
      expect(res.status).toBe(201);
      const cropVarietys = await cropVarietyModel.query().where('farm_id', farm.farm_id);
      expect(cropVarietys.length).toBe(1);
      expect(cropVarietys[0].crop_variety_name).toBe(cropVariety.crop_variety_name);
      expect(cropVarietys[0].organic).toBe(null);
    });

    describe('crop_variety_name + genus + species uniqueness tests', function () {
      test('should return 400 status if cropVariety is posted w/o variety name', async () => {
        let cropVariety = fakeCropVariety(crop.crop_id);
        cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;
        [cropVariety] = await mocks.crop_varietyFactory(
          { promisedFarm: [farm], createdUser: [newOwner] },
          cropVariety,
        );
        const res = await postCropVarietyRequest(cropVariety, {});
        expect(res.status).toBe(400);
      });

      test('should post a cropVariety and its variety', async () => {
        const cropVariety = fakeCropVariety(crop.crop_id);
        cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;
        const [cropVariety1] = await mocks.crop_varietyFactory(
          {
            promisedFarm: [farm],
            createdUser: [newOwner],
          },
          cropVariety,
        );
        cropVariety.crop_variety_name += ' - 1';
        const res = await postCropVarietyRequest(cropVariety, {});
        expect(res.status).toBe(201);
        const cropVarietys = await cropVarietyModel.query().where('farm_id', farm.farm_id);
        expect(cropVarietys.length).toBe(2);
        expect(cropVarietys[0].crop_variety_name).toBe(cropVariety1.crop_variety_name);
        expect(cropVarietys[1].crop_variety_name).toBe(cropVariety.crop_variety_name);
      });
    });

    describe('Post cropVariety authorization', () => {
      let worker;
      let manager;
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

        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory(
          {
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser],
          },
          fakeUserFarm(1),
        );

        [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
      });

      test('owner should return 403 status if cropVariety is posted by unauthorized user', async () => {
        const cropVariety = fakeCropVariety(crop.crop_id);
        cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;
        const res = await postCropVarietyRequest(cropVariety, {
          user_id: unAuthorizedUser.user_id,
        });
        expect(res.status).toBe(403);
        expect(res.error.text).toBe(
          'User does not have the following permission(s): add:crop_variety',
        );
      });

      test('should return 403 status if cropVariety is posted by newWorker', async () => {
        const cropVariety = fakeCropVariety(crop.crop_id);
        cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;
        const res = await postCropVarietyRequest(cropVariety, { user_id: worker.user_id });
        expect(res.status).toBe(403);
        expect(res.error.text).toBe(
          'User does not have the following permission(s): add:crop_variety',
        );
      });

      test('manager should post and get a valid cropVariety', async () => {
        const cropVariety = fakeCropVariety(crop.crop_id);
        cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;
        const res = await postCropVarietyRequest(cropVariety, { user_id: manager.user_id });
        expect(res.status).toBe(201);
        const cropVarietys = await cropVarietyModel.query().where('farm_id', farm.farm_id);
        expect(cropVarietys.length).toBe(1);
        expect(cropVarietys[0].crop_variety_name).toBe(cropVariety.crop_variety_name);
      });

      test('Circumvent authorization by modify farm_id', async () => {
        const cropVariety = fakeCropVariety(crop.crop_id);
        cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;

        const res = await postCropVarietyRequest(cropVariety, {
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id,
        });

        expect(res.status).toBe(403);
        expect(res.error.text).toBe('user not authorized to access farm');
      });
    });
  });
});
