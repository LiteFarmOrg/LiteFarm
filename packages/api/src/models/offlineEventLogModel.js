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
      required: ['session_id', 'event_name', 'event_at'],
      properties: {
        session_id: { type: 'string', format: 'uuid' },
        event_name: { type: 'string' },
        status_code: { type: ['integer', 'null'] },
        url: { type: ['string', 'null'] },
        country_id: { type: ['integer', 'null'] },
        network: { type: ['string', 'null'] },
        browser: { type: ['string', 'null'] },
        browser_version: { type: ['string', 'null'] },
        device_vendor: { type: ['string', 'null'] },
        os: { type: ['string', 'null'] },
        device_model: { type: ['string', 'null'] },
        app_version: { type: ['string', 'null'] },
        log_status: { type: ['string', 'null'] },
        event_at: { type: 'string', format: 'date-time' },
        went_online_at: { type: ['string', 'null'], format: 'date-time' },
        user_id: { type: ['string', 'null'] },
        role_id: { type: ['integer', 'null'] },
      },
      additionalProperties: false,
    };
  }
}

export default offlineEventLogModel;
