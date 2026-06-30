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

class MarketDirectoryPartnerCountry extends Model {
  static get tableName() {
    return 'market_directory_partner_country';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['market_directory_partner_id'],
      properties: {
        id: { type: 'integer' },
        market_directory_partner_id: { type: 'integer' },
        country_id: { type: ['integer', 'null'] }, // null = 'all countries'
      },
      additionalProperties: false,
    };
  }
}

export default MarketDirectoryPartnerCountry;
