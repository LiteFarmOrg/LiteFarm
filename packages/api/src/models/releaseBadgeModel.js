/*
 *  Copyright 2023 LiteFarm.org
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

class ReleaseBadge extends BaseFormatModel {
  static get tableName() {
    return 'release_badge';
  }

  static get idColumn() {
    return 'user_id';
  }

  // As in baseModel, but without created_by_user_id and updated_by_user_id:
  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    this.created_at = new Date().toISOString();
    this.updated_at = this.created_at;
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);
    this.updated_at = new Date().toISOString();
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        app_version: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
      additionalProperties: false,
    };
  }
}

export default ReleaseBadge;
