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

class MarketDirectoryPartnerPermissions extends baseModel {
  static get tableName() {
    return 'market_directory_partner_permissions';
  }

  static get idColumn() {
    return ['market_directory_info_id', 'market_directory_partner_id'];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['market_directory_info_id', 'market_directory_partner_id'],
      properties: {
        market_directory_info_id: { type: 'string' },
        market_directory_partner_id: { type: 'integer' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
}

export default MarketDirectoryPartnerPermissions;
