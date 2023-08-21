/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (priceModel.js) is part of LiteFarm.
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
// TODO: Deprecate objection soft delete
import softDelete from 'objection-soft-delete';
// Patch for mergeContext deprecation from objection
import { QueryBuilder } from 'objection';
QueryBuilder.prototype.mergeContext = QueryBuilder.prototype.context;

class Price extends softDelete({ columnName: 'deleted' })(Model) {
  static get tableName() {
    return 'price';
  }

  static get idColumn() {
    return 'price_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['crop_id', 'value_$/kg', 'farm_id'],
      properties: {
        price_id: { type: 'integer' },
        crop_id: { type: 'integer' },
        'value_$/kg': { type: 'integer' },
        date: { type: 'string', format: 'date-time' },
        farm_id: { type: 'string' },
        deleted: { type: 'boolean' },
      },
      additionalProperties: false,
    };
  }
}

export default Price;
