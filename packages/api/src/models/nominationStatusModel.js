/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (farmModel.js) is part of LiteFarm.
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

// Describes the nomination table
// Base model extends objection.js
class NominationStatus extends baseModel {
  static get tableName() {
    return 'nomination_status';
  }

  static get idColumn() {
    return 'status_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['nomination_id', 'workflow_id'],
      properties: {
        status_id: { type: 'integer' },
        nomination_id: { type: 'integer' },
        workflow_id: { type: 'integer' },
        notes: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
}

export default NominationStatus;
