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

class Farm extends baseModel {
  static get tableName() {
    return 'market_directory_data';
  }

  static get hidden() {
    return [...super.hidden];
  }

  static get idColumn() {
    return 'farm_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_name', 'representative_first_name', 'email', 'address'],
      properties: {
        farm_id: { type: 'string' },
        farm_name: { type: 'string', minLength: 1, maxLength: 255 },
        logo: { type: ['string', `null`], maxLength: 255 },
        about: { type: ['string', `null`] },
        representative_first_name: { type: 'string', minLength: 1, maxLength: 255 },
        representative_last_name: { type: ['string', `null`], maxLength: 255 },
        email: { type: 'string', minLength: 1, maxLength: 255 },
        phone_number: { type: 'string', maxLength: 255 },
        address: { type: 'string', minLength: 1, maxLength: 255 },
        website: { type: ['string', `null`], maxLength: 255 },
        instagram: { type: ['string', `null`], maxLength: 255 },
        facebook: { type: ['string', `null`], maxLength: 255 },
        x: { type: ['string', `null`], maxLength: 255 },
        youtube: { type: ['string', `null`], maxLength: 255 },
        linkedin: { type: ['string', `null`], maxLength: 255 },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
}

export default Farm;
