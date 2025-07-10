/* eslint-disable @typescript-eslint/no-unused-vars */

/*
 *  Copyright 2019, 2020, 2021, 2022, 2025 LiteFarm.org
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

import chai from 'chai';

import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import mocks from './mock.factories.js';
import server from './../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
import { faker } from '@faker-js/faker';

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkSchedulerJwt.js', () =>
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.requestTimedNotifications = true;
    next();
  }),
);

import axios from 'axios';
import { connectFarmToEnsemble } from './utils/ensembleUtils.js';
import { setupFarmEnvironment } from './utils/testDataSetup.js';
jest.mock('axios');
const mockedAxios = axios;

describe('Time Based Notification Tests', () => {
  let farmOwner;
  let farm;
  let isDayLaterThanUtc;
  let fakeToday;

  beforeEach(async () => {
    // Set up a farm with a farm owner
    [farmOwner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    isDayLaterThanUtc = faker.datatype.boolean();
    fakeToday = new Date();
    if (isDayLaterThanUtc) fakeToday.setDate(fakeToday.getDate() + 1);

    await mocks.userFarmFactory(
      {
        promisedUser: [farmOwner],
        promisedFarm: [farm],
      },
      mocks.fakeUserFarm({ role_id: 1 }),
    );

    // const middleware = require('../src/middleware/acl/checkSchedulerJwt');
    // middleware.mockImplementation((req, res, next) => {
    //   req.auth = {};
    //   req.auth.requestTimedNotifications = true;
    //   next();
    // });
  });

  async function createFullTask(defaultTaskData = {}) {
    const [{ task_type_id }] = await mocks.task_typeFactory({
      promisedFarm: [{ farm_id: farm.farm_id }],
    });

    const [task] = await mocks.taskFactory(
      { promisedUser: [farmOwner], promisedTaskType: [{ task_type_id }] },
      mocks.fakeTask(defaultTaskData),
    );

    const taskFamily = faker.helpers.arrayElement([
      'location',
      'management',
      'plant',
      'transplant',
    ]);

    switch (taskFamily) {
      case 'location': {
        const [location] = await mocks.locationFactory({
          promisedFarm: [{ farm_id: farm.farm_id }],
        });
        await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
        break;
      }
      case 'management': {
        const [plantingManagementPlan] = await mocks.planting_management_planFactory({
          promisedFarm: [{ farm_id: farm.farm_id }],
        });
        await mocks.management_tasksFactory({
          promisedTask: [task],
          promisedPlantingManagementPlan: [plantingManagementPlan],
        });
        break;
      }
      case 'plant': {
        const [plantingManagementPlan] = await mocks.planting_management_planFactory({
          promisedFarm: [{ farm_id: farm.farm_id }],
        });
        await mocks.plant_taskFactory(
          { promisedTask: [task] },
          mocks.fakePlantTask({
            planting_management_plan_id: plantingManagementPlan.planting_management_plan_id,
          }),
        );
        break;
      }
      case 'transplant': {
        const [mgtPlan] = await mocks.planting_management_planFactory({
          promisedFarm: [{ farm_id: farm.farm_id }],
        });
        const [prevMgtPlan] = await mocks.planting_management_planFactory({
          promisedFarm: [{ farm_id: farm.farm_id }],
        });
        await mocks.transplant_taskFactory({
          promisedTask: [task],
          promisedMgtPlan: [mgtPlan],
          promisedPrevMgtPlan: [prevMgtPlan],
        });
        break;
      }
      default: {
        const [location] = await mocks.locationFactory({
          promisedFarm: [{ farm_id: farm.farm_id }],
        });
        await mocks.location_tasksFactory({ promisedTask: [task], promisedField: [location] });
        break;
      }
    }
  }

  function postWeeklyUnassignedTasksRequest(data, callback) {
    const { farm_id } = data;
    chai
      .request(server)
      .post(`/time_notification/weekly_unassigned_tasks/${farm_id}`)
      .send({ isDayLaterThanUtc })
      .end(callback);
  }

  function postDailyDueTodayTasks(data, callback) {
    const { farm_id } = data;
    chai
      .request(server)
      .post(`/time_notification/daily_due_today_tasks/${farm_id}`)
      .send({ isDayLaterThanUtc })
      .end(callback);
  }

  async function postDailyNewIrrigationPrescriptions(data) {
    const { farm_id } = data;
    const response = await chai
      .request(server)
      .post(`/time_notification/new_irrigation_prescription/${farm_id}`)
      .send({ isDayLaterThanUtc });

    return response;
  }

  // Clean up after test finishes
  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  afterEach(async (done) => {
    await knex.raw(`
      UPDATE task SET deleted = TRUE WHERE deleted = FALSE;
      UPDATE notification SET deleted = TRUE WHERE deleted = FALSE;
      UPDATE notification_user SET deleted = TRUE WHERE deleted = FALSE;
    `);
    done();
  });

  describe('Unassigned Tasks Due This Week Notification Test', () => {
    describe('Notification Sent To All Valid Recipients Tests', () => {
      beforeEach(async () => {
        // Set up such that there are unassigned tasks due within the next week
        await createFullTask({
          due_date: faker.date.soon(6, fakeToday).toISOString().split('T')[0],
          assignee_user_id: null,
        });
      });

      test('Farm Owners Should Receive Notification', async (done) => {
        postWeeklyUnassignedTasksRequest({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const notifications = await knex('notification_user')
            .join(
              'notification',
              'notification.notification_id',
              'notification_user.notification_id',
            )
            .where({
              'notification_user.user_id': farmOwner.user_id,
              'notification_user.deleted': false,
              'notification.deleted': false,
            });
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
          const notifications = await knex('notification_user')
            .join(
              'notification',
              'notification.notification_id',
              'notification_user.notification_id',
            )
            .where({
              'notification_user.user_id': farmManager.user_id,
              'notification_user.deleted': false,
              'notification.deleted': false,
            });
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
          const notifications = await knex('notification_user')
            .join(
              'notification',
              'notification.notification_id',
              'notification_user.notification_id',
            )
            .where({
              'notification_user.user_id': extensionOfficer.user_id,
              'notification_user.deleted': false,
              'notification.deleted': false,
            });
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
          const notifications = await knex('notification_user').where({
            user_id: farmWorker.user_id,
            deleted: false,
          });
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
          const notifications = await knex('notification_user').where({
            user_id: otherFarmManager.user_id,
            deleted: false,
          });
          expect(notifications.length).toBe(0);
          done();
        });
      });
    });
    describe('Notification Only Sent Under Correct Conditions Tests', () => {
      test('Not Sent When There Are No Unassigned Tasks', (done) => {
        postWeeklyUnassignedTasksRequest({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const notifications = await knex('notification').where({ deleted: false });
          expect(notifications.length).toBe(0);
          done();
        });
      });

      test('Not Sent When The Only Unassigned Tasks Are Due Later Then 7 Days', async (done) => {
        const laterThanOneWeekFromNow = fakeToday;
        laterThanOneWeekFromNow.setDate(laterThanOneWeekFromNow.getDate() + 8);
        const laterThanOneWeekFromNowStr = laterThanOneWeekFromNow.toISOString().split('T')[0];

        await createFullTask({
          due_date: laterThanOneWeekFromNowStr,
          assignee_user_id: null,
        });

        postWeeklyUnassignedTasksRequest({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const notifications = await knex('notification').where({ deleted: false });
          expect(notifications.length).toBe(0);
          done();
        });
      });

      test('Not Sent When The Only Tasks Due This Week Are Assigned', async (done) => {
        await createFullTask({
          due_date: faker.date.soon(6, fakeToday).toISOString().split('T')[0],
          assignee_user_id: farmOwner.user_id,
        });

        postWeeklyUnassignedTasksRequest({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const notifications = await knex('notification').where({ deleted: false });
          expect(notifications.length).toBe(0);
          done();
        });
      });

      test('Sent When There Are Unassigned Tasks Due Within The Next 7 days', async (done) => {
        await createFullTask({
          due_date: faker.date.soon(6, fakeToday).toISOString().split('T')[0],
          assignee_user_id: null,
        });
        postWeeklyUnassignedTasksRequest({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const notifications = await knex('notification').where({ deleted: false });
          expect(notifications.length).toBe(1);
          done();
        });
      });
    });
  });

  describe('Tasks Due Today Notification Test', () => {
    let farmWorker;
    beforeEach(async () => {
      [farmWorker] = await mocks.usersFactory();

      await mocks.userFarmFactory(
        {
          promisedUser: [farmWorker],
          promisedFarm: [farm],
        },
        mocks.fakeUserFarm({ role_id: 3 }),
      );
    });

    describe('Notification sent tests', () => {
      test('Farm worker should receive a due today notification', async (done) => {
        await createFullTask({
          due_date: fakeToday.toISOString().split('T')[0],
          assignee_user_id: farmWorker.user_id,
        });

        postDailyDueTodayTasks({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const notifications = await knex('notification').where({
            'notification.farm_id': farm.farm_id,
            'notification.deleted': false,
          });
          expect(notifications.length).toBe(1);
          expect(notifications[0].title.translation_key).toBe(
            'NOTIFICATION.DAILY_TASKS_DUE_TODAY.TITLE',
          );
          done();
        });
      });

      test('Daily notification_date correctly matches due_date when isDayLaterThanUtc=true', async (done) => {
        isDayLaterThanUtc = true;
        fakeToday = new Date();
        fakeToday.setDate(fakeToday.getDate() + 1);

        await createFullTask({
          due_date: fakeToday.toISOString().split('T')[0],
          assignee_user_id: farmWorker.user_id,
        });

        postDailyDueTodayTasks({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const notifications = await knex('notification').where({
            'notification.farm_id': farm.farm_id,
            'notification.deleted': false,
          });

          const expectedDate = fakeToday.toISOString().split('T')[0];
          expect(notifications[0].context.notification_date).toBe(expectedDate);

          done();
        });
      });

      test('Farm owner should receive a due today notification', async (done) => {
        await createFullTask({
          due_date: fakeToday.toISOString().split('T')[0],
          assignee_user_id: farmOwner.user_id,
        });

        postDailyDueTodayTasks({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const notifications = await knex('notification').where({
            'notification.farm_id': farm.farm_id,
            'notification.deleted': false,
          });
          expect(notifications.length).toBe(1);
          expect(notifications[0].title.translation_key).toBe(
            'NOTIFICATION.DAILY_TASKS_DUE_TODAY.TITLE',
          );
          done();
        });
      });

      test('Multiple farm workers in the same farm should receive a due today notification', async (done) => {
        await createFullTask({
          due_date: fakeToday.toISOString().split('T')[0],
          assignee_user_id: farmOwner.user_id,
        });

        await createFullTask({
          due_date: fakeToday.toISOString().split('T')[0],
          assignee_user_id: farmWorker.user_id,
        });

        postDailyDueTodayTasks({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const notifications = await knex('notification').where({
            'notification.farm_id': farm.farm_id,
            'notification.deleted': false,
          });
          expect(notifications.length).toBe(2);
          expect(notifications[0].title.translation_key).toBe(
            'NOTIFICATION.DAILY_TASKS_DUE_TODAY.TITLE',
          );
          done();
        });
      });
    });

    describe('Notification not sent tests', () => {
      test('Notification not sent if no active workers in a farm', async (done) => {
        const [farm2] = await mocks.farmFactory();
        await createFullTask({
          due_date: faker.date.soon(2, fakeToday).toISOString().split('T')[0],
          assignee_user_id: farmWorker.user_id,
        });

        postDailyDueTodayTasks({ farm_id: farm2.farm_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const notifications = await knex('notification').where({
            'notification.farm_id': farm2.farm_id,
            'notification.deleted': false,
          });
          expect(notifications.length).toBe(0);
          done();
        });
      });

      test('Other farm worker should not receive a due today notification of another worker', async (done) => {
        const [farmWorker2] = await mocks.usersFactory();
        await mocks.userFarmFactory(
          {
            promisedUser: [farmWorker2],
            promisedFarm: [farm],
          },
          mocks.fakeUserFarm({ role_id: 3 }),
        );

        await createFullTask({
          due_date: fakeToday.toISOString().split('T')[0],
          assignee_user_id: farmWorker.user_id,
        });

        postDailyDueTodayTasks({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const notifications = await knex('notification_user')
            .join(
              'notification',
              'notification.notification_id',
              'notification_user.notification_id',
            )
            .where({
              'notification_user.user_id': farmWorker2.user_id,
              'notification_user.deleted': false,
              'notification.deleted': false,
            });
          expect(notifications.length).toBe(0);
          done();
        });
      });

      test('Farm workers should not receive a due today notification of unassigned tasks', async (done) => {
        await createFullTask({
          due_date: fakeToday.toISOString().split('T')[0],
          assignee_user_id: null,
        });

        postDailyDueTodayTasks({ farm_id: farm.farm_id }, async (err, res) => {
          expect(res.status).toBe(200);
          const notifications = await knex('notification_user')
            .join(
              'notification',
              'notification.notification_id',
              'notification_user.notification_id',
            )
            .where({
              'notification_user.user_id': farmWorker.user_id,
              'notification_user.deleted': false,
              'notification.deleted': false,
            });
          expect(notifications.length).toBe(0);
          done();
        });
      });
    });
  });

  describe('New Irrigation Prescription Notification Test', () => {
    let farm;
    let field;

    beforeEach(async () => {
      ({ farm, field } = await setupFarmEnvironment());

      await connectFarmToEnsemble(farm);
    });

    describe('Notification sent tests', () => {
      beforeEach(async () => {
        await mockedAxios.mockClear();
      });

      test('One notification record should be created for the last irrigation prescription', async () => {
        await mockedAxios.mockResolvedValue({
          status: 201,
          data: [
            {
              id: 123,
              recommended_start_date: '2025-05-07T00:00:00Z',
              location_id: field.location_id,
            },
            {
              id: 124,
              recommended_start_date: '2025-05-08T00:00:00Z',
              location_id: field.location_id,
            },
          ],
        });

        const res = await postDailyNewIrrigationPrescriptions({ farm_id: farm.farm_id });

        expect(res.status).toBe(201);

        const rows = await knex('notification')
          .where('farm_id', farm.farm_id)
          .whereRaw("(context->'irrigation_prescription_id') IN (?, ?)", [123, 124]);

        expect(rows).toHaveLength(1);

        expect(rows[0].context.irrigation_prescription_id).toBe(124);
        expect(rows[0].ref.url).toBe('/irrigation_prescription/124');
        expect(rows[0].title.translation_key).toBe(
          'NOTIFICATION.NEW_IRRIGATION_PRESCRIPTION.TITLE',
        );
      });

      test('Repeat notifications are not sent for the same irrigation prescription', async () => {
        await mockedAxios.mockResolvedValue({
          status: 201,
          data: [
            {
              id: 223,
              recommended_start_date: '2025-05-07T00:00:00Z',
              location_id: field.location_id,
            },
            {
              id: 224,
              recommended_start_date: '2025-05-08T00:00:00Z',
              location_id: field.location_id,
            },
          ],
        });
        const res1 = await postDailyNewIrrigationPrescriptions({ farm_id: farm.farm_id });

        // 201 is controller response for notifications sent
        expect(res1.status).toBe(201);

        const res2 = await postDailyNewIrrigationPrescriptions({ farm_id: farm.farm_id });

        // 200 is controller response for no notifications sent
        expect(res2.status).toBe(200);

        const rows = await knex('notification')
          .where('farm_id', farm.farm_id)
          .whereRaw("(context->'irrigation_prescription_id') IN (?, ?)", [223, 224]);

        // There should be exactly 1 record in the DB
        expect(rows).toHaveLength(1);
      });
    });
  });
});
