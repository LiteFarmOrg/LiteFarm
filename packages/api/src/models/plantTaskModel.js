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

import Model from './baseFormatModel.js';
import taskModel from './taskModel.js';
import plantingManagementPlanModel from './plantingManagementPlanModel.js';

class PlantTaskModel extends Model {
  static get tableName() {
    return 'plant_task';
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
      required: ['task_id', 'planting_management_plan_id'],

      properties: {
        task_id: { type: 'integer' },
        planting_management_plan_id: {
          type: 'string',
        },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      task: {
        relation: Model.BelongsToOneRelation,
        modelClass: taskModel,
        join: {
          from: 'plant_task.task_id',
          to: 'task.task_id',
        },
      },
      planting_management_plan: {
        relation: Model.HasOneRelation,
        modelClass: plantingManagementPlanModel,
        join: {
          from: 'plant_task.planting_management_plan_id',
          to: 'planting_management_plan.planting_management_plan_id',
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
      planting_management_plan_id: 'edit',
      // relationMappings
      task: 'edit',
      planting_management_plan: 'omit',
    };
  }
}

export default PlantTaskModel;
