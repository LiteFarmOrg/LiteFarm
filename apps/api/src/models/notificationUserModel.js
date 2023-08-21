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

import Model from './baseFormatModel.js';

import baseModel from './baseModel.js';
import Notification from './notificationModel.js';

/**
 * Models data persistence for users' notifications.
 */
class NotificationUser extends baseModel {
  /**
   * Tracks open subscription channels for server-sent events. To support multiple sessions by the same user,
   *   keys are user IDs; values are Maps with timestamp keys and HTTP response object values.
   * @member {Map}
   * @static
   */
  static subscriptions = new Map();

  /**
   * Identifies the database table for this Model.
   * @static
   * @returns {string} Names of the database table.
   */
  static get tableName() {
    return 'notification_user';
  }

  /**
   * Identifies the primary key fields for this Model.
   * @static
   * @returns {string[]} Names of the primary key fields.
   */
  static get idColumn() {
    return ['notification_id', 'user_id'];
  }

  /**
   * Supports validating instances of this Model class.
   * @static
   * @returns {Object} A description of valid instances.
   */
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id'],
      properties: {
        notification_id: { type: 'string' },
        user_id: { type: 'string' },
        alert: { type: 'boolean' },
        status: {
          type: 'string',
          /**
           * @name userNotificationStatusType
           * @desc Enumerated type for user notification status.
           * @enum
           * */
          enum: ['Unread', 'Read', 'Archived'],
        },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  /**
   * Defines this Model's associations with other Models.
   * @static
   * @returns {Object} A description of Model associations.
   */
  static get relationMappings() {
    return {
      notification: {
        relation: Model.BelongsToOneRelation,
        modelClass: Notification,
        join: {
          from: 'notification_user.notification_id',
          to: 'notification.notification_id',
        },
      },
    };
  }

  /**
   * Retrieves notifications for a specified user and farm context.
   * @param {uuid} farm_id - The farm context.
   * @param {uuid} user_id - The specified user.
   * @static
   * @async
   * @returns {Promise<Object[]>} An array of data objects.
   */
  static async getNotificationsForFarmUser(farm_id, user_id) {
    return NotificationUser.query()
      .join('notification', 'notification_user.notification_id', 'notification.notification_id')
      .select(
        'notification.notification_id',
        'user_id',
        'alert',
        'status',
        'title',
        'body',
        'variables',
        'ref',
        'context',
        'notification_user.created_at',
      )
      .whereNotDeleted()
      .where((builder) => {
        builder.whereNull('farm_id').orWhere({ farm_id });
      })
      .andWhere({ user_id })
      .andWhere({ 'notification.deleted': false })
      .orderBy('notification_user.created_at', 'desc')
      .limit(100)
      .context({ showHidden: true });
  }

  /**
   * Stores modifications for a set of user notifications
   * @param {uuid} userId - The specified user.
   * @param {uuid[]} notificationIds - An array of notification identifiers.
   * @param {object} modifications - The altered data values.u
   * @static
   * @async
   */
  static async update(userId, notificationIds, modifications) {
    await NotificationUser.query()
      .patch(modifications)
      .whereIn('notification_id', notificationIds)
      .andWhere('user_id', userId)
      .context({ user_id: userId });
  }

  /**
   * Clears the alert indicator for a specified set of the user's notifications.
   * @param {uuid} userId - The specified user.
   * @param {uuid} farmId - The user session's current farm.
   * @param {uuid[]} notificationIds - An array of notification identifiers.
   * @static
   * @async
   */
  static async clearAlerts(userId, farmId, notificationIds) {
    const count = await NotificationUser.query()
      .patch({ alert: false })
      .whereIn('notification_id', notificationIds)
      .andWhere('user_id', userId)
      .andWhere('alert', true)
      .context({ user_id: userId });
    const userSubs = NotificationUser.subscriptions.get(userId);
    userSubs?.forEach((subscriber) => {
      subscriber?.forEach((subscription) => {
        if (farmId === subscription.farm_id) {
          subscription.sendAlert(-count);
        }
      });
    });
  }

  /**
   * Creates a notification and initiates status tracking for a specified set of recipients.
   * @param {Object} notification - A notification to be created.
   * @param {uuid[]} userIds - The user IDs of the recipients.
   * @static
   * @async
   */
  static async notify(notification, userIds) {
    if (!userIds.length) return;
    const { notification_id } = await Notification.query()
      .insert(notification)
      .context({ user_id: '1' });
    await Promise.all(
      userIds.map(async (user_id) => {
        await NotificationUser.query()
          .insert({ user_id, notification_id })
          .context({ user_id: '1' });
      }),
    );
    NotificationUser.alert(notification.farm_id, userIds);
  }

  /**
   * Alerts any recipients with open subscription channels of a new notification.
   * @param {uuid} farm_id - The farm context of the new notification (`null` for all farms).
   * @param {uuid[]} userIds - The user IDs of the recipients.
   * @static
   */
  static alert(farm_id, userIds) {
    userIds.forEach((user_id) => {
      const userSubs = NotificationUser.subscriptions.get(user_id);
      userSubs?.forEach((subscriber) => {
        subscriber?.forEach((subscription) => {
          if (farm_id === subscription.farm_id || farm_id === null) {
            subscription.sendAlert();
          }
        });
      });
    });
  }
}

export default NotificationUser;
