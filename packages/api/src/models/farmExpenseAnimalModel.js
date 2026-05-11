/*
 *  Copyright 2026 LiteFarm.org
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

import BaseFormatModel from './baseFormatModel.js';
import farmExpenseModel from './farmExpenseModel.js';
import animalModel from './animalModel.js';
import animalBatchModel from './animalBatchModel.js';

class FarmExpenseAnimal extends BaseFormatModel {
  static get tableName() {
    return 'farm_expense_animal';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_expense_id', 'allocated_value'],
      properties: {
        id: { type: 'integer' },
        farm_expense_id: { type: 'string' },
        animal_id: { type: ['integer', 'null'] },
        animal_batch_id: { type: ['integer', 'null'] },
        allocated_value: { type: 'number' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      farm_expense: {
        relation: BaseFormatModel.BelongsToOneRelation,
        modelClass: farmExpenseModel,
        join: {
          from: 'farm_expense_animal.farm_expense_id',
          to: 'farmExpense.farm_expense_id',
        },
      },
      animal: {
        relation: BaseFormatModel.BelongsToOneRelation,
        modelClass: animalModel,
        join: {
          from: 'farm_expense_animal.animal_id',
          to: 'animal.id',
        },
      },
      animal_batch: {
        relation: BaseFormatModel.BelongsToOneRelation,
        modelClass: animalBatchModel,
        join: {
          from: 'farm_expense_animal.animal_batch_id',
          to: 'animal_batch.id',
        },
      },
    };
  }
}

export default FarmExpenseAnimal;
