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


class TransplantContainerModel extends Model {
  static get tableName() {
    return 'transplant_container';
  }

  static get idColumn() {
    return 'management_plan_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['management_plan_id', 'in_ground', 'planting_depth', 'location_id'],
      properties: {
        management_plan_id: { type: 'number' },
        in_ground: { type: 'boolean' },
        location_id: { type: 'string' },
        plant_spacing: { type: ['number', null] },
        plant_spacing_unit: { type: 'string', enum: ['cm', 'm', 'km', 'in', 'ft', 'mi'] },
        total_plants: { type: ['integer', null] },
        number_of_containers: { type: ['integer', null] },
        plants_per_container: { type: ['integer', null] },
        planting_depth: { type: 'number' },
        planting_depth_unit: { type: 'string', enum: ['cm', 'm', 'km', 'in', 'ft', 'mi'] },
        planting_soil: { type: ['string', null] },
        container_type: { type: ['string', null] },
        notes: { type: ['string', null] },
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
          from: 'transplant_container.location_id',
          to: 'location.location_id',
        },
      },
    };
  }
}

module.exports = TransplantContainerModel;
