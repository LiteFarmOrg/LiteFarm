/*
 *  Copyright 2019-2022 LiteFarm.org
 *  This file is part of LiteFarm.
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

class transplantTaskModel extends Model {
  static get tableName() {
    return 'transplant_task';
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
        planting_management_plan_id: {
          type: 'string',
        },
        prev_planting_management_plan_id: {
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
        modelClass: require('./taskModel'),
        join: {
          from: 'transplant_task.task_id',
          to: 'task.task_id',
        },
      },
      planting_management_plan: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./plantingManagementPlanModel'),
        join: {
          from: 'transplant_task.planting_management_plan_id',
          to: 'planting_management_plan.planting_management_plan_id',
        },
      },
    };
  }

  /**
   * Populates test data for a new transplant task, given IDs for an existing task and two planting management plans.
   *
   * @param {number} taskId - The primary key of the `task` table record representing the task.
   * @param {string} transplantMgtPlanId - The primary key of the `planting_management_plan` record for the tranplanting task.
   * @param {string} plantMgtPlanId - The primary key of the `planting_management_plan` record for the original planting task.
   * @returns {object} The data contents of the new record in table `transplant_task`.
   */
  static async createTestRecord(taskId, transplantMgtPlanId, plantMgtPlanId) {
    return await transplantTaskModel.query().insert({ task_id: taskId, planting_management_plan_id: transplantMgtPlanId, prev_planting_management_plan_id: plantMgtPlanId }).returning('*');
  }
}

module.exports = transplantTaskModel;
