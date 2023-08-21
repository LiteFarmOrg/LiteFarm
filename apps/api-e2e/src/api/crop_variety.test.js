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

  function postCropVarietyRequest(
    data,
    { user_id = newOwner.user_id, farm_id = farm.farm_id },
    callback,
  ) {
    chai
      .request(server)
      .post('/crop_variety')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function getRequest(url, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).get(url).set('user_id', user_id).set('farm_id', farm_id).end(callback);
  }

  function putCropVarietyRequest(
    data,
    { user_id = newOwner.user_id, farm_id = farm.farm_id },
    callback,
  ) {
    const { crop_variety_id } = data;
    chai
      .request(server)
      .put(`/crop_variety/${crop_variety_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback);
  }

  function deleteRequest(url, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).delete(url).set('user_id', user_id).set('farm_id', farm_id).end(callback);
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

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
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
      test('Workers should get cropVariety by farm id', async (done) => {
        getRequest(
          `/crop_variety/farm/${farm.farm_id}`,
          { user_id: worker.user_id },
          (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body[0].crop_variety_id).toBe(cropVariety.crop_variety_id);
            done();
          },
        );
      });

      test('Workers should get cropVariety by id', async (done) => {
        getRequest(
          `/crop_variety/${cropVariety.crop_variety_id}`,
          { user_id: worker.user_id },
          (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.crop_variety_id).toBe(cropVariety.crop_variety_id);
            done();
          },
        );
      });

      test('Should filter out deleted cropVariety', async (done) => {
        await cropVarietyModel
          .query()
          .context(newOwner)
          .findById(cropVariety.crop_variety_id)
          .delete();
        getRequest(
          `/crop_variety/${cropVariety.crop_variety_id}`,
          { user_id: worker.user_id },
          (err, res) => {
            expect(res.status).toBe(404);
            done();
          },
        );
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

        test('Owner should get cropVariety by farm id', async (done) => {
          getRequest(
            `/crop_variety/${cropVariety.crop_variety_id}`,
            { user_id: newOwner.user_id },
            (err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.crop_variety_id).toBe(cropVariety.crop_variety_id);
              done();
            },
          );
        });

        test('Manager should get cropVariety by farm id', async (done) => {
          getRequest(
            `/crop_variety/${cropVariety.crop_variety_id}`,
            { user_id: manager.user_id },
            (err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.crop_variety_id).toBe(cropVariety.crop_variety_id);
              done();
            },
          );
        });

        test('Should get status 403 if an unauthorizedUser tries to get cropVariety by farm id', async (done) => {
          getRequest(
            `/crop_variety/${cropVariety.crop_variety_id}`,
            { user_id: unAuthorizedUser.user_id },
            (err, res) => {
              expect(res.status).toBe(403);
              done();
            },
          );
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          getRequest(
            `/crop_variety/${cropVariety.crop_variety_id}`,
            {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
            },
            (err, res) => {
              expect(res.status).toBe(403);
              done();
            },
          );
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

      test('should delete a cropVariety that is not in use', async (done) => {
        deleteRequest(
          `/crop_variety/${cropVarietyNotInUse.crop_variety_id}`,
          {},
          async (err, res) => {
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
            done();
          },
        );
      });

      test('Should delete a cropVariety referenced by a completed management plan', async (done) => {
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
        deleteRequest(
          `/crop_variety/${crop_variety_id}`,
          { user_id, farm_id },
          async (err, res) => {
            expect(res.status).toBe(200);
            const cropVarietiesDeleted = await cropVarietyModel
              .query()
              .whereDeleted()
              .context({ showHidden: true })
              .where('farm_id', farm_id);
            expect(cropVarietiesDeleted.length).toBe(1);
            expect(cropVarietiesDeleted[0].deleted).toBe(true);
            expect(cropVarietiesDeleted[0].crop_variety_id).toBe(crop_variety_id);
            const managementPlan = await knex('management_plan')
              .where({ management_plan_id })
              .first();
            expect(managementPlan.deleted).toBe(true);
            done();
          },
        );
      });

      test('Should delete a cropVariety referenced by a abandoned management plan', async (done) => {
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
        deleteRequest(
          `/crop_variety/${crop_variety_id}`,
          { user_id, farm_id },
          async (err, res) => {
            expect(res.status).toBe(200);
            const cropVarietiesDeleted = await cropVarietyModel
              .query()
              .whereDeleted()
              .context({ showHidden: true })
              .where('farm_id', farm_id);
            expect(cropVarietiesDeleted.length).toBe(1);
            expect(cropVarietiesDeleted[0].deleted).toBe(true);
            expect(cropVarietiesDeleted[0].crop_variety_id).toBe(crop_variety_id);
            const managementPlan = await knex('management_plan')
              .where({ management_plan_id })
              .first();
            expect(managementPlan.deleted).toBe(true);
            done();
          },
        );
      });

      test('Management plan with any complete date or abandon date is considered completed or abandoned', async (done) => {
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
        deleteRequest(
          `/crop_variety/${crop_variety_id}`,
          { user_id, farm_id },
          async (err, res) => {
            expect(res.status).toBe(200);
            const cropVarietiesDeleted = await cropVarietyModel
              .query()
              .whereDeleted()
              .context({ showHidden: true })
              .where('farm_id', farm_id);
            expect(cropVarietiesDeleted.length).toBe(1);
            expect(cropVarietiesDeleted[0].deleted).toBe(true);
            expect(cropVarietiesDeleted[0].crop_variety_id).toBe(crop_variety_id);
            done();
          },
        );
      });

      test('Should not delete a cropVariety that is part of an active management plan', async (done) => {
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
        deleteRequest(
          `/crop_variety/${managementPlan.crop_variety_id}`,
          { user_id, farm_id },
          async (err, res) => {
            expect(res.status).toBe(400);
            const cropVarietyNotDeleted = await cropVarietyModel
              .query()
              .whereDeleted()
              .context({ showHidden: false })
              .where('farm_id', farm_id);
            expect(cropVarietyNotDeleted.length).toBe(0);
            done();
          },
        );
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

        test('Manager should delete a cropVariety that has past management plan', async (done) => {
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
          deleteRequest(
            `/crop_variety/${crop_variety_id}`,
            { user_id, farm_id },
            async (err, response) => {
              expect(response.status).toBe(200);
              const cropVarietiesDeleted = await cropVarietyModel
                .query()
                .whereDeleted()
                .context({ showHidden: true })
                .where('farm_id', farm_id);
              expect(cropVarietiesDeleted.length).toBe(1);
              expect(cropVarietiesDeleted[0].deleted).toBe(true);
              expect(cropVarietiesDeleted[0].crop_variety_id).toBe(crop_variety_id);
              done();
            },
          );
        });

        test('should return 403 if unauthorized user tries to delete a cropVariety that is not in use', async (done) => {
          deleteRequest(
            `/crop_variety/${cropVarietyNotInUse.crop_variety_id}`,
            { user_id: unAuthorizedUser.user_id },
            (err, res) => {
              expect(res.status).toBe(403);
              done();
            },
          );
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          deleteRequest(
            `/crop_variety/${cropVarietyNotInUse.crop_variety_id}`,
            {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
            },
            (err, res) => {
              expect(res.status).toBe(403);
              done();
            },
          );
        });

        test('should return 403 if a worker tries to delete a cropVariety that is not in use', async (done) => {
          deleteRequest(
            `/crop_variety/${cropVarietyNotInUse.crop_variety_id}`,
            { user_id: worker.user_id },
            (err, res) => {
              expect(res.status).toBe(403);
              done();
            },
          );
        });
      });

      describe('Put cropVariety', () => {
        test('Owner should be able to edit a cropVariety', async (done) => {
          const newCropVariety = { ...cropVariety, ...mocks.fakeCropVariety() };
          putCropVarietyRequest(newCropVariety, {}, async (err, res) => {
            expect(res.status).toBe(200);
            const cropVarietyRes = await cropVarietyModel
              .query()
              .where('crop_variety_id', cropVariety.crop_variety_id)
              .first();
            expect(cropVarietyRes.crop_variety_name).toBe(newCropVariety.crop_variety_name);
            done();
          });
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

          test('Manager should be able to edit a cropVariety', async (done) => {
            const newCropVariety = { ...cropVariety, ...mocks.fakeCropVariety() };
            putCropVarietyRequest(
              newCropVariety,
              { user_id: manager.user_id },
              async (err, res) => {
                expect(res.status).toBe(200);
                const cropVarietyRes = await cropVarietyModel
                  .query()
                  .where('crop_variety_id', cropVariety.crop_variety_id)
                  .first();
                expect(cropVarietyRes.crop_variety_name).toBe(newCropVariety.crop_variety_name);
                done();
              },
            );
          });

          test('should return 403 when a worker tries to edit cropVariety', async (done) => {
            const newCropVariety = { ...cropVariety, ...mocks.fakeCropVariety() };
            putCropVarietyRequest(newCropVariety, { user_id: worker.user_id }, async (err, res) => {
              expect(res.status).toBe(403);
              const cropVarietyRes = await cropVarietyModel
                .query()
                .where('crop_variety_id', cropVariety.crop_variety_id)
                .first();
              expect(cropVarietyRes.crop_variety_name).toBe(cropVariety.crop_variety_name);
              done();
            });
          });

          test('should return 403 when an unauthorized tries to edit cropVariety', async (done) => {
            const newCropVariety = { ...cropVariety, ...mocks.fakeCropVariety() };
            putCropVarietyRequest(
              newCropVariety,
              { user_id: unAuthorizedUser.user_id },
              async (err, res) => {
                expect(res.status).toBe(403);
                const cropVarietyRes = await cropVarietyModel
                  .query()
                  .where('crop_variety_id', cropVariety.crop_variety_id)
                  .first();
                expect(cropVarietyRes.crop_variety_name).toBe(cropVariety.crop_variety_name);
                done();
              },
            );
          });

          test('Circumvent authorization by modifying farm_id', async (done) => {
            const newCropVariety = { ...cropVariety, ...mocks.fakeCropVariety() };
            putCropVarietyRequest(
              newCropVariety,
              {
                user_id: unAuthorizedUser.user_id,
                farm_id: farmunAuthorizedUser.farm_id,
              },
              async (err, res) => {
                expect(res.status).toBe(403);
                const cropVarietyRes = await cropVarietyModel
                  .query()
                  .where('crop_variety_id', cropVariety.crop_variety_id)
                  .first();
                expect(cropVarietyRes.crop_variety_name).toBe(cropVariety.crop_variety_name);
                done();
              },
            );
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

    test('should return 400 status if cropVariety is posted w/o crop_variety_name', async (done) => {
      const cropVariety = fakeCropVariety(crop.crop_id);
      delete cropVariety.crop_variety_name;
      postCropVarietyRequest(cropVariety, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.crop_variety_name[0].keyword).toBe('required');
        done();
      });
    });

    test('should return 403 status if headers.farm_id is set to null', async (done) => {
      const cropVariety = fakeCropVariety(crop.crop_id);
      cropVariety.farm_id = null;
      postCropVarietyRequest(cropVariety, {}, (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

    test('should post and get a valid cropVariety', async (done) => {
      const cropVariety = fakeCropVariety(crop.crop_id);
      cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;
      delete cropVariety.nutrient_credits;
      postCropVarietyRequest(cropVariety, {}, async (err, res) => {
        expect(res.status).toBe(201);
        const cropVarietys = await knex('crop_variety').where('farm_id', farm.farm_id);
        expect(cropVarietys.length).toBe(1);
        expect(cropVarietys[0].crop_variety_name).toBe(cropVariety.crop_variety_name);
        expect(cropVarietys[0].nutrient_credits).toBe(crop.nutrient_credits);
        done();
      });
    });

    test('should post and get a valid cropVariety with null compliance info', async (done) => {
      const cropVariety = fakeCropVariety(crop.crop_id);
      cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;
      cropVariety.compliance_file_url = '';
      cropVariety.organic = null;
      cropVariety.treated = null;
      cropVariety.genetically_engineered = null;
      cropVariety.searched = null;
      postCropVarietyRequest(cropVariety, {}, async (err, res) => {
        expect(res.status).toBe(201);
        const cropVarietys = await cropVarietyModel.query().where('farm_id', farm.farm_id);
        expect(cropVarietys.length).toBe(1);
        expect(cropVarietys[0].crop_variety_name).toBe(cropVariety.crop_variety_name);
        expect(cropVarietys[0].organic).toBe(null);
        done();
      });
    });

    describe('crop_variety_name + genus + species uniqueness tests', function () {
      test('should return 400 status if cropVariety is posted w/o variety name', async (done) => {
        let cropVariety = fakeCropVariety(crop.crop_id);
        cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;
        [cropVariety] = await mocks.crop_varietyFactory(
          { promisedFarm: [farm], createdUser: [newOwner] },
          cropVariety,
        );
        postCropVarietyRequest(cropVariety, {}, (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });

      test('should post a cropVariety and its variety', async (done) => {
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
        postCropVarietyRequest(cropVariety, {}, async (err, res) => {
          expect(res.status).toBe(201);
          const cropVarietys = await cropVarietyModel.query().where('farm_id', farm.farm_id);
          expect(cropVarietys.length).toBe(2);
          expect(cropVarietys[0].crop_variety_name).toBe(cropVariety1.crop_variety_name);
          expect(cropVarietys[1].crop_variety_name).toBe(cropVariety.crop_variety_name);
          done();
        });
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

      test('owner should return 403 status if cropVariety is posted by unauthorized user', async (done) => {
        const cropVariety = fakeCropVariety(crop.crop_id);
        cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;
        postCropVarietyRequest(cropVariety, { user_id: unAuthorizedUser.user_id }, (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe(
            'User does not have the following permission(s): add:crop_variety',
          );
          done();
        });
      });

      test('should return 403 status if cropVariety is posted by newWorker', async (done) => {
        const cropVariety = fakeCropVariety(crop.crop_id);
        cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;
        postCropVarietyRequest(cropVariety, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe(
            'User does not have the following permission(s): add:crop_variety',
          );
          done();
        });
      });

      test('manager should post and get a valid cropVariety', async (done) => {
        const cropVariety = fakeCropVariety(crop.crop_id);
        cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;
        postCropVarietyRequest(cropVariety, { user_id: manager.user_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const cropVarietys = await cropVarietyModel.query().where('farm_id', farm.farm_id);
          expect(cropVarietys.length).toBe(1);
          expect(cropVarietys[0].crop_variety_name).toBe(cropVariety.crop_variety_name);
          done();
        });
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        const cropVariety = fakeCropVariety(crop.crop_id);
        cropVariety.crop_variety_name = `${cropVariety.cropVariety_specie} - ${cropVariety.crop_variety_name}`;
        postCropVarietyRequest(
          cropVariety,
          {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          },
          (err, res) => {
            expect(res.status).toBe(403);
            expect(res.error.text).toBe('user not authorized to access farm');
            done();
          },
        );
      });
    });
  });
});
