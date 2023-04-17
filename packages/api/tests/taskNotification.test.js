/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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
import server from '../src/server.js';
import knex from '../src/util/knex.js';
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    req.user = {};
    req.user.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';
import { tableCleanup } from './testEnvironment.js';

describe('Task Notification Tests', () => {
  let farmOwner;
  let farm;
  let farmWorker;
  let farmWorker2;

  beforeEach(async () => {
    // const middleware = require('../src/middleware/acl/checkJwt');
    //
    // middleware.mockImplementation((req, res, next) => {
    //   req.user = {};
    //   req.user.user_id = req.get('user_id');
    //   next();
    // });

    [farmOwner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [farmWorker] = await mocks.usersFactory();
    [farmWorker2] = await mocks.usersFactory();

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

    await mocks.userFarmFactory(
      {
        promisedUser: [farmWorker2],
        promisedFarm: [farm],
      },
      mocks.fakeUserFarm({ role_id: 3 }),
    );
  });

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

  function patchAssignTaskRequest({ user_id, farm_id }, assignee_user_id, task_id, callback) {
    chai
      .request(server)
      .patch(`/task/assign/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(assignee_user_id)
      .end(callback);
  }

  function patchAbandonTaskRequest({ user_id, farm_id }, data, task_id, callback) {
    chai
      .request(server)
      .patch(`/task/abandon/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  describe('Task Reassignment Notification Tests', () => {
    test('Owner will receive a reassignment notification when task has been reassigned to them from a worker', async (done) => {
      const [{ task_type_id }] = await mocks.task_typeFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });

      const [{ task_id }] = await mocks.taskFactory(
        { promisedUser: [{ user_id: farmOwner.user_id }], promisedTaskType: [{ task_type_id }] },
        mocks.fakeTask({
          assignee_user_id: farmWorker.user_id,
        }),
      );

      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchAssignTaskRequest(
        { user_id: farmOwner.user_id, farm_id: farm.farm_id },
        { assignee_user_id: farmOwner.user_id },
        task_id,
        async (err, res) => {
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
          expect(notifications.length).toBe(1);
          expect(notifications[0].title.translation_key).toBe('NOTIFICATION.TASK_REASSIGNED.TITLE');
          done();
        },
      );
    });

    test('Reassigned user should have a regular assignment notification', async (done) => {
      const [{ task_type_id }] = await mocks.task_typeFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });

      const [{ task_id }] = await mocks.taskFactory(
        { promisedUser: [{ user_id: farmOwner.user_id }], promisedTaskType: [{ task_type_id }] },
        mocks.fakeTask({
          assignee_user_id: farmOwner.user_id,
        }),
      );

      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchAssignTaskRequest(
        { user_id: farmOwner.user_id, farm_id: farm.farm_id },
        { assignee_user_id: farmWorker.user_id },
        task_id,
        async (err, res) => {
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
          expect(notifications.length).toBe(1);
          expect(notifications[0].title.translation_key).toBe('NOTIFICATION.TASK_ASSIGNED.TITLE');
          done();
        },
      );
    });

    test('Other workers will not receive a reassignment notification of other tasks', async (done) => {
      const [{ task_type_id }] = await mocks.task_typeFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });

      const [{ task_id }] = await mocks.taskFactory(
        { promisedUser: [{ user_id: farmOwner.user_id }], promisedTaskType: [{ task_type_id }] },
        mocks.fakeTask({
          assignee_user_id: farmOwner.user_id,
        }),
      );

      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchAssignTaskRequest(
        { user_id: farmOwner.user_id, farm_id: farm.farm_id },
        { assignee_user_id: farmWorker.user_id },
        task_id,
        async (err, res) => {
          expect(res.status).toBe(200);
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
        },
      );
    });
    test('Owner will receive a notification when a task in unassigned', async (done) => {
      const [{ task_type_id }] = await mocks.task_typeFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });

      const [{ task_id }] = await mocks.taskFactory(
        { promisedUser: [{ user_id: farmOwner.user_id }], promisedTaskType: [{ task_type_id }] },
        mocks.fakeTask({
          assignee_user_id: farmWorker.user_id,
        }),
      );

      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchAssignTaskRequest(
        { user_id: farmOwner.user_id, farm_id: farm.farm_id },
        { assignee_user_id: null },
        task_id,
        async (err, res) => {
          expect(res.status).toBe(200);
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
          expect(notifications[0].title.translation_key).toBe('NOTIFICATION.TASK_UNASSIGNED.TITLE');
          expect(notifications[0].body.translation_key).toBe('NOTIFICATION.TASK_UNASSIGNED.BODY');
          done();
        },
      );
    });

    test('Worker does not receive a task unassigned notification', async (done) => {
      const [{ task_type_id }] = await mocks.task_typeFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });

      const [{ task_id }] = await mocks.taskFactory(
        { promisedUser: [{ user_id: farmOwner.user_id }], promisedTaskType: [{ task_type_id }] },
        mocks.fakeTask({
          assignee_user_id: farmWorker.user_id,
        }),
      );

      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchAssignTaskRequest(
        { user_id: farmOwner.user_id, farm_id: farm.farm_id },
        { assignee_user_id: null },
        task_id,
        async (err, res) => {
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
          expect(notifications.length).toBe(1);
          expect(notifications[0].title.translation_key).toBe('NOTIFICATION.TASK_REASSIGNED.TITLE');
          expect(notifications[0].body.translation_key).toBe('NOTIFICATION.TASK_REASSIGNED.BODY');
          done();
        },
      );
    });
  });

  describe('Task Abandonment Notification Tests', () => {
    const abandonTaskRequest = {
      abandonment_reason: 'LABOUR_ISSUE',
      abandonment_notes: '',
      abandon_date: '2022-05-24',
    };

    test('A worker should receive an abandonment notification when their task has been abandoned by owner', async (done) => {
      const [{ task_type_id }] = await mocks.task_typeFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });

      const [{ task_id }] = await mocks.taskFactory(
        { promisedUser: [{ user_id: farmOwner.user_id }], promisedTaskType: [{ task_type_id }] },
        mocks.fakeTask({
          assignee_user_id: farmWorker.user_id,
        }),
      );

      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchAbandonTaskRequest(
        { user_id: farmOwner.user_id, farm_id: farm.farm_id },
        abandonTaskRequest,
        task_id,
        async (err, res) => {
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
          expect(notifications.length).toBe(1);
          expect(notifications[0].title.translation_key).toBe('NOTIFICATION.TASK_ABANDONED.TITLE');
          done();
        },
      );
    });

    test('Other workers should not receive an abandonment notification when a worker task has been abandoned by owner', async (done) => {
      const [{ task_type_id }] = await mocks.task_typeFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });

      const [{ task_id }] = await mocks.taskFactory(
        { promisedUser: [{ user_id: farmOwner.user_id }], promisedTaskType: [{ task_type_id }] },
        mocks.fakeTask({
          assignee_user_id: farmWorker.user_id,
        }),
      );

      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchAbandonTaskRequest(
        { user_id: farmOwner.user_id, farm_id: farm.farm_id },
        abandonTaskRequest,
        task_id,
        async (err, res) => {
          expect(res.status).toBe(200);
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
        },
      );
    });

    test('No abandonment notification created when an unassigned task has been abandoned by owner', async (done) => {
      const [{ task_type_id }] = await mocks.task_typeFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });
      const [{ location_id }] = await mocks.locationFactory({
        promisedFarm: [{ farm_id: farm.farm_id }],
      });

      const [{ task_id }] = await mocks.taskFactory(
        { promisedUser: [{ user_id: farmOwner.user_id }], promisedTaskType: [{ task_type_id }] },
        mocks.fakeTask({
          assignee_user_id: null,
        }),
      );

      await mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      });

      patchAbandonTaskRequest(
        { user_id: farmOwner.user_id, farm_id: farm.farm_id },
        abandonTaskRequest,
        task_id,
        async (err, res) => {
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
        },
      );
    });
  });
});
