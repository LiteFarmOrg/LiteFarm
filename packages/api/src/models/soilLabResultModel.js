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
import farmModel from './farmModel.js';
import locationModel from './locationModel.js';

class SoilLabResultModel extends BaseModel {
  static get tableName() {
    return 'soil_lab_result';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'farm_id',
        'submission_id',
        'row',
        'location_id',
        'match_method',
        'depth_top_cm',
        'depth_bottom_cm',
        'depth_assumed',
        'values',
        'source_filename',
        'source_sha256',
      ],
      properties: {
        id: { type: 'string' },
        farm_id: { type: 'string' },
        submission_id: { type: 'string' },
        row: { type: 'integer' },
        location_id: { type: 'string', format: 'uuid' },
        match_method: { type: 'string', minLength: 1, maxLength: 32 },
        sample_label: { type: ['string', 'null'] },
        sampled_on: { type: ['string', 'null'], format: 'date' },
        depth_top_cm: { type: 'number' },
        depth_bottom_cm: { type: 'number' },
        depth_assumed: { type: 'boolean' },
        lat: { type: ['number', 'null'] },
        lng: { type: ['number', 'null'] },
        values: {
          type: 'object',
          minProperties: 1,
          propertyNames: { maxLength: 64 },
          additionalProperties: { type: 'number' },
        },
        lab_name: { type: ['string', 'null'] },
        source_filename: { type: 'string' },
        source_sha256: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      farm: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: farmModel,
        join: {
          from: 'soil_lab_result.farm_id',
          to: 'farm.farm_id',
        },
      },
      location: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: locationModel,
        join: {
          from: 'soil_lab_result.location_id',
          to: 'location.location_id',
        },
      },
    };
  }
}

export default SoilLabResultModel;
