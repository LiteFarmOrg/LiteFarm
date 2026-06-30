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

class MarketDirectoryPartnerAuth extends Model {
  static get tableName() {
    return 'market_directory_partner_auth';
  }

  static get idColumn() {
    return 'market_directory_partner_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['market_directory_partner_id', 'client_id', 'keycloak_url', 'keycloak_realm'],
      properties: {
        market_directory_partner_id: { type: 'integer' },
        client_id: { type: 'string' },
        keycloak_url: { type: 'string' },
        keycloak_realm: { type: 'string' },
        webhook_endpoint: { type: ['string', 'null'] },
      },
      additionalProperties: false,
    };
  }
}

export default MarketDirectoryPartnerAuth;
