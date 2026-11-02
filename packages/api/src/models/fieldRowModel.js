/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
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

import BaseModel from './baseModel.js';

class FieldRowModel extends BaseModel {
  static get tableName() {
    return 'field_row';
  }

  static get idColumn() {
    return 'row_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['row_plan_id', 'row_number', 'position', 'line_points', 'length'],
      properties: {
        row_id: { type: 'string' },
        row_plan_id: { type: 'string' },
        row_number: { type: 'integer', minimum: 0 },
        frag: { type: 'integer', minimum: 0 },
        position: { type: 'integer', minimum: 0 },
        line_points: {
          type: 'array',
          minItems: 2,
          items: {
            type: 'object',
            required: ['lat', 'lng'],
            properties: { lat: { type: 'number' }, lng: { type: 'number' } },
          },
        },
        length: { type: 'number' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
}

export default FieldRowModel;
