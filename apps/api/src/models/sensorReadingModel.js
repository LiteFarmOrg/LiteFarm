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

import Model from './baseFormatModel.js';
import knex from '../util/knex.js';

class SensorReading extends Model {
  // Returned Date-time object from db is not compatible with ajv format types
  $parseJson(json, opt) {
    json = super.$parseJson(json, opt);
    if (json.created_at && typeof json.created_at === 'object') {
      json.created_at = json.created_at.toISOString();
    }
    return json;
  }

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
        read_time: { type: 'string', format: 'timestamp' },
        created_at: { type: 'string', format: 'timestamp' },
        location_id: { type: 'string' },
        reading_type: { type: 'string', minLength: 1, maxLength: 255 },
        value: { type: 'number', format: 'float' },
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
    locationIds = [],
    readingTypes = [],
    endDateTime = new Date(),
    startDateTime = new Date(),
  ) {
    const durationType = '1 hour';
    const sensorReadingsResponsePromises = [];
    for (const readingType of readingTypes) {
      sensorReadingsResponsePromises.push(
        knex.raw(
          `
        SELECT
          nearest_read_time AS read_time, 
          read_time AS actual_read_time, 
          value, 
          u AS unit,
          location_id,
          name 
        FROM get_average_sensor_readings_by_reading_type(?,?,?,?,?,?);
      `,
          [readingType, false, startDateTime, endDateTime, locationIds, durationType],
        ),
      );
    }
    const sensorReadingsResponse = await Promise.all(sensorReadingsResponsePromises);
    return readingTypes.reduce((acc, cv, index) => {
      acc[cv] = sensorReadingsResponse[index].rows;
      return acc;
    }, {});
  }
}

export default SensorReading;
