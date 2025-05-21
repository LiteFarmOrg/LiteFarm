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
import taskModel from './taskModel.js';

class SoilSampleTaskModel extends Model {
  static get tableName() {
    return 'soil_sample_task';
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
      required: ['samples_per_location', 'sample_depths', 'sampling_tool'],
      properties: {
        task_id: { type: 'integer' },
        document_id: {
          type: ['string', 'null'],
          format: 'uuid',
        },
        samples_per_location: {
          type: 'integer',
          minimum: 1,
        },
        sample_depths: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              from: { type: 'number' },
              to: { type: 'number' },
            },
            required: ['from', 'to'],
          },
          minItems: 1,
        },
        sample_depths_unit: {
          type: 'string',
          enum: ['cm', 'in'],
        },
        sampling_tool: {
          type: 'string',
          enum: ['SOIL_PROBE', 'AUGER', 'SPADE'],
        },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      task: {
        relation: Model.BelongsToOneRelation,
        modelClass: taskModel,
        join: {
          from: 'soil_sample_task.task_id',
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
      document_id: 'omit',
      samples_per_location: 'keep',
      sample_depths: 'keep',
      sample_depths_unit: 'keep',
      sampling_tool: 'keep',
      // relationMappings
      task: 'omit',
    };
  }
}

export default SoilSampleTaskModel;
