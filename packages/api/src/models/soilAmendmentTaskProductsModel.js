/*
 *  Copyright 2024 LiteFarm.org
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
import productModel from './productModel.js';
import soilAmendmentTaskModel from './soilAmendmentTaskModel.js';

class SoilAmendmentTaskProducts extends Model {
  static get tableName() {
    return 'soil_amendment_task_products';
  }

  static get idColumn() {
    return 'id';
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
        product_id: { type: 'integer' },
        product_quantity: { type: 'number' },
        product_quantity_unit: {
          type: 'string',
          enum: ['g', 'lb', 'kg', 't', 'mt', 'oz'],
        },
        application_rate: { type: 'number' },
        application_rate_unit: {
          type: 'string',
          enum: ['kg/ha', 'lb/ac'],
        },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: productModel,
        join: {
          from: 'soil_amendment_task_products.product_id',
          to: 'product.product_id',
        },
      },
      soil_amendment_task: {
        relation: Model.BelongsToOneRelation,
        modelClass: soilAmendmentTaskModel,
        join: {
          from: 'soil_amendment_task_products.task_id',
          to: 'soil_amendment_task.task_id',
        },
      },
    };
  }
}

export default SoilAmendmentTaskProducts;
