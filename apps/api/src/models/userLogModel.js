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

import Model from './baseFormatModel.js';
import UserModel from './userModel.js';

class userLogModel extends Model {
  // Returned Date-time object from db is not compatible with ajv format types
  $parseJson(json, opt) {
    json = super.$parseJson(json, opt);
    if (json.created_at && typeof json.created_at === 'object') {
      json.created_at = json.created_at.toISOString();
    }
    return json;
  }

  static get tableName() {
    return 'userLog';
  }

  static get idColumn() {
    return 'user_log_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'user_id',
        'ip',
        'languages',
        'browser',
        'browser_version',
        'screen_width',
        'screen_height',
      ],
      properties: {
        user_log_id: { type: 'string' },
        user_id: { type: 'string' },
        farm_id: { type: 'string' },
        ip: { type: ['string', 'null'] },
        languages: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        browser: { type: ['string', 'null'] },
        browser_version: { type: ['string', 'null'] },
        os: { type: ['string', 'null'] },
        os_version: { type: ['string', 'null'] },
        device_vendor: { type: ['string', 'null'] },
        device_model: { type: ['string', 'null'] },
        device_type: { type: ['string', 'null'] },
        created_at: { type: 'string', format: 'date-time' },
        screen_width: { type: ['number', 'null'] },
        screen_height: { type: ['number', 'null'] },
        reason_for_failure: { type: 'string' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      user: {
        modelClass: UserModel,
        relation: Model.HasOneRelation,
        join: {
          from: 'userLog.user_id',
          to: 'users.user_id',
        },
      },
    };
  }
}

export default userLogModel;
