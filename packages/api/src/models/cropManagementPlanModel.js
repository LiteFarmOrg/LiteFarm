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


class CropManagementPlanModel extends Model {
  static get tableName() {
    return 'crop_management_plan';
  }

  static get idColumn() {
    return 'management_plan_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['location_id', 'management_plan_id', 'planting_type'],
      properties: {
        management_plan_id: { type: 'integer' },
        location_id: { type: 'string' },
        planting_type: {
          type: 'string',
          enum: ['BROADCAST', 'CONTAINER', 'BEDS', 'ROWS'],
        },
        notes: { type: 'string' },
        estimated_revenue: { type: 'number' },
        estimated_yield: { type: 'number' },
        estimated_yield_unit: { type: 'string', enum: ['g', 'lb', 'kg', 'oz', 'l', 'gal'] },
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
          from: 'crop_management_plan.location_id',
          to: 'location.location_id',
        },
      },
      broadcast: {
        modelClass: require('./broadcastModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'crop_management_plan.management_plan_id',
          to: 'broadcast.management_plan_id',
        },
      },
      container: {
        modelClass: require('./containerModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'crop_management_plan.management_plan_id',
          to: 'container.management_plan_id',
        },
      },
      beds: {
        modelClass: require('./bedsModel'),
        relation: Model.HasOneRelation,
        join: {
          from: 'crop_management_plan.management_plan_id',
          to: 'beds.management_plan_id',
        },
      },
    };
  }
}

module.exports = CropManagementPlanModel;
