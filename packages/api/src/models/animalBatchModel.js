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
import AnimalBatchUseRelationshipModel from './animalBatchUseRelationshipModel.js';
import TaskAnimalBatchRelationshipModel from './taskAnimalBatchRelationshipModel.js';
import TaskModel from './taskModel.js';
import DefaultAnimalTypeModel from './defaultAnimalTypeModel.js';
import CustomAnimalTypeModel from './customAnimalTypeModel.js';
import DefaultAnimalBreedModel from './defaultAnimalBreedModel.js';
import CustomAnimalBreedModel from './customAnimalBreedModel.js';
import AnimalGroupModel from './animalGroupModel.js';

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
        organic_status: { type: 'string', enum: ['Non-Organic', 'Transitional', 'Organic'] },
        birth_date: { type: ['string', 'null'], format: 'date-time' },
        brought_in_date: { type: ['string', 'null'], format: 'date-time' },
        origin_id: { type: ['integer', 'null'] },
        dam: { type: ['string', 'null'] },
        sire: { type: ['string', 'null'] },
        supplier: { type: ['string', 'null'], maxLength: 255 },
        price: { type: ['number', 'null'] },
        location_id: { type: ['string', 'null'] },
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
      animal_union_batch: {
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
      groups: {
        modelClass: AnimalGroupModel,
        relation: Model.ManyToManyRelation,
        join: {
          from: 'animal_batch.id',
          through: {
            modelClass: AnimalBatchGroupRelationshipModel,
            from: 'animal_batch_group_relationship.animal_batch_id',
            to: 'animal_batch_group_relationship.animal_group_id',
          },
          to: 'animal_group.id',
        },
        modify: (query) => query.select('name').where('deleted', false),
      },
      animal_batch_use_relationships: {
        relation: Model.HasManyRelation,
        modelClass: AnimalBatchUseRelationshipModel,
        join: {
          from: 'animal_batch.id',
          to: 'animal_batch_use_relationship.animal_batch_id',
        },
      },
      tasks: {
        modelClass: TaskModel,
        relation: Model.ManyToManyRelation,
        join: {
          from: 'animal_batch.id',
          through: {
            modelClass: TaskAnimalBatchRelationshipModel,
            from: 'task_animal_batch_relationship.animal_batch_id',
            to: 'task_animal_batch_relationship.task_id',
          },
          to: 'task.task_id',
        },
      },
      default_type: {
        modelClass: DefaultAnimalTypeModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'animal_batch.default_type_id',
          to: 'default_animal_type.id',
        },
        modify: (query) => query.select('key'),
      },
      custom_type: {
        modelClass: CustomAnimalTypeModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'animal_batch.custom_type_id',
          to: 'custom_animal_type.id',
        },
        modify: (query) => query.select('type'),
      },
      default_breed: {
        modelClass: DefaultAnimalBreedModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'animal_batch.default_breed_id',
          to: 'default_animal_breed.id',
        },
        modify: (query) => query.select('key'),
      },
      custom_breed: {
        modelClass: CustomAnimalBreedModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'animal_batch.custom_breed_id',
          to: 'custom_animal_breed.id',
        },
        modify: (query) => query.select('breed'),
      },
    };
  }

  static get modifiers() {
    return {
      filterDeleted(query) {
        const { ref } = AnimalBatchModel;
        query.where(ref('deleted'), false);
      },
      selectMinimalProperties(query) {
        const { ref } = AnimalBatchModel;
        query.select(ref('id'), ref('name'), ref('location_id'));
      },
      selectId(query) {
        const { ref } = AnimalBatchModel;
        query.select(ref('id'));
      },
    };
  }
}

export default AnimalBatchModel;
