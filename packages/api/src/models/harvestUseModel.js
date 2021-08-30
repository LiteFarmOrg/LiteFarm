/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (cropSaleModel.js) is part of LiteFarm.
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

class HarvestUse extends Model {
  static get tableName() {
    return 'harvestUse';
  }

  static get idColumn() {
    return 'harvest_use_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['task_id', 'harvest_use_type_id', 'quantity_kg'],

      properties: {
        harvest_use_id: { type: 'integer' },
        task_id: { type: 'integer' },
        harvest_use_type_id: { type: 'integer' },
        quantity_kg: { type: 'float' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      harvest_task: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./harvestTaskModel'),
        join: {
          from: 'harvestUse.task_id',
          to: 'harvest_task.task_id',
        },
      },
      harvestUseType: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./harvestUseTypeModel'),
        join: {
          from: 'harvestUse.harvest_use_type_id',
          to: 'harvestUseType.harvest_use_type_id',
        },
      },
    }
  }
}

module.exports = HarvestUse;
