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

class Line extends Model {
  static get tableName() {
    return 'line';
  }

  static get idColumn() {
    return 'figure_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['line_points', 'length', 'width'],

      properties: {
        figure_id: { type: 'string' },
        line_points: {
          minItems: 2,
          type: 'array',
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' },
          },
        },
        length: { type: 'number' },
        length_unit: { type: 'string', enum: ['cm', 'm', 'km', 'in', 'ft', 'mi'] },
        width: { type: 'number' },
        width_unit: { type: 'string', enum: ['cm', 'm', 'km', 'in', 'ft', 'mi'] },
        total_area: { type: 'number' },
        total_area_unit: { type: 'string', enum: ['m2', 'ha', 'ft2', 'ac'] },
      },
      additionalProperties: false,
    };
  }
}

module.exports = Line;
