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

import { transaction } from 'objection';
import Model from './baseFormatModel.js';
import LocationModel from './locationModel.js';
import PartnerReadingTypeModel from '../models/PartnerReadingTypeModel.js';
import SensorReadingTypeModel from './SensorReadingTypeModel.js';
import knex from '../util/knex.js';

class Sensor extends Model {
  static get tableName() {
    return 'sensor';
  }

  static get idColumn() {
    return 'location_id';
  }

  // Optional JSON schema. This is not the database schema! Nothing is generated
  // based on this. This is only used for validation. Whenever a model instance
  // is created it is checked against this schema. http://json-schema.org/.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['partner_id', 'external_id'],

      properties: {
        location_id: { type: 'string' },
        model: { type: 'string', maxLength: 255 },
        partner_id: { type: 'integer' },
        external_id: { type: 'string', maxLength: 255 },
        depth: { type: ['number', 'null'], format: 'float' },
        depth_unit: { type: 'string', enum: ['cm', 'm', 'in', 'ft'] },
        elevation: { type: 'number', format: 'float' },
      },
      additionalProperties: false,
    };
  }

  static get relationMappings() {
    return {
      sensor_reading_type: {
        modelClass: SensorReadingTypeModel,
        relation: Model.HasManyRelation,
        join: {
          from: 'sensor.location_id',
          to: 'sensor_reading_type.location_id',
        },
      },
    };
  }

  static async createSensor(sensor, farm_id, user_id, partner_id) {
    const trx = await transaction.start(Model.knex());

    try {
      if (partner_id !== 0) {
        const existingSensor = await LocationModel.getSensorLocation(
          farm_id,
          partner_id,
          sensor.external_id,
          trx,
        );
        if (existingSensor) {
          if (existingSensor.deleted) {
            await LocationModel.unDeleteLocation(user_id, existingSensor.location_id, trx);
            existingSensor.deleted = false;
          }
          await trx.commit();
          return existingSensor;
        }
      }
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
          model: sensor.model,
          partner_id,
          depth: sensor.depth,
          external_id: sensor.external_id,
          sensor_reading_type: readingTypes.map((readingType) => {
            return { partner_reading_type_id: readingType.partner_reading_type_id };
          }),
        },
      };

      const sensorLocationWithGraph = await LocationModel.createOrUpdateLocation(
        'sensor',
        { user_id },
        data,
        trx,
      );
      await trx.commit();
      return sensorLocationWithGraph;
    } catch (error) {
      console.log(error);
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Returns sensor grid points for the list of location ids
   * @param {Array} sensorIds sensor ids
   * @returns {Object} reading_type Reading Object
   */
  static async getSensorLocationByLocationIds(locationIds = []) {
    return await knex.raw(
      `WITH filtered_sensors_info as (
        SELECT 
              s.location_id, 
              s.external_id,
              b.point,
              b.name
              FROM "sensor" s 
              JOIN (
                SELECT 
                l.name,
                l.location_id, 
                a.point 
                FROM "location" l JOIN
                (
                  SELECT * FROM "figure" f
                  JOIN "point" p 
                  ON f.figure_id::uuid = p.figure_id
                ) a
                ON l.location_id::uuid = a.location_id 
              ) b 
              ON s.location_id::uuid = b.location_id
              WHERE s.location_id = ANY(?)
              ORDER BY b.name ASC
        )
        SELECT 
          i.location_id, 
          (array_agg(i.point))[1] as point,
          (array_agg(i.name))[1] as name,
          array_agg(DISTINCT p.readable_value) as reading_type
          FROM filtered_sensors_info i 
          JOIN sensor_reading_type s ON s.location_id::uuid = i.location_id::uuid
          JOIN partner_reading_type p ON p.partner_reading_type_id = s.partner_reading_type_id
          GROUP BY i.location_id
          ORDER BY name ASC;
        `,
      [locationIds],
    );
  }

  static async getSensorReadingTypes(location_id) {
    return Model.knex().raw(
      `
        SELECT prt.readable_value FROM sensor as s 
        JOIN sensor_reading_type as srt ON srt.location_id = s.location_id 
        JOIN partner_reading_type as prt ON srt.partner_reading_type_id = prt.partner_reading_type_id 
        WHERE s.location_id = ?;
        `,
      location_id,
    );
  }

  static async getAllSensorReadingTypes(farm_id) {
    return Model.knex().raw(
      `
        SELECT prt.readable_value, l.location_id FROM location as l
        JOIN sensor_reading_type as srt ON srt.location_id = l.location_id 
        JOIN partner_reading_type as prt ON srt.partner_reading_type_id = prt.partner_reading_type_id 
        WHERE l.farm_id = ?;
      `,
      farm_id,
    );
  }

  static async patchSensorReadingTypes(location_id, readingTypes) {
    try {
      for (const readingTypeKey in readingTypes) {
        if (readingTypes[readingTypeKey].active) {
          // if the reading is active we want to insert into the table
          // but first check if it already exists in the table then do nothing
          const result = await Model.knex().raw(
            `
            SELECT prt.readable_value FROM sensor as s 
            JOIN sensor_reading_type as srt ON srt.location_id = s.location_id 
            JOIN partner_reading_type as prt ON srt.partner_reading_type_id = prt.partner_reading_type_id 
            WHERE s.location_id = ? AND prt.readable_value = ?;
            `,
            [location_id, readingTypes[readingTypeKey].name],
          );
          // here it checks if there already exists if not then insert the reading type into the database
          if (result.rows.length === 0) {
            await Model.knex().raw(
              `
              INSERT INTO sensor_reading_type (partner_reading_type_id, location_id)
              SELECT prt.partner_reading_type_id, location_id FROM sensor as s 
              JOIN partner_reading_type as prt ON prt.partner_id = s.partner_id 
              WHERE s.location_id = ? AND prt.readable_value = ?;
              `,
              [location_id, readingTypes[readingTypeKey].name],
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
            WHERE sensor_reading_type.location_id = ? AND prt.readable_value = ?);
            `,
            [location_id, readingTypes[readingTypeKey].name],
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  static async getLocationIdForSensorReadings(external_id, partner_id, farm_id) {
    return Model.knex().raw(
      `
        SELECT loc.location_id FROM sensor AS s
        JOIN location AS loc ON loc.location_id = s.location_id 
        WHERE external_id = ? and partner_id = ? AND farm_id = ?;
      `,
      [external_id, partner_id, farm_id],
    );
  }
}

export default Sensor;
