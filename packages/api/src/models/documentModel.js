/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (managementPlanModel.js) is part of LiteFarm.
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

import { Model } from 'objection';

import baseModel from './baseModel.js';
import farmModel from './farmModel.js';
import fileModel from './fileModel.js';

class Document extends baseModel {
  static get tableName() {
    return 'document';
  }

  static get idColumn() {
    return 'document_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'farm_id'],
      properties: {
        document_id: { type: 'string' },
        farm_id: { type: 'string' },
        name: { type: 'string' },
        thumbnail_url: { type: ['string', null] },
        valid_until: { anyOf: [{ type: 'null' }, { type: 'date' }] },
        notes: { type: ['string', null] },
        no_expiration: { type: ['boolean', null] },
        type: {
          type: ['string', null],
          enum: [
            'CLEANING_PRODUCT',
            'CROP_COMPLIANCE',
            'FERTILIZING_PRODUCT',
            'PEST_CONTROL_PRODUCT',
            'SOIL_AMENDMENT',
            'SOIL_SAMPLE_RESULTS',
            'WATER_SAMPLE_RESULTS',
            'INVOICES',
            'RECEIPTS',
            'OTHER',
          ],
        },
        archived: { type: 'boolean' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      farm: {
        relation: Model.BelongsToOneRelation,
        modelClass: farmModel,
        join: {
          from: 'document.farm_id',
          to: 'farm.farm_id',
        },
      },
      files: {
        relation: Model.HasManyRelation,
        modelClass: fileModel,
        join: {
          from: 'document.document_id',
          to: 'file.document_id',
        },
      },
    };
  }
}

export default Document;
