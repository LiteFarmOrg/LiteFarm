/*
 *  Copyright (c) 2021-2024 LiteFarm.org
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

import { Model } from 'objection';
import baseModel from './baseModel.js';
import soilAmendmentProductModel from './soilAmendmentProductModel.js';

class ProductModel extends baseModel {
  static get tableName() {
    return 'product';
  }

  static get idColumn() {
    return 'product_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'farm_id', 'type'],
      properties: {
        product_id: { type: 'integer' },
        name: { type: 'string' },
        product_translation_key: { type: 'string' },
        supplier: { type: 'string' },
        on_permitted_substances_list: {
          type: ['string', 'null'],
          enum: ['YES', 'NO', 'NOT_SURE', null],
        },
        type: {
          type: 'string',
          enum: ['soil_amendment_task', 'pest_control_task', 'cleaning_task'],
        },
        farm_id: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      soil_amendment_product: {
        relation: Model.HasOneRelation,
        modelClass: soilAmendmentProductModel,
        join: {
          from: 'product.product_id',
          to: 'soil_amendment_product.product_id',
        },
      },
    };
  }
}

export default ProductModel;
