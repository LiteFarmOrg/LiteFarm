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

import IntegratingPartners from './integratingPartnersModel.js';
import Farm from './farmModel.js';

class FarmExternalIntegrations extends Model {
  /**
   * Identifies the database table for this Model.
   * @static
   * @returns {string} Names of the database table.
   */
  static get tableName() {
    return 'farm_external_integration';
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
        organization_uuid: { type: 'string' },
        webhook_id: { type: 'integer' },
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
          from: 'farm_external_integration.farm_id',
          to: 'farm.farm_id',
        },
      },
      partner: {
        modelClass: IntegratingPartners,
        relation: Model.HasOneRelation,
        join: {
          from: 'farm_external_integration.partner_id',
          to: 'integrating_partner.partner_id',
        },
      },
    };
  }

  /**
   * Updates the webhook address for a farm.
   * @param farmId
   * @param webhookId
   * @return {Promise<*>}
   */
  static async updateWebhookId(farmId, webhookId) {
    return FarmExternalIntegrations.query()
      .patch({ webhook_id: webhookId })
      .where('farm_id', farmId);
  }

  static async getOrganizationId(farmId, partnerId) {
    return FarmExternalIntegrations.query()
      .select('organization_uuid')
      .where('farm_id', farmId)
      .where('partner_id', partnerId)
      .first();
  }
}

export default FarmExternalIntegrations;
