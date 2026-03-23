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
import { checkAndTrimString } from '../util/util.js';

class FarmNoteModel extends BaseModel {
  static get tableName() {
    return 'farm_note';
  }

  static get idColumn() {
    return 'id';
  }

  // Override to expose updated_at and created_by_user_id for display on the frontend.
  static get hidden() {
    return ['updated_by_user_id', 'created_at', 'deleted'];
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    this.trimNote();
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);
    this.trimNote();
  }

  trimNote() {
    if (this.note) {
      this.note = checkAndTrimString(this.note);
    }
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['note', 'farm_id'],
      properties: {
        id: { type: 'string' },
        farm_id: { type: 'string' },
        user_id: { type: 'string' },
        note: { type: 'string' },
        is_private: { type: 'boolean' },
        image_url: { type: ['string', 'null'] },
        ...this.baseProperties,
      },
    };
  }
}

export default FarmNoteModel;
