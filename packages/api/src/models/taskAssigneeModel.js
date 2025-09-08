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

  static async assignTask(taskId, assigneeUserIds, trx) {
    // TODO: LF-4926 remove parameter trx and wrap method in a transaction internally
    //       (uncomment the next and last lines)
    // return TaskAssigneeModel.transaction(async (trx) => {

    // Remove assignees that are no longer assigned
    await TaskAssigneeModel.query(trx)
      .delete()
      .where({ task_id: taskId })
      .whereNotIn('assignee_user_id', assigneeUserIds || []);

    if (assigneeUserIds?.length) {
      // Insert new assignees (or keep existing ones)
      // https://knexjs.org/guide/query-builder.html#onconflict
      await TaskAssigneeModel.query(trx)
        .insert(
          assigneeUserIds.map((assigneeUserId) => ({
            task_id: taskId,
            assignee_user_id: assigneeUserId,
          })),
        )
        .onConflict(['task_id', 'assignee_user_id'])
        .merge();
    }

    // Return assignees
    return TaskAssigneeModel.query(trx).where({ task_id: taskId });
    // });
  }

  static async assignTasks(taskIds, assigneeUserIds, trx) {
    // TODO: LF-4926 remove parameter trx and wrap method in a transaction internally
    //       (uncomment the next and last lines)
    // return TaskAssigneeModel.transaction(async (trx) => {

    // Remove assignees that are no longer assigned
    await TaskAssigneeModel.query(trx)
      .delete()
      .whereIn('task_id', taskIds)
      .whereNotIn('assignee_user_id', assigneeUserIds || []);

    if (assigneeUserIds?.length) {
      const taskAssignees = [];
      for (const taskId of taskIds) {
        for (const assigneeUserId of assigneeUserIds) {
          taskAssignees.push({ task_id: taskId, assignee_user_id: assigneeUserId });
        }
      }

      // Insert new assignees (or keep existing ones)
      await TaskAssigneeModel.query(trx)
        .insert(taskAssignees)
        .onConflict(['task_id', 'assignee_user_id'])
        .merge();
    }

    // Return assignees
    return TaskAssigneeModel.query(trx).whereIn('task_id', taskIds);
    // });
  }
}

export default TaskAssigneeModel;
