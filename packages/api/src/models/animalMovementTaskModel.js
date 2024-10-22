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
import TaskModel from './taskModel.js';
import AnimalModel from './animalModel.js';
import AnimalBatchModel from './animalBatchModel.js';
import AnimalMovementPurposeModel from './animalMovementPurposeModel.js';
import AnimalMovementTaskPurposeRelationshipModel from './animalMovementTaskPurposeRelationshipModel.js';
import AnimalMovementTaskAnimalRelationshipModel from './animalMovementTaskAnimalRelationshipModel.js';
import AnimalMovementTaskAnimalBatchRelationshipModel from './animalMovementTaskAnimalBatchRelationshipModel.js';

class AnimalMovementTask extends baseModel {
  static get tableName() {
    return 'animal_movement_task';
  }

  static get idColumn() {
    return 'task_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: [],
      properties: {
        task_id: { type: 'integer' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      task: {
        relation: Model.BelongsToOneRelation,
        modelClass: TaskModel,
        join: {
          from: 'animal_movement_task.task_id',
          to: 'task.task_id',
        },
      },
      animals: {
        relation: Model.ManyToManyRelation,
        modelClass: AnimalModel,
        join: {
          from: 'animal_movement_task.task_id',
          through: {
            modelClass: AnimalMovementTaskAnimalRelationshipModel,
            from: 'animal_movement_task_animal_relationship.task_id',
            to: 'animal_movement_task_animal_relationship.animal_id',
          },
          to: 'animal.id',
        },
      },
      animal_batches: {
        relation: Model.ManyToManyRelation,
        modelClass: AnimalBatchModel,
        join: {
          from: 'animal_movement_task.task_id',
          through: {
            modelClass: AnimalMovementTaskAnimalBatchRelationshipModel,
            from: 'animal_movement_task_animal_batch_relationship.task_id',
            to: 'animal_movement_task_animal_batch_relationship.animal_batch_id',
          },
          to: 'animal_batch.id',
        },
      },
      purposes: {
        relation: Model.ManyToManyRelation,
        modelClass: AnimalMovementPurposeModel,
        join: {
          from: 'animal_movement_task.task_id',
          through: {
            modelClass: AnimalMovementTaskPurposeRelationshipModel,
            from: 'animal_movement_task_purpose_relationship.task_id',
            to: 'animal_movement_task_purpose_relationship.purpose_id',
            extra: ['other_purpose'],
          },
          to: 'animal_movement_purpose.id',
        },
      },
    };
  }
}

export default AnimalMovementTask;
