/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (harvestLogModel.js) is part of LiteFarm.
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

class Figure extends Model {
  static get tableName() {
    return 'figure';
  }

  static get idColumn() {
    return 'figure_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['type', 'location_id'],

      properties: {
        type: {
          type: 'string',
          enum: ['gate', 'water_valve', 'farm_site_boundary', 'field', 'garden', 'buffer_zone', 'watercourse', 'fence', 'ceremonial_area',
            'residence', 'surface_water', 'natural_area', 'greenhouse', 'barn'],
        },
        location_id: { type: 'string' },
        figure_id: { type: 'string' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      area: {
        relation: Model.HasOneRelation,
        modelClass: require('./areaModel'),
        join: {
          from: 'figure.figure_id',
          to: 'area.figure_id',
        },
      },

      point: {
        relation: Model.HasOneRelation,
        modelClass: require('./pointModel'),
        join: {
          from: 'figure.figure_id',
          to: 'point.figure_id',
        },
      },
      line: {
        relation: Model.HasOneRelation,
        modelClass: require('./lineModel'),
        join: {
          from: 'figure.figure_id',
          to: 'line.figure_id',
        },
      },

    };
  }
}

module.exports = Figure;
