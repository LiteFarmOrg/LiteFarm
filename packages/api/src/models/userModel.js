/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (userModel.js) is part of LiteFarm.
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

class User extends Model {
  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get tableName() {
    return 'users';
  }

  static get idColumn() {
    return 'user_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['first_name', 'last_name', 'email'],

      properties: {
        user_id: { type: 'string' },
        first_name: { type: 'string', minLength: 1, maxLength: 255 },
        last_name: { type: 'string', maxLength: 255 },
        profile_picture: { type: 'string' },
        phone_number: { type : 'string' },
        address: { type : 'string' },
        email: { type: 'email' },
        farm_id: { type: ['string', 'null'] },
        notification_setting: {
          type: 'object',
          required:['alert_weather', 'alert_worker_finish', 'alert_action_after_scouting', 'alert_before_planned_date', 'alert_pest'],
          properties:{
            alert_weather: { type : 'boolean' },
            alert_worker_finish: { type : 'boolean' },
            alert_action_after_scouting: { type : 'boolean' },
            alert_before_planned_date: { type : 'boolean' },
            alert_pest: { type : 'boolean' },
          },
        },
        created_at: { type : 'date-time' },
        updated_at: { type : 'date-time' },
        password_hash: { type: 'string' },
      },
      additionalProperties: false,
    };
  }
}

module.exports = User;
