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
import AnimalBatchSexDetailModel from './animalBatchSexDetailModel.js';
import animalUnionBatchIdViewModel from './animalUnionBatchIdViewModel.js';

class AnimalBatchModel extends baseModel {
  static get tableName() {
    return 'animal_batch';
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
      required: ['farm_id', 'count'],
      oneOf: [
        {
          required: ['default_type_id'],
        },
        {
          required: ['custom_type_id'],
        },
      ],
      properties: {
        count: { type: 'integer' },
        custom_breed_id: { type: ['integer', 'null'] },
        custom_type_id: { type: ['integer', 'null'] },
        default_breed_id: { type: ['integer', 'null'] },
        default_type_id: { type: ['integer', 'null'] },
        farm_id: { type: 'string' },
        id: { type: 'integer' },
        name: { type: ['string', 'null'] },
        notes: { type: ['string', 'null'] },
        photo_url: { type: ['string', 'null'] },
        animal_removal_reason_id: { type: ['integer', 'null'] },
        removal_explanation: { type: ['string', 'null'] },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      // Animal batch can have many sex details
      sex_detail: {
        relation: Model.HasManyRelation,
        modelClass: AnimalBatchSexDetailModel,
        join: {
          from: 'animal_batch.id',
          to: 'animal_batch_sex_detail.animal_batch_id',
        },
      },
      animal_union_batch_id_view: {
        relation: Model.BelongsToOneRelation,
        modelClass: animalUnionBatchIdViewModel,
        join: {
          from: 'animal_batch.id',
          to: 'animal_union_batch_id_view.id',
        },
        filter: (query) => query.where('animal_union_batch_id_view.batch', true),
      },
    };
  }
}

export default AnimalBatchModel;
