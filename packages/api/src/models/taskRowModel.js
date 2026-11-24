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

import BaseModel from './baseModel.js';

class TaskRowModel extends BaseModel {
  static get tableName() {
    return 'task_row';
  }

  static get idColumn() {
    return ['task_id', 'row_id'];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['task_id', 'row_id'],
      properties: {
        task_id: { type: 'integer' },
        row_id: { type: 'string' },
        status: { type: 'string', enum: ['pending', 'done', 'aborted'] },
        completed_at: { type: ['string', 'null'] },
        note: { type: ['string', 'null'], maxLength: 1000 },
        ...this.baseProperties,
      },
      additionalProperties: false,
    };
  }
}

export default TaskRowModel;
