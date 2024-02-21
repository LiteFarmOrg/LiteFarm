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

import { checkAndTrimString } from '../util/util.js';
import baseModel from './baseModel.js';

class Animal extends baseModel {
  static get tableName() {
    return 'animal';
  }

  static get idColumn() {
    return 'id';
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    this.trimStringProperties();
  }

  async $beforeUpdate(queryContext) {
    await super.$beforeUpdate(queryContext);
    this.trimStringProperties();
  }

  trimStringProperties() {
    const stringProperties = Object.entries(this.constructor.jsonSchema.properties)
      .filter(([, value]) => value.type.includes('string'))
      .map(([key]) => key);

    for (const key of stringProperties) {
      if (key in this) {
        this[key] = checkAndTrimString(this[key]);
      }
    }
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_id'],
      anyOf: [
        {
          required: ['default_type_id', 'name'],
        },
        {
          required: ['custom_type_id', 'name'],
        },
        {
          required: ['default_type_id', 'identifier'],
        },
        {
          required: ['custom_type_id', 'identifier'],
        },
      ],
      properties: {
        id: { type: 'integer' },
        farm_id: { type: 'string' },
        default_type_id: { type: ['integer', 'null'] },
        custom_type_id: { type: ['integer', 'null'] },
        default_breed_id: { type: ['integer', 'null'] },
        custom_breed_id: { type: ['integer', 'null'] },
        sex_id: { type: ['integer', 'null'] },
        name: { type: ['string', 'null'] },
        birth_date: { type: ['string', 'null'], format: 'date' },
        identifier: { type: ['string', 'null'] },
        identifier_color_id: { type: ['integer', 'null'] },
        identifier_placement_id: { type: ['integer', 'null'] },
        origin_id: { type: ['integer', 'null'] },
        dam: { type: ['string', 'null'] },
        sire: { type: ['string', 'null'] },
        brought_in_date: { type: ['string', 'null'], format: 'date' },
        weaning_date: { type: ['string', 'null'], format: 'date' },
        notes: { type: ['string', 'null'] },
        removed: { type: 'boolean' },
        animal_removal_reason_id: { type: ['integer', 'null'] },
        removal_explanation: { type: ['string', 'null'] },
        ...this.baseProperties,
      },
      additionalProperties: false,
      if: {
        properties: {
          removed: { const: true },
        },
        required: ['removed'],
      },
      then: {
        required: ['animal_removal_reason_id'],
      },
    };
  }
}

export default Animal;
