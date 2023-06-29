/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (productModel.js) is part of LiteFarm.
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

import baseModel from './baseModel.js';

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
      required: ['name', 'farm_id'],
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
}

export default ProductModel;
