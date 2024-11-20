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
import { tableCleanup } from './testEnvironment.js';
import cropModel from '../src/models/cropModel.js';

describe('Crop Tests', () => {
  let newOwner;
  let farm;
  let token;

  beforeAll(() => {
    token = global.token;
  });

  function postCropRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    return chai
      .request(server)
      .post('/crop')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function getRequest(url, { user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    return chai.request(server).get(url).set('user_id', user_id).set('farm_id', farm_id);
  }

  function putCropRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    const { crop_id } = data;

    return chai
      .request(server)
      .put(`/crop/${crop_id}`)
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

  function fakeCrop(farm_id = farm.farm_id) {
    const crop = mocks.fakeCrop();
    return { ...crop, farm_id };
  }

  beforeEach(async () => {
    await knex.raw('DELETE from crop');
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

  describe('Get && delete && put crop', () => {
    let crop;
    let worker;
    let workerFarm;
    let seededCrop;

    beforeEach(async () => {
      [crop] = await mocks.cropFactory(
        { promisedFarm: [farm], createdUser: [newOwner] },
        {
          ...mocks.fakeCrop(),
          crop_common_name: 'crop',
          user_added: true,
        },
      );
      [worker] = await mocks.usersFactory();
      [workerFarm] = await mocks.userFarmFactory(
        { promisedUser: [worker], promisedFarm: [farm] },
        fakeUserFarm(3),
      );
      [seededCrop] = await mocks.cropFactory(
        { promisedFarm: [{ farm_id: null }], createdUser: [newOwner] },
        mocks.fakeCrop(),
      );
      console.log(workerFarm);
    });

    describe('Get crop', () => {
      test('Workers should get crop by farm id', async () => {
        const res = await getRequest(`/crop/farm/${farm.farm_id}`, { user_id: worker.user_id });
        expect(res.status).toBe(200);
        expect(res.body[0].crop_id).toBe(crop.crop_id);
      });

      xtest('Workers should get seeded crops', async () => {
        const res = await getRequest(`/crop/farm/${farm.farm_id}`, { user_id: worker.user_id });
        expect(res.status).toBe(200);
        expect(res.body[1].crop_id).toBe(seededCrop.crop_id);
      });

      test('Workers should get crop by id', async () => {
        const res = await getRequest(`/crop/${crop.crop_id}`, { user_id: worker.user_id });
        expect(res.status).toBe(200);
        expect(res.body[0].crop_id).toBe(crop.crop_id);
      });

      test('Should filter out deleted crop', async () => {
        await cropModel.query().context(newOwner).findById(crop.crop_id).delete();
        const res = await getRequest(`/crop/${crop.crop_id}`, { user_id: worker.user_id });
        expect(res.status).toBe(404);
      });

      describe('Get crop authorization tests', () => {
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

        test('Owner should get crop by farm id', async () => {
          const res = await getRequest(`/crop/${crop.crop_id}`, { user_id: newOwner.user_id });
          expect(res.status).toBe(200);
          expect(res.body[0].crop_id).toBe(crop.crop_id);
        });

        test('Manager should get crop by farm id', async () => {
          const res = await getRequest(`/crop/${crop.crop_id}`, { user_id: manager.user_id });
          expect(res.status).toBe(200);
          expect(res.body[0].crop_id).toBe(crop.crop_id);
        });

        test('Should get status 403 if an unauthorizedUser tries to get crop by farm id', async () => {
          const res = await getRequest(`/crop/${crop.crop_id}`, {
            user_id: unAuthorizedUser.user_id,
          });
          expect(res.status).toBe(403);
        });

        // TODO switch to JWT
        test('Circumvent authorization by modifying farm_id', async () => {
          const res = await getRequest(`/crop/${crop.crop_id}`, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          });

          expect(res.status).toBe(403);
        });
      });
    });

    describe('Delete crop', function () {
      let cropNotInUse;

      beforeEach(async () => {
        [cropNotInUse] = await mocks.cropFactory(
          { promisedFarm: [farm], createdUser: [newOwner] },
          {
            ...mocks.fakeCrop(),
            crop_common_name: 'cropNotInUse',
            user_added: true,
          },
        );
      });

      test('Owner should delete a crop that is referenced by a managementPlan', async () => {
        const res = await deleteRequest(`/crop/${crop.crop_id}`, {});
        expect(res.status).toBe(200);
        const crops = await cropModel
          .query()
          .whereDeleted()
          .context({ showHidden: true })
          .where('farm_id', farm.farm_id);
        expect(crops.length).toBe(1);
        expect(crops[0].deleted).toBe(true);
        expect(crops[0].crop_genus).toBe(crop.crop_genus);
      });

      test('should delete a crop that is not in use', async () => {
        const res = await deleteRequest(`/crop/${cropNotInUse.crop_id}`, {});
        expect(res.status).toBe(200);
        const cropsDeleted = await cropModel
          .query()
          .whereDeleted()
          .context({ showHidden: true })
          .where('farm_id', farm.farm_id);
        expect(cropsDeleted.length).toBe(1);
        expect(cropsDeleted[0].deleted).toBe(true);
        expect(cropsDeleted[0].crop_genus).toBe(cropNotInUse.crop_genus);
      });

      test('should return 403 if user tries to delete a seeded crop', async () => {
        const res = await deleteRequest(`/crop/${seededCrop.crop_id}`, {});
        expect(res.status).toBe(403);
      });

      test('should return 403 if user tries to delete a seeded crop with farm_id == null', async () => {
        const res = await deleteRequest(`/crop/${seededCrop.crop_id}`, { farm_id: null });
        expect(res.status).toBe(403);
      });

      describe('Delete crop Authorization test', () => {
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

        test('Manager should delete a crop that is not in use', async () => {
          const res = await deleteRequest(`/crop/${cropNotInUse.crop_id}`, {
            user_id: manager.user_id,
          });
          expect(res.status).toBe(200);
          const cropsDeleted = await cropModel
            .query()
            .whereDeleted()
            .context({ showHidden: true })
            .where('farm_id', farm.farm_id);
          expect(cropsDeleted.length).toBe(1);
          expect(cropsDeleted[0].deleted).toBe(true);
          expect(cropsDeleted[0].crop_genus).toBe(cropNotInUse.crop_genus);
        });

        test('should return 403 if unauthorized user tries to delete a crop that is not in use', async () => {
          const res = await deleteRequest(`/crop/${cropNotInUse.crop_id}`, {
            user_id: unAuthorizedUser.user_id,
          });
          expect(res.status).toBe(403);
        });

        test('Circumvent authorization by modifying farm_id', async () => {
          const res = await deleteRequest(`/crop/${cropNotInUse.crop_id}`, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          });

          expect(res.status).toBe(403);
        });

        test('should return 403 if a worker tries to delete a crop that is not in use', async () => {
          const res = await deleteRequest(`/crop/${cropNotInUse.crop_id}`, {
            user_id: worker.user_id,
          });
          expect(res.status).toBe(403);
        });
      });

      describe('Put crop', () => {
        test('Owner should be able to edit a crop', async () => {
          let newCrop = { ...crop, ...mocks.fakeCrop() };
          const res = await putCropRequest(newCrop, {});
          expect(res.status).toBe(200);
          const cropRes = await cropModel.query().where('crop_id', crop.crop_id).first();
          expect(cropRes.crop_genus).toBe(newCrop.crop_genus);
        });

        test('Should return 403 if user tries to edit a seeded crop', async () => {
          let newCrop = { ...seededCrop, ...mocks.fakeCrop() };
          const res = await putCropRequest(newCrop, {});
          expect(res.status).toBe(403);
        });

        describe('Put crop authorization tests', () => {
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

          test('Manager should be able to edit a crop', async () => {
            let newCrop = { ...crop, ...mocks.fakeCrop() };
            const res = await putCropRequest(newCrop, { user_id: manager.user_id });
            expect(res.status).toBe(200);
            const cropRes = await cropModel.query().where('crop_id', crop.crop_id).first();
            expect(cropRes.crop_genus).toBe(newCrop.crop_genus);
          });

          test('should return 403 when a worker tries to edit crop', async () => {
            let newCrop = { ...crop, ...mocks.fakeCrop() };
            const res = await putCropRequest(newCrop, { user_id: worker.user_id });
            expect(res.status).toBe(403);
            const cropRes = await cropModel.query().where('crop_id', crop.crop_id).first();
            expect(cropRes.crop_genus).toBe(crop.crop_genus);
          });

          test('should return 403 when an unauthorized tries to edit crop', async () => {
            let newCrop = { ...crop, ...mocks.fakeCrop() };
            const res = await putCropRequest(newCrop, { user_id: unAuthorizedUser.user_id });
            expect(res.status).toBe(403);
            const cropRes = await cropModel.query().where('crop_id', crop.crop_id).first();
            expect(cropRes.crop_genus).toBe(crop.crop_genus);
          });

          test('Circumvent authorization by modifying farm_id', async () => {
            let newCrop = { ...crop, ...mocks.fakeCrop() };

            const res = await putCropRequest(newCrop, {
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
            });

            expect(res.status).toBe(403);
            const cropRes = await cropModel.query().where('crop_id', crop.crop_id).first();
            expect(cropRes.crop_genus).toBe(crop.crop_genus);
          });
        });
      });
    });
  });

  describe('Post crop', () => {
    test('should return 400 status if crop is posted w/o crop_common_name', async () => {
      let crop = fakeCrop();
      delete crop.crop_common_name;
      const res = await postCropRequest(crop, {});
      expect(res.status).toBe(400);
      expect(JSON.parse(res.error.text).error.data.crop_common_name[0].keyword).toBe('required');
    });

    test('should return 403 status if headers.farm_id is set to null', async () => {
      let crop = fakeCrop();
      crop.farm_id = null;
      const res = await postCropRequest(crop, {});
      expect(res.status).toBe(403);
    });

    test('should post and get a valid crop', async () => {
      let crop = fakeCrop();
      crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
      const res = await postCropRequest(crop, {});
      expect(res.status).toBe(201);
      const crops = await cropModel.query().where('farm_id', farm.farm_id);
      expect(crops.length).toBe(1);
      expect(crops[0].crop_common_name).toBe(crop.crop_common_name);
    });

    describe('crop_common_name + genus + species uniqueness tests', function () {
      test('should return 400 status if crop is posted w/o variety name', async () => {
        let crop = fakeCrop();
        crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
        [crop] = await mocks.cropFactory({ promisedFarm: [farm], createdUser: [newOwner] }, crop);
        const res = await postCropRequest(crop, {});
        expect(res.status).toBe(400);
      });

      test('should post a crop and its variety', async () => {
        let crop = fakeCrop();
        crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
        const [crop1] = await mocks.cropFactory(
          { promisedFarm: [farm], createdUser: [newOwner] },
          crop,
        );
        crop.crop_common_name += ' - 1';
        const res = await postCropRequest(crop, {});
        expect(res.status).toBe(201);
        const crops = await cropModel.query().where('farm_id', farm.farm_id);
        expect(crops.length).toBe(2);
        expect(crops[0].crop_common_name).toBe(crop1.crop_common_name);
        expect(crops[1].crop_common_name).toBe(crop.crop_common_name);
      });
    });

    describe('Post crop authorization', () => {
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

      test('owner should return 403 status if crop is posted by unauthorized user', async () => {
        let crop = fakeCrop();
        crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
        const res = await postCropRequest(crop, { user_id: unAuthorizedUser.user_id });
        expect(res.status).toBe(403);
        expect(res.error.text).toBe('User does not have the following permission(s): add:crops');
      });

      test('should return 403 status if crop is posted by newWorker', async () => {
        let crop = fakeCrop();
        crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
        const res = await postCropRequest(crop, { user_id: worker.user_id });
        expect(res.status).toBe(403);
        expect(res.error.text).toBe('User does not have the following permission(s): add:crops');
      });

      test('manager should post and get a valid crop', async () => {
        let crop = fakeCrop();
        crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
        const res = await postCropRequest(crop, { user_id: manager.user_id });
        expect(res.status).toBe(201);
        const crops = await cropModel.query().where('farm_id', farm.farm_id);
        expect(crops.length).toBe(1);
        expect(crops[0].crop_common_name).toBe(crop.crop_common_name);
      });

      test('Circumvent authorization by modify farm_id', async () => {
        let crop = fakeCrop();
        crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;

        const res = await postCropRequest(crop, {
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id,
        });

        expect(res.status).toBe(403);
        expect(res.error.text).toBe('user not authorized to access farm');
      });
    });
  });
});
