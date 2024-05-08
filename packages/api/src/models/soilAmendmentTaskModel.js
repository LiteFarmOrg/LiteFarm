/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fertilizerLogModel.js) is part of LiteFarm.
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
import soilAmendmentTaskProductsModel from './soilAmendmentTaskProductsModel.js';

class SoilAmendmentTaskModel extends Model {
  static get tableName() {
    return 'soil_amendment_task';
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
      required: [],

      properties: {
        task_id: { type: 'integer' },
        purpose: {
          type: 'string',
          enum: ['structure', 'moisture_retention', 'nutrient_availability', 'ph', 'other'],
        },
        other_purpose: { type: ['string', 'null'] },
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
          from: 'soil_amendment_task.task_id',
          to: 'task.task_id',
        },
      },
      soil_amendment_task_products: {
        relation: Model.HasManyRelation,
        modelClass: soilAmendmentTaskProductsModel,
        join: {
          from: 'soil_amendment_task.task_id',
          to: 'soil_amendment_task_products.task_id',
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
      purpose: 'keep',
      other_purpose: 'keep',
      product_id: 'keep',
      product_quantity: 'keep',
      product_quantity_unit: 'keep',
      // relationMappings
      task: 'omit',
      product: 'omit',
      soil_amendment_task_products: 'keep',
    };
  }
}

export default SoilAmendmentTaskModel;
