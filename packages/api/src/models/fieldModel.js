/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fieldModel.js) is part of LiteFarm.
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

class Field extends Model {
  static get tableName() {
    return 'field';
  }

  static get idColumn() {
    return 'location_id';
  }

  static get virtualAttributes() {
    return ['main_color', 'hover_color', 'line_type'];
  }

  get main_color() {
    return '444444';
  }

  get hover_color() {
    return 'ffffff';
  }

  get line_type() {
    return 'solid';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['location_id'],
      properties: {
        location_id: { type: 'string' },
        organic_status: { type: 'string', enum: ['Non-Organic', 'Transitional', 'Organic'] },
        station_id: { type: 'number' },
        transition_date: { type: 'date' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
    };
  }
}

module.exports = Field;
