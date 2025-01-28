/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

class AddonPartner extends Model {
  /**
   * Identifies the database table for this Model.
   * @static
   * @returns {string} Names of the database table.
   */
  static get tableName() {
    return 'addon_partner';
  }

  /**
   * Identifies the primary key fields for this Model.
   * @static
   * @returns {string} Names of the primary key fields.
   */
  static get idColumn() {
    return 'id';
  }

  /**
   * Supports validating instances of this Model class.
   * @static
   * @returns {Object} A description of valid instances.
   */
  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        root_url: { type: 'string' },
        deactivated: { type: 'boolean' },
      },
      additionalProperties: false,
    };
  }

  static async getAccessAndRefreshTokens(name) {
    return await AddonPartner.query()
      .select('access_token', 'refresh_token')
      .where({ name, deactivated: false })
      .first();
  }

  static async patchAccessAndRefreshTokens(name, access_token, refresh_token) {
    return await AddonPartner.query()
      .patch({ access_token, refresh_token })
      .where({ name, deactivated: false });
  }
  static async getBrandName(id) {
    return await AddonPartner.query().select('name').where('id', id).first();
  }
}

export default AddonPartner;
