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

const { transaction, Model } = require('objection');
const LocationModel = require('./locationModel');
const PartnerReadingTypeModel = require('../models/PartnerReadingTypeModel');
const knex = Model.knex();

class Sensor extends Model {
  static get tableName() {
    return 'sensor';
  }

  static get idColumn() {
    return 'sensor_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['farm_id', 'name', 'partner_id', 'external_id', 'location_id'],

      properties: {
        sensor_id: { type: 'string' },
        farm_id: { type: 'string', minLength: 1, maxLength: 255 },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        partner_id: { type: 'integer' },
        external_id: { type: 'string', minLength: 1, maxLength: 255 },
        location_id: { type: 'string' },
        depth: { type: 'float' },
        elevation: { type: 'float' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      sensor_reading_type: {
        modelClass: require('./SensorReadingTypeModel'),
        relation: Model.HasManyRelation,
        join: {
          from: 'sensor.sensor_id',
          to: 'sensor_reading_type.sensor_id',
        },
      },
    };
  }

  static async createSensor(sensor, farm_id, user_id) {
    const trx = await transaction.start(Model.knex());

    const readingTypes = await Promise.all(
      sensor.reading_types.map(async (r) => {
        return await PartnerReadingTypeModel.getReadingTypeByReadableValue(r);
      }),
    );

    const data = {
      farm_id,
      figure: {
        point: { point: { lat: sensor.latitude, lng: sensor.longitude } },
        type: 'sensor',
      },
      name: sensor.name,
      notes: '',
      sensor: {
        farm_id,
        name: sensor.name,
        partner_id: 1,
        depth: sensor.depth,
        external_id: sensor.external_id,
        sensor_reading_type: readingTypes.map((readingType) => {
          return { partner_reading_type_id: readingType.partner_reading_type_id };
        }),
      },
    };

    const sensorLocationWithGraph = await LocationModel.createLocation(
      'sensor',
      { user_id },
      data,
      trx,
    );
    await trx.commit();
    return sensorLocationWithGraph;
  }
  /**
   * Returns sensor grid points for the list of sensor ids
   * @param {Array} sensorIds sensor ids
   * @returns {Object} reading_type Reading Object
   */
  static async getSensorLocationBySensorIds(locationIds = []) {
    return await knex.raw(
      `SELECT 
      s.sensor_id, 
      s.name, 
      s.external_id,
      b.point
      FROM
      "sensor" s 
      JOIN (
        SELECT 
        l.location_id, 
        a.point FROM "location" l JOIN
        (
          SELECT * FROM "figure" f
          JOIN "point" p 
          ON f.figure_id::uuid = p.figure_id
        ) a
        ON l.location_id::uuid = a.location_id 
      ) b 
      ON s.location_id::uuid = b.location_id
      WHERE s.location_id = ANY(?)
      ORDER BY s.name ASC;
      `,
      [locationIds],
    );
  }
}

module.exports = Sensor;
