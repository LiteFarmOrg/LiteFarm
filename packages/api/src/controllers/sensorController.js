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

import SensorModel from '../models/sensorModel.js';
import PartnerReadingTypeModel from '../models/PartnerReadingTypeModel.js';
import {
  ENSEMBLE_UNITS_MAPPING_WEBHOOK,
  getEnsembleSensors,
  getEnsembleSensorReadings,
} from '../util/ensemble.js';
import { databaseUnit } from '../util/unit.js';
import knex from '../util/knex.js';

const sensorController = {
  async getSensors(req, res) {
    const { farm_id } = req.headers;
    try {
      const { sensors, sensor_arrays } = await getEnsembleSensors(farm_id);

      return res.status(200).send({
        sensors,
        sensor_arrays,
      });
    } catch (error) {
      console.error(error);
      return res.status(error.status || 400).json({
        error: error.message || error,
      });
    }
  },
  async getSensorReadings(req, res) {
    const { farm_id } = req.headers;
    const { esids, startTime, endTime, truncPeriod } = req.query;

    try {
      const data = await getEnsembleSensorReadings({
        farm_id,
        esids,
        startTime,
        endTime,
        truncPeriod,
      });

      return res.status(200).send(data);
    } catch (error) {
      console.error(error);
      const status = error.status || error.code || 400;

      return res.status(status).json({
        error: error.message || error,
      });
    }
  },

  // Note : API is called at the ensemble backend. the ensemble backend sends the same status code when we add sensors to the farm (register sensor API).
  // when we register some sensors, the add readings API is called and the same status code is passed in the response of register sensors (i.e 200).
  // For example, if we make that as 400 then the registered sensor API of the ensemble will send back 400 and the add sensor API will fail.
  // therefore, The error status code should be 200.
  async addReading(req, res) {
    if (!Object.keys(req.body).length) {
      return res.status(200).send('No sensor readings posted');
    }
    try {
      const infoBody = [];
      const partnerId = parseInt(req.params.partner_id);
      const farmId = req.params.farm_id || '';
      if (!farmId.length) return res.status(400).send('farm id not found');
      const { rows: partnerSensorReadingTypes = [] } =
        await PartnerReadingTypeModel.getPartnerReadingTypeByPartnerId(partnerId);
      if (!partnerSensorReadingTypes.length)
        return res.status(400).send('partner not registered with the Litefarm');
      const readingTypeValidation = [];
      for (const sensor of Object.keys(req.body)) {
        const sensorData = req.body[sensor].data;
        let { rows: corresponding_sensor = [] } = await SensorModel.getLocationIdForSensorReadings(
          sensor,
          partnerId,
          farmId,
        );
        if (!corresponding_sensor.length) return res.status(400).send('sensor id not found');
        corresponding_sensor = corresponding_sensor[0];
        for (const sensorInfo of sensorData) {
          const readingType = sensorInfo.parameter_category.toLowerCase().replaceAll(' ', '_');
          const isPartnerReadingTypePresent = partnerSensorReadingTypes.some(
            (partnerSensorReadingType) => partnerSensorReadingType.readable_value === readingType,
          );
          if (!isPartnerReadingTypePresent) {
            readingTypeValidation.push(
              `Invalid reading type ${sensorInfo.parameter_category} of ${sensor} sensor.`,
            );
            continue;
          }
          // Reconcile incoming units with stored as units and conversion function keys
          const system = ENSEMBLE_UNITS_MAPPING_WEBHOOK[sensorInfo.unit]?.system;
          const unit = ENSEMBLE_UNITS_MAPPING_WEBHOOK[sensorInfo.unit]?.conversionKey;
          const readingTypeStoredAsUnit = databaseUnit[readingType] ?? undefined;
          const isStoredAsUnit = unit == readingTypeStoredAsUnit;

          if (sensorInfo.values.length < sensorInfo.timestamps.length) {
            return res.status(400).send('sensor values and timestamps are not in sync');
          }
          if (!system || !unit || !readingTypeStoredAsUnit || !isStoredAsUnit) {
            return res.status(400).send('provided units are not supported');
          }
          for (let k = 0; k < sensorInfo.values.length; ++k) {
            infoBody.push({
              read_time: sensorInfo.timestamps[k] || '',
              location_id: corresponding_sensor.location_id,
              value: sensorInfo.values[k],
              reading_type: readingType,
              valid: sensorInfo.validated[k] || false,
              unit,
            });
          }
        }
      }

      if (infoBody.length === 0) {
        return res.status(200).json({
          error: 'No records of sensor readings added to the Litefarm.',
          readingTypeValidationError: readingTypeValidation.length
            ? readingTypeValidation
            : undefined,
        });
      } else {
        const chunkSize = 999;
        const result = await knex.batchInsert('sensor_reading', infoBody, chunkSize).returning('*');
        return res.status(200).json({
          sensorsAdded: result,
          readingTypeValidationError: readingTypeValidation.length
            ? readingTypeValidation
            : undefined,
        });
      }
    } catch (error) {
      return res.status(200).json({
        error,
      });
    }
  },
};

export default sensorController;
