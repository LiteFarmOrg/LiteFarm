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
import AnimalBatchGroupRelationshipModel from './animalBatchGroupRelationshipModel.js';
import AnimalUnionBatchIdViewModel from './animalUnionBatchIdViewModel.js';
import { checkAndTrimString } from '../util/util.js';

class AnimalBatchModel extends baseModel {
  static get tableName() {
    return 'animal_batch';
  }

  static get idColumn() {
    return 'id';
  }

  static get stringProperties() {
    const stringProperties = [];
    for (const [key, value] of Object.entries(this.jsonSchema.properties)) {
      if (value.type.includes('string')) {
        stringProperties.push(key);
      }
    }
    return stringProperties;
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    this.trimStringProperties();
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);
    this.trimStringProperties();
  }

  trimStringProperties() {
    for (const key of this.constructor.stringProperties) {
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
        removal_date: { type: ['string', 'null'], format: 'date-time' },
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
      internal_identifier: {
        relation: Model.HasOneRelation,
        modelClass: AnimalUnionBatchIdViewModel,
        join: {
          from: 'animal_batch.id',
          to: 'animal_union_batch_id_view.id',
        },
        modify: (query) => query.select('internal_identifier').where('batch', true),
      },
      group_ids: {
        relation: Model.HasManyRelation,
        modelClass: AnimalBatchGroupRelationshipModel,
        join: {
          from: 'animal_batch.id',
          to: 'animal_batch_group_relationship.animal_batch_id',
        },
        modify: (query) =>
          query.select('animal_group_id').whereIn('animal_group_id', function () {
            this.select('id').from('animal_group').where('deleted', false);
          }),
      },
    };
  }
}

export default AnimalBatchModel;
