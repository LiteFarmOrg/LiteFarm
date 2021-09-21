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

class HarvestTaskModel extends Model {
  static get tableName() {
    return 'harvest_task';
  }

  static get idColumn() {
    return 'task_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['task_id'],

      properties: {
        task_id: { type: 'integer' },
        projected_quantity: { type: 'number' },
        projected_quantity_unit: { type: 'string', enum: ['kg', 'mt', 'lb', 't'] },
        actual_quantity: { type: 'number' },
        actual_quantity_unit: { type: 'string', enum: ['kg', 'mt', 'lb', 't'] },
        harvest_everything: { type: 'boolean' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      task: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./taskModel'),
        join: {
          from: 'harvest_task.task_id',
          to: 'task.task_id',
        },

      },
      //TODO: revert back to harvestUses
      harvest_use: {
        modelClass: require('./harvestUseModel'),
        relation: Model.HasManyRelation,
        join: {
          from: 'harvest_task.task_id',
          to: 'harvest_use.task_id',
        },
      },

    };
  }
}

module.exports = HarvestTaskModel;
