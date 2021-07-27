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

const Model = require('objection').Model;


class plantingMethodModel extends Model {
  static get tableName() {
    return 'planting_method';
  }

  static get idColumn() {
    return 'planting_method_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['management_plan_id', 'is_final_planting_method'],
      properties: {
        planting_method_id: { type: 'string' },
        management_plan_id: { type: 'integer' },
        is_final_planting_method: { type: 'boolean' },
        planting_method: {
          type: ['string', null],
          enum: ['BROADCAST_METHOD', 'CONTAINER_METHOD', 'BED_METHOD', 'ROW_METHOD', null],
        },
        is_planting_method_known: {
          type: ['boolean', null],
        },
        estimated_seeds: { type: ['number', null] },
        estimated_seeds_unit: { type: ['string'], enum: ['g', 'kg', 'oz', 'lb'] },
        estimated_yield: { type: ['number', null] },
        estimated_yield_unit: { type: ['string'], enum: ['g', 'kg', 'oz', 'lb'] },
        location_id: { type: ['string', null] },
        pin_coordinate: {
          type: ['object', null],
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' },
          },
        },
        notes: { type: 'string' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      location: {
        relation: Model.HasOneRelation,
        modelClass: require('./locationModel.js'),
        join: {
          from: 'planting_method.location_id',
          to: 'location.location_id',
        },
      },
      broadcast: {
        modelClass: require('./broadcastMethodModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'planting_method.planting_method_id',
          to: 'broadcast_method.planting_method_id',
        },
      },
      container: {
        modelClass: require('./containerMethodModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'planting_method.planting_method_id',
          to: 'container_method.planting_method_id',
        },
      },
      beds: {
        modelClass: require('./bedMethodModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'planting_method.planting_method_id',
          to: 'bed_method.planting_method_id',
        },
      },
      rows: {
        modelClass: require('./rowMethodModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'planting_method.planting_method_id',
          to: 'row_method.planting_method_id',
        },
      },
    };
  }
}

module.exports = plantingMethodModel;
