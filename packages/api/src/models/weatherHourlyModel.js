/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (weatherHourlyModel.js) is part of LiteFarm.
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

class weatherHourly extends Model {
  static get tableName() {
    return 'weatherHourly';
  }

  static get idColumn() {
    return 'weather_hourly_id';
  }
  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['min_degrees', 'max_degrees', 'min_humidity', 'max_humidity', 'precipitation', 'wind_speed', 'field_id'],
      properties: {
        weather_hourly_id: { type: 'integer' },
        min_degrees: { type: 'float' },
        max_degrees: { type: 'float' },
        min_humidity: { type: 'float' },
        max_humidity: { type: 'float' },
        precipitation: { type: 'float ' },
        wind_speed: { type: 'float' },
        station_id: { type: 'integer' },
      },
    };
  }
}

module.exports = weatherHourly;
