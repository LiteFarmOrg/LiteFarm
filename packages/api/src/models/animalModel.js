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
import AnimalUnionBatchIdViewModel from './animalUnionBatchIdViewModel.js';
import AnimalGroupRelationshipModel from './animalGroupRelationshipModel.js';
import Model from './baseFormatModel.js';
import { checkAndTrimString } from '../util/util.js';
import AnimalUseRelationshipModel from './animalUseRelationshipModel.js';
import TaskModel from './taskModel.js';
import TaskAnimalRelationshipModel from './taskAnimalRelationshipModel.js';
import DefaultAnimalTypeModel from './defaultAnimalTypeModel.js';
import CustomAnimalTypeModel from './customAnimalTypeModel.js';
import DefaultAnimalBreedModel from './defaultAnimalBreedModel.js';
import CustomAnimalBreedModel from './customAnimalBreedModel.js';
import AnimalGroupModel from './animalGroupModel.js';

class Animal extends baseModel {
  static get tableName() {
    return 'animal';
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
        birth_date: { type: ['string', 'null'], format: 'date-time' },
        identifier: { type: ['string', 'null'] },
        identifier_color_id: { type: ['integer', 'null'] },
        origin_id: { type: ['integer', 'null'] },
        dam: { type: ['string', 'null'] },
        sire: { type: ['string', 'null'] },
        brought_in_date: { type: ['string', 'null'], format: 'date-time' },
        weaning_date: { type: ['string', 'null'], format: 'date-time' },
        notes: { type: ['string', 'null'] },
        photo_url: { type: ['string', 'null'] },
        animal_removal_reason_id: { type: ['integer', 'null'] },
        removal_explanation: { type: ['string', 'null'] },
        removal_date: { type: ['string', 'null'], format: 'date-time' },
        identifier_type_id: { type: ['integer', 'null'] },
        identifier_type_other: { type: ['string', 'null'] },
        organic_status: { type: 'string', enum: ['Non-Organic', 'Transitional', 'Organic'] },
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
      animal_union_batch: {
        relation: Model.HasOneRelation,
        modelClass: AnimalUnionBatchIdViewModel,
        join: {
          from: 'animal.id',
          to: 'animal_union_batch_id_view.id',
        },
        modify: (query) => query.select('internal_identifier').where('batch', false),
      },
      group_ids: {
        relation: Model.HasManyRelation,
        modelClass: AnimalGroupRelationshipModel,
        join: {
          from: 'animal.id',
          to: 'animal_group_relationship.animal_id',
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
          from: 'animal.id',
          through: {
            modelClass: AnimalGroupRelationshipModel,
            from: 'animal_group_relationship.animal_id',
            to: 'animal_group_relationship.animal_group_id',
          },
          to: 'animal_group.id',
        },
        modify: (query) => query.select('name').where('deleted', false),
      },
      animal_use_relationships: {
        relation: Model.HasManyRelation,
        modelClass: AnimalUseRelationshipModel,
        join: {
          from: 'animal.id',
          to: 'animal_use_relationship.animal_id',
        },
      },
      tasks: {
        modelClass: TaskModel,
        relation: Model.ManyToManyRelation,
        join: {
          from: 'animal.id',
          through: {
            modelClass: TaskAnimalRelationshipModel,
            from: 'task_animal_relationship.animal_id',
            to: 'task_animal_relationship.task_id',
          },
          to: 'task.task_id',
        },
      },
      default_type: {
        modelClass: DefaultAnimalTypeModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'animal.default_type_id',
          to: 'default_animal_type.id',
        },
        modify: (query) => query.select('key'),
      },
      custom_type: {
        modelClass: CustomAnimalTypeModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'animal.custom_type_id',
          to: 'custom_animal_type.id',
        },
        modify: (query) => query.select('type'),
      },
      default_breed: {
        modelClass: DefaultAnimalBreedModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'animal.default_breed_id',
          to: 'default_animal_breed.id',
        },
        modify: (query) => query.select('key'),
      },
      custom_breed: {
        modelClass: CustomAnimalBreedModel,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'animal.custom_breed_id',
          to: 'custom_animal_breed.id',
        },
        modify: (query) => query.select('breed'),
      },
    };
  }

  static get modifiers() {
    return {
      filterDeleted(query) {
        const { ref } = Animal;
        query.where(ref('deleted'), false);
      },
      selectMinimalProperties(query) {
        const { ref } = Animal;
        query.select(ref('id'), ref('name'), ref('location_id'));
      },
      selectId(query) {
        const { ref } = Animal;
        query.select(ref('id'));
      },
    };
  }

  static async getAnimalIdsWithTasks(trx, animalIds, taskFilterCondition) {
    if (taskFilterCondition) {
      return Animal.query(trx)
        .select('id')
        .withGraphFetched('tasks')
        .modifyGraph('tasks', (builder) => {
          builder.select('task.task_id', 'task.complete_date', 'task.abandon_date');
          builder.where('deleted', false).whereRaw(taskFilterCondition);
        })
        .whereIn('animal.id', animalIds);
    }

    return Animal.query(trx)
      .select('id')
      .withGraphFetched('tasks')
      .modifyGraph('tasks', (builder) => {
        builder.select('task.task_id', 'task.complete_date', 'task.abandon_date');
        builder.where('deleted', false);
      })
      .whereIn('animal.id', animalIds)
      .transacting(trx);
  }

  // Get animals with finalized (completed or abandoned) tasks
  static async getAnimalIdsWithFinalizedTasks(trx, animalIds) {
    return Animal.getAnimalIdsWithTasks(
      trx,
      animalIds,
      'complete_date IS NOT NULL OR abandon_date IS NOT NULL',
    );
  }

  static async getAnimalIdsWithIncompleteTasks(trx, animalIds) {
    return Animal.getAnimalIdsWithTasks(
      trx,
      animalIds,
      'complete_date IS NULL AND abandon_date IS NULL',
    );
  }

  static async unrelateIncompleteTasksForAnimals(trx, animalIds) {
    let unrelatedTaskIds = [];
    const animals = await Animal.getAnimalIdsWithIncompleteTasks(trx, animalIds);

    if (animals) {
      // Delete relationships
      await Promise.all(
        animals.map(({ id, tasks }) => {
          const taskIds = tasks.map(({ task_id }) => task_id);
          unrelatedTaskIds = [...unrelatedTaskIds, ...taskIds];

          return Animal.relatedQuery('tasks')
            .for(id)
            .unrelate()
            .whereIn('task.task_id', taskIds)
            .transacting(trx);
        }),
      );
    }

    return { unrelatedTaskIds: [...new Set(unrelatedTaskIds)] };
  }
}

export default Animal;
