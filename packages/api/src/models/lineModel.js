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
      required: ['grid_points', 'total_area'],

      properties: {
        figure_id: { type: 'string' },
        line_points: {
          type: 'array',
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' },
          },
        },
        length: { type: 'number' },
        width: { type: 'number' },
      },
      additionalProperties: false,
    };
  }
}

module.exports = Line;
