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
import { tableCleanup } from './testEnvironment.js';
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
jest.mock('../src/jobs/station_sync/mapping.js');
import mocks from './mock.factories.js';
import farmExpenseModel from '../src/models/farmExpenseModel.js';
import farmExpenseCropVarietyModel from '../src/models/farmExpenseCropVarietyModel.js';
import farmExpenseAnimalModel from '../src/models/farmExpenseAnimalModel.js';

describe('Expense Tests', () => {
  let _token;
  let farm;
  let mainFarm;
  let owner;
  let expenseType;
  let cropVariety;
  let animal;
  let animalBatch;

  beforeAll(() => {
    _token = global.token;
  });

  // FUNCTIONS

  function postExpenseRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    const chain = chai
      .request(server)
      .post(`/expense/farm/${farm_id}`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
    return callback ? chain.end(callback) : chain;
  }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  function getRequest({ user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    const chain = chai
      .request(server)
      .get(`/expense/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id);
    return callback ? chain.end(callback) : chain;
  }

  function deleteRequest(
    farm_expense_id,
    { user_id = owner.user_id, farm_id = farm.farm_id },
    callback,
  ) {
    chai
      .request(server)
      .delete(`/expense/${farm_expense_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function patchRequest(
    data,
    farm_expense_id,
    { user_id = owner.user_id, farm_id = farm.farm_id },
    callback,
  ) {
    const chain = chai
      .request(server)
      .patch(`/expense/${farm_expense_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
    return callback ? chain.end(callback) : chain;
  }

  async function returnUserFarms(role) {
    const [mainFarm] = await mocks.farmFactory();
    const [user] = await mocks.usersFactory();
    const [_userFarm] = await mocks.userFarmFactory(
      {
        promisedUser: [user],
        promisedFarm: [mainFarm],
      },
      fakeUserFarm(role),
    );
    return { mainFarm, user };
  }

  function getFakeExpense(expense_type_id, farm_id) {
    const expense = mocks.fakeExpense();
    return { ...expense, expense_type_id, farm_id };
  }

  async function returnExpenseType(mainFarm) {
    const [expense_type] = await mocks.farmExpenseTypeFactory({ promisedFarm: [mainFarm] });
    return { expense_type };
  }

  async function returnExpense(user, mainFarm) {
    const { farm_id } = mainFarm;
    const { user_id } = user;
    const [expense_type] = await mocks.farmExpenseTypeFactory({ promisedFarm: [{ farm_id }] });
    const [expense] = await mocks.farmExpenseFactory({
      promisedExpenseType: [expense_type],
      promisedUserFarm: [{ user_id, farm_id }],
    });
    return { expense };
  }

  function makeExpenseBody(overrides = {}) {
    return [
      {
        ...mocks.fakeExpense({
          expense_type_id: expenseType.expense_type_id,
          farm_id: farm.farm_id,
        }),
        ...overrides,
      },
    ];
  }

  beforeEach(async () => {
    ({ mainFarm, user: owner } = await returnUserFarms(1));
    farm = mainFarm;

    [expenseType] = await mocks.farmExpenseTypeFactory({ promisedFarm: [mainFarm] });
    const [crop] = await mocks.cropFactory({ promisedFarm: [mainFarm] });
    [cropVariety] = await mocks.crop_varietyFactory({
      promisedFarm: [mainFarm],
      promisedCrop: [crop],
    });
    [animal] = await mocks.animalFactory({ promisedFarm: [mainFarm] });
    [animalBatch] = await mocks.animal_batchFactory({ promisedFarm: [mainFarm] });
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  // POST TESTS

  describe('Post expense tests', () => {
    test('Owner should post expense', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { expense_type } = await returnExpenseType(mainFarm);
      const expense = getFakeExpense(expense_type.expense_type_id, mainFarm.farm_id);
      const expensesArray = [];
      expensesArray.push(expense);

      postExpenseRequest(
        expensesArray,
        { user_id: user.user_id, farm_id: mainFarm.farm_id },
        async (_err, res) => {
          expect(res.status).toBe(201);
          const expenses = await farmExpenseModel
            .query()
            .context({ showHidden: true })
            .where('farm_id', mainFarm.farm_id);
          expect(expenses.length).toBe(1);
          expect(expenses[0].value).toBe(expense.value);
        },
      );
    });

    test('Manager should post expense', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const { expense_type } = await returnExpenseType(mainFarm);
      const expense = getFakeExpense(expense_type.expense_type_id, mainFarm.farm_id);
      const expensesArray = [];
      expensesArray.push(expense);

      postExpenseRequest(
        expensesArray,
        { user_id: user.user_id, farm_id: mainFarm.farm_id },
        async (_err, res) => {
          expect(res.status).toBe(201);
          const expenses = await farmExpenseModel
            .query()
            .context({ showHidden: true })
            .where('farm_id', mainFarm.farm_id);
          expect(expenses.length).toBe(1);
          expect(expenses[0].value).toBe(expense.value);
        },
      );
    });

    test('Worker should post expense', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const { expense_type } = await returnExpenseType(mainFarm);
      const expense = getFakeExpense(expense_type.expense_type_id, mainFarm.farm_id);
      const expensesArray = [];
      expensesArray.push(expense);

      postExpenseRequest(
        expensesArray,
        { user_id: user.user_id, farm_id: mainFarm.farm_id },
        async (_err, res) => {
          expect(res.status).toBe(201);
          const expenses = await farmExpenseModel
            .query()
            .context({ showHidden: true })
            .where('farm_id', mainFarm.farm_id);
          expect(expenses.length).toBe(1);
          expect(expenses[0].value).toBe(expense.value);
        },
      );
    });

    test('farm_expense_animal array creates linked rows', async () => {
      const body = makeExpenseBody({
        farm_expense_animal: [mocks.fakeFarmExpenseAnimal({ animal_id: animal.id })],
      });

      const res = await postExpenseRequest(body, {
        user_id: owner.user_id,
        farm_id: farm.farm_id,
      });
      expect(res.status).toBe(201);
      const expenses = await farmExpenseModel.query().where('farm_id', farm.farm_id);
      expect(expenses.length).toBe(1);
      const animalRows = await farmExpenseAnimalModel
        .query()
        .where('farm_expense_id', expenses[0].farm_expense_id);
      expect(animalRows.length).toBe(1);
      expect(animalRows[0].animal_id).toBe(animal.id);
    });

    test('farm_expense_crop_variety array creates linked rows', async () => {
      const body = makeExpenseBody({
        farm_expense_crop_variety: [
          mocks.fakeFarmExpenseCropVariety({ crop_variety_id: cropVariety.crop_variety_id }),
        ],
      });

      const res = await postExpenseRequest(body, {
        user_id: owner.user_id,
        farm_id: farm.farm_id,
      });
      expect(res.status).toBe(201);
      const expenses = await farmExpenseModel.query().where('farm_id', farm.farm_id);
      expect(expenses.length).toBe(1);
      const cvRows = await farmExpenseCropVarietyModel
        .query()
        .where('farm_expense_id', expenses[0].farm_expense_id);
      expect(cvRows.length).toBe(1);
      expect(cvRows[0].crop_variety_id).toBe(cropVariety.crop_variety_id);
    });

    test('Returns 400 if expense has both non-empty farm_expense_animal and farm_expense_crop_variety', async () => {
      const body = makeExpenseBody({
        farm_expense_animal: [mocks.fakeFarmExpenseAnimal({ animal_id: animal.id })],
        farm_expense_crop_variety: [
          mocks.fakeFarmExpenseCropVariety({ crop_variety_id: cropVariety.crop_variety_id }),
        ],
      });
      const res = await postExpenseRequest(body, {
        user_id: owner.user_id,
        farm_id: farm.farm_id,
      });
      expect(res.status).toBe(400);
    });

    test('Returns 400 if farm_expense_animal item has both animal_id and animal_batch_id', async () => {
      const body = makeExpenseBody({
        farm_expense_animal: [
          mocks.fakeFarmExpenseAnimal({ animal_id: animal.id, animal_batch_id: animalBatch.id }),
        ],
      });
      const res = await postExpenseRequest(body, {
        user_id: owner.user_id,
        farm_id: farm.farm_id,
      });
      expect(res.status).toBe(400);
    });

    test('Returns 400 if farm_expense_animal item has neither animal_id nor animal_batch_id', async () => {
      const body = makeExpenseBody({
        farm_expense_animal: [mocks.fakeFarmExpenseAnimal()],
      });
      const res = await postExpenseRequest(body, {
        user_id: owner.user_id,
        farm_id: farm.farm_id,
      });
      expect(res.status).toBe(400);
    });

    test('Returns 400 if duplicate animal_id in farm_expense_animal', async () => {
      const body = makeExpenseBody({
        farm_expense_animal: [
          mocks.fakeFarmExpenseAnimal({ animal_id: animal.id }),
          mocks.fakeFarmExpenseAnimal({ animal_id: animal.id }),
        ],
      });
      const res = await postExpenseRequest(body, {
        user_id: owner.user_id,
        farm_id: farm.farm_id,
      });
      expect(res.status).toBe(400);
    });

    test('Returns 400 if animal_id does not belong to the farm', async () => {
      const [outsideAnimal] = await mocks.animalFactory();
      const body = makeExpenseBody({
        farm_expense_animal: [mocks.fakeFarmExpenseAnimal({ animal_id: outsideAnimal.id })],
      });
      const res = await postExpenseRequest(body, {
        user_id: owner.user_id,
        farm_id: farm.farm_id,
      });
      expect(res.status).toBe(400);
    });

    test('Returns 400 if crop_variety_id is missing from farm_expense_crop_variety item', async () => {
      const body = makeExpenseBody({
        farm_expense_crop_variety: [mocks.fakeFarmExpenseCropVariety()],
      });
      const res = await postExpenseRequest(body, {
        user_id: owner.user_id,
        farm_id: farm.farm_id,
      });
      expect(res.status).toBe(400);
    });

    test('Returns 400 if crop_variety_id does not belong to the farm', async () => {
      const [outsideCropVariety] = await mocks.crop_varietyFactory();
      const body = makeExpenseBody({
        farm_expense_crop_variety: [
          mocks.fakeFarmExpenseCropVariety({
            crop_variety_id: outsideCropVariety.crop_variety_id,
          }),
        ],
      });
      const res = await postExpenseRequest(body, {
        user_id: owner.user_id,
        farm_id: farm.farm_id,
      });
      expect(res.status).toBe(400);
    });

    test('Allows removed animals in allocations', async () => {
      const [removedAnimal] = await mocks.animalFactory({ promisedFarm: [farm] });
      const [animalRemovalReason] = await mocks.animal_removal_reasonFactory();
      await knex('animal').where('id', removedAnimal.id).update({
        removal_date: new Date().toISOString(),
        animal_removal_reason_id: animalRemovalReason.id,
      });

      const body = makeExpenseBody({
        farm_expense_animal: [mocks.fakeFarmExpenseAnimal({ animal_id: removedAnimal.id })],
      });
      const res = await postExpenseRequest(body, {
        user_id: owner.user_id,
        farm_id: farm.farm_id,
      });
      expect(res.status).toBe(201);
    });

    test('Should return 403 when unauthorized user tries to post expense', async () => {
      const { mainFarm, _user } = await returnUserFarms(1);
      const { expense_type } = await returnExpenseType(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();
      const expense = getFakeExpense(expense_type.expense_type_id, mainFarm.farm_id);
      const expensesArray = [];
      expensesArray.push(expense);

      postExpenseRequest(
        expensesArray,
        {
          user_id: unAuthorizedUser.user_id,
          farm_id: mainFarm.farm_id,
        },
        async (_err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe(
            'User does not have the following permission(s): add:expenses',
          );
        },
      );
    });
  });

  // GET TESTS

  describe('Get expense tests', () => {
    test('Owner should get expense by farm id', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { expense } = await returnExpense(user, mainFarm);

      getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id }, (_err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].farm_id).toBe(expense.farm_id);
      });
    });
    test('Manager should get expense by farm id', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const { expense } = await returnExpense(user, mainFarm);

      getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id }, (_err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].farm_id).toBe(expense.farm_id);
      });
    });
    test('ManWorkerager should get expense by farm id', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const { expense } = await returnExpense(user, mainFarm);

      getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id }, (_err, res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].farm_id).toBe(expense.farm_id);
      });
    });
    test('Should get status 403 if an unauthorizedUser tries to get expense by farm id', async () => {
      const { mainFarm, _user } = await returnUserFarms(1);
      const [unAuthorizedUser] = await mocks.usersFactory();
      getRequest({ user_id: unAuthorizedUser.user_id, farm_id: mainFarm.farm_id }, (_err, res) => {
        expect(res.status).toBe(403);
        expect(res.error.text).toBe('User does not have the following permission(s): get:expenses');
      });
    });

    test('Response includes farm_expense_animal when allocations exist', async () => {
      const [expense] = await mocks.farmExpenseFactory({
        promisedExpenseType: [expenseType],
        promisedUserFarm: [{ user_id: owner.user_id, farm_id: farm.farm_id }],
      });
      await mocks.farm_expense_animalFactory({
        promisedExpense: [expense],
        promisedAnimal: [animal],
      });

      const res = await getRequest({ user_id: owner.user_id, farm_id: farm.farm_id });
      expect(res.status).toBe(200);
      const found = res.body.find((e) => e.farm_expense_id === expense.farm_expense_id);
      expect(found).toBeDefined();
      expect(found.farm_expense_animal).toBeDefined();
      expect(found.farm_expense_animal.length).toBe(1);
      expect(found.farm_expense_animal[0].animal_id).toBe(animal.id);
    });

    test('Response includes farm_expense_crop_variety when allocations exist', async () => {
      const [expense] = await mocks.farmExpenseFactory({
        promisedExpenseType: [expenseType],
        promisedUserFarm: [{ user_id: owner.user_id, farm_id: farm.farm_id }],
      });
      await mocks.farm_expense_crop_varietyFactory({
        promisedExpense: [expense],
        promisedCropVariety: [cropVariety],
      });

      const res = await getRequest({ user_id: owner.user_id, farm_id: farm.farm_id });
      expect(res.status).toBe(200);
      const found = res.body.find((e) => e.farm_expense_id === expense.farm_expense_id);
      expect(found).toBeDefined();
      expect(found.farm_expense_crop_variety).toBeDefined();
      expect(found.farm_expense_crop_variety.length).toBe(1);
      expect(found.farm_expense_crop_variety[0].crop_variety_id).toBe(cropVariety.crop_variety_id);
    });
  });

  // DELETE TESTS

  describe('Delete expense tests', () => {
    test('Owner should delete their expense', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { expense } = await returnExpense(user, mainFarm);

      deleteRequest(
        expense.farm_expense_id,
        { user_id: user.user_id, farm_id: mainFarm.farm_id },
        async (_err, res) => {
          expect(res.status).toBe(200);
          const [deletedField] = await farmExpenseModel
            .query()
            .context({ showHidden: true })
            .where('farm_expense_id', expense.farm_expense_id);
          expect(deletedField.deleted).toBe(true);
        },
      );
    });
    test('Manager should delete their expense', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const { expense } = await returnExpense(user, mainFarm);

      deleteRequest(
        expense.farm_expense_id,
        { user_id: user.user_id, farm_id: mainFarm.farm_id },
        async (_err, res) => {
          expect(res.status).toBe(200);
          const [deletedField] = await farmExpenseModel
            .query()
            .context({ showHidden: true })
            .where('farm_expense_id', expense.farm_expense_id);
          expect(deletedField.deleted).toBe(true);
        },
      );
    });
    test('Worker should delete their own expense', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const { expense } = await returnExpense(user, mainFarm);

      deleteRequest(
        expense.farm_expense_id,
        { user_id: user.user_id, farm_id: mainFarm.farm_id },
        async (_err, res) => {
          expect(res.status).toBe(200);
          const [deletedField] = await farmExpenseModel
            .query()
            .context({ showHidden: true })
            .where('farm_expense_id', expense.farm_expense_id);
          expect(deletedField.deleted).toBe(true);
        },
      );
    });
    test("Worker should get 403 if they try to delete another user's expense", async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const [otherUser] = await mocks.usersFactory();
      const [_otherUserFarm] = await mocks.userFarmFactory(
        {
          promisedUser: [otherUser],
          promisedFarm: [mainFarm],
        },
        fakeUserFarm(1),
      );
      const { expense } = await returnExpense(otherUser, mainFarm);

      deleteRequest(
        expense.farm_expense_id,
        { user_id: user.user_id, farm_id: mainFarm.farm_id },
        async (_err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe('user not authorized to access record they did not create');
        },
      );
    });
    test('Unauthorized user should get 403 if they try to delete their expense', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [unAuthorizedUser] = await mocks.usersFactory();
      const { expense } = await returnExpense(user, mainFarm);

      deleteRequest(
        expense.farm_expense_id,
        {
          user_id: unAuthorizedUser.user_id,
          farm_id: mainFarm.farm_id,
        },
        async (_err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe(
            'User does not have the following permission(s): delete:expenses',
          );
        },
      );
    });
  });

  describe('Patch expense tests', () => {
    test('Owner should patch their expense', async () => {
      const { mainFarm, user: owner } = await returnUserFarms(1);
      const { expense } = await returnExpense(owner, mainFarm);

      const patchData = {
        value: expense.value + 5,
        note: 'patched in note',
      };

      patchRequest(
        patchData,
        expense.farm_expense_id,
        {
          user_id: owner.user_id,
          farm_id: mainFarm.farm_id,
        },
        async (_err, res) => {
          expect(res.status).toBe(200);
          const [updatedField] = await farmExpenseModel
            .query()
            .where('farm_expense_id', expense.farm_expense_id);
          expect(updatedField.value).toBe(patchData.value);
          expect(updatedField.note).toBe(patchData.note);
        },
      );
    });

    test("Owner should patch another user's expense", async () => {
      const { mainFarm, user: owner } = await returnUserFarms(1);
      const [otherUser] = await mocks.usersFactory();
      const [_otherUserFarm] = await mocks.userFarmFactory(
        {
          promisedUser: [otherUser],
          promisedFarm: [mainFarm],
        },
        fakeUserFarm(2),
      );
      const { expense } = await returnExpense(otherUser, mainFarm);

      const patchData = {
        value: expense.value + 5,
        note: 'patched in note',
      };

      patchRequest(
        patchData,
        expense.farm_expense_id,
        {
          user_id: owner.user_id,
          farm_id: mainFarm.farm_id,
        },
        async (_err, res) => {
          expect(res.status).toBe(200);
          const [updatedField] = await farmExpenseModel
            .query()
            .where('farm_expense_id', expense.farm_expense_id);
          expect(updatedField.value).toBe(patchData.value);
          expect(updatedField.note).toBe(patchData.note);
        },
      );
    });

    test('Manager should patch their expense', async () => {
      const { mainFarm, user: manager } = await returnUserFarms(2);
      const { expense } = await returnExpense(manager, mainFarm);

      const patchData = {
        value: expense.value + 5,
        note: 'patched in note',
      };

      patchRequest(
        patchData,
        expense.farm_expense_id,
        {
          user_id: manager.user_id,
          farm_id: mainFarm.farm_id,
        },
        async (_err, res) => {
          expect(res.status).toBe(200);
          const [updatedField] = await farmExpenseModel
            .query()
            .where('farm_expense_id', expense.farm_expense_id);
          expect(updatedField.value).toBe(patchData.value);
          expect(updatedField.note).toBe(patchData.note);
        },
      );
    });

    test("Manager should patch another user's expense", async () => {
      const { mainFarm, user: manager } = await returnUserFarms(2);
      const [otherUser] = await mocks.usersFactory();
      const [_otherUserFarm] = await mocks.userFarmFactory(
        {
          promisedUser: [otherUser],
          promisedFarm: [mainFarm],
        },
        fakeUserFarm(2),
      );
      const { expense } = await returnExpense(otherUser, mainFarm);

      const patchData = {
        value: expense.value + 5,
        note: 'patched in note',
      };

      patchRequest(
        patchData,
        expense.farm_expense_id,
        {
          user_id: manager.user_id,
          farm_id: mainFarm.farm_id,
        },
        async (_err, res) => {
          expect(res.status).toBe(200);
          const [updatedField] = await farmExpenseModel
            .query()
            .where('farm_expense_id', expense.farm_expense_id);
          expect(updatedField.value).toBe(patchData.value);
          expect(updatedField.note).toBe(patchData.note);
        },
      );
    });

    test('Worker should patch their own expense', async () => {
      const { mainFarm, user: worker } = await returnUserFarms(3);
      const { expense } = await returnExpense(worker, mainFarm);

      const patchData = {
        value: expense.value + 5,
        note: 'patched in note',
      };

      patchRequest(
        patchData,
        expense.farm_expense_id,
        {
          user_id: worker.user_id,
          farm_id: mainFarm.farm_id,
        },
        async (_err, res) => {
          expect(res.status).toBe(200);
          const [updatedField] = await farmExpenseModel
            .query()
            .where('farm_expense_id', expense.farm_expense_id);
          expect(updatedField.value).toBe(patchData.value);
          expect(updatedField.note).toBe(patchData.note);
        },
      );
    });

    test("Worker should get 403 if they try to patch another user's expense", async () => {
      const { mainFarm, user: worker } = await returnUserFarms(3);
      const [otherUser] = await mocks.usersFactory();
      const [_otherUserFarm] = await mocks.userFarmFactory(
        {
          promisedUser: [otherUser],
          promisedFarm: [mainFarm],
        },
        fakeUserFarm(3),
      );
      const { expense } = await returnExpense(otherUser, mainFarm);

      const patchData = {
        value: expense.value + 5,
        note: 'patched in note',
      };

      patchRequest(
        patchData,
        expense.farm_expense_id,
        {
          user_id: worker.user_id,
          farm_id: mainFarm.farm_id,
        },
        async (_err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe('user not authorized to access record they did not create');
        },
      );
    });

    test('Unauthorized user should get 403 if they try to patch expense', async () => {
      const { mainFarm, user: owner } = await returnUserFarms(1);
      const [unauthorizedUser] = await mocks.usersFactory();
      const { expense } = await returnExpense(owner, mainFarm);

      const patchData = {
        value: expense.value + 5,
        note: 'patched in note',
      };

      patchRequest(
        patchData,
        expense.farm_expense_id,
        {
          user_id: unauthorizedUser.user_id,
          farm_id: mainFarm.farm_id,
        },
        async (_err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe(
            'User does not have the following permission(s): delete:expenses',
          );
        },
      );
    });

    describe('PATCH with allocation arrays', () => {
      let expense;

      beforeEach(async () => {
        ({ expense } = await returnExpense(owner, mainFarm));
      });

      test('farm_expense_animal array replaces existing rows', async () => {
        await mocks.farm_expense_animalFactory({
          promisedExpense: [expense],
          promisedAnimal: [animal],
        });
        const [animal2] = await mocks.animalFactory({ promisedFarm: [farm] });

        const res = await patchRequest(
          { farm_expense_animal: [mocks.fakeFarmExpenseAnimal({ animal_id: animal2.id })] },
          expense.farm_expense_id,
          { user_id: owner.user_id, farm_id: farm.farm_id },
        );
        expect(res.status).toBe(200);
        const rows = await farmExpenseAnimalModel
          .query()
          .where('farm_expense_id', expense.farm_expense_id);
        expect(rows.length).toBe(1);
        expect(rows[0].animal_id).toBe(animal2.id);
      });

      test('farm_expense_crop_variety array replaces existing rows', async () => {
        await mocks.farm_expense_crop_varietyFactory({
          promisedExpense: [expense],
          promisedCropVariety: [cropVariety],
        });
        const [crop2] = await mocks.cropFactory({ promisedFarm: [farm] });
        const [cropVariety2] = await mocks.crop_varietyFactory({
          promisedFarm: [farm],
          promisedCrop: [crop2],
        });

        const res = await patchRequest(
          {
            farm_expense_crop_variety: [
              mocks.fakeFarmExpenseCropVariety({ crop_variety_id: cropVariety2.crop_variety_id }),
            ],
          },
          expense.farm_expense_id,
          { user_id: owner.user_id, farm_id: farm.farm_id },
        );
        expect(res.status).toBe(200);
        const rows = await farmExpenseCropVarietyModel
          .query()
          .where('farm_expense_id', expense.farm_expense_id);
        expect(rows.length).toBe(1);
        expect(rows[0].crop_variety_id).toBe(cropVariety2.crop_variety_id);
      });

      test('Omitting allocation arrays leaves existing allocations untouched', async () => {
        await mocks.farm_expense_animalFactory({
          promisedExpense: [expense],
          promisedAnimal: [animal],
        });

        const res = await patchRequest({ note: 'patched note' }, expense.farm_expense_id, {
          user_id: owner.user_id,
          farm_id: farm.farm_id,
        });
        expect(res.status).toBe(200);
        const rows = await farmExpenseAnimalModel
          .query()
          .where('farm_expense_id', expense.farm_expense_id);
        expect(rows.length).toBe(1);
      });

      test('farm_expense_animal: [] removes all existing animal allocations', async () => {
        await mocks.farm_expense_animalFactory({
          promisedExpense: [expense],
          promisedAnimal: [animal],
        });

        const res = await patchRequest({ farm_expense_animal: [] }, expense.farm_expense_id, {
          user_id: owner.user_id,
          farm_id: farm.farm_id,
        });
        expect(res.status).toBe(200);
        const rows = await farmExpenseAnimalModel
          .query()
          .where('farm_expense_id', expense.farm_expense_id);
        expect(rows.length).toBe(0);
      });

      test('farm_expense_crop_variety: [] removes all existing crop variety allocations', async () => {
        await mocks.farm_expense_crop_varietyFactory({
          promisedExpense: [expense],
          promisedCropVariety: [cropVariety],
        });

        const res = await patchRequest({ farm_expense_crop_variety: [] }, expense.farm_expense_id, {
          user_id: owner.user_id,
          farm_id: farm.farm_id,
        });
        expect(res.status).toBe(200);
        const rows = await farmExpenseCropVarietyModel
          .query()
          .where('farm_expense_id', expense.farm_expense_id);
        expect(rows.length).toBe(0);
      });

      test('PATCH replaces existing animal rows with crop variety rows', async () => {
        await mocks.farm_expense_animalFactory({
          promisedExpense: [expense],
          promisedAnimal: [animal],
        });

        const res = await patchRequest(
          {
            farm_expense_animal: [],
            farm_expense_crop_variety: [
              mocks.fakeFarmExpenseCropVariety({ crop_variety_id: cropVariety.crop_variety_id }),
            ],
          },
          expense.farm_expense_id,
          { user_id: owner.user_id, farm_id: farm.farm_id },
        );
        expect(res.status).toBe(200);
        const animalRows = await farmExpenseAnimalModel
          .query()
          .where('farm_expense_id', expense.farm_expense_id);
        expect(animalRows.length).toBe(0);
        const cvRows = await farmExpenseCropVarietyModel
          .query()
          .where('farm_expense_id', expense.farm_expense_id);
        expect(cvRows.length).toBe(1);
        expect(cvRows[0].crop_variety_id).toBe(cropVariety.crop_variety_id);
      });
    });
  });
});
