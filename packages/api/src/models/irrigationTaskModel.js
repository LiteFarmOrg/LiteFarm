/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (irrigationLogModel.js) is part of LiteFarm.
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
import IrrigationTypesModel from './irrigationTypesModel.js';

class IrrigationTaskModel extends Model {
  static get tableName() {
    return 'irrigation_task';
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
      required: ['irrigation_type_name'],

      properties: {
        task_id: { type: 'integer' },
        irrigation_type_id: { type: 'number' },
        irrigation_type_name: { type: 'string' },
        estimated_duration: { type: ['number', 'null'] },
        estimated_duration_unit: { type: ['string', 'null'] },
        estimated_flow_rate: { type: ['number', 'null'] },
        estimated_flow_rate_unit: { type: ['string', 'null'] },
        location_id: { type: 'string' },
        estimated_water_usage: { type: ['number', 'null'] },
        estimated_water_usage_unit: { type: ['string', 'null'] },
        application_depth: { type: ['number', 'null'] },
        application_depth_unit: { type: ['string', 'null'] },
        measuring_type: { type: 'string' },
        percent_of_location_irrigated: { type: ['number', 'null'] },
        default_location_flow_rate: { type: 'boolean' },
        default_location_application_depth: { type: 'boolean' },
        default_irrigation_task_type_location: { type: 'boolean' },
        default_irrigation_task_type_measurement: { type: 'boolean' },
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
          from: 'irrigation_task.task_id',
          to: 'task.task_id',
        },
      },
      irrigation_type: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: IrrigationTypesModel,
        join: {
          from: 'irrigation_type.irrigation_type_id',
          to: 'irrigation_task.irrigation_type_id',
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
      irrigation_type_id: 'keep',
      irrigation_type_name: 'keep',
      estimated_duration: 'keep',
      estimated_duration_unit: 'keep',
      estimated_flow_rate: 'keep',
      estimated_flow_rate_unit: 'keep',
      location_id: 'keep',
      estimated_water_usage: 'keep',
      estimated_water_usage_unit: 'keep',
      application_depth: 'keep',
      application_depth_unit: 'keep',
      measuring_type: 'keep',
      percent_of_location_irrigated: 'keep',
      default_location_flow_rate: 'omit',
      default_location_application_depth: 'omit',
      default_irrigation_task_type_location: 'omit',
      default_irrigation_task_type_measurement: 'omit',
      // relationMappings
      task: 'omit',
      irrigation_type: 'omit',
    };
  }
}

export default IrrigationTaskModel;
