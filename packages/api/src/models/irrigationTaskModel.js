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

import { Model } from 'objection';
import taskModel from './taskModel.js';

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
      required: ['type'],

      properties: {
        task_id: { type: 'integer' },
        type: { type: 'string' },
        irrigation_type_id: { type: 'number' },
        estimated_duration: { type: 'number' },
        estimated_duration_unit: { type: 'string' },
        estimated_flow_rate: { type: 'number' },
        estimated_flow_rate_unit: { type: 'string' },
        location_id: { type: 'string' },
        estimated_water_usage: { type: 'number' },
        estimated_water_usage_unit: { type: 'string' },
        application_depth: { type: 'number' },
        application_depth_unit: { type: 'string' },
        default_measuring_type: { type: 'string' },
        irrigated_area: { type: 'number' },
        irrigated_area_unit: { type: 'string' },
        location_size_unit: { type: 'string' },
        percentage_location_irrigated: { type: 'number' },
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
    };
  }
}

export default IrrigationTaskModel;
