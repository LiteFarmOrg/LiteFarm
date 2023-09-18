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
import util from 'util';

import chaiHttp from 'chai-http';
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
jest.mock('../src/jobs/station_sync/mapping.js');
import mocks from './mock.factories.js';
import revenueTypeModel from '../src/models/revenueTypeModel.js';

describe('Revenue Type Tests', () => {
  let token;
  let farm;
  let farm1;
  let newOwner;

  beforeAll(() => {
    token = global.token;
  });

  // FUNCTIONS

  function postRevenueTypeRequest(
    data,
    { user_id = newOwner.user_id, farm_id = farm.farm_id },
    callback,
  ) {
    chai
      .request(server)
      .post(`/revenue_type`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }
  const postRevenueTypeRequestAsPromise = util.promisify(postRevenueTypeRequest);

  function patchRevenueTypeRequest(
    data,
    { user_id = newOwner.user_id, farm_id = farm.farm_id },
    callback,
  ) {
    chai
      .request(server)
      .patch(`/revenue_type/${data.revenue_type_id}`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }
  const patchRevenueTypeRequestAsPromise = util.promisify(patchRevenueTypeRequest);

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .get(`/revenue_type`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }
  const getRequestAsPromise = util.promisify(getRequest);

  function deleteRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    const { revenue_type_id } = data;
    chai
      .request(server)
      .delete(`/revenue_type/${revenue_type_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }
  const deleteRequestAsPromise = util.promisify(deleteRequest);

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

  async function returnRevenueType(mainFarm) {
    const [revenue_type] = await mocks.revenue_typeFactory({ promisedFarm: [mainFarm] });
    return { revenue_type };
  }

  async function returnDefaultRevenueType() {
    const defaultFarm = mocks.farmFactory();
    defaultFarm.farm_id = null;
    const [revenue_type] = await mocks.revenue_typeFactory({ promisedFarm: [defaultFarm] });
    return { revenue_type };
  }

  function getFakeRevenueType(farm_id) {
    const revenue = mocks.fakeRevenueType();
    return { ...revenue, farm_id };
  }

  beforeEach(async () => {
    [farm] = await mocks.farmFactory();
    [farm1] = await mocks.farmFactory();
    [newOwner] = await mocks.usersFactory();
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  // POST TESTS
  describe('Post revenue type tests', () => {
    test('Owner should post revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const revenue_type = getFakeRevenueType(mainFarm.farm_id);

      const res = await postRevenueTypeRequestAsPromise(revenue_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(201);
      const revenue_types = await revenueTypeModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', mainFarm.farm_id);
      expect(revenue_types.length).toBe(1);
      expect(revenue_types[0].value).toBe(revenue_type.value);
    });

    test('Manager should post revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const revenue_type = getFakeRevenueType(mainFarm.farm_id);

      const res = await postRevenueTypeRequestAsPromise(revenue_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(201);
      const revenue_types = await revenueTypeModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', mainFarm.farm_id);
      expect(revenue_types.length).toBe(1);
      expect(revenue_types[0].value).toBe(revenue_type.value);
    });

    test('Worker should get 403 if they try to post revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const revenue_type = getFakeRevenueType(mainFarm.farm_id);

      const res = await postRevenueTypeRequestAsPromise(revenue_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): add:revenue_types',
      );
    });

    test('Unauthorized user should get 403 if they try to post revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const revenue_type = getFakeRevenueType(mainFarm.farm_id);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await postRevenueTypeRequestAsPromise(revenue_type, {
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): add:revenue_types',
      );
    });
  });

  // GET TESTS
  describe('Get revenue type tests', () => {
    test('Owner should get revenue type by farm id (or null)', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const revenue = await returnRevenueType(mainFarm);

      const res = await getRequestAsPromise({ user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(revenue.revenue_type.farm_id);
    });

    test('manager should get revenue type by farm id (or null)', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const revenue = await returnRevenueType(mainFarm);

      const res = await getRequestAsPromise({ user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(revenue.revenue_type.farm_id);
    });

    test('Worker should get revenue type by farm id (or null)', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const revenue = await returnRevenueType(mainFarm);

      const res = await getRequestAsPromise({ user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(revenue.revenue_type.farm_id);
    });

    test('Unauthorized user should get 403 if they try to get revenue type by farm id (or null)', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const revenue = await returnRevenueType(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await getRequestAsPromise({
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): get:revenue_types',
      );
    });
  });

  // DELETE DEFAULT TEST
  describe('Delete revenue type default tests', () => {
    test('Owner should get 403 if they try to delete default revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const revenue = await returnDefaultRevenueType();
      const res = await deleteRequestAsPromise(revenue.revenue_type, { user_id: revenue.user_id });
      expect(res.status).toBe(403);
    });

    test('manager should get 403 if they try to delete default revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const revenue = await returnDefaultRevenueType();

      const res = await deleteRequestAsPromise(revenue.revenue_type, { user_id: user.user_id });
      expect(res.status).toBe(403);
    });

    test('Worker should get 403 if they try to delete default revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const revenue = await returnDefaultRevenueType();

      const res = await deleteRequestAsPromise(revenue.revenue_type, { user_id: user.user_id });
      expect(res.status).toBe(403);
    });

    test('unauthorized user should get 403 if they try to delete default revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const revenue = await returnDefaultRevenueType();
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await deleteRequestAsPromise(revenue.revenue_type, {
        user_id: unAuthorizedUser.user_id,
      });
      expect(res.status).toBe(403);
    });
  });

  // DELETE TESTS
  describe('Delete revenue type tests', () => {
    test('Owner should delete their revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const revenue = await returnRevenueType(mainFarm);

      const res = await deleteRequestAsPromise(revenue.revenue_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(200);
      const [deletedField] = await revenueTypeModel
        .query()
        .context({ showHidden: true })
        .where('revenue_type_id', revenue.revenue_type.revenue_type_id);
      expect(deletedField.deleted).toBe(true);
    });

    test('manager should delete their revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const revenue = await returnRevenueType(mainFarm);

      const res = await deleteRequestAsPromise(revenue.revenue_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(200);
      const [deletedField] = await revenueTypeModel
        .query()
        .context({ showHidden: true })
        .where('revenue_type_id', revenue.revenue_type.revenue_type_id);
      expect(deletedField.deleted).toBe(true);
    });

    test('worker should get 403 if they try to delete their revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const revenue = await returnRevenueType(mainFarm);

      const res = await deleteRequestAsPromise(revenue.revenue_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): delete:revenue_types',
      );
    });

    test('Unauthorized user should delete get 403 if they try to delete their revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [unAuthorizedUser] = await mocks.usersFactory();
      const revenue = await returnRevenueType(mainFarm);

      const res = await deleteRequestAsPromise(revenue.revenue_type, {
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): delete:revenue_types',
      );
    });
  });

  // Update revenue type
  describe('Update revenue type tests', () => {
    test('Owner should update revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const revenue = await returnRevenueType(mainFarm);

      const res = await patchRevenueTypeRequestAsPromise(revenue.revenue_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(204);
      const revenue_types = await revenueTypeModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', mainFarm.farm_id);
      expect(revenue_types.length).toBe(1);
      expect(revenue_types[0].value).toBe(revenue.revenue_type.value);
    });

    test('Manager should update revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const revenue = await returnRevenueType(mainFarm);

      const res = await patchRevenueTypeRequestAsPromise(revenue.revenue_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(204);
      const revenue_types = await revenueTypeModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', mainFarm.farm_id);
      expect(revenue_types.length).toBe(1);
      expect(revenue_types[0].value).toBe(revenue.revenue_type.value);
    });

    test('Worker should get 403 if they try to update revenue type', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const revenue = await returnRevenueType(mainFarm);

      const res = await patchRevenueTypeRequestAsPromise(revenue.revenue_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): edit:revenue_types',
      );
    });

    test('Unauthorized user should get 403 if they try to update revenue type', async () => {
      const { mainFarm } = await returnUserFarms(3);
      const revenue = await returnRevenueType(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await patchRevenueTypeRequestAsPromise(revenue.revenue_type, {
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): edit:revenue_types',
      );
    });
  });
});
