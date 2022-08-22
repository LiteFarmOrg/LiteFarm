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

import { Model } from 'objection';
import taskModel from './taskModel.js';
import productModel from './productModel.js';

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
        other_purpose: { type: 'string' },
        product_id: { type: 'integer', minimum: 0 },
        product_quantity: { type: 'number' },
        product_quantity_unit: {
          type: 'string',
          enum: ['g', 'lb', 'kg', 't', 'mt', 'oz', 'l', 'gal', 'ml', 'fl-oz'],
        },
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
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: productModel,
        join: {
          from: 'soil_amendment_task.product_id',
          to: 'product.product_id',
        },
      },
    };
  }
}

export default SoilAmendmentTaskModel;
