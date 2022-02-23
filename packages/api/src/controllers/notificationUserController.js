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
    const { user } = req.query;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Content-Encoding': 'identity',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    });
    res.write('\n');

    console.log(`opening subscription user ${user}`);

    let userSubs = subscriptions.get(user);
    if (!userSubs) {
      userSubs = new Map();
      subscriptions.set(user, userSubs);
    }

    const opened = new Date();
    userSubs.set(opened, res);

    req.on('close', () => {
      console.log(`closing subscription user ${user} opened ${opened}`);
      const userSubs = subscriptions.get(user);
      if (userSubs) {
        userSubs.delete(opened);
      } else {
        console.log(
          `Problem closing alerts subscription: no subscription for user ${user} opened ${opened}`,
        );
      }
      if (userSubs.size === 0) subscriptions.delete(user);
    });
  },

  alert(farm_id, userIds) {
    userIds.forEach((user_id) => {
      const userSubs = subscriptions.get(user_id);
      if (userSubs) {
        userSubs.forEach((res) => res.write(`data: ${JSON.stringify({ farm_id, delta: 1 })}\n\n`));
      }
    });
  },
};
