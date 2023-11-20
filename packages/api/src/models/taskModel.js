/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import Model from './baseFormatModel.js';

import BaseModel from './baseModel.js';
import soilAmendmentTaskModel from './soilAmendmentTaskModel.js';
import pestControlTask from './pestControlTask.js';
import irrigationTaskModel from './irrigationTaskModel.js';
import scoutingTaskModel from './scoutingTaskModel.js';
import soilTaskModel from './soilTaskModel.js';
import fieldWorkTaskModel from './fieldWorkTaskModel.js';
import harvestTaskModel from './harvestTaskModel.js';
import cleaningTaskModel from './cleaningTaskModel.js';
import taskTypeModel from './taskTypeModel.js';
import plantTaskModel from './plantTaskModel.js';
import transplantTaskModel from './transplantTaskModel.js';
import plantingManagementPlanModel from './plantingManagementPlanModel.js';
import managementTasksModel from './managementTasksModel.js';
import locationModel from './locationModel.js';
import locationTasksModel from './locationTasksModel.js';

class TaskModel extends BaseModel {
  static get tableName() {
    return 'task';
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
      required: ['due_date', 'task_type_id'],
      properties: {
        task_id: { type: 'integer' },
        task_type_id: { type: 'integer' },
        due_date: { type: 'string', format: 'date' },
        notes: { type: ['string', 'null'], maxLength: 10000 },
        completion_notes: { type: ['string', 'null'], maxLength: 10000 },
        owner_user_id: { type: 'string' },
        assignee_user_id: { type: ['string', 'null'] },
        coordinates: { type: ['object', 'null'] },
        duration: { type: ['number', 'null'] },
        wage_at_moment: { type: ['number', 'null'] },
        happiness: { type: ['integer', 'null'], minimum: 0, maximum: 5 },
        complete_date: { type: ['string', 'null'], format: 'date' },
        late_time: { type: ['string', 'null'], format: 'date-time' },
        for_review_time: { type: ['string', 'null'], format: 'date-time' },
        abandon_date: { type: ['string', 'null'], format: 'date' },
        abandonment_reason: {
          type: 'string',
          enum: [
            'OTHER',
            'CROP_FAILURE',
            'LABOUR_ISSUE',
            'MARKET_PROBLEM',
            'WEATHER',
            'MACHINERY_ISSUE',
            'SCHEDULING_ISSUE',
          ],
        },
        other_abandonment_reason: { type: ['string', 'null'] },
        abandonment_notes: { type: ['string', 'null'], maxLength: 10000 },
        override_hourly_wage: { type: 'boolean' },
        // photo deprecated LF-3471
        photo: { type: ['string', 'null'] },
        // action_needed deprecated LF-3471
        action_needed: { type: 'boolean' },
        ...super.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      soil_amendment_task: {
        relation: Model.HasOneRelation,
        modelClass: soilAmendmentTaskModel,
        join: {
          from: 'task.task_id',
          to: 'soil_amendment_task.task_id',
        },
      },
      pest_control_task: {
        relation: Model.HasOneRelation,
        modelClass: pestControlTask,
        join: {
          from: 'task.task_id',
          to: 'pest_control_task.task_id',
        },
      },
      irrigation_task: {
        relation: Model.HasOneRelation,
        modelClass: irrigationTaskModel,
        join: {
          from: 'task.task_id',
          to: 'irrigation_task.task_id',
        },
      },
      scouting_task: {
        relation: Model.HasOneRelation,
        modelClass: scoutingTaskModel,
        join: {
          from: 'task.task_id',
          to: 'scouting_task.task_id',
        },
      },
      soil_task: {
        relation: Model.HasOneRelation,
        modelClass: soilTaskModel,
        join: {
          from: 'task.task_id',
          to: 'soil_task.task_id',
        },
      },
      field_work_task: {
        relation: Model.HasOneRelation,
        modelClass: fieldWorkTaskModel,
        join: {
          from: 'task.task_id',
          to: 'field_work_task.task_id',
        },
      },
      harvest_task: {
        relation: Model.HasOneRelation,
        modelClass: harvestTaskModel,
        join: {
          from: 'task.task_id',
          to: 'harvest_task.task_id',
        },
      },
      cleaning_task: {
        relation: Model.HasOneRelation,
        modelClass: cleaningTaskModel,
        join: {
          from: 'task.task_id',
          to: 'cleaning_task.task_id',
        },
      },
      taskType: {
        relation: Model.BelongsToOneRelation,
        modelClass: taskTypeModel,
        join: {
          from: 'task.task_type_id',
          to: 'task_type.task_type_id',
        },
      },
      plant_task: {
        relation: Model.HasOneRelation,
        modelClass: plantTaskModel,
        join: {
          from: 'task.task_id',
          to: 'plant_task.task_id',
        },
      },
      transplant_task: {
        relation: Model.HasOneRelation,
        modelClass: transplantTaskModel,
        join: {
          from: 'task.task_id',
          to: 'transplant_task.task_id',
        },
      },
      //TODO: rename to plantingManagementPlans
      managementPlans: {
        modelClass: plantingManagementPlanModel,
        relation: Model.ManyToManyRelation,
        join: {
          from: 'task.task_id',
          through: {
            modelClass: managementTasksModel,
            from: 'management_tasks.task_id',
            to: 'management_tasks.planting_management_plan_id',
          },
          to: 'planting_management_plan.planting_management_plan_id',
        },
      },
      locations: {
        modelClass: locationModel,
        relation: Model.ManyToManyRelation,
        join: {
          from: 'task.task_id',
          through: {
            modelClass: locationTasksModel,
            from: 'location_tasks.task_id',
            to: 'location_tasks.location_id',
          },
          to: 'location.location_id',
        },
      },
      locationTasks: {
        modelClass: locationTasksModel,
        relation: Model.HasManyRelation,
        join: {
          from: 'task.task_id',
          to: 'location_tasks.task_id',
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
      task_type_id: 'keep',
      due_date: 'edit',
      notes: 'keep',
      completion_notes: 'omit',
      owner_user_id: 'edit',
      assignee_user_id: 'edit',
      coordinates: 'edit',
      duration: 'omit',
      wage_at_moment: 'edit',
      happiness: 'omit',
      complete_date: 'omit',
      late_time: 'omit',
      for_review_time: 'omit',
      abandon_date: 'omit',
      abandonment_reason: 'omit',
      other_abandonment_reason: 'omit',
      abandonment_notes: 'omit',
      override_hourly_wage: 'omit',
      photo: 'omit',
      action_needed: 'omit',
      // relationMappings
      soil_amendment_task: 'edit',
      pest_control_task: 'edit',
      irrigation_task: 'edit',
      scouting_task: 'edit',
      soil_task: 'edit',
      field_work_task: 'edit',
      harvest_task: 'edit',
      cleaning_task: 'edit',
      taskType: 'omit',
      plant_task: 'edit',
      transplant_task: 'edit',
      managementPlans: 'omit',
      locations: 'edit',
    };
  }

  /**
   * Gets the assignee of a task.
   * @param {number} taskId - the ID of the task.
   * @static
   * @async
   * @returns {Object} - Object {assignee_user_id, assignee_role_id, wage_at_moment, override_hourly_wage}
   */
  static async getTaskAssignee(taskId) {
    return await TaskModel.query()
      .whereNotDeleted()
      .join('users', 'task.assignee_user_id', 'users.user_id')
      .join('userFarm as uf', 'users.user_id', 'uf.user_id')
      .join('role', 'role.role_id', 'uf.role_id')
      .select(
        TaskModel.knex().raw(
          'users.user_id as assignee_user_id, role.role_id as assignee_role_id, task.wage_at_moment, task.override_hourly_wage',
        ),
      )
      .where('task.task_id', taskId)
      .first();
  }

  /**
   * Gets the type of a task
   * @param taskId {number} - id of the Task.
   * @return {Promise<Object>}
   * @static
   * @async
   */
  static async getTaskType(taskId) {
    return await TaskModel.query()
      .join('task_type', 'task.task_type_id', 'task_type.task_type_id')
      .whereNotDeleted()
      .select('task_type.*')
      .where('task.task_id', taskId)
      .first();
  }

  /**
   * Gets the tasks that are due this week and are unassigned
   * @param {number} taskIds - the IDs of the task.
   * @static
   * @async
   * @returns {Object} - Object {task_type_id, task_id}
   */
  static async getUnassignedTasksDueThisWeekFromIds(taskIds, isDayLaterThanUTC = false) {
    const dayLaterInterval = isDayLaterThanUTC ? '"1 day"' : '"0 days"';
    return await TaskModel.query().select('*').whereIn('task_id', taskIds).whereRaw(
      `
      task.assignee_user_id IS NULL
      AND task.complete_date IS NULL
      AND task.abandon_date IS NULL
      AND task.due_date <= (now() + ('1 week')::interval + (?)::interval)::date
      AND task.due_date >= (now() + (?)::interval)::date
      `,
      [dayLaterInterval, dayLaterInterval],
    );
  }

  /**
   * Gets the tasks that are due this week and are unassigned
   * @param {uuid} taskId - the ID of the task whose status is being checked
   * @static
   * @async
   * @returns {Object} - Object {complete_date, abandon_date, assignee_user_id, task_translation_key}
   */
  static async getTaskStatus(taskId) {
    return await TaskModel.query()
      .leftOuterJoin('task_type', 'task.task_type_id', 'task_type.task_type_id')
      .select('complete_date', 'abandon_date', 'assignee_user_id', 'task_translation_key')
      .where('task_id', taskId)
      .andWhere('task.deleted', false)
      .first();
  }

  /**
   * Assign the task to the user with the given assigneeUserId.
   * @param {uuid} taskId - the ID of the task
   * @param {uuid} assigneeUserId - the ID of user whose the task is being assigned too
   * @param {Object} user - the user who requested this task assignment
   * @static
   * @async
   * @returns {Object} - Task Object
   */
  static async assignTask(taskId, assigneeUserId, user) {
    return await TaskModel.query()
      .context(user)
      .patchAndFetchById(taskId, { assignee_user_id: assigneeUserId });
  }

  /**
   * Assign tasks to the user with the given assigneeUserId.
   * @param {uuid} taskIds - the IDs of the tasks
   * @param {uuid} assigneeUserId - the ID of user whose the task is being assigned too
   * @param {Object} user - the user who requested this task assignment
   * @static
   * @async
   * @returns {Object} - Task Object
   */
  static async assignTasks(taskIds, assigneeUserId, user) {
    return await TaskModel.query()
      .context(user)
      .patch({
        assignee_user_id: assigneeUserId,
      })
      .whereIn('task_id', taskIds);
  }

  /**
   * Checks whether a given user in a given farm has tasks that are due today.
   * @param {string} userId user id
   * @param {Array} taskIds task ids from a farm
   * @static
   * @async
   * @returns {boolean} true if the user has tasks due today or false if not
   */
  static async hasTasksDueTodayForUserFromFarm(userId, taskIds, isDayLaterThanUTC = false) {
    const today = new Date();
    if (isDayLaterThanUTC) today.setDate(today.getDate() + 1);
    const tasksDueToday = await TaskModel.query()
      .select('*')
      .whereIn('task_id', taskIds)
      .whereNotDeleted()
      .andWhere('task.assignee_user_id', userId)
      .andWhere('task.due_date', today);

    return tasksDueToday && tasksDueToday.length;
  }

  /**
   * Returns all available tasks on the given date from the given taskIds
   * Available in this case means unassigned, incomplete, not abandoned, and not deleted
   * @param {Array} taskIds - taskIds to search
   * @param {string} date - the date to search
   * @param {Object} user - the user who requested this task assignment
   * @static
   * @async
   * @returns {Object} - Task Object.
   */
  static async getAvailableTasksOnDate(taskIds, date, user) {
    return await TaskModel.query()
      .leftOuterJoin('task_type', 'task.task_type_id', 'task_type.task_type_id')
      .context(user)
      .select('*')
      .where((builder) => {
        builder.where('task.due_date', date);
        builder.whereIn('task.task_id', taskIds);
        builder.where('task.assignee_user_id', null);
        builder.where('task.complete_date', null);
        builder.where('task.abandon_date', null);
        builder.where('task.deleted', false);
      });
  }

  static async deleteTask(task_id, user) {
    try {
      const deleteResponse = await TaskModel.query()
        .context(user)
        .patchAndFetchById(task_id, { deleted: true });
      return deleteResponse;
    } catch (error) {
      return error;
    }
  }
}

export default TaskModel;
