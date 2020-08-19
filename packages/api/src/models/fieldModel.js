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
    return 'field_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_id', 'grid_points'],
      properties: {
        field_id: { type: 'string' },
        farm_id: { type: 'string' },
        field_name: { type: 'string' },
        area: { type: 'number' },
        station_id: { type: 'number' },
        grid_points: { type: 'array',
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' },
          },
        },
      },
    };
  }
  static get relationMappings() {
    // Import models here to prevent require loops.
    return {
      fieldCrop:{
        relation: Model.HasManyRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: require('./fieldCropModel.js'),
        join: {
          from: 'field.field_id',
          to: 'fieldCrop.field_id',
        },
      },
    };
  }
}

module.exports = Field;
