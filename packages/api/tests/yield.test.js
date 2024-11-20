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
import { tableCleanup } from './testEnvironment.js';
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
jest.mock('../src/jobs/station_sync/mapping');
import mocks from './mock.factories.js';
import yieldModel from '../src/models/yieldModel.js';

describe('Yield Tests', () => {
  let token;
  let farm;
  let newOwner;
  let crop;

  beforeAll(() => {
    token = global.token;
  });

  function postYieldRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    return chai
      .request(server)
      .post('/yield')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  function putYieldRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    const { yield_id } = data;

    return chai
      .request(server)
      .put(`/yield/${yield_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data);
  }

  function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    return chai
      .request(server)
      .get(`/yield/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  function deleteRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    const { yield_id } = data;

    return chai
      .request(server)
      .delete(`/yield/${yield_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  async function returnUserFarms(role) {
    const [mainFarm] = await mocks.farmFactory();
    const [user] = await mocks.usersFactory();
    const [userFarm] = await mocks.userFarmFactory(
      {
        promisedUser: [user],
        promisedFarm: [mainFarm],
      },
      fakeUserFarm(role),
    );
    return { mainFarm, user };
  }

  function getFakeYield(crop_id, farm_id) {
    const cropYield = mocks.fakeYield();
    return { ...cropYield, crop_id, farm_id };
  }

  async function returnYield(mainFarm) {
    const [crop] = await mocks.cropFactory({ promisedFarm: [mainFarm] });
    const [crop_yield] = await mocks.yieldFactory({ promisedCrop: [crop] });
    return { crop_yield };
  }

  async function returnCrop(mainFarm) {
    const [crop] = await mocks.cropFactory({ promisedFarm: [mainFarm] });
    return { crop };
  }

  beforeEach(async () => {
    [farm] = await mocks.farmFactory();
    [newOwner] = await mocks.usersFactory();
    [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  // POST TESTS

  describe('Post yield tests', () => {
    test('Owner should post yield', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { crop } = await returnCrop(mainFarm);
      const cropYield = getFakeYield(crop.crop_id, mainFarm.farm_id);

      const res = await postYieldRequest(cropYield, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(201);
      const yields = await yieldModel.query().where('farm_id', mainFarm.farm_id);
      expect(yields.length).toBe(1);
      expect(yields[0].yield_id).toBe(cropYield.yield_id);
    });

    test('Manager should post yield', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const { crop } = await returnCrop(mainFarm);
      const cropYield = getFakeYield(crop.crop_id, mainFarm.farm_id);

      const res = await postYieldRequest(cropYield, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(201);
      const yields = await yieldModel.query().where('farm_id', mainFarm.farm_id);
      expect(yields.length).toBe(1);
      expect(yields[0].yield_id).toBe(cropYield.yield_id);
    });

    test('Should return 403 when worker tries to post yield', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const { crop } = await returnCrop(mainFarm);
      const cropYield = getFakeYield(crop.crop_id, mainFarm.farm_id);

      const res = await postYieldRequest(cropYield, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe('User does not have the following permission(s): add:yields');
    });

    test('Should return 403 when unauthorized user tries to post yield', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { cropYield } = await returnYield(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await postYieldRequest(cropYield, {
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe('user not authorized to access farm');
    });
  });

  // PUT TESTS
  describe('Put yield tests', () => {
    test('Owner should update quantity_kg/m2', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { crop_yield } = await returnYield(mainFarm);

      crop_yield['quantity_kg/m2'] = 8;
      const res = await putYieldRequest(crop_yield, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(200);
      expect(res.body[0]['quantity_kg/m2']).toBe(8);
    });

    test('Manager should update quantity_kg/m2', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const { crop_yield } = await returnYield(mainFarm);

      crop_yield['quantity_kg/m2'] = 22;
      const res = await putYieldRequest(crop_yield, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(200);
      expect(res.body[0]['quantity_kg/m2']).toBe(22);
    });

    test('Should return 403 when a worker tries to edit quantity_kg/m2', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const { crop_yield } = await returnYield(mainFarm);

      crop_yield['quantity_kg/m2'] = 4;
      const res = await putYieldRequest(crop_yield, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe('User does not have the following permission(s): edit:yields');
    });

    test('Should return 403 when a unauthorized user tries to edit quantity_kg/m2', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { crop_yield } = await returnYield(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      crop_yield['quantity_kg/m2'] = 4;
      const res = await putYieldRequest(crop_yield, { user_id: unAuthorizedUser.user_id });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe('user not authorized to access farm');
    });
  });

  // GET TESTS

  describe('Get yield tests', () => {
    test('Owner should get yield by farm id', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { crop_yield } = await returnYield(mainFarm);

      const res = await getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(crop_yield.farm_id);
    });

    test('Manager should get yield by farm id', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const { crop_yield } = await returnYield(mainFarm);

      const res = await getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(crop_yield.farm_id);
    });

    test('Worker should get yield by farm id', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const { crop_yield } = await returnYield(mainFarm);

      const res = await getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(crop_yield.farm_id);
    });

    test('Should get status 403 if an unauthorizedUser tries to get yield by farm id', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [unAuthorizedUser] = await mocks.usersFactory();
      const res = await getRequest({
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe('User does not have the following permission(s): get:yields');
    });
  });

  // DELETE TESTS

  describe('Delete yield tests', () => {
    test('Owner should delete their yield', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { crop_yield } = await returnYield(mainFarm);

      const res = await deleteRequest(crop_yield, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(200);
      const [deletedField] = await yieldModel.query().where('yield_id', crop_yield.yield_id);
      expect(deletedField.deleted).toBe(true);
    });

    test('Manager should delete their yield', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const { crop_yield } = await returnYield(mainFarm);

      const res = await deleteRequest(crop_yield, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(200);
      const [deletedField] = await yieldModel.query().where('yield_id', crop_yield.yield_id);
      expect(deletedField.deleted).toBe(true);
    });

    test('Should return 403 if a worker tries to delete a yield', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const { crop_yield } = await returnYield(mainFarm);

      const res = await deleteRequest(crop_yield, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe('User does not have the following permission(s): delete:yields');
    });

    test('Should get status 403 if an unauthorizedUser tries to delete yield', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { crop_yield } = await returnYield(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await deleteRequest(crop_yield, {
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe('User does not have the following permission(s): delete:yields');
    });
  });
});
