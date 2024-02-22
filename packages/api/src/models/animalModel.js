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

import Model from './baseFormatModel.js';
import baseModel from './baseModel.js';
import animalUnionBatchIdViewModel from './animalUnionBatchIdViewModel.js';

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
      required: ['farm_id'],
      oneOf: [
        {
          required: ['default_type_id'],
        },
        {
          required: ['custom_type_id'],
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
        photo_url: { type: ['string', 'null'] },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      animal_union_batch_id_view: {
        relation: Model.BelongsToOneRelation,
        modelClass: animalUnionBatchIdViewModel,
        join: {
          from: 'animal.id',
          to: 'animal_union_batch_id_view.id',
        },
        filter: (query) => query.where('animal_union_batch_id_view.batch', false),
      },
    };
  }
}

export default Animal;
