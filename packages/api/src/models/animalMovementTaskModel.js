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
import TaskModel from './taskModel.js';
import AnimalMovementTaskPurposeRelationshipModel from './animalMovementTaskPurposeRelationshipModel.js';

class AnimalMovementTask extends Model {
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
      purpose_relationships: {
        relation: Model.HasManyRelation,
        modelClass: AnimalMovementTaskPurposeRelationshipModel,
        join: {
          from: 'animal_movement_task.task_id',
          to: 'animal_movement_task_purpose_relationship.task_id',
        },
      },
    };
  }
}

export default AnimalMovementTask;
