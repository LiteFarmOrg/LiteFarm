/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (harvestLogModel.js) is part of LiteFarm.
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

class HarvestLog extends Model {
  static get tableName() {
    return 'harvestLog';
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
      required: ['quantity_kg'],

      properties: {
        quantity_kg: { type: 'float' },
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
          from: 'harvestLog.activity_id',
          to: 'activityLog.activity_id',
        },

      },

      harvestUseType:{
        modelClass:require('./harvestUseTypeModel'),
        relation:Model.ManyToManyRelation,
        join:{
          from: 'harvestLog.activity_id',
          through: {
            modelClass: require('./harvestUseModel'),
            from: 'harvestUse.activity_id',
            to: 'harvestUse.harvest_use_type_id',
          },
          to: 'harvestUseType.harvest_use_type_id',
        },

      },

    };
  }
}

module.exports = HarvestLog;
