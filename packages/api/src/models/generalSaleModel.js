/*
 *  Copyright (c) 2023 LiteFarm.org
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

class GeneralSale extends Model {
  static get tableName() {
    return 'general_sale';
  }

  static get idColumn() {
    return ['sale_id'];
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['sale_id'],

      properties: {
        sale_id: { type: 'integer' },
        sale_value: {
          type: 'number',
          format: 'float',
        },
        notes: { type: ['string', 'null'], maxLength: 10000 },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      sale: {
        relation: Model.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one.
        modelClass: saleModel,
        join: {
          from: 'general_sale.sale_id',
          to: 'sale.sale_id',
        },
      },
    };
  }
}

export default GeneralSale;
