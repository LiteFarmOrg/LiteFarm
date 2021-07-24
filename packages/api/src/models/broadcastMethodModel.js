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


class BroadcastMethodModel extends Model {
  static get tableName() {
    return 'broadcast_method';
  }

  static get idColumn() {
    return 'planting_method_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['planting_method_id', 'percentage_planted', 'area_used', 'area_used_unit', 'seeding_rate'],
      properties: {
        planting_method_id: { type: 'number' },
        percentage_planted: { type: 'number' },
        area_used: { type: 'number' },
        area_used_unit: { type: 'string', enum: ['m2', 'ha', 'ft2', 'ac'] },
        seeding_rate: {
          type: 'number',
        },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {};
  }
}

module.exports = BroadcastMethodModel;
