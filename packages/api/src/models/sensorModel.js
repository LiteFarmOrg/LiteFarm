/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

const { transaction, Model } = require('objection');
const LocationModel = require('./locationModel');
const PartnerReadingTypeModel = require('../models/PartnerReadingTypeModel');

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
        grid_points: { type: 'object' },
        model: { type: 'string', minLength: 1, maxLength: 255 },
        isDeleted: { type: 'boolean' },
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
        model: sensor.model,
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
  static async getSensorReadingTypes(sensorId) {
    return Model.knex().raw(
      `
        SELECT prt.readable_value FROM sensor as s 
        JOIN sensor_reading_type as srt ON srt.sensor_id = s.sensor_id 
        JOIN partner_reading_type as prt ON srt.partner_reading_type_id = prt.partner_reading_type_id 
        WHERE s.sensor_id = ?;
        `,
      sensorId,
    );
  }

  static async patchSensorReadingTypes(sensorId, readingTypes) {
    try {
      for (const readingTypeKey in readingTypes) {
        if (readingTypes[readingTypeKey].active) {
          // if the reading is active we want to insert into the table
          // but first check if it already exists in the table then do nothing
          const result = await Model.knex().raw(
            `
            SELECT prt.readable_value FROM sensor as s 
            JOIN sensor_reading_type as srt ON srt.sensor_id = s.sensor_id 
            JOIN partner_reading_type as prt ON srt.partner_reading_type_id = prt.partner_reading_type_id 
            WHERE s.sensor_id = ? AND prt.readable_value = ?;
            `,
            [sensorId, readingTypes[readingTypeKey].name],
          );
          // here it checks if there already exists if not then insert the reading type into the database
          if (result.rows.length === 0) {
            await Model.knex().raw(
              `
              INSERT INTO sensor_reading_type (partner_reading_type_id, sensor_id)
              SELECT prt.partner_reading_type_id, sensor_id FROM sensor as s 
              JOIN partner_reading_type as prt ON prt.partner_id = s.partner_id 
              WHERE s.sensor_id = ? AND prt.readable_value = ?;
              `,
              [sensorId, readingTypes[readingTypeKey].name],
            );
          }
        } else {
          // delete the reading type if false
          await Model.knex().raw(
            `
            DELETE FROM sensor_reading_type
            WHERE sensor_reading_type_id IN
            (SELECT sensor_reading_type_id FROM sensor_reading_type
            JOIN partner_reading_type as prt ON prt.partner_reading_type_id = sensor_reading_type.partner_reading_type_id 
            WHERE sensor_reading_type.sensor_id = ? AND prt.readable_value = ?);
            `,
            [sensorId, readingTypes[readingTypeKey].name],
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Sensor;
