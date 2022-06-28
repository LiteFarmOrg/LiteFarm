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

const Model = require('objection').Model;

class SensorReading extends Model {
  static get tableName() {
    return 'sensor_reading';
  }

  static get idColumn() {
    return 'reading_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'read_time',
        'sensor_id',
        'reading_type',
        'value',
        'unit',
        'read_time',
        'reading_type',
        'value',
        'unit',
      ],
      properties: {
        reading_id: { type: 'string' },
        read_time: { type: 'timestamp' },
        created_at: { type: 'timestamp' },
        sensor_id: { type: 'string' },
        reading_type: { type: 'string', minLength: 1, maxLength: 255 },
        value: { type: 'float' },
        unit: { type: 'string', minLength: 1, maxLength: 255 },
        valid: { type: 'boolean' },
      },
      additionalProperties: false,
    };
  }

  /**
   * Returns sensor readings for a farm for the past given number of days
   * @param {uuid} farmId farm id
   * @param {number} days number of days of sensor readings
   * @returns {Object} Sensor Reading Object
   */
  static async getSensorReadingsByFarmId(farmId, days) {
    if (!days) {
      return await SensorReading.query()
        .joinRaw('JOIN sensor ON sensor_reading.sensor_id::uuid = sensor.sensor_id')
        .where('farm_id', farmId);
    } else {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - days);
      return await SensorReading.query()
        .joinRaw('JOIN sensor ON sensor_reading.sensor_id::uuid = sensor.sensor_id')
        .where('farm_id', farmId)
        .andWhere('created_at', '>=', pastDate);
    }
  }
}

module.exports = SensorReading;
