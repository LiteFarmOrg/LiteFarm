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

const NotificationUser = require('../models/notificationUserModel');

const subscriptions = new Map();

module.exports = {
  async getNotifications(req, res) {
    try {
      const notifications = await NotificationUser.getNotificationsForFarmUser(
        req.headers.farm_id,
        req.user.user_id,
      );
      res.status(200).send(notifications);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error });
    }
  },

  subscribeToAlerts(req, res) {
    const { user_id, farm_id } = req.query;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Content-Encoding': 'identity',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    });
    res.write('\n');

    console.log(`opening subscription user ${user_id}`);

    let userSubs = subscriptions.get(user_id);
    if (!userSubs) {
      userSubs = new Map();
      subscriptions.set(user_id, userSubs);
    }

    const opened = new Date().toISOString();
    userSubs.set(opened, { farm_id, res });

    req.on('close', () => {
      console.log(`closing subscription user ${user_id} opened ${opened}`);
      const userSubs = subscriptions.get(user_id);
      if (!userSubs) {
        console.log(`Problem closing alerts subscription: no subscriptions for user ${user_id}`);
        return;
      }

      const sub = userSubs.get(opened);
      if (!sub) {
        console.log(
          `Problem closing alerts subscription: no subscription for user ${user_id} opened ${opened}`,
        );
        return;
      }
      sub.res.end();
      userSubs.delete(opened);
      if (userSubs.size === 0) subscriptions.delete(user_id);
    });
  },

  alert(farm_id, userIds) {
    userIds.forEach((user_id) => {
      const userSubs = subscriptions.get(user_id);
      if (userSubs) {
        userSubs.forEach((sub) => {
          if (sub.farm_id === farm_id || farm_id === null) {
            sub.res.write(`data: ${JSON.stringify({ delta: 1 })}\n\n`);
          }
        });
      }
    });
  },
};
