/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (shiftModel.js) is part of LiteFarm.
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

const baseModel = require('./baseModel');
const Model = require('objection').Model;

class Shift extends baseModel {
  static get tableName() {
    return 'shift';
  }

  static get idColumn() {
    return 'shift_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'farm_id'],

      properties: {
        shift_id: { type: 'string' },
        user_id: { type: 'string' },
        farm_id: { type: 'string' },
        shift_date: { type: 'date' },
        mood: {
          type: 'string',
          enum: ['happy', 'neutral', 'very happy', 'sad', 'very sad', 'na', 'no answer'],
        },
        wage_at_moment: { type: 'number' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    }
  }
}

module.exports = Shift;
