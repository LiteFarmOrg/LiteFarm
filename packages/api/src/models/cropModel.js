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
import yieldModel from './yieldModel.js';
import priceModel from './priceModel.js';

class Crop extends BaseModel {
  static get tableName() {
    return 'crop';
  }

  static get idColumn() {
    return 'crop_id';
  }

  //TODO: remove after nutrition values are complete
  static get hidden() {
    return [
      'max_rooting_depth',
      'depletion_fraction',
      'initial_kc',
      'mid_kc',
      'end_kc',
      'max_height',
      'percentrefuse',
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
      'vitk',
      'is_avg_depth',
      'is_avg_nutrient',
      'is_avg_kc',
      'user_added',
      'nutrient_notes',
      'refuse',
      'nutrient_credits',
      'reviewed',
      ...super.hidden,
    ];
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['crop_common_name', 'farm_id'],

      properties: {
        crop_id: { type: 'integer' },
        farm_id: { type: 'string' },
        crop_common_name: { type: 'string', minLength: 1, maxLength: 255 },
        crop_variety: { type: 'string', minLength: 1, maxLength: 255 },
        crop_genus: { type: 'string', minLength: 1, maxLength: 255 },
        crop_specie: { type: 'string', minLength: 1, maxLength: 255 },
        crop_group: {
          type: ['string', 'null'],
          enum: [
            'Fruit and nuts',
            'Other crops',
            'Stimulant, spice and aromatic crops',
            'Vegetables and melons',
            'Cereals',
            'High starch root/tuber crops',
            'Oilseed crops and oleaginous fruits',
            'Leguminous crops',
            'Sugar crops',
            'Potatoes and yams',
            'Beverage and spice crops',
          ],
        },
        crop_subgroup: {
          type: ['string', 'null'],
          enum: [
            'Berries',
            'Cereals',
            'Citrus fruits',
            'Fibre crops',
            'Flower crops',
            'Fruit-bearing vegetables',
            'Grapes',
            'Grasses and other fodder crops',
            'High starch root/tuber crops',
            'Leafy or stem vegetables',
            'Leguminous crops',
            'Lentils',
            'Medicinal, pesticidal or similar crops',
            'Melons',
            'Mixed cereals',
            'Mushrooms and truffles',
            'Nuts',
            'Oilseed crops and oleaginous fruits',
            'Other crops',
            'Other fruits',
            'Other roots and tubers',
            'Other temporary oilseed crops',
            'Permanent oilseed crops',
            'Pome fruits and stone fruits',
            'Root, bulb or tuberous vegetables',
            'Rubber',
            'Spice and aromatic crops',
            'Stimulant crops',
            'Sugar crops',
            'Tobacco',
            'Tropical and subtropical fruits',
          ],
        },
        max_rooting_depth: { type: 'number' },
        depletion_fraction: { type: 'number' },
        initial_kc: { type: 'number' },
        mid_kc: { type: 'number' },
        end_kc: { type: 'number' },
        max_height: { type: 'number' },
        percentrefuse: { type: 'number' },
        protein: { type: 'number' },
        lipid: { type: 'number' },
        energy: { type: 'number' },
        ca: { type: 'number' },
        fe: { type: 'number' },
        mg: { type: 'number' },
        ph: { type: 'number' },
        k: { type: 'number' },
        na: { type: 'number' },
        zn: { type: 'number' },
        cu: { type: 'number' },
        fl: { type: 'number' },
        mn: { type: 'number' },
        se: { type: 'number' },
        vita_rae: { type: 'number' },
        vite: { type: 'number' },
        vitc: { type: 'number' },
        thiamin: { type: 'number' },
        riboflavin: { type: 'number' },
        niacin: { type: 'number' },
        pantothenic: { type: 'number' },
        vitb6: { type: 'number' },
        folate: { type: 'number' },
        vitb12: { type: 'number' },
        vitk: { type: 'number' },
        is_avg_depth: { type: ['boolean', 'null'] },
        is_avg_nutrient: { type: ['boolean', 'null'] },
        is_avg_kc: { type: ['boolean', 'null'] },
        user_added: { type: 'boolean' },
        nutrient_notes: { type: 'string' },
        refuse: { type: 'string' },
        nutrient_credits: { type: 'number' },
        reviewed: { type: 'boolean' },
        crop_translation_key: { type: 'string' },
        crop_photo_url: { type: 'string' },
        can_be_cover_crop: { type: ['boolean', 'null'] },
        planting_depth: { type: ['number', 'null'] },
        yield_per_area: { type: ['number', 'null'] },
        average_seed_weight: { type: ['number', 'null'] },
        yield_per_plant: { type: ['number', 'null'] },
        seeding_type: {
          type: ['string', 'null'],
          enum: ['SEED', 'SEEDLING_OR_PLANTING_STOCK', 'null'],
        },
        lifecycle: { type: ['string', 'null'], enum: ['ANNUAL', 'PERENNIAL', 'null'] },
        needs_transplant: { type: ['boolean', 'null'] },
        germination_days: { type: ['integer', 'null'] },
        transplant_days: { type: ['integer', 'null'] },
        harvest_days: { type: ['integer', 'null'] },
        termination_days: { type: ['integer', 'null'] },
        planting_method: {
          type: ['string', 'null'],
          enum: ['BROADCAST_METHOD', 'CONTAINER_METHOD', 'BED_METHOD', 'ROW_METHOD', 'null'],
        },
        plant_spacing: { type: ['number', 'null'] },
        seeding_rate: { type: ['number', 'null'] },
        hs_code_id: { anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }] },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      yield: {
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: yieldModel,
        join: {
          from: 'crop.crop_id',
          to: 'yield.crop_id',
        },
      },
      price: {
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: priceModel,
        join: {
          from: 'crop.crop_id',
          to: 'price.crop_id',
        },
      },
    };
  }
}

export default Crop;
