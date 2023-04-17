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

import BaseModel from './baseModel.js';

import { Model } from 'objection';
import IntegratingPartners from './integratingPartnersModel.js';

class PartnerReadingTypeModel extends BaseModel {
  /**
   * Identifies the database table for this Model.
   * @static
   * @returns {string} Names of the database table.
   */
  static get tableName() {
    return 'partner_reading_type';
  }

  /**
   * Identifies the primary key fields for this Model.
   * @static
   * @returns {string[]} Names of the primary key fields.
   */
  static get idColumn() {
    return ['partner_reading_type_id'];
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
        partner_reading_type_id: { type: 'string' },
        partner_id: { type: 'integer' },
        raw_value: { type: 'integer' },
        readable_value: { type: 'string' },
      },
    };
  }

  /**
   * Defines this Model's associations with other Models.
   * @static
   * @returns {Object} A description of Model associations.
   */
  static get relationMappings() {
    return {
      partner: {
        modelClass: IntegratingPartners,
        relation: Model.HasOneRelation,
        join: {
          from: 'partner_reading_type.partner_id',
          to: 'integrating_partner.partner_id',
        },
      },
    };
  }

  static async getReadingTypeByReadableValue(readableValue) {
    return PartnerReadingTypeModel.query().where('readable_value', readableValue).first();
  }

  static async getPartnerReadingTypeByPartnerId(partner_id) {
    return Model.knex().raw(
      `
        SELECT readable_value FROM public.partner_reading_type
        WHERE partner_id=?
      `,
      [partner_id],
    );
  }
}

export default PartnerReadingTypeModel;
