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

const Model = require('objection').Model;
const BaseModel = require('./baseModel');

class Crop extends BaseModel {
  static get tableName() {
    return 'crop';
  }

  static get idColumn() {
    return 'crop_id';
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
        farm_id: { type : 'string' },
        crop_common_name: { type: 'string', minLength: 1, maxLength: 255 },
        crop_genus: { type: 'string', minLength: 1, maxLength: 255 },
        crop_specie: { type: 'string', minLength: 1, maxLength: 255 },
        crop_group: {
          type: 'string, null',
          enum:  ['Other crops', 'Fruit and nuts', 'Beverage and spice crops', 'Potatoes and yams'
            , 'Vegetables and melons', 'Cereals', 'Leguminous crops', 'Sugar crops', 'Oilseed crops'],
        },
        crop_subgroup: {
          type: 'string, null',
          enum: ['Fibre crops', 'Grasses and other fodder crops', 'Nuts',
            'Temporary spice crops', 'Pome fruits and stone fruits', 'Other crops',
            'High starch Root/tuber crops', 'Leafy or stem vegetables',
            'Tropical and subtropical fruits',
            'Cereals', 'Legumes', 'Sugar crops (root)',
            'Citrus fruits', 'Permanent spice crops',
            'Berries', 'Fruit-bearing vegetables', 'Other fruits',
            'Root, bulb, or tuberous vegetables', 'Temporary oilseed crops',
            'Permanent oilseed crops', 'Medicinal, aromatic, pesticidal, or similar crops',
            'Grapes', 'Flower crops', 'Mushrooms and truffles', 'Rubber', 'Sugar crops (other)',
            'Tobacco'],
        },
        max_rooting_depth: { type : 'number' },
        depletion_fraction: { type : 'number' },
        initial_kc: { type : 'number' },
        mid_kc: { type : 'number' },
        end_kc: { type : 'number' },
        max_height: { type : 'number' },
        percentrefuse: { type : 'number' },
        protein: { type : 'number' },
        lipid: { type : 'number' },
        energy: { type : 'number' },
        ca: { type : 'number' },
        fe: { type : 'number' },
        mg: { type : 'number' },
        ph: { type : 'number' },
        k: { type : 'number' },
        na: { type : 'number' },
        zn: { type : 'number' },
        cu: { type : 'number' },
        fl: { type : 'number' },
        mn: { type : 'number' },
        se: { type : 'number' },
        vita_rae: { type : 'number' },
        vite: { type : 'number' },
        vitc: { type : 'number' },
        thiamin: { type : 'number' },
        riboflavin: { type : 'number' },
        niacin: { type : 'number' },
        pantothenic: { type : 'number' },
        vitb6: { type : 'number' },
        folate: { type : 'number' },
        vitb12: { type : 'number' },
        vitk: { type : 'number' },
        is_avg_depth: { type : 'boolean, null' },
        is_avg_nutrient: { type : 'boolean, null' },
        is_avg_kc: { type : 'boolean, null' },
        user_added: { type : 'boolean' },
        nutrient_notes: { type : 'string' },
        refuse: { type : 'string' },
        nutrient_credits: { type : 'number' },
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
        modelClass: require('./yieldModel'),
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
        modelClass: require('./priceModel'),
        join: {
          from: 'crop.crop_id',
          to: 'price.crop_id',
        },
      },
      ...this.baseRelationMappings('crop'),
    }
  }
}

module.exports = Crop;
