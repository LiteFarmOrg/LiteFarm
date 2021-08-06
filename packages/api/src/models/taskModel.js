/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (taskModel.js) is part of LiteFarm.
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
const BaseModel = require('./baseModel');

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
      required: ['due_date', 'type', 'happiness'],

      properties: {
        task_id: { type: 'integer' },
        type: { type: 'integer' },
        due_date: { type: 'date-time' },
        notes: { type: 'string' },
        completion_notes: { type: 'string' },
        owner_user_id: { type: 'string' },
        assignee_user_id: { type: ['string', null] },
        coordinates: { type: 'object' },
        duration: { type: 'number' },
        wage_at_moment: { type: 'number' },
        happiness: { type: 'integer', minimum: 0, maximum: 5 },
        planned_time: { type: 'date-time' },
        completed_time: { type: ['date-time', null] },
        late_time: { type: ['date-time', null] },
        for_review_time: { type: ['date-time', null] },
        abandoned_time: { type: ['date-time', null] },
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
        modelClass: require('./soilAmendmentTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'soil_amendment_task.task_id',
        },
      },
      pest_control_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./pestControlTask'),
        join: {
          from: 'task.task_id',
          to: 'pest_control_task.task_id',
        },
      },
      irrigation_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./irrigationTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'irrigation_task.task_id',
        },
      },
      scouting_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./scoutingTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'scouting_task.task_id',
        },
      },
      soil_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./soilTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'soil_task.task_id',
        },
      },
      field_work_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./fieldWorkTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'field_work_task.task_id',
        },
      },
      harvest_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./harvestTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'harvest_task.task_id',
        },
      },
      harvestUse: {
        relation: Model.HasManyRelation,
        modelClass: require('./harvestUseModel'),
        join: {
          from: 'task.task_id',
          to: 'harvestUse.task_id',
        },
      },
      taskType: {
        relation: Model.HasManyRelation,
        modelClass: require('./taskTypeModel'),
        join: {
          from: 'task.type',
          to: 'task_type.task_type_id',
        },
      },
      plant_task: {
        relation: Model.HasOneRelation,
        modelClass: require('./plantTaskModel'),
        join: {
          from: 'task.task_id',
          to: 'plant_task.task_id',
        },
      },
      managementPlans: {
        modelClass: require('./managementPlanModel'),
        relation: Model.ManyToManyRelation,
        join: {
          from: 'task.task_id',
          through: {
            modelClass: require('./managementTasksModel'),
            from: 'management_tasks.task_id',
            to: 'management_tasks.management_plan_id',
          },
          to: 'management_plan.management_plan_id',
        },

      },
      locations: {
        modelClass: require('./locationModel'),
        relation: Model.ManyToManyRelation,
        join: {
          from: 'task.task_id',
          through: {
            modelClass: require('./locationTasksModel'),
            from: 'location_tasks.task_id',
            to: 'location_tasks.location_id',
          },
          to: 'location.location_id',
        },
      },
    };
  }
}

module.exports = TaskModel;
