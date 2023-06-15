/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
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

class OrganicHistory extends baseModel {
  static get tableName() {
    return 'organic_history';
  }

  static get idColumn() {
    return 'organic_history_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['location_id', 'organic_status', 'effective_date'],
      properties: {
        organic_history_id: { type: 'string' },
        location_id: { type: 'string' },
        organic_status: { type: 'string', enum: ['Non-Organic', 'Transitional', 'Organic'] },
        effective_date: { type: 'string', format: 'date' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }

  static get modifiers() {
    return {
      orderByEffectiveDateAsc(builder) {
        builder.orderBy('effective_date');
      },
    };
  }
}

export default OrganicHistory;
