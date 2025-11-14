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
import mocks from './mock.factories.js';
import NotificationUser from '../src/models/notificationUserModel.js';

describe('Notification tests', () => {
  async function getRequest(url, { user_id = user.user_id, farm_id = farm.farm_id }, callback) {
    return chai
      .request(server)
      .get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .then((res) => callback(null, res))
      .catch((_err) => callback(_err));
  }

  let user;
  let farm;
  let userFarm;

  beforeEach(async () => {
    [user] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [userFarm] = await mocks.userFarmFactory({ promisedUser: [user], promisedFarm: [farm] });
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('GET user notifications', () => {
    test('Users should get their notifications scoped for all farms', async () => {
      const [notification] = await mocks.notification_userFactory({
        promisedUserFarm: [userFarm],
      });
      await getRequest('/notification_user', {}, (_err, res) => {
        expect(_err).toBe(null);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].user_id).toBe(user.user_id);
        expect(res.body[0].notification_id).toBe(notification.notification_id);
      });
    });

    test('Users should get their notifications scoped for their current farm', async () => {
      const [notification] = await mocks.notification_userFactory({
        promisedUserFarm: [userFarm],
      });
      await getRequest('/notification_user', {}, (_err, res) => {
        expect(_err).toBe(null);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].user_id).toBe(user.user_id);
        expect(res.body[0].notification_id).toBe(notification.notification_id);
      });
    });

    test('Users should not get their notifications scoped for farms other than their current farm', async () => {
      const [otherFarm] = await mocks.farmFactory();
      const [otherUserFarm] = await mocks.userFarmFactory({
        promisedUser: [user],
        promisedFarm: [otherFarm],
      });
      await mocks.notification_userFactory({
        promisedUserFarm: [otherUserFarm],
      });
      await getRequest('/notification_user', {}, (_err, res) => {
        expect(_err).toBe(null);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
      });
    });

    test('Users are not authorized to get "their" notifications for farms where they are not active', async () => {
      const [inactiveFarm] = await mocks.farmFactory();
      const [inactiveUserFarm] = await mocks.userFarmFactory(
        { promisedUser: [user], promisedFarm: [inactiveFarm] },
        (userFarm = mocks.fakeUserFarm({ status: 'Inactive' })),
      );
      await mocks.notification_userFactory({
        promisedUserFarm: [inactiveUserFarm],
      });
      await getRequest('/notification_user', { farm_id: inactiveFarm.farm_id }, (_err, res) => {
        expect(_err).toBe(null);
        expect(res.status).toBe(403);
      });
    });
  });

  describe('PATCH user notifications', () => {
    async function clearAlerts(
      notificationIds,
      { user_id = user.user_id, farm_id = farm.farm_id },
      callback,
    ) {
      return chai
        .request(server)
        .patch('/notification_user/clear_alerts')
        .set('user_id', user_id)
        .set('farm_id', farm_id)
        .send(notificationIds)
        .then((res) => callback(null, res))
        .catch((_err) => callback(_err));
    }

    async function setStatus(body, { user_id = user.user_id, farm_id = farm.farm_id }, callback) {
      return chai
        .request(server)
        .patch('/notification_user')
        .set('user_id', user_id)
        .set('farm_id', farm_id)
        .send(body)
        .then((res) => callback(null, res))
        .catch((_err) => callback(_err));
    }

    test("Clears all alerts for the user's current farm when notification id's are missing.", async () => {
      // Notifications in current farm
      const [notification1] = await mocks.notification_userFactory({
        promisedUserFarm: [userFarm],
      });
      const [notification2] = await mocks.notification_userFactory({
        promisedUserFarm: [userFarm],
      });

      // Notification in another farm
      const [otherFarm] = await mocks.farmFactory();
      const [otherUserFarm] = await mocks.userFarmFactory({
        promisedUser: [user],
        promisedFarm: [otherFarm],
      });
      const [otherFarmNotification] = await mocks.notification_userFactory({
        promisedUserFarm: [otherUserFarm],
      });

      expect(notification1.alert).toBe(true);
      expect(notification2.alert).toBe(true);
      expect(otherFarmNotification.alert).toBe(true);

      await clearAlerts(undefined, {}, async (_err, res) => {
        expect(_err).toBe(null);
        expect(res.status).toBe(200);

        const notifications = await NotificationUser.getNotificationsForFarmUser(
          farm.farm_id,
          user.user_id,
        );

        const otherFarmNotifications = await NotificationUser.getNotificationsForFarmUser(
          otherFarm.farm_id,
          user.user_id,
        );

        expect(notifications[0].alert).toBe(false);
        expect(notifications[1].alert).toBe(false);
        expect(otherFarmNotifications[0].alert).toBe(true);
      });
    });

    test("Clears only the specified alerts when notification id's are provided", async () => {
      // Notifications in current farm
      const [notification1] = await mocks.notification_userFactory({
        promisedUserFarm: [userFarm],
      });
      const [notification2] = await mocks.notification_userFactory({
        promisedUserFarm: [userFarm],
      });
      // Notifications in another farm
      const [otherFarm] = await mocks.farmFactory();
      const [otherUserFarm] = await mocks.userFarmFactory({
        promisedUser: [user],
        promisedFarm: [otherFarm],
      });
      const [otherFarmNotification] = await mocks.notification_userFactory({
        promisedUserFarm: [otherUserFarm],
      });

      expect(notification1.alert).toBe(true);
      expect(notification2.alert).toBe(true);
      expect(otherFarmNotification.alert).toBe(true);

      await clearAlerts(
        { notification_ids: [notification1.notification_id] },
        {},
        async (_err, res) => {
          expect(_err).toBe(null);
          expect(res.status).toBe(200);

          const notifications = await NotificationUser.getNotificationsForFarmUser(
            farm.farm_id,
            user.user_id,
          );
          const otherFarmNotifications = await NotificationUser.getNotificationsForFarmUser(
            otherFarm.farm_id,
            user.user_id,
          );

          notifications.forEach(({ alert, notification_id }) => {
            if (notification_id === notification1.notification_id) {
              expect(alert).toBe(false);
            } else {
              expect(alert).toBe(true);
            }
          });

          expect(otherFarmNotifications[0].alert).toBe(true);
        },
      );
    });

    test('Does not clear alerts for another farm when provided notification id belongs to another farm', async () => {
      // Notification for another farm
      const [otherFarm] = await mocks.farmFactory();
      const [otherUserFarm] = await mocks.userFarmFactory({
        promisedUser: [user],
        promisedFarm: [otherFarm],
      });
      const [otherFarmNotification] = await mocks.notification_userFactory({
        promisedUserFarm: [otherUserFarm],
      });

      expect(otherFarmNotification.alert).toBe(true);

      // Try to clear using a notification_id that belongs to another farm
      await clearAlerts(
        { notification_ids: [otherFarmNotification.notification_id] },
        {},
        async (_err, res) => {
          expect(_err).toBe(null);
          expect(res.status).toBe(200);

          const otherFarmNotifications = await NotificationUser.getNotificationsForFarmUser(
            otherFarm.farm_id,
            user.user_id,
          );

          // Unchanged
          expect(otherFarmNotifications[0].alert).toBe(true);
        },
      );
    });

    test('Responds with 400 when notification_ids contains non-UUID values', async () => {
      await clearAlerts({ notification_ids: [123, 'not-a-uuid'] }, {}, (_err, res) => {
        expect(_err).toBe(null);
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
      });
    });

    test('Users can modify the status for a set of their notifications', async () => {
      const [notification] = await mocks.notification_userFactory({
        promisedUserFarm: [userFarm],
      });
      expect(notification.status).toBe('Unread');
      const newStatus = 'Read';
      await setStatus(
        { notification_ids: [notification.notification_id], status: newStatus },
        {},
        async (_err, res) => {
          expect(_err).toBe(null);
          expect(res.status).toBe(200);
          await getRequest('/notification_user', {}, (_, res) => {
            expect(res.body[0].status).toBe(newStatus);
          });
        },
      );
    });
  });
});
