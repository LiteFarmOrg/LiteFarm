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

class MarketDirectoryInfo extends baseModel {
  static get tableName() {
    return 'market_directory_info';
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
      required: ['farm_id', 'farm_name', 'contact_first_name', 'contact_email', 'address'],
      properties: {
        id: { type: 'string' },
        farm_id: { type: 'string' },
        farm_name: { type: 'string', minLength: 1, maxLength: 255 },
        logo: { type: ['string', 'null'], maxLength: 255 },
        about: { type: ['string', 'null'] },
        contact_first_name: { type: 'string', minLength: 1, maxLength: 255 },
        contact_last_name: { type: ['string', 'null'], maxLength: 255 },
        contact_email: { type: 'string', minLength: 1, maxLength: 255 },
        email: { type: ['string', 'null'], maxLength: 255 },
        country_code: { type: ['integer', 'null'], minimum: 1, maximum: 999 },
        phone_number: { type: ['string', 'null'], maxLength: 255 },
        address: { type: 'string', minLength: 1, maxLength: 255 },
        website: { type: ['string', 'null'] },
        instagram: { type: ['string', 'null'], maxLength: 255 },
        facebook: { type: ['string', 'null'], maxLength: 255 },
        x: { type: ['string', 'null'], maxLength: 255 },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
}

export default MarketDirectoryInfo;
