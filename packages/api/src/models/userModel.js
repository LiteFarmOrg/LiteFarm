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
  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);
    this.updated_at = new Date().toISOString();
    !queryContext.shouldUpdateEmail && delete this.email;
  }

  async $beforeInsert(context) {
    await super.$beforeInsert(context);
    this.email && (this.email = this.email.toLowerCase());
  }

  static async beforeFind(args) {
    await super.beforeFind(args);
    this.email && (this.email = this.email.toLowerCase());
  }

  static get tableName() {
    return 'users';
  }

  static get idColumn() {
    return 'user_id';
  }

  static get hidden() {
    return ['created_at', 'updated_at'];
  }

  static get hiddenFromOtherUsers() {
    return ['gender', 'birth_year', 'notification_setting'];
  }

  async $afterFind(queryContext) {
    await super.$afterFind(queryContext);
    const { hidden, hiddenFromOtherUsers } = this.constructor;
    if (hidden.length > 0) {
      const { showHidden, user_id } = queryContext;
      if (!showHidden) {
        let fieldsToBeHidden = [];
        if (this.user_id === user_id) {
          fieldsToBeHidden = hidden;
        }else{
          fieldsToBeHidden = [...hidden, ...hiddenFromOtherUsers]
        }
        for (const property of fieldsToBeHidden) {
          delete this[property];
        }
      }
    }
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
        phone_number: { type: 'string' },
        address: { type: 'string' },
        email: { type: 'email' },
        farm_id: { type: ['string', 'null'] },
        notification_setting: {
          type: 'object',
          required: ['alert_weather', 'alert_worker_finish', 'alert_action_after_scouting', 'alert_before_planned_date', 'alert_pest'],
          properties: {
            alert_weather: { type: 'boolean' },
            alert_worker_finish: { type: 'boolean' },
            alert_action_after_scouting: { type: 'boolean' },
            alert_before_planned_date: { type: 'boolean' },
            alert_pest: { type: 'boolean' },
          },
        },
        language_preference: { type: 'string' },
        status: { type: 'number' },
        gender: {
          type: 'string',
          enum: ['OTHER', 'PREFER_NOT_TO_SAY', 'MALE', 'FEMALE'],
        },
        birth_year: { type: ['number', null], multipleOf: 1.0, minimum: 1900, maximum: new Date().getFullYear() },
        created_at: { type: 'date-time' },
        updated_at: { type: 'date-time' },
      },
      additionalProperties: false,
    };
  }
}

module.exports = User;
