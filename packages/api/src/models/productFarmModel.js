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

import baseModel from './baseModel.js';

class ProductFarmModel extends baseModel {
  static get tableName() {
    return 'product_farm';
  }

  static get idColumn() {
    return 'product_farm_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['product_id', 'farm_id'],
      properties: {
        product_farm_id: { type: 'integer' },
        product_id: { type: 'integer' },
        farm_id: { type: 'string' },
        archived: { type: 'boolean', default: false },
        supplier: { type: ['string', 'null'], maxLength: 255 },
        on_permitted_substances_list: {
          type: ['string', 'null'],
          enum: ['YES', 'NO', 'NOT_SURE', null],
        },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
}

export default ProductFarmModel;
