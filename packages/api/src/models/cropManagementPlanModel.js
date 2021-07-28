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
      required: ['management_plan_id', 'already_in_ground', 'needs_transplant'],
      properties: {
        management_plan_id: { type: 'integer' },
        seed_date: { anyOf: [{ type: 'null' }, { type: 'date' }] },
        plant_date: { anyOf: [{ type: 'null' }, { type: 'date' }] },
        germination_date: { anyOf: [{ type: 'null' }, { type: 'date' }] },
        transplant_date: { anyOf: [{ type: 'null' }, { type: 'date' }] },
        harvest_date: { anyOf: [{ type: 'null' }, { type: 'date' }] },
        termination_date: { anyOf: [{ type: 'null' }, { type: 'date' }] },
        already_in_ground: { type: 'boolean' },
        is_seed: { type: ['boolean', null] },
        needs_transplant: { type: 'boolean' },
        for_cover: { type: ['boolean', null] },
        is_wild: { type: ['boolean', null] },
        crop_age: { type: ['integer', null] },
        crop_age_unit: { type: ['string'], enum: ['week', 'month', 'year'] },
        //TODO: deprecate estimated_revenue
        estimated_revenue: { type: ['number', null] },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      planting_management_plans: {
        modelClass: require('./plantingManagementPlanModel'),
        relation: Model.HasManyRelation,
        join: {
          from: 'crop_management_plan.management_plan_id',
          to: 'planting_management_plan.management_plan_id',
        },
      },
    };
  }
}

module.exports = CropManagementPlanModel;
