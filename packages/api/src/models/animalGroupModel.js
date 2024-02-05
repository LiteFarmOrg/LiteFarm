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

import { Model } from 'objection';
import AnimalGroupRelationshipModel from './animalGroupRelationshipModel.js';
import baseModel from './baseModel.js';
import AnimalBatchGroupRelationshipModel from './animalBatchGroupRelationshipModel.js';

class AnimalGroup extends baseModel {
  static get tableName() {
    return 'animal_group';
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
      required: ['farm_id', 'name'],
      properties: {
        id: { type: 'integer' },
        farm_id: { type: 'string' },
        name: { type: 'string' },
        notes: { type: ['string', 'null'] },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      animal_relationships: {
        modelClass: AnimalGroupRelationshipModel,
        relation: Model.HasManyRelation,
        join: {
          from: 'animal_group.id',
          to: 'animal_group_relationship.animal_group_id',
        },
        modify: (query) => query.select('animal_id'),
      },
      batch_relationships: {
        modelClass: AnimalBatchGroupRelationshipModel,
        relation: Model.HasManyRelation,
        join: {
          from: 'animal_group.id',
          to: 'animal_batch_group_relationship.animal_group_id',
        },
        modify: (query) => query.select('animal_batch_id'),
      },
    };
  }
}

export default AnimalGroup;
