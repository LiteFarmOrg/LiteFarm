/*
 *  Copyright 2024 LiteFarm.org
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
import productModel from './productModel.js';
import taskModel from './taskModel.js';
//import soilAmendmentPurposeModel from './soilAmendmentPurposeModel.js';
import soilAmendmentTaskProductPurposeRelationshipModel from './soilAmendmentTaskProductPurposeRelationshipModel.js';

const metricWeightUnits = ['g', 'kg', 'mt'];
const imperialWeightUnits = ['oz', 'lb', 't'];
const weightUnits = [...metricWeightUnits, ...imperialWeightUnits];
const applicationRateWeightUnits = [
  'g/m2',
  'lb/ft2',
  'kg/m2',
  't/ft2',
  'mt/m2',
  'oz/ft2',
  'g/ha',
  'lb/ac',
  'kg/ha',
  't/ac',
  'mt/ha',
  'oz/ac',
];
const metricVolumeUnits = ['ml', 'l'];
const imperialVolumeUnits = ['fl-oz', 'gal'];
const volumeUnits = [...metricVolumeUnits, ...imperialVolumeUnits];
const applicationRateVolumeUnits = [
  'l/m2',
  'gal/ft2',
  'ml/m2',
  'fl-oz/ft2',
  'l/ha',
  'gal/ac',
  'ml/ha',
  'fl-oz/ac',
];

class SoilAmendmentTaskProducts extends BaseModel {
  static get tableName() {
    return 'soil_amendment_task_products';
  }

  static get idColumn() {
    return 'id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      // LF-4246 - null data present on prod
      // required: ['product_id'],
      // oneOf: [
      //   {
      //     required: ['weight', 'weight_unit'],
      //   },
      //   {
      //     required: ['volume', 'volume_unit'],
      //   },
      // ],
      properties: {
        id: { type: 'integer' },
        task_id: { type: 'integer' },
        product_id: { type: 'integer' },
        weight: { type: ['number', 'null'] },
        weight_unit: {
          type: ['string', 'null'],
          enum: [...weightUnits, null],
        },
        application_rate_weight_unit: {
          type: ['string', 'null'],
          enum: [...applicationRateWeightUnits, null],
        },
        volume: { type: ['number', 'null'] },
        volume_unit: {
          type: ['string', 'null'],
          enum: [...volumeUnits, null],
        },
        application_rate_volume_unit: {
          type: ['string', 'null'],
          enum: [...applicationRateVolumeUnits, null],
        },
        percent_of_location_amended: { type: ['number', 'null'] },
        total_area_amended: { type: ['number', 'null'] },
        ...super.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: productModel,
        join: {
          from: 'soil_amendment_task_products.product_id',
          to: 'product.product_id',
        },
      },
      task: {
        relation: Model.BelongsToOneRelation,
        modelClass: taskModel,
        join: {
          from: 'soil_amendment_task_products.task_id',
          to: 'task.task_id',
        },
      },
      purpose_relationships: {
        relation: Model.HasManyRelation,
        modelClass: soilAmendmentTaskProductPurposeRelationshipModel,
        join: {
          from: 'soil_amendment_task_products.id',
          to: 'soil_amendment_task_products_purpose_relationship.task_products_id',
        },
      },
    };
  }

  static modifiers = {
    filterDeleted(query) {
      const { ref } = SoilAmendmentTaskProducts;
      query.where(ref('deleted'), false);
    },
  };

  // Custom function used in copy crop plan
  // Should contain all jsonSchema() and relationMappings() keys
  static get templateMappingSchema() {
    return {
      // jsonSchema()
      id: 'omit',
      task_id: 'omit',
      product_id: 'keep',
      weight: 'keep',
      weight_unit: 'keep',
      application_rate_weight_unit: 'keep',
      volume: 'keep',
      volume_unit: 'keep',
      application_rate_volume_unit: 'keep',
      // TODO: revisit when copy allows location changing
      percent_of_location_amended: 'keep',
      total_area_amended: 'keep',
      // relationMappings
      product: 'omit',
      soil_amendment_task: 'omit',
      purpose_relationships: 'edit',
    };
  }
}

export default SoilAmendmentTaskProducts;
