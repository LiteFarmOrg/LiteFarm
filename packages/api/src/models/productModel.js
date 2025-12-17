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
import ProductFarmModel from './productFarmModel.js';
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
      required: ['name', 'type'],
      properties: {
        product_id: { type: 'integer' },
        name: { type: 'string' },
        product_translation_key: { type: ['string', 'null'] },
        type: {
          type: 'string',
          enum: ['soil_amendment_task', 'pest_control_task', 'cleaning_task'],
        },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get modifiers() {
    return {
      flattenProductFarm(builder) {
        builder.select(
          'product.*',
          'product_farm.supplier',
          'product_farm.on_permitted_substances_list',
          'product_farm.farm_id',
          'product_farm.removed',
        );
      },
    };
  }

  static get relationMappings() {
    return {
      product_farm: {
        relation: Model.HasManyRelation,
        modelClass: ProductFarmModel,
        join: {
          from: 'product.product_id',
          to: 'product_farm.product_id',
        },
      },
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
