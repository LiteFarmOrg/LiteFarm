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

class farmDataSchedule extends Model {
  static get tableName() {
    return 'farmDataSchedule';
  }

  static get idColumn() {
    return 'request_number';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_id'],

      properties: {
        request_number: { type: 'number' },
        user_id: { type: 'string' },
        farm_id: { type: 'string' },
        is_processed: { type: 'boolean' },
        created_at: { type: 'string' },
        has_failed: { type: 'boolean' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      user: {
        modelClass: require('./userModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'farmDataSchedule.user_id',
          to: 'users.user_id',
        },
      },
      farm: {
        modelClass: require('./farmModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'farmDataSchedule.farm_id',
          to: 'farm.farm_id',
        },
      },
    }
  }
}

module.exports = farmDataSchedule;
