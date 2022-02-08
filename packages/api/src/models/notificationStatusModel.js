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

class NotificationStatus extends baseModel {
  static get tableName() {
    return 'notification_status';
  }

  static get idColumn() {
    return ['notification_id', 'user_id'];
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['alert', 'status'],
      properties: {
        notification_id: { type: 'string' },
        user_id: { type: 'string' },
        alert: { type: 'boolean' },
        status: {
          type: 'string',
          enum: ['Unread', 'Read', 'Archived'],
        },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      notification: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./Notification'),
        join: {
          from: 'notification_status.',
          to: 'notification.notification_id',
        },
      },
    };
  }
}

module.exports = NotificationStatus;
