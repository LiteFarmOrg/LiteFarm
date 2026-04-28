/*
 *  Copyright (c) 2026 LiteFarm.org
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
import saleModel from './saleModel.js';
import animalModel from './animalModel.js';
import animalBatchModel from './animalBatchModel.js';

class AnimalSale extends Model {
  static get tableName() {
    return 'animal_sale';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['sale_id'],

      properties: {
        id: { type: 'integer' },
        sale_id: { type: 'integer' },
        animal_id: { type: ['integer', 'null'] },
        animal_batch_id: { type: ['integer', 'null'] },
        quantity: { type: ['number', 'null'], format: 'float' },
        quantity_unit: { type: ['string', 'null'] },
        sale_value: { type: ['number', 'null'], format: 'float' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      sale: {
        relation: Model.BelongsToOneRelation,
        modelClass: saleModel,
        join: {
          from: 'animal_sale.sale_id',
          to: 'sale.sale_id',
        },
      },
      animal: {
        relation: Model.BelongsToOneRelation,
        modelClass: animalModel,
        join: {
          from: 'animal_sale.animal_id',
          to: 'animal.id',
        },
      },
      animal_batch: {
        relation: Model.BelongsToOneRelation,
        modelClass: animalBatchModel,
        join: {
          from: 'animal_sale.animal_batch_id',
          to: 'animal_batch.id',
        },
      },
    };
  }
}

export default AnimalSale;
