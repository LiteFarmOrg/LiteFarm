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

import { Model } from 'objection';
import knex from '../util/knex.js';

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
        'location_id',
        'value',
        'unit',
        'read_time',
        'reading_type',
        'valid',
        'unit',
      ],
      properties: {
        reading_id: { type: 'string' },
        read_time: { type: 'timestamp' },
        created_at: { type: 'timestamp' },
        location_id: { type: 'string' },
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
  static async getSensorReadingsInDaysByFarmId(farmId) {
    const sensorReadings = await knex.raw(
      `
      SELECT * FROM 
      (SELECT
      l.name,
      rank() OVER 
        (
        PARTITION BY sr.reading_type, sr.location_id 
        ORDER BY sr.read_time DESC
        ),
        sr.*
        FROM sensor_reading AS sr
      INNER JOIN sensor AS s
      ON sr.location_id = s.location_id
      INNER JOIN location AS l
      ON sr.location_id = l.location_id
      WHERE l.farm_id = ?
      ) sensor_reading_ranked_scores
      WHERE rank <=1
    `,
      [farmId],
    );
    return sensorReadings.rows;
  }

  /**
   * Returns sensor readings for the list of location ids, readingType and endDate
   * @param {Date} endDate end date
   * @param {Array} locationIds sensor ids
   * @param {string} readingType reading type e.g temperature
   * @returns {Object} list of sensor readings
   */
  static async getSensorReadingsByLocationIds(
    endDate = new Date(),
    locationIds = [],
    readingType = '',
  ) {
    const durationType = '1 hour';
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 5);
    const sensorReadings = await knex.raw(
      `
    SELECT
      nearest_read_time AS read_time, 
      read_time AS actual_read_time, 
      value, 
      u AS unit,
      location_id,
      name 
    FROM get_nearest_sensor_readings(?,?,?,?,?,?) WHERE nearest_read_time - read_time < INTERVAL '2 hour';
  `,
      [readingType, false, startDate, endDate, locationIds, durationType],
    );
    return sensorReadings.rows;
  }
}

export default SensorReading;
