/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (seedLogModel.js) is part of LiteFarm.
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


class SeedLogModel extends Model {
  static get tableName() {
    return 'seedLog';
  }

  static get idColumn() {
    return 'activity_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        activity_id: { type: 'integer' },
        space_depth_cm: {
          type: 'float',
        },
        space_length_cm: {
          type: 'float',
        },
        space_width_cm: {
          type: 'float',
        },
        'rate_seeds/m2': {
          type: 'float',
        },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      activityLog: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./activityLogModel'),
        join: {
          from: 'seedLog.activity_id',
          to: 'activityLog.activity_id',
        },
      },
    };
  }
}

module.exports = SeedLogModel;
