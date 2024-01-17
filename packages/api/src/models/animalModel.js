/*
 *  Copyright 2024 LiteFarm.org
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

import baseModel from './baseModel.js';

class Animal extends baseModel {
  static get tableName() {
    return 'animal';
  }

  static get idColumn() {
    return 'id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      oneOf: [
        {
          required: ['farm_id', 'default_breed_id'],
        },
        {
          required: ['farm_id', 'custom_breed_id'],
        },
      ],
      properties: {
        id: { type: 'integer' },
        farm_id: { type: 'string' },
        default_breed_id: { type: ['integer', 'null'] },
        custom_breed_id: { type: ['integer', 'null'] },
        sex_id: { type: 'integer' },
        name: { type: 'string' },
        birth_date: { type: 'string', format: 'date' },
        identifier: { type: 'string ' },
        identifier_color_id: { type: 'integer' },
        identifier_placement_id: { type: 'integer' },
        origin_id: { type: 'integer' },
        dam: { type: 'string' },
        sire: { type: 'string' },
        brought_in_date: { type: 'string', format: 'date' },
        weaning_date: { type: 'string', format: 'date' },
        notes: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
}

export default Animal;
