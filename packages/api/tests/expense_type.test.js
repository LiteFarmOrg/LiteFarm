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
import farmExpenseTypeModel from '../src/models/expenseTypeModel.js';

describe('Expense Type Tests', () => {
  let token;
  let farm;
  let farm1;
  let newOwner;

  beforeAll(() => {
    token = global.token;
  });

  // FUNCTIONS

  function postExpenseTypeRequest(
    data,
    { user_id = newOwner.user_id, farm_id = farm.farm_id },
    callback,
  ) {
    chai
      .request(server)
      .post(`/expense_type`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }
  const postExpenseTypeRequestAsPromise = util.promisify(postExpenseTypeRequest);

  function patchExpenseTypeRequest(
    data,
    { user_id = newOwner.user_id, farm_id = farm.farm_id },
    callback,
  ) {
    chai
      .request(server)
      .patch(`/expense_type/${data.expense_type_id}`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }
  const patchExpenseTypeRequestAsPromise = util.promisify(patchExpenseTypeRequest);

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .get(`/expense_type/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }
  const getRequestAsPromise = util.promisify(getRequest);

  function getDefaultRequest({ user_id = newOwner.user_id, farm_id = farm1.farm_id }, callback) {
    chai
      .request(server)
      .get(`/expense_type`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      // .send(farm_id)
      .end(callback);
  }
  const getDefaultRequestAsPromise = util.promisify(getDefaultRequest);

  function deleteRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    const { expense_type_id } = data;
    chai
      .request(server)
      .delete(`/expense_type/${expense_type_id}`)
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

  async function returnExpenseType(mainFarm) {
    const [expense_type] = await mocks.farmExpenseTypeFactory({ promisedFarm: [mainFarm] });
    return { expense_type };
  }

  async function returnDefaultExpenseType() {
    const defaultFarm = mocks.farmFactory();
    defaultFarm.farm_id = null;
    const [expense_type] = await mocks.farmExpenseTypeFactory({ promisedFarm: [defaultFarm] });
    return { expense_type };
  }

  function getFakeExpenseType(farm_id) {
    const expense = mocks.fakeExpenseType();
    return { ...expense, farm_id };
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
  describe('Post expense type tests', () => {
    test('Owner should post expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const expense_type = getFakeExpenseType(mainFarm.farm_id);

      const res = await postExpenseTypeRequestAsPromise(expense_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(201);
      const expense_types = await farmExpenseTypeModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', mainFarm.farm_id);
      expect(expense_types.length).toBe(1);
      expect(expense_types[0].value).toBe(expense_type.value);
    });

    test('Manager should post expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const expense_type = getFakeExpenseType(mainFarm.farm_id);

      const res = await postExpenseTypeRequestAsPromise(expense_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(201);
      const expense_types = await farmExpenseTypeModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', mainFarm.farm_id);
      expect(expense_types.length).toBe(1);
      expect(expense_types[0].value).toBe(expense_type.value);
    });

    test('Worker should get 403 if they try to post expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const expense_type = getFakeExpenseType(mainFarm.farm_id);

      const res = await postExpenseTypeRequestAsPromise(expense_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): add:expense_types',
      );
    });

    test('Unauthorized user should get 403 if they try to post expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const expense_type = getFakeExpenseType(mainFarm.farm_id);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await postExpenseTypeRequestAsPromise(expense_type, {
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): add:expense_types',
      );
    });
  });

  // GET TESTS
  describe('Get expense type tests', () => {
    test('Owner should get expense type by farm id (or null)', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const expense = await returnExpenseType(mainFarm);

      const res = await getRequestAsPromise({ user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(expense.expense_type.farm_id);
    });

    test('manager should get expense type by farm id (or null)', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const expense = await returnExpenseType(mainFarm);

      const res = await getRequestAsPromise({ user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(expense.expense_type.farm_id);
    });

    test('Worker should get expense type by farm id (or null)', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const expense = await returnExpenseType(mainFarm);

      const res = await getRequestAsPromise({ user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(expense.expense_type.farm_id);
    });

    test('Unauthorized user should get 403 if they try to get expense type by farm id (or null)', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const expense = await returnExpenseType(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await getRequestAsPromise({
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): get:expense_types',
      );
    });
  });

  // GET DEFAULT TESTS
  describe('Get expense type default tests', () => {
    test('Owner should get default expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const expense = await returnDefaultExpenseType();

      const res = await getDefaultRequestAsPromise({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(expense.expense_type.farm_id);
    });

    test('manager should get default expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const expense = await returnDefaultExpenseType();

      const res = await getDefaultRequestAsPromise({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(expense.expense_type.farm_id);
    });

    test('worker should get default expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const expense = await returnDefaultExpenseType();

      const res = await getDefaultRequestAsPromise({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(expense.expense_type.farm_id);
    });
  });

  // DELETE DEFAULT TEST
  describe('Delete expense type default tests', () => {
    test('Owner should get 403 if they try to delete default expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const expense = await returnDefaultExpenseType();
      const res = await deleteRequestAsPromise(expense.expense_type, { user_id: expense.user_id });
      expect(res.status).toBe(403);
    });

    test('manager should get 403 if they try to delete default expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const expense = await returnDefaultExpenseType();

      const res = await deleteRequestAsPromise(expense.expense_type, { user_id: user.user_id });
      expect(res.status).toBe(403);
    });

    test('Worker should get 403 if they try to delete default expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const expense = await returnDefaultExpenseType();

      const res = await deleteRequestAsPromise(expense.expense_type, { user_id: user.user_id });
      expect(res.status).toBe(403);
    });

    test('unauthorized user should get 403 if they try to delete default expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const expense = await returnDefaultExpenseType();
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await deleteRequestAsPromise(expense.expense_type, {
        user_id: unAuthorizedUser.user_id,
      });
      expect(res.status).toBe(403);
    });
  });

  // DELETE TESTS
  describe('Delete expense type tests', () => {
    test('Owner should delete their expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const expense = await returnExpenseType(mainFarm);

      const res = await deleteRequestAsPromise(expense.expense_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(200);
      const [deletedField] = await farmExpenseTypeModel
        .query()
        .context({ showHidden: true })
        .where('expense_type_id', expense.expense_type.expense_type_id);
      expect(deletedField.deleted).toBe(true);
    });

    test('manager should delete their expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const expense = await returnExpenseType(mainFarm);

      const res = await deleteRequestAsPromise(expense.expense_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(200);
      const [deletedField] = await farmExpenseTypeModel
        .query()
        .context({ showHidden: true })
        .where('expense_type_id', expense.expense_type.expense_type_id);
      expect(deletedField.deleted).toBe(true);
    });

    test('worker should get 403 if they try to delete their expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const expense = await returnExpenseType(mainFarm);

      const res = await deleteRequestAsPromise(expense.expense_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): delete:expense_types',
      );
    });

    test('Unauthorized user should delete get 403 if they try to delete their expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [unAuthorizedUser] = await mocks.usersFactory();
      const expense = await returnExpenseType(mainFarm);

      const res = await deleteRequestAsPromise(expense.expense_type, {
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): delete:expense_types',
      );
    });
  });

  // Update expense type
  describe('Update expense type tests', () => {
    test('Owner should update expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const expense = await returnExpenseType(mainFarm);

      const res = await patchExpenseTypeRequestAsPromise(expense.expense_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(204);
      const expense_types = await farmExpenseTypeModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', mainFarm.farm_id);
      expect(expense_types.length).toBe(1);
      expect(expense_types[0].value).toBe(expense.expense_type.value);
    });

    test('Manager should update expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const expense = await returnExpenseType(mainFarm);

      const res = await patchExpenseTypeRequestAsPromise(expense.expense_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(204);
      const expense_types = await farmExpenseTypeModel
        .query()
        .context({ showHidden: true })
        .where('farm_id', mainFarm.farm_id);
      expect(expense_types.length).toBe(1);
      expect(expense_types[0].value).toBe(expense.expense_type.value);
    });

    test('Worker should get 403 if they try to update expense type', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const expense = await returnExpenseType(mainFarm);

      const res = await patchExpenseTypeRequestAsPromise(expense.expense_type, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): edit:expense_types',
      );
    });

    test('Unauthorized user should get 403 if they try to update expense type', async () => {
      const { mainFarm } = await returnUserFarms(3);
      const expense = await returnExpenseType(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await patchExpenseTypeRequestAsPromise(expense.expense_type, {
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): edit:expense_types',
      );
    });
  });
});
