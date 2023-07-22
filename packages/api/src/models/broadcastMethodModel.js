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

class BroadcastMethodModel extends Model {
  static get tableName() {
    return 'broadcast_method';
  }

  static get idColumn() {
    return 'planting_management_plan_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['planting_management_plan_id', 'percentage_planted', 'area_used', 'seeding_rate'],
      properties: {
        planting_management_plan_id: { type: 'string' },
        percentage_planted: { type: 'number' },
        area_used: { type: 'number' },
        area_used_unit: { type: 'string', enum: ['m2', 'ha', 'ft2', 'ac'] },
        seeding_rate: { type: 'number' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {};
  }

  // Custom function used in copy crop plan
  // Should contain all jsonSchema() and relationMappings() keys
  static get templateMappingSchema() {
    return {
      // jsonSchema()
      planting_management_plan_id: 'edit',
      percentage_planted: 'keep',
      area_used: 'keep',
      area_used_unit: 'keep',
      seeding_rate: 'keep',
      // relationMappings
    };
  }
}

export default BroadcastMethodModel;
