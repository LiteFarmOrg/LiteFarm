/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (cropModel.js) is part of LiteFarm.
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
import cropModel from './cropModel.js';

class CropVariety extends BaseModel {
  static get tableName() {
    return 'crop_variety';
  }

  static get idColumn() {
    return 'crop_variety_id';
  }

  //TODO: remove after nutrition values are complete
  static get hidden() {
    return [
      'protein',
      'lipid',
      'energy',
      'ca',
      'fe',
      'mg',
      'ph',
      'k',
      'na',
      'zn',
      'cu',
      'fl',
      'mn',
      'se',
      'vita_rae',
      'vite',
      'vitc',
      'thiamin',
      'riboflavin',
      'niacin',
      'pantothenic',
      'vitb6',
      'folate',
      'vitb12',
      'nutrient_credits',
      //TODO: remove the following when these fields can be edited on the frontend
      'seeding_type',
      'can_be_cover_crop',
      'yield_per_area',
      'average_seed_weight',
      'yield_per_plant',
      'planting_method',
      'plant_spacing',
      'planting_depth',
      'needs_transplant',
      'germination_days',
      'transplant_days',
      'harvest_days',
      'termination_days',
      'seeding_rate',
      ...super.hidden,
    ];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['crop_id', 'farm_id', 'crop_variety_name'],
      properties: {
        crop_variety_id: { type: 'string' },
        crop_id: { type: 'integer' },
        farm_id: { type: 'string' },
        crop_variety_name: { type: ['string', 'null'] },
        crop_varietal: { type: ['string', 'null'], maxLength: 255 },
        crop_cultivar: { type: ['string', 'null'], maxLength: 255 },
        supplier: { type: ['string', 'null'] },
        seeding_type: { type: 'string', enum: ['SEED', 'SEEDLING_OR_PLANTING_STOCK'] },
        lifecycle: { type: 'string', enum: ['ANNUAL', 'PERENNIAL'] },
        compliance_file_url: { type: ['string', 'null'] },
        organic: { type: ['boolean', 'null'] },
        treated: { type: ['string', 'null'], enum: ['YES', 'NO', 'NOT_SURE', 'null'] },
        genetically_engineered: { type: ['boolean', 'null'] },
        searched: { type: ['boolean', 'null'] },
        protein: { type: ['number', 'null'] },
        lipid: { type: ['number', 'null'] },
        ph: { type: ['number', 'null'] },
        energy: { type: ['number', 'null'] },
        ca: { type: ['number', 'null'] },
        fe: { type: ['number', 'null'] },
        mg: { type: ['number', 'null'] },
        k: { type: ['number', 'null'] },
        na: { type: ['number', 'null'] },
        zn: { type: ['number', 'null'] },
        cu: { type: ['number', 'null'] },
        mn: { type: ['number', 'null'] },
        vita_rae: { type: ['number', 'null'] },
        vitc: { type: ['number', 'null'] },
        thiamin: { type: ['number', 'null'] },
        riboflavin: { type: ['number', 'null'] },
        niacin: { type: ['number', 'null'] },
        vitb6: { type: ['number', 'null'] },
        folate: { type: ['number', 'null'] },
        vitb12: { type: ['number', 'null'] },
        nutrient_credits: { type: ['number', 'null'] },
        crop_variety_photo_url: { type: 'string' },
        planting_method: {
          type: ['string', 'null'],
          enum: ['BROADCAST_METHOD', 'CONTAINER_METHOD', 'BED_METHOD', 'ROW_METHOD', 'null'],
        },
        can_be_cover_crop: { type: ['boolean', 'null'] },
        planting_depth: { type: ['number', 'null'] },
        yield_per_area: { type: ['number', 'null'] },
        average_seed_weight: { type: ['number', 'null'] },
        yield_per_plant: { type: ['number', 'null'] },
        plant_spacing: { type: ['number', 'null'] },
        needs_transplant: { type: ['boolean', 'null'] },
        germination_days: { type: ['integer', 'null'] },
        transplant_days: { type: ['integer', 'null'] },
        harvest_days: { type: ['integer', 'null'] },
        termination_days: { type: ['integer', 'null'] },
        seeding_rate: { type: ['number', 'null'] },
        hs_code_id: { type: ['string', 'number', 'null'] },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      crop: {
        relation: Model.BelongsToOneRelation,
        modelClass: cropModel,
        join: {
          from: 'crop_variety.crop_id',
          to: 'crop.crop_id',
        },
      },
    };
  }
}

export default CropVariety;
