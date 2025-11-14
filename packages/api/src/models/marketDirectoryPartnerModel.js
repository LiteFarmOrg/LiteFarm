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
import marketDirectoryPartnerCountryModel from './marketDirectoryPartnerCountryModel.js';

class MarketDirectoryPartner extends Model {
  static get tableName() {
    return 'market_directory_partner';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['key'],
      properties: {
        id: { type: 'integer' },
        key: { type: 'string' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      countries: {
        modelClass: marketDirectoryPartnerCountryModel,
        relation: Model.HasManyRelation,
        join: {
          from: 'market_directory_partner.id',
          to: 'market_directory_partner_country.market_directory_partner_id',
        },
      },
    };
  }

  /**
   * Returns partners available in the given country, including global partners.
   */
  static async getMarketDirectoryPartnersByCountryId(countryId) {
    return await MarketDirectoryPartner.query()
      .joinRelated('countries')
      .where('countries.country_id', countryId)
      .orWhere('countries.country_id', null);
  }
}

export default MarketDirectoryPartner;
