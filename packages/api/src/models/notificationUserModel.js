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

const Model = require('objection').Model;
const baseModel = require('./baseModel');
const Notification = require('./notificationModel');

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
   * @returns {Object[]} An array of data objects.
   */
  static async getNotificationsForFarmUser(farm_id, user_id) {
    return (
      await NotificationUser.knex().raw(
        `
      SELECT notification.notification_id, alert, status, translation_key, variables, 
        entity_type, entity_id, context, notification_user.created_at
      FROM notification JOIN notification_user
      ON notification.notification_id = notification_user.notification_id
      WHERE notification.deleted = false 
        AND notification_user.deleted = false 
        AND user_id = ? 
        AND (farm_id IS NULL OR farm_id = ?)
      ORDER BY notification_user.created_at DESC
      LIMIT 100;
      `,
        [user_id, farm_id],
      )
    ).rows;
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
    userIds.forEach(async (user_id) => {
      await NotificationUser.query().insert({ user_id, notification_id }).context({ user_id: '1' });
    });
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
      if (!userSubs) return;
      userSubs.forEach((subscription) => {
        if (farm_id === subscription.farm_id || farm_id === null) {
          subscription.sendAlert();
        }
      });
    });
  }
}

module.exports = NotificationUser;
