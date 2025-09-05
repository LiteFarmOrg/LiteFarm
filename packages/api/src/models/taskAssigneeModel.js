/*
 *  Copyright 2025 LiteFarm.org
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

import Model from './baseFormatModel.js';
import TaskModel from './taskModel.js';

class TaskAssigneeModel extends Model {
  static get tableName() {
    return 'task_assignee';
  }

  static get idColumn() {
    return ['task_id', 'assignee_user_id'];
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['task_id', 'assignee_user_id'],
      properties: {
        task_id: { type: 'integer' },
        assignee_user_id: { type: 'string' },
        duration: { type: ['number', 'null'] },
        happiness: { type: ['integer', 'null'], minimum: 0, maximum: 5 },
        report_date: { type: ['string', 'null'], format: 'date' },
        report_notes: { type: ['string', 'null'], maxLength: 10000 },
        wage_at_completion: { type: ['number', 'null'] },
        revision_date: { type: ['string', 'null'], format: 'date-time' },
        revised_by_user_id: { type: ['string', 'null'] },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      task: {
        relation: Model.BelongsToOneRelation,
        modelClass: TaskModel,
        join: {
          from: 'task_assignee.task_id',
          to: 'task.task_id',
        },
      },
    };
  }
}

export default TaskAssigneeModel;
