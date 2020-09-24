/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (notificationModel.js) is part of LiteFarm.
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


class Notification extends Model {

  static get tableName() {
    return 'notification';
  }

  static get idColumn() {
    return 'notification_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'notification_kind'],

      properties: {
        notification_id: { type: 'string' },
        user_id: { type: 'string' },
        notification_kind: {
          type: 'string',
          enum: ['todo_added', 'alert_weather', 'alert_worker_finish', 'alert_action_after_scouting', 'alert_before_planned_date', 'alert_pest'],
        },
        notification_body: {
          type: 'object',
          required: ['message'],
          properties:{
            message: { type : 'string' },
          },
        },
        is_read: { type : 'boolean' },
      },
      additionalProperties: false,
    };
  }
}

module.exports = Notification;
