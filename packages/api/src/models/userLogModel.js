/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (userFarmModel.js) is part of LiteFarm.
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

class userLogModel extends Model{
  static get tableName() {
    return 'userLog';
  }

  static get idColumn() {
    return 'user_log_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'ip', 'languages', 'browser', 'browser_version', 'os', 'os_version',
        'screen_width', 'screen_height'],
      properties: {
        user_log_id: { type: 'string' },
        user_id: { type: 'string' },
        ip: { type: 'string' },
        languages: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        browser: { type: 'string' },
        browser_version: { type: 'string' },
        os: { type: 'string' },
        os_version: { type: 'string' },
        device_vendor: { type: 'string' },
        device_model: { type: 'string' },
        device_type: { type: 'string' },
        created_at: { type: 'date-time' },
        screen_width: { type: 'number' },
        screen_height: { type: 'number' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      user: {
        modelClass: require('./userModel.js'),
        relation: Model.HasOneRelation,
        join: {
          from: 'userLog.user_id',
          to: 'users.user_id',
        },
      },
    };
  }
}

module.exports = userLogModel;
