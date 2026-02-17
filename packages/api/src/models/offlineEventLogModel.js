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

class offlineEventLogModel extends Model {
  static get tableName() {
    return 'offline_event_log';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['event_name', 'app_version', 'authenticated', 'event_at', 'went_online_at'],
      properties: {
        event_name: { type: 'string' },
        status_code: { type: ['integer', 'null'] },
        country_id: { type: ['number', 'null'] },
        app_version: { type: 'string' },
        authenticated: { type: 'boolean' },
        event_at: { type: 'string', format: 'date-time' },
        went_online_at: { type: 'string', format: 'date-time' },
      },
      additionalProperties: false,
    };
  }
}

export default offlineEventLogModel;
