/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (soilDataLogModel.js) is part of LiteFarm.
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

class SoilDataLog extends Model {
  static get tableName() {
    return 'soilDataLog';
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
        start_depth: { type: 'integer' },
        end_depth: { type: 'integer' },
        depth_cm: { type: 'string' },
        texture: { type: 'string', enum:['sand', 'loamySand', 'sandyLoam', 'loam',
          'siltLoam', 'silt', 'sandyClayLoam', 'clayLoam', 'siltyClayLoam',
          'sandyClay', 'siltyClay', 'clay'] },
        k: { type: 'integer' },
        p: { type: 'integer' },
        n: { type: 'integer' },
        na: { type: 'integer' },
        om: { type: 'integer' },
        ph: { type: 'integer' },
        'bulk_density_kg/m3': { type: 'float' },
        organic_carbon: { type: 'integer' },
        inorganic_carbon: { type: 'integer' },
        total_carbon: { type: 'integer' },
        s: { type: 'integer' },
        ca: { type: 'integer' },
        mg: { type: 'integer' },
        zn: { type: 'integer' },
        mn: { type: 'integer' },
        fe: { type: 'integer' },
        cu: { type: 'integer' },
        b: { type: 'integer' },
        c: { type: 'integer' },
        cec: { type: 'float' },
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
          from: 'soilDataLog.activity_id',
          to: 'activityLog.activity_id',
        },
      },

    };
  }
}

module.exports = SoilDataLog;
