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

class FarmMarketProductCategory extends Model {
  static get tableName() {
    return 'farm_market_product_category';
  }

  static get idColumn() {
    return ['market_directory_info_id', 'market_product_category_id'];
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['market_directory_info_id', 'market_product_category_id'],
      properties: {
        market_directory_info_id: { type: 'string' },
        market_product_category_id: { type: 'integer' },
      },
      additionalProperties: false,
    };
  }
}

export default FarmMarketProductCategory;
