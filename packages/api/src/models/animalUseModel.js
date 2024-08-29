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

import knex from '../util/knex.js';
import baseModel from './baseModel.js';

class AnimalUse extends baseModel {
  static get tableName() {
    return 'animal_use';
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
      required: ['key'],
      properties: {
        id: { type: 'integer' },
        key: { type: 'string' },
      },
      additionalProperties: false,
    };
  }

  static async getAnimalUsesForTypes() {
    const typeUseRelationships = await knex('animal_type_use_relationship')
      .select({
        default_type_id: 'default_type_id',
        useId: 'animal_use.id',
        useKey: 'animal_use.key',
      })
      .join('animal_use', 'animal_type_use_relationship.animal_use_id', '=', 'animal_use.id');

    const usesPerType = typeUseRelationships.reduce((map, { default_type_id, useId, useKey }) => {
      map[default_type_id] = map[default_type_id] || [];
      map[default_type_id].push({ id: useId, key: useKey });

      return map;
    }, {});

    const response = Object.entries(usesPerType).map(([defaultTypeId, uses]) => {
      return { default_type_id: +defaultTypeId, uses };
    });

    const allUses = await AnimalUse.query();
    response.push({ default_type_id: null, uses: allUses });

    return response;
  }
}

export default AnimalUse;
