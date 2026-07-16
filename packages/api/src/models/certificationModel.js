/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
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
import BaseModel from './baseModel.js';
import userFarmModel from './userFarmModel.js';
import farmModel from './farmModel.js';
import certificationSystemTypeModel from './certificationSystemTypeModel.js';
import certifierModel from './certifierModel.js';

export const CERTIFICATION_TYPES = [
  'ORGANIC',
  'BIODYNAMIC',
  'REGENERATIVE',
  'CERTIFIED_HUMANE',
  'FAIR_TRADE',
  'GRASSFED/PASTURE',
  'SUSTAINABILITY',
  'ANIMAL_WELFARE',
  'NON-GMO',
  'CARBON/CLIMATE',
];

class Certification extends BaseModel {
  static get tableName() {
    return 'certification';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_id'],
      properties: {
        id: { type: 'string' },
        farm_id: { type: 'string' },
        system_type_id: { type: ['integer', 'null'] },
        certifier_id: { type: ['integer', 'null'] },
        requested_system_type: { type: ['string', 'null'] },
        other_certifier: { type: ['string', 'null'] },
        is_active: { type: 'boolean' },
        certification_type: { type: ['string', 'null'], enum: [...CERTIFICATION_TYPES, null] },
        certificate_number: { type: ['string', 'null'] },
        certificate_member_id: { type: ['string', 'null'] },
        issue_date: { type: ['string', 'null'], format: 'date' },
        valid_until: { type: ['string', 'null'], format: 'date' },
        certificate_document_url: { type: ['string', 'null'] },
        ...super.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      userFarm: {
        modelClass: userFarmModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: ['certification.updated_by_user_id', 'certification.farm_id'],
          to: ['userFarm.user_id', 'userFarm.farm_id'],
        },
      },
      farm: {
        modelClass: farmModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'certification.farm_id',
          to: 'farm.farm_id',
        },
      },
      certificationSystemType: {
        modelClass: certificationSystemTypeModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'certification.system_type_id',
          to: 'certification_system_type.id',
        },
      },
      certifier: {
        modelClass: certifierModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'certification.certifier_id',
          to: 'certifiers.certifier_id',
        },
      },
    };
  }

  $trimStringFields() {
    for (const [key, value] of Object.entries(this)) {
      if (typeof value === 'string') {
        this[key] = value.trim();
      }
    }
  }

  async $beforeInsert(context) {
    await super.$beforeInsert(context);
    this.$trimStringFields();
  }

  async $beforeUpdate(opt, context) {
    await super.$beforeUpdate(opt, context);
    this.$trimStringFields();
  }
}

export default Certification;
