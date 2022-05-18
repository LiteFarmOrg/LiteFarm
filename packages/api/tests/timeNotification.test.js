/*
 *  Copyright 2019-2022 LiteFarm.org
 *  This file is part of LiteFarm.
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
chai.use(chaiHttp);
const mocks = require('./mock.factories');
const server = require('./../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment');
const { faker } = require('@faker-js/faker');
const { sign } = require('jsonwebtoken');

jest.mock('jsdom');
jest.mock('../src/util/jwt');
jest.mock('../src/middleware/acl/checkSchedulerJwt.js');

describe('Time Based Notification Tests', () => {
  let farmOwner;
  let farm;
  let farmWorker;
  let globalSchedulerToken;

  beforeEach(async () => {
    // Set up a farm with a farm owner
    [farmOwner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [farmWorker] = await mocks.usersFactory();

    await mocks.userFarmFactory(
      {
        promisedUser: [farmOwner],
        promisedFarm: [farm],
      },
      mocks.fakeUserFarm({ role_id: 1 }),
    );

    await mocks.userFarmFactory(
      {
        promisedUser: [farmWorker],
        promisedFarm: [farm],
      },
      mocks.fakeUserFarm({ role_id: 3 }),
    );

    const middleware = require('../src/middleware/acl/checkSchedulerJwt');
    middleware.mockImplementation((req, res, next) => {
      req.auth = {};
      req.auth.requestTimedNotifications = true;
      next();
    });

    const { createToken, tokenType } = require('../src/util/jwt');
    createToken.mockImplementation(async (type, user) => {
      const localSchedulerToken = sign(user, tokenType[type], {
        expiresIn: '7d',
        algorithm: 'HS256',
      });
      globalSchedulerToken = localSchedulerToken;
      return localSchedulerToken;
    });
  });

  function postWeeklyUnassignedTasksRequest(data, callback) {
    const { farm_id } = data;
    chai
      .request(server)
      .post(`/time_notification/weekly_unassigned_tasks/${farm_id}`)
      .set('Authorization', `Bearer ${globalSchedulerToken}`)
      .end(callback);
  }

  function postDailyDueTodayTasks(data, callback) {
    const { user_id } = data;
    chai.request(server)
      .post(`/time_notification/daily_due_today_tasks/${user_id}`)
      .set('Authorization', `Bearer ${globalSchedulerToken}`)
      .end(callback);
  }

  // Clean up after test finishes
  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  afterEach(async (done) => {
    // Reset notifications
    await knex.raw('DELETE FROM "notification_user";');
    await knex.raw('DELETE FROM "notification";');
    done();
  });

  describe('Unassigned Tasks Due This Week Notification Test', () => {
    describe('Notification Sent To All Valid Recipients Tests', () => {
      beforeEach(async () => {
        // Set up such that there are unassigned tasks due within the next week
        await mocks.taskFactory(
          { promisedUser: [farmOwner] },
          mocks.fakeTask({
            due_date: faker.date.soon(6).toISOString().split('T')[0],
            assignee_user_id: null,
          }),
        );
      });

      test('Farm Owners Should Receive Notification', async (done) => {
        postWeeklyUnassignedTasksRequest({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(201);
          expect(res.body.farmManagement).toContain(farmOwner.user_id);
          const notifications = await knex('notification_user')
            .join(
              'notification',
              'notification.notification_id',
              'notification_user.notification_id',
            )
            .where('notification_user.user_id', farmOwner.user_id);
          expect(notifications.length).toBe(1);
          expect(notifications[0].title.translation_key).toBe(
            'NOTIFICATION.WEEKLY_UNASSIGNED_TASKS.TITLE',
          );
          done();
        });
      });

      test('Farm Managers Should Receive Notification', async (done) => {
        const [farmManager] = await mocks.usersFactory();
        await mocks.userFarmFactory(
          {
            promisedUser: [farmManager],
            promisedFarm: [farm],
          },
          mocks.fakeUserFarm({ role_id: 2 }),
        );

        postWeeklyUnassignedTasksRequest({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(201);
          expect(res.body.farmManagement).toContain(farmManager.user_id);
          const notifications = await knex('notification_user')
            .join(
              'notification',
              'notification.notification_id',
              'notification_user.notification_id',
            )
            .where('notification_user.user_id', farmManager.user_id);
          expect(notifications.length).toBe(1);
          expect(notifications[0].title.translation_key).toBe(
            'NOTIFICATION.WEEKLY_UNASSIGNED_TASKS.TITLE',
          );
          done();
        });
      });

      test('Extension Officers Should Receive Notification', async (done) => {
        const [extensionOfficer] = await mocks.usersFactory();
        await mocks.userFarmFactory(
          {
            promisedUser: [extensionOfficer],
            promisedFarm: [farm],
          },
          mocks.fakeUserFarm({ role_id: 5 }),
        );

        postWeeklyUnassignedTasksRequest({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(201);
          expect(res.body.farmManagement).toContain(extensionOfficer.user_id);
          const notifications = await knex('notification_user')
            .join(
              'notification',
              'notification.notification_id',
              'notification_user.notification_id',
            )
            .where('notification_user.user_id', extensionOfficer.user_id);
          expect(notifications.length).toBe(1);
          expect(notifications[0].title.translation_key).toBe(
            'NOTIFICATION.WEEKLY_UNASSIGNED_TASKS.TITLE',
          );
          done();
        });
      });

      test('Farm Worker Should Not Receive Notification', async (done) => {
        const [farmWorker] = await mocks.usersFactory();
        await mocks.userFarmFactory(
          {
            promisedUser: [farmWorker],
            promisedFarm: [farm],
          },
          mocks.fakeUserFarm({ role_id: 3 }),
        );

        postWeeklyUnassignedTasksRequest({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(201);
          expect(res.body.farmManagement).not.toContain(farmWorker.user_id);
          const notifications = await knex('notification_user').where(
            'user_id',
            farmWorker.user_id,
          );
          expect(notifications.length).toBe(0);
          done();
        });
      });

      test('Farm Manager at a Different Farm Should Not Receive Notification', async (done) => {
        const [otherFarmManager] = await mocks.usersFactory();
        const [otherFarm] = await mocks.farmFactory();
        await mocks.userFarmFactory(
          {
            promisedUser: [otherFarmManager],
            promisedFarm: [otherFarm],
          },
          mocks.fakeUserFarm({ role_id: 2 }),
        );

        postWeeklyUnassignedTasksRequest({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(201);
          expect(res.body.farmManagement).not.toContain(otherFarmManager.user_id);
          const notifications = await knex('notification_user').where(
            'user_id',
            otherFarmManager.user_id,
          );
          expect(notifications.length).toBe(0);
          done();
        });
      });
    });
    describe('Notification Only Sent Under Correct Conditions Tests', () => {
      test('Not Sent When There Are No Unassigned Tasks', (done) => {
        postWeeklyUnassignedTasksRequest({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.unassignedTasks.length).toBe(0);
          const notifications = await knex('notification');
          expect(notifications.length).toBe(0);
          done();
        });
      });

      test('Not Sent When The Only Unassigned Tasks Are Due Later Then 7 Days', async (done) => {
        const laterThanOneWeekFromNow = new Date();
        laterThanOneWeekFromNow.setDate(laterThanOneWeekFromNow.getDate() + 8);
        const laterThanOneWeekFromNowStr = laterThanOneWeekFromNow.toISOString().split('T')[0];

        await mocks.taskFactory(
          {},
          mocks.fakeTask({
            due_date: laterThanOneWeekFromNowStr,
            assignee_user_id: null,
          }),
        );
        postWeeklyUnassignedTasksRequest({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.unassignedTasks.length).toBe(0);
          const notifications = await knex('notification');
          expect(notifications.length).toBe(0);
          done();
        });
      });

      test('Not Sent When The Only Tasks Due This Week Are Assigned', async (done) => {
        await mocks.taskFactory(
          {},
          mocks.fakeTask({
            due_date: faker.date.soon(6).toISOString().split('T')[0],
            assignee_user_id: farmOwner.user_id,
          }),
        );
        postWeeklyUnassignedTasksRequest({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.unassignedTasks.length).toBe(0);
          const notifications = await knex('notification');
          expect(notifications.length).toBe(0);
          done();
        });
      });

      test('Sent When There Are Unassigned Tasks Due Within The Next 7 days', async (done) => {
        await mocks.taskFactory(
          { promisedUser: [farmOwner] },
          mocks.fakeTask({
            due_date: faker.date.soon(6).toISOString().split('T')[0],
            assignee_user_id: null,
          }),
        );
        postWeeklyUnassignedTasksRequest({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(201);
          expect(res.body.unassignedTasks.length).toBe(1);
          const notifications = await knex('notification');
          expect(notifications.length).toBe(1);
          done();
        });
      });
    });
  });

  describe('Tasks Due Today Notification Test', () => {
    describe('Notification sent tests', () => {
      beforeEach(async () => {
        await mocks.taskFactory(
          { promisedUser: [farmOwner] },
          mocks.fakeTask({
            due_date: new Date().toISOString().split('T')[0],
            assignee_user_id: farmWorker.user_id,
          }),
        );
      });

      test('Farm workers should receive a due today notification', async (done) => {
        postDailyDueTodayTasks({ user_id: farmWorker.user_id }, async(err, res) => {
          console.log(res.body);
          expect(res.status).toBe(201);
          const notifications = await knex('notification_user')
            .join(
              'notification',
              'notification.notification_id',
              'notification_user.notification_id',
            )
            .where('notification_user.user_id', farmWorker.user_id);
          expect(notifications.length).toBe(1);
          expect(notifications[0].title.translation_key).toBe('NOTIFICATION.DAILY_TASKS_DUE_TODAY.TITLE');
          done();
        });
      });
    });
  });
});

/* global jest describe test expect beforeEach afterEach afterAll */