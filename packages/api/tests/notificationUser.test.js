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
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';

describe('Notification tests', () => {
  function getRequest(url, { user_id = user.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).get(url).set('user_id', user_id).set('farm_id', farm_id).end(callback);
  }

  let user;
  let farm;
  let userFarm;

  beforeEach(async () => {
    [user] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [userFarm] = await mocks.userFarmFactory({ promisedUser: [user], promisedFarm: [farm] });
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('GET user notifications', () => {
    test('Users should get their notifications scoped for all farms', async (done) => {
      const [notification] = await mocks.notification_userFactory({
        promisedUserFarm: [userFarm],
      });
      getRequest('/notification_user', {}, (err, res) => {
        expect(err).toBe(null);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].user_id).toBe(user.user_id);
        expect(res.body[0].notification_id).toBe(notification.notification_id);
        done();
      });
    });

    test('Users should get their notifications scoped for their current farm', async (done) => {
      const [notification] = await mocks.notification_userFactory({
        promisedUserFarm: [userFarm],
      });
      getRequest('/notification_user', {}, (err, res) => {
        expect(err).toBe(null);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].user_id).toBe(user.user_id);
        expect(res.body[0].notification_id).toBe(notification.notification_id);
        done();
      });
    });

    test('Users should not get their notifications scoped for farms other than their current farm', async (done) => {
      const [otherFarm] = await mocks.farmFactory();
      const [otherUserFarm] = await mocks.userFarmFactory({
        promisedUser: [user],
        promisedFarm: [otherFarm],
      });
      await mocks.notification_userFactory({
        promisedUserFarm: [otherUserFarm],
      });
      getRequest('/notification_user', {}, (err, res) => {
        expect(err).toBe(null);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
        done();
      });
    });

    test('Users are not authorized to get "their" notifications for farms where they are not active', async (done) => {
      const [inactiveFarm] = await mocks.farmFactory();
      const [inactiveUserFarm] = await mocks.userFarmFactory(
        { promisedUser: [user], promisedFarm: [inactiveFarm] },
        (userFarm = mocks.fakeUserFarm({ status: 'Inactive' })),
      );
      await mocks.notification_userFactory({
        promisedUserFarm: [inactiveUserFarm],
      });
      getRequest('/notification_user', { farm_id: inactiveFarm.farm_id }, (err, res) => {
        expect(err).toBe(null);
        expect(res.status).toBe(403);
        done();
      });
    });
  });

  describe('PATCH user notifications', () => {
    function clearAlerts(
      notificationIds,
      { user_id = user.user_id, farm_id = farm.farm_id },
      callback,
    ) {
      chai
        .request(server)
        .patch('/notification_user/clear_alerts')
        .set('user_id', user_id)
        .set('farm_id', farm_id)
        .send(notificationIds)
        .end(callback);
    }

    function setStatus(body, { user_id = user.user_id, farm_id = farm.farm_id }, callback) {
      chai
        .request(server)
        .patch('/notification_user')
        .set('user_id', user_id)
        .set('farm_id', farm_id)
        .send(body)
        .end(callback);
    }

    test('Users can clear alert flag on a set of their notifications', async (done) => {
      const [notification] = await mocks.notification_userFactory({
        promisedUserFarm: [userFarm],
      });
      expect(notification.alert).toBe(true);
      clearAlerts({ notification_ids: [notification.notification_id] }, {}, (err, res) => {
        expect(err).toBe(null);
        expect(res.status).toBe(200);
        getRequest('/notification_user', {}, (_, res) => {
          expect(res.body[0].alert).toBe(false);
          done();
        });
      });
    });

    test('Users can modify the status for a set of their notifications', async (done) => {
      const [notification] = await mocks.notification_userFactory({
        promisedUserFarm: [userFarm],
      });
      expect(notification.status).toBe('Unread');
      const newStatus = 'Read';
      setStatus(
        { notification_ids: [notification.notification_id], status: newStatus },
        {},
        (err, res) => {
          expect(err).toBe(null);
          expect(res.status).toBe(200);
          getRequest('/notification_user', {}, (_, res) => {
            expect(res.body[0].status).toBe(newStatus);
            done();
          });
        },
      );
    });
  });
});
