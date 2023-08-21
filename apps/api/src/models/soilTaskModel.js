/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (soilDataLogModel.js) is part of LiteFarm.
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

class SoilTaskModel extends Model {
  static get tableName() {
    return 'soil_task';
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

      properties: {
        task_id: { type: 'integer' },
        start_depth: { type: 'integer' },
        end_depth: { type: 'integer' },
        depth_cm: { type: 'string' },
        texture: {
          type: 'string',
          enum: [
            'sand',
            'loamySand',
            'sandyLoam',
            'loam',
            'siltLoam',
            'silt',
            'sandyClayLoam',
            'clayLoam',
            'siltyClayLoam',
            'sandyClay',
            'siltyClay',
            'clay',
          ],
        },
        k: { type: 'number', format: 'float' },
        p: { type: 'number', format: 'float' },
        n: { type: 'number', format: 'float' },
        na: { type: 'number', format: 'float' },
        om: { type: 'number', format: 'float' },
        ph: { type: 'number', format: 'float' },
        'bulk_density_kg/m3': { type: 'number', format: 'float' },
        organic_carbon: { type: 'number', format: 'float' },
        inorganic_carbon: { type: 'number', format: 'float' },
        total_carbon: { type: 'number', format: 'float' },
        s: { type: 'number', format: 'float' },
        ca: { type: 'number', format: 'float' },
        mg: { type: 'number', format: 'float' },
        zn: { type: 'number', format: 'float' },
        mn: { type: 'number', format: 'float' },
        fe: { type: 'number', format: 'float' },
        cu: { type: 'number', format: 'float' },
        b: { type: 'number', format: 'float' },
        c: { type: 'number', format: 'float' },
        cec: { type: 'number', format: 'float' },
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
          from: 'soil_task.task_id',
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
      start_depth: 'keep',
      end_depth: 'keep',
      depth_cm: 'keep',
      texture: 'keep',
      k: 'keep',
      p: 'keep',
      n: 'keep',
      na: 'keep',
      om: 'keep',
      ph: 'keep',
      'bulk_density_kg/m3': 'keep',
      organic_carbon: 'keep',
      inorganic_carbon: 'keep',
      total_carbon: 'keep',
      s: 'keep',
      ca: 'keep',
      mg: 'keep',
      zn: 'keep',
      mn: 'keep',
      fe: 'keep',
      cu: 'keep',
      b: 'keep',
      c: 'keep',
      cec: 'keep',
      // relationMappings
      task: 'omit',
    };
  }
}

export default SoilTaskModel;
