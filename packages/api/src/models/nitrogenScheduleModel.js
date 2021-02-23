/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (nitrogenScheduleModel.js) is part of LiteFarm.
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

const Model = require('objection').Model;

class NitrogenSchedule extends Model {
  static get tableName() {
    return 'nitrogenSchedule';
  }

  static get idColumn() {
    return 'nitrogen_schedule_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['scheduled_at', 'farm_id', 'frequency'],
      properties: {
        nitrogen_schedule_id: { type: 'integer' },
        created_at: { type: 'date-time' },
        scheduled_at: { type: 'date-time' },
        farm_id: { type: 'string' },
        frequency: { type: 'integer' },
      },
      additionalProperties: false,
    };
  }
}

module.exports = NitrogenSchedule;
