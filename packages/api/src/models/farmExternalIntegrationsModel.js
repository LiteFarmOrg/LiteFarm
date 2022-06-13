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

const Model = require('objection').Model;
const IntegratingPartners = require('./integratingPartnersModel');
const Farm = require('./farmModel');

class FarmExternalIntegrations extends Model {
  /**
   * Identifies the database table for this Model.
   * @static
   * @returns {string} Names of the database table.
   */
  static get tableName() {
    return 'farmExternalIntegrations';
  }

  /**
   * Identifies the primary key fields for this Model.
   * @static
   * @returns {string[]} Names of the primary key fields.
   */
  static get idColumn() {
    return ['farm_id', 'partner_id'];
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
        farm_id: { type: 'string' },
        partner_id: { type: 'integer' },
        registration_uuid: { type: 'string' },
        webhook: { type: 'boolean' },
      },
      additionalProperties: false,
    };
  }

  /**
   * Defines this Model's associations with other Models.
   * @static
   * @returns {Object} A description of Model associations.
   */
  static get relationMappings() {
    return {
      farm: {
        modelClass: Farm,
        relation: Model.HasOneRelation,
        join: {
          from: 'farmExternalIntegrations.farm_id',
          to: 'farm.farm_id',
        },
      },
      partner: {
        modelClass: IntegratingPartners,
        relation: Model.HasOneRelation,
        join: {
          from: 'farmExternalIntegrations.partner_id',
          to: 'integratingPartners.partner_id',
        },
      },
    };
  }
}

module.exports = FarmExternalIntegrations;
