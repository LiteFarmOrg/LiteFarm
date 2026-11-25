/*
 *  Copyright 2026 LiteFarm.org
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
import cropModel from './cropModel.js';
import farmModel from './farmModel.js';

class FarmCropModel extends BaseModel {
  static get tableName() {
    return 'farm_crop';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_id', 'crop_id'],
      properties: {
        id: { type: 'integer' },
        farm_id: { type: 'string' },
        crop_id: { type: 'integer' },
        lifecycle: { type: ['string', 'null'], enum: ['ANNUAL', 'PERENNIAL', null] },
        can_be_cover_crop: { type: 'boolean' },
        days_to_harvest: { type: ['integer', 'null'] },
        needs_transplant: { type: ['boolean', 'null'] },
        transplant_days: { type: ['integer', 'null'] },
        name_override: { type: ['string', 'null'] },
        photo_override: { type: ['string', 'null'] },
        archived: { type: 'boolean' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      crop: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: cropModel,
        join: {
          from: 'farm_crop.crop_id',
          to: 'crop.crop_id',
        },
      },
      farm: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: farmModel,
        join: {
          from: 'farm_crop.farm_id',
          to: 'farm.farm_id',
        },
      },
    };
  }
}

export default FarmCropModel;
