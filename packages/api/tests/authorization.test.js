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
import moment from 'moment';
chai.use(chaiHttp);
import server from './../src/server.js';
import knex from '../src/util/knex.js';
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    console.log('Mocked!');
    console.log(req.get('user_id'));
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';
import { tableCleanup } from './testEnvironment.js';
import cropModel from '../src/models/cropModel.js';
import pesiticideModel from '../src/models/pesiticideModel.js';

xdescribe('Authorization Tests', () => {
  let middleware;
  let newOwner;
  let farm;
  let token;

  beforeAll(() => {
    token = global.token;
  });

  function postRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    return chai
      .request(server)
      .post(`/pesticide`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function getRequest({
    user_id = newOwner.user_id,
    farm_id = farm.farm_id,
    header_farm_id = farm.farm_id,
  }) {
    return chai
      .request(server)
      .get(`/pesticide/farm/${header_farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  function deleteRequest({
    user_id = newOwner.user_id,
    farm_id = farm.farm_id,
    pesticide_id,
    data = {},
  }) {
    return chai
      .request(server)
      .delete(`/pesticide/${pesticide_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
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

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  function getFakePesticide(farm_id = farm.farm_id) {
    const pesticide = mocks.fakePesticide();
    return { ...pesticide, farm_id };
  }

  function getFakeField(farm_id = farm.farm_id) {
    const field = mocks.fakeFieldForTests();
    return { ...field, farm_id };
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

  describe('userFarm status validations', () => {
    let pesticide;
    beforeEach(async () => {
      [pesticide] = await mocks.pesticideFactory({ promisedFarm: [farm] });
    });
    test('Invited user should not delete a pesticide', async () => {
      const [invitedManager] = await mocks.usersFactory();
      const [managerFarm] = await mocks.userFarmFactory(
        {
          promisedUser: [invitedManager],
          promisedFarm: [farm],
        },
        { ...fakeUserFarm(2), status: 'Invited' },
      );
      const res = await deleteRequest({
        user_id: invitedManager.user_id,
        pesticide_id: pesticide.pesticide_id,
      });
      expect(res.status).toBe(403);
    });

    test('Inactive user should not delete a pesticide', async () => {
      const [invitedManager] = await mocks.usersFactory();
      const [managerFarm] = await mocks.userFarmFactory(
        {
          promisedUser: [invitedManager],
          promisedFarm: [farm],
        },
        { ...fakeUserFarm(2), status: 'Inactive' },
      );
      const res = await deleteRequest({
        user_id: invitedManager.user_id,
        pesticide_id: pesticide.pesticide_id,
      });
      expect(res.status).toBe(403);
    });
  });

  describe('Get && delete circumventions', () => {
    let pesticide;
    beforeEach(async () => {
      [pesticide] = await mocks.pesticideFactory({ promisedFarm: [farm] });
    });

    describe('Delete fertlizer', function () {
      describe('Delete fertlizer authorization tests', () => {
        let newWorker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
          [newWorker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory(
            {
              promisedUser: [newWorker],
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

        test('Owner should delete a fertlizer', async () => {
          const res = await deleteRequest({ pesticide_id: pesticide.pesticide_id });
          expect(res.status).toBe(200);
          const pesticideRes = await pesiticideModel
            .query()
            .context({ showHidden: true })
            .where('pesticide_id', pesticide.pesticide_id);
          expect(pesticideRes.length).toBe(1);
          expect(pesticideRes[0].deleted).toBe(true);
        });

        test('Manager should delete a pesticide', async () => {
          const res = await deleteRequest({
            user_id: manager.user_id,
            pesticide_id: pesticide.pesticide_id,
          });
          expect(res.status).toBe(200);
          const pesticideRes = await pesiticideModel
            .query()
            .context({ showHidden: true })
            .where('pesticide_id', pesticide.pesticide_id);
          expect(pesticideRes.length).toBe(1);
          expect(pesticideRes[0].deleted).toBe(true);
        });

        test('should return 403 if an unauthorized user tries to delete a pesticide', async () => {
          const res = await deleteRequest({
            user_id: unAuthorizedUser.user_id,
            pesticide_id: pesticide.pesticide_id,
          });

          expect(res.status).toBe(403);
        });

        test('should return 403 if a worker tries to delete a pesticide', async () => {
          const res = await deleteRequest({
            user_id: newWorker.user_id,
            pesticide_id: pesticide.pesticide_id,
          });
          expect(res.status).toBe(403);
        });

        describe('Circumventions', () => {
          test('Circumvent authorization by modifying farm_id', async () => {
            const res = await deleteRequest({
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              pesticide_id: pesticide.pesticide_id,
            });

            expect(res.status).toBe(403);
          });

          test('Circumvent authorization by modifying farm_id in body', async () => {
            const res = await deleteRequest({
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              pesticide_id: pesticide.pesticide_id,
              data: { farm_id: farmunAuthorizedUser.farm_id },
            });

            expect(res.status).toBe(400);
          });

          test('Circumvent authorization by modifying field_id in body', async () => {
            const [fieldunauthorizaed] = await mocks.fieldFactory({
              promisedFarm: [farmunAuthorizedUser],
            });

            const res = await deleteRequest({
              user_id: unAuthorizedUser.user_id,
              farm_id: farmunAuthorizedUser.farm_id,
              pesticide_id: pesticide.pesticide_id,
              data: {
                field_id: fieldunauthorizaed.field_id,
                farm_id: farmunAuthorizedUser.farm_id,
              },
            });

            expect(res.status).toBe(400);
          });
        });
      });
    });
  });

  describe('Post circumventions', () => {
    let fakepesticide;

    beforeEach(async () => {
      fakepesticide = getFakePesticide();
    });

    describe('Post pesticide authorization tests', () => {
      let newWorker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async () => {
        [newWorker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [newWorker],
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

      test('Owner should post and get a valid crop', async () => {
        const res = await postRequest(fakepesticide, {});
        expect(res.status).toBe(201);
        const pesticides = await pesiticideModel
          .query()
          .context({ showHidden: true })
          .where('farm_id', farm.farm_id);
        expect(pesticides.length).toBe(1);
        expect(pesticides[0].pesticide_name).toBe(fakepesticide.pesticide_name);
      });

      test('Manager should post and get a valid crop', async () => {
        const res = await postRequest(fakepesticide, { user_id: manager.user_id });
        expect(res.status).toBe(201);
        const pesticides = await pesiticideModel
          .query()
          .context({ showHidden: true })
          .where('farm_id', farm.farm_id);
        expect(pesticides.length).toBe(1);
        expect(pesticides[0].pesticide_name).toBe(fakepesticide.pesticide_name);
      });

      test('should return 403 status if pesticide is posted by worker', async () => {
        const res = await postRequest(fakepesticide, { user_id: newWorker.user_id });
        expect(res.status).toBe(403);
        expect(res.error.text).toBe(
          'User does not have the following permission(s): add:pesticides',
        );
      });

      test('should return 403 status if pesticide is posted by unauthorized user', async () => {
        const res = await postRequest(fakepesticide, { user_id: unAuthorizedUser.user_id });
        expect(res.status).toBe(403);
        expect(res.error.text).toBe(
          'User does not have the following permission(s): add:pesticides',
        );
      });

      describe('Circumventions', () => {
        test('Circumvent authorization by adding farm_id to req.body', async () => {
          const res = await postRequest(fakepesticide, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          });

          expect(res.status).toBe(403);
        });

        test('Circumvent authorization by adding field_id to req.body', async () => {
          const [fieldunauthorizaed] = await mocks.fieldFactory({
            promisedFarm: [farmunAuthorizedUser],
          });

          const res = await postRequest(
            { ...fakepesticide, field_id: fieldunauthorizaed.field_id },
            { user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id },
          );

          expect(res.status).toBe(403);
        });
      });
    });
  });

  //TODO unauthorized user post a farm by editing the farm_id of a pesticide owned by unauthorized owner
  describe('Put Circumventions', () => {
    let crop;
    beforeEach(async () => {
      [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
    });

    describe('Put crop authorization tests', () => {
      let newWorker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async () => {
        [newWorker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory(
          {
            promisedUser: [newWorker],
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

      test('Owner should be able to edit a crop', async () => {
        let newCrop = { ...crop, ...mocks.fakeCrop() };
        const res = await putCropRequest(newCrop, {});
        expect(res.status).toBe(200);
        const cropRes = await cropModel
          .query()
          .context({ showHidden: true })
          .where('crop_id', crop.crop_id)
          .first();
        expect(cropRes.crop_genus).toBe(newCrop.crop_genus);
      });

      test('Manager should be able to edit a crop', async () => {
        let newCrop = { ...crop, ...mocks.fakeCrop() };
        const res = await putCropRequest(newCrop, { user_id: manager.user_id });
        expect(res.status).toBe(200);
        const cropRes = await cropModel
          .query()
          .context({ showHidden: true })
          .where('crop_id', crop.crop_id)
          .first();
        expect(cropRes.crop_genus).toBe(newCrop.crop_genus);
      });

      test('should return 403 when a worker tries to edit crop', async () => {
        let newCrop = { ...crop, ...mocks.fakeCrop() };
        const res = await putCropRequest(newCrop, { user_id: newWorker.user_id });
        expect(res.status).toBe(403);
        const cropRes = await cropModel
          .query()
          .context({ showHidden: true })
          .where('crop_id', crop.crop_id)
          .first();
        expect(cropRes.crop_genus).toBe(crop.crop_genus);
      });

      test('should return 403 when an unauthorized tries to edit crop', async () => {
        let newCrop = { ...crop, ...mocks.fakeCrop() };
        const res = await putCropRequest(newCrop, { user_id: unAuthorizedUser.user_id });
        expect(res.status).toBe(403);
        const cropRes = await cropModel
          .query()
          .context({ showHidden: true })
          .where('crop_id', crop.crop_id)
          .first();
        expect(cropRes.crop_genus).toBe(crop.crop_genus);
      });

      describe('circumventions', () => {
        test('Circumvent authorization by modifying farm_id', async () => {
          let newCrop = { ...crop, ...mocks.fakeCrop() };

          const res = await putCropRequest(newCrop, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          });

          expect(res.status).toBe(403);
          const cropRes = await cropModel
            .query()
            .context({ showHidden: true })
            .where('crop_id', crop.crop_id)
            .first();
          expect(cropRes.crop_genus).toBe(crop.crop_genus);
        });

        test('Unauthorized users should not edit a crop by change farm_id in req.body', async () => {
          let newCrop = { ...crop, ...mocks.fakeCrop(), farm_id: farmunAuthorizedUser.farm_id };

          const res = await putCropRequest(newCrop, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          });

          expect(res.status).toBe(403);
          const cropRes = await cropModel
            .query()
            .context({ showHidden: true })
            .where('crop_id', newCrop.crop_id)
            .first();
          expect(cropRes.farm_id).toBe(crop.farm_id);
        });

        // TODO: set crop.farm_id as immutable
        xtest('Unauthorized user post crop to farm they do not have access to', async () => {
          let [cropUnauthorizedUser] = await mocks.cropFactory({
            promisedFarm: [farmunAuthorizedUser],
          });
          let newCrop = { ...cropUnauthorizedUser, ...mocks.fakeCrop(), farm_id: farm.farm_id };

          const res = await putCropRequest(newCrop, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id,
          });

          // expect(res.status).toBe(403);
          const cropRes = await cropModel
            .query()
            .context({ showHidden: true })
            .where('crop_id', cropUnauthorizedUser.crop_id)
            .first();
          expect(cropRes.farm_id).toBe(cropUnauthorizedUser.farm_id);
        });
      });
    });
  });
});
