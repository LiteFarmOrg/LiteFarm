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

import Model from './baseFormatModel.js';
import plantingManagementPlanModel from './plantingManagementPlanModel.js';

class CropManagementPlanModel extends Model {
  // Server.js function changes date to datetime -- here we change it back: see LF-3396
  $parseJson(json, opt) {
    json = super.$parseJson(json, opt);
    const pgDateTypeFields = [
      'germination_date',
      'harvest_date',
      'plant_date',
      'seed_date',
      'termination_date',
      'transplant_date',
    ];
    if (Object.keys(json).some((e) => pgDateTypeFields.includes(e))) {
      Object.keys(json).forEach((key) => {
        if (pgDateTypeFields.includes(key) && json[key]) {
          json[key] = json[key].split('T')[0];
        }
      });
    }
    return json;
  }

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
        seed_date: { type: ['string', 'null'], format: 'date' },
        plant_date: { type: ['string', 'null'], format: 'date' },
        germination_date: { type: ['string', 'null'], format: 'date' },
        transplant_date: { type: ['string', 'null'], format: 'date' },
        harvest_date: { type: ['string', 'null'], format: 'date' },
        termination_date: { type: ['string', 'null'], format: 'date' },
        already_in_ground: { type: 'boolean' },
        is_seed: { type: ['boolean', 'null'] },
        needs_transplant: { type: 'boolean' },
        for_cover: { type: ['boolean', 'null'] },
        is_wild: { type: ['boolean', 'null'] },
        //TODO: deprecate estimated_revenue
        estimated_revenue: { type: ['number', 'null'] },
        estimated_yield: { type: ['number', 'null'] },
        estimated_yield_unit: { type: ['string'], enum: ['kg', 'lb', 'mt', 't'] },
        estimated_price_per_mass: { type: ['number', 'null'] },
        estimated_price_per_mass_unit: { type: ['string'], enum: ['kg', 'lb', 'mt', 't'] },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      planting_management_plans: {
        modelClass: plantingManagementPlanModel,
        relation: Model.HasManyRelation,
        join: {
          from: 'crop_management_plan.management_plan_id',
          to: 'planting_management_plan.management_plan_id',
        },
      },
    };
  }

  // Custom function used in copy crop plan
  // Should contain all jsonSchema() and relationMappings() keys
  static get templateMappingSchema() {
    return {
      // jsonSchema()
      management_plan_id: 'omit',
      seed_date: 'edit',
      plant_date: 'edit',
      germination_date: 'edit',
      transplant_date: 'edit',
      harvest_date: 'edit',
      termination_date: 'edit',
      already_in_ground: 'edit',
      is_seed: 'keep',
      needs_transplant: 'keep',
      for_cover: 'keep',
      is_wild: 'keep',
      estimated_revenue: 'keep',
      estimated_yield: 'keep',
      estimated_yield_unit: 'keep',
      estimated_price_per_mass: 'keep',
      estimated_price_per_mass_unit: 'keep',
      // relationMappings
      planting_management_plans: 'edit',
    };
  }
}

export default CropManagementPlanModel;
