/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (nitrogenBalanceModel.js) is part of LiteFarm.
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

class NitrogenBalance extends Model {
  static get tableName() {
    return 'nitrogenBalance';
  }

  static get idColumn() {
    return 'nitrogen_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['field_id', 'nitrogen_value'],
      properties: {
        nitrogen_id: { type: 'integer' },
        created_at: { type: 'date-time' },
        field_id: { type: 'string' },
        nitrogen_value: { type: 'float' },
      },
      additionalProperties: false,
    };
  }
}

export default NitrogenBalance;
