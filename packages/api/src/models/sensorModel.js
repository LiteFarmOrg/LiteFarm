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
      required: ['farm_id', 'name', 'grid_points', 'location_id'],

      properties: {
        sensor_id: { type: 'string' },
        farm_id: { type: 'string', minLength: 1, maxLength: 255 },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        grid_points: { type: 'object' },
        external_id: { type: 'string', minLength: 1, maxLength: 255 },
        partner_id: { type: 'integer' },
        depth: { type: 'float' },
        elevation: { type: 'float' },
        location_id: { type: 'string' },
      },
      additionalProperties: false,
    };
  }

  static async createSensor(farm_id, sensor, context) {
    const LocationModel = require('./locationModel');
    const SensorReadingTypeModel = require('../models/SensorReadingTypeModel');
    const PartnerReadingTypeModel = require('../models/PartnerReadingTypeModel');

    const trx = await transaction.start(Model.knex());

    const locationData = {};
    const sensorLocation = LocationModel.createLocation('sensor', context, locationData, trx);

    const savedSensor = await Sensor.query(trx).insert({
      farm_id,
      name: sensor.name,
      grid_points: {
        lat: sensor.latitude,
        lng: sensor.longitude,
      },
      partner_id: 1,
      depth: sensor.depth,
      external_id: sensor.external_id,
      location_id: sensorLocation.location_id,
    });
    const readingTypes = await Promise.all(
      sensor.reading_types.map((r) => {
        return PartnerReadingTypeModel.getReadingTypeByReadableValue(r);
      }),
    );

    await SensorReadingTypeModel.query(trx).insert(
      readingTypes.map((readingType) => {
        return {
          partner_reading_type_id: readingType.partner_reading_type_id,
          sensor_id: savedSensor.sensor_id,
        };
      }),
    );
  }
}

// TODO: Create relationships with reading model
module.exports = Sensor;
