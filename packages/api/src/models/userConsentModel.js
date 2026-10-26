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

import Model from './baseFormatModel.js';

class UserConsent extends Model {
  async $beforeInsert(context) {
    await super.$beforeInsert(context);
    this.consented_at = new Date().toISOString();
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);
    this.consented_at = new Date().toISOString();
  }

  static get tableName() {
    return 'user_consent';
  }

  static get idColumn() {
    return 'user_id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'consent_version'],
      properties: {
        user_id: { type: 'string' },
        consent_version: { type: 'string', minLength: 1 },
        consented_at: { type: ['string', 'null'], format: 'date-time' },
      },
      additionalProperties: false,
    };
  }
}

export default UserConsent;
