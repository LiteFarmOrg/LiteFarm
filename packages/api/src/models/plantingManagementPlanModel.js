/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (managementPlanModel.js) is part of LiteFarm.
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

import { Model } from 'objection';
import locationModel from './locationModel.js';
import broadcastMethodModel from './broadcastMethodModel.js';
import containerMethodModel from './containerMethodModel.js';
import bedMethodModel from './bedMethodModel.js';
import rowMethodModel from './rowMethodModel.js';
import transplantTaskModel from './transplantTaskModel.js';
import plantTaskModel from './plantTaskModel.js';
import managementTasksModel from './managementTasksModel.js';

class plantingManagementPlanModel extends Model {
  static get tableName() {
    return 'planting_management_plan';
  }

  static get idColumn() {
    return 'planting_management_plan_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['management_plan_id'],
      properties: {
        planting_management_plan_id: { type: 'string' },
        management_plan_id: { type: 'integer' },
        is_final_planting_management_plan: { type: 'boolean' },
        planting_task_type: {
          type: ['string', null],
          enum: ['TRANSPLANT_TASK', 'PLANT_TASK', null],
        },
        planting_method: {
          type: ['string', null],
          enum: ['BROADCAST_METHOD', 'CONTAINER_METHOD', 'BED_METHOD', 'ROW_METHOD', null],
        },
        is_planting_method_known: {
          type: ['boolean', null],
        },
        estimated_seeds: { type: ['number', null] },
        estimated_seeds_unit: { type: ['string'], enum: ['g', 'kg', 'mt', 'oz', 'lb', 't'] },
        location_id: { type: ['string', null] },
        pin_coordinate: {
          type: ['object', null],
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' },
          },
        },
        notes: { type: 'string' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      location: {
        relation: Model.HasOneRelation,
        modelClass: locationModel,
        join: {
          from: 'planting_management_plan.location_id',
          to: 'location.location_id',
        },
      },
      broadcast_method: {
        modelClass: broadcastMethodModel,
        relation: Model.HasOneRelation,
        join: {
          from: 'planting_management_plan.planting_management_plan_id',
          to: 'broadcast_method.planting_management_plan_id',
        },
      },
      container_method: {
        modelClass: containerMethodModel,
        relation: Model.HasOneRelation,
        join: {
          from: 'planting_management_plan.planting_management_plan_id',
          to: 'container_method.planting_management_plan_id',
        },
      },
      bed_method: {
        modelClass: bedMethodModel,
        relation: Model.HasOneRelation,
        join: {
          from: 'planting_management_plan.planting_management_plan_id',
          to: 'bed_method.planting_management_plan_id',
        },
      },
      row_method: {
        modelClass: rowMethodModel,
        relation: Model.HasOneRelation,
        join: {
          from: 'planting_management_plan.planting_management_plan_id',
          to: 'row_method.planting_management_plan_id',
        },
      },
      transplant_task: {
        modelClass: transplantTaskModel,
        relation: Model.HasOneRelation,
        join: {
          from: 'planting_management_plan.planting_management_plan_id',
          to: 'transplant_task.planting_management_plan_id',
        },
      },
      plant_task: {
        modelClass: plantTaskModel,
        relation: Model.HasOneRelation,
        join: {
          from: 'planting_management_plan.planting_management_plan_id',
          to: 'plant_task.planting_management_plan_id',
        },
      },
      managementTasks: {
        modelClass: managementTasksModel,
        relation: Model.HasManyRelation,
        join: {
          from: 'planting_management_plan.planting_management_plan_id',
          to: 'management_tasks.planting_management_plan_id',
        },
      },
    };
  }
}

export default plantingManagementPlanModel;
