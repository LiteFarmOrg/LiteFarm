/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (cleaningTaskModel.js) is part of LiteFarm.
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
import taskModel from './taskModel.js';

class CleaningTaskModel extends Model {
  static get tableName() {
    return 'cleaning_task';
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
      required: ['agent_used'],

      properties: {
        task_id: { type: 'integer' },
        product_id: { type: ['integer', 'null'] },
        other_purpose: { type: 'string' },
        cleaning_target: { type: ['string', 'null'] },
        agent_used: { type: ['boolean'] },
        water_usage: { type: ['number', 'null'] },
        water_usage_unit: { type: 'string', enum: ['ml', 'l', 'gal', 'fl-oz'] },
        product_quantity: { type: ['number', 'null'] },
        product_quantity_unit: { type: 'string', enum: ['ml', 'l', 'gal', 'fl-oz'] },
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
        modelClass: taskModel,
        join: {
          from: 'cleaning_task.task_id',
          to: 'task.task_id',
        },
      },
    };
  }

  // Custom function used in copy crop plan
  // Should contain all jsonSchema() and relationMappings() keys
  static get templateMappingSchema() {
    return {
      // jsonSchema()
      task_id: 'omit',
      product_id: 'keep',
      other_purpose: 'keep',
      cleaning_target: 'keep',
      agent_used: 'keep',
      water_usage: 'keep',
      water_usage_unit: 'keep',
      product_quantity: 'keep',
      product_quantity_unit: 'keep',
      // relationMappings
      task: 'omit',
    };
  }
}

export default CleaningTaskModel;
