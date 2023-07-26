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

class ContainerMethodModel extends Model {
  static get tableName() {
    return 'container_method';
  }

  static get idColumn() {
    return 'planting_management_plan_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['planting_management_plan_id', 'in_ground'],
      properties: {
        planting_management_plan_id: { type: 'string' },
        in_ground: { type: 'boolean' },
        plant_spacing: { type: ['number', 'null'] },
        plant_spacing_unit: { type: 'string', enum: ['cm', 'm', 'in', 'ft'] },
        total_plants: { type: ['integer', 'null'] },
        number_of_containers: { type: ['integer', 'null'] },
        plants_per_container: { type: ['integer', 'null'] },
        planting_depth: { type: ['number', 'null'] },
        planting_depth_unit: { type: 'string', enum: ['cm', 'm', 'in', 'ft'] },
        planting_soil: { type: ['string', 'null'] },
        container_type: { type: ['string', 'null'] },
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
      in_ground: 'keep',
      plant_spacing: 'keep',
      plant_spacing_unit: 'keep',
      total_plants: 'keep',
      number_of_containers: 'keep',
      plants_per_container: 'keep',
      planting_depth: 'keep',
      planting_depth_unit: 'keep',
      planting_soil: 'keep',
      container_type: 'keep',
      // relationMappings
    };
  }
}

export default ContainerMethodModel;
