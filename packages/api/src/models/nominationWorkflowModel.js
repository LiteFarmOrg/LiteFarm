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
class NominationWorkflow extends baseModel {
  static get tableName() {
    return 'nomination_workflow';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['status', 'type_group'],
      properties: {
        workflow_id: { type: 'integer' },
        status: { type: 'string' },
        type_group: { type: 'string' },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
}

export default NominationWorkflow;
