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
import AddonPartner from './addonPartnerModel.js';
import Farm from './farmModel.js';
import baseModel from './baseModel.js';

class FarmAddon extends baseModel {
  /**
   * Identifies the database table for this Model.
   * @static
   * @returns {string} Names of the database table.
   */
  static get tableName() {
    return 'farm_addon';
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
        farm_id: { type: 'string' },
        addon_partner_id: { type: 'integer' },
        org_uuid: { type: 'string' },
        org_pk: { type: 'integer' },
        ...this.baseProperties,
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
      addon: {
        modelClass: AddonPartner,
        relation: Model.HasOneRelation,
        join: {
          from: 'farm_addon.addon_partner_id',
          to: 'addon_partner.id',
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
    return FarmAddon.query().patch({ webhook_id: webhookId }).where('farm_id', farmId);
  }

  static async getOrganisationIds(farmId, addonPartnerId) {
    return FarmAddon.query()
      .select('org_uuid', 'org_pk')
      .where('farm_id', farmId)
      .where('addon_partner_id', addonPartnerId)
      .whereNotDeleted()
      .first();
  }

  /**
   * Retrieves all organization identifiers (uuid, pk) for a given addon partner.
   *
   * @param {number} addonPartnerId - The ID of the addon partner.
   * @returns {Promise<Array<{ org_uuid: string, org_pk: number, farm_id: string }>>} The organization identifiers and the farm they are associated with
   */
  static async getAllOrganisationIds(addonPartnerId) {
    return FarmAddon.query()
      .select('org_uuid', 'org_pk', 'farm_id')
      .where('addon_partner_id', addonPartnerId)
      .whereNotDeleted();
  }
}

export default FarmAddon;
