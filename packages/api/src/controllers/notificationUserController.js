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

/**
 * Controls requests related to the user's notifications.
 */
module.exports = {
  /**
   * Establishes a subscription for the user's notifications.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  subscribeToAlerts(req, res) {
    const { user_id, farm_id } = req.query;

    // Use server-sent events.
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Content-Encoding': 'identity',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    });
    res.write('\n');

    const opened = new Date().toISOString();

    // Maintain subscriptions Map(key = user_id, value = Map(key = timestamp, value = res)).
    const subscriptions = NotificationUser.subscriptions;

    let userSubs = subscriptions.get(user_id);
    if (!userSubs) {
      userSubs = new Map();
      subscriptions.set(user_id, userSubs);
    }

    // Register a function to send alerts to sessions for the user, farm combination.
    const sendAlert = (delta = 1) => {
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    };

    // Periodically send a "heartbeat" to prevent browser from closing idle connection.
    // Chrome appears to close connections that are idle for 1 minute.
    // Note: there is client code to reconnect after idle timeout or other disconnect.
    // But that causes scary error in browser console, plus brief outage in connectivity.
    const intervalId = setInterval(() => {
      sendAlert(0);
    }, 1000 * 45);

    // Register a function to end the long-term HTTP response that handles server-sent events.
    const endHttpRes = () => {
      res.end();
    };

    // Record the subscription.
    userSubs.set(opened, { farm_id, sendAlert, endHttpRes });
    subscriptions.set('count', (subscriptions.get('count') || 0) + 1);
    console.log(`Opening subscription: user ${user_id} at ${opened}`);
    console.log(
      `  ${subscriptions.size - 1} users have ${subscriptions.get('count')} active subscriptions.`,
    );

    // Cleans up subscription tracking when HTTP request closes.
    req.on('close', () => {
      clearInterval(intervalId);
      const userSubs = subscriptions.get(user_id);
      if (!userSubs) {
        console.log(`Cannot close non-existent subscription: user ${user_id}`);
        return;
      }

      const sub = userSubs.get(opened);
      if (!sub) {
        console.log(`Cannot close non-existent subscription: user ${user_id} opened at ${opened}`);
        return;
      }

      // End the HTTP response.
      sub.endHttpRes();

      // Remove the subscription tracking.
      userSubs.delete(opened);
      if (userSubs.size === 0) subscriptions.delete(user_id);
      subscriptions.set('count', subscriptions.get('count') - 1);
      console.log(`Closed subscription: user ${user_id} opened at ${opened}`);
      console.log(
        `  ${subscriptions.size - 1} users have ${subscriptions.get(
          'count',
        )} active subscriptions.`,
      );
    });
  },

  /**
   * Responds with the user's notifications regarding their current farm.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @async
   */
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

  /**
   * Handles requests to update user notifications.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @async
   */
  async patchNotifications(req, res) {
    const payload = { ...req.body };
    delete payload.notification_ids;
    try {
      await NotificationUser.update(req.user.user_id, req.body.notification_ids, payload);
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error });
    }
  },

  /**
   * Handles requests to clear notification alert indicators.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @async
   */
  async clearAlerts(req, res) {
    try {
      await NotificationUser.clearAlerts(
        req.user.user_id,
        req.headers.farm_id,
        req.body.notification_ids,
      );
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error });
    }
  },
};
