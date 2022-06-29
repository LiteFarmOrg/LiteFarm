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

const baseController = require('../controllers/baseController');
const SensorModel = require('../models/sensorModel');
const SensorReadingModel = require('../models/sensorReadingModel');
const IntegratingPartnersModel = require('../models/integratingPartnersModel');
const NotificationUser = require('../models/notificationUserModel');
const FarmExternalIntegrationsModel = require('../models/farmExternalIntegrationsModel');
const { transaction, Model } = require('objection');
const {
  createOrganization,
  registerOrganizationWebhook,
  bulkSensorClaim,
  unclaimSensor,
} = require('../util/ensemble');

const sensorErrors = require('../util/sensorErrors');

const sensorController = {
  async getSensorReadingTypes(req, res) {
    const { sensor_id } = req.params;
    try {
      const sensorReadingTypesResponse = await SensorModel.getSensorReadingTypes(sensor_id);
      const readingTypes = sensorReadingTypesResponse.rows.map(
        (datapoint) => datapoint.readable_value,
      );
      res.status(200).send(readingTypes);
    } catch (e) {
      res.status(404).send('Sensor not found');
    }
  },
  async addSensors(req, res) {
    try {
      const { farm_id } = req.headers;
      const { user_id } = req.user;
      const { access_token } = await IntegratingPartnersModel.getAccessAndRefreshTokens(
        'Ensemble Scientific',
      );
      const { data, errors } = parseCsvString(req.file.buffer.toString(), {
        Name: {
          key: 'name',
          parseFunction: (val) => val.trim(),
          validator: (val) => 1 <= val.length && val.length <= 100,
          required: true,
          errorTranslationKey: sensorErrors.SENSOR_NAME,
        },
        External_ID: {
          key: 'external_id',
          parseFunction: (val) => val.trim(),
          validator: (val) => 1 <= val.length && val.length <= 20,
          required: false,
          errorTranslationKey: sensorErrors.EXTERNAL_ID,
        },
        Latitude: {
          key: 'latitude',
          parseFunction: (val) => parseFloat(val),
          validator: (val) => -90 <= val && val <= 90,
          required: true,
          errorTranslationKey: sensorErrors.SENSOR_LATITUDE,
        },
        Longitude: {
          key: 'longitude',
          parseFunction: (val) => parseFloat(val),
          validator: (val) => -180 <= val && val <= 180,
          required: true,
          errorTranslationKey: sensorErrors.SENSOR_LONGITUDE,
        },
        Reading_types: {
          key: 'reading_types',
          parseFunction: (val) => val.replaceAll(' ', '').split(','),
          validator: (val) =>
            val.includes('soil_moisture_content') ||
            val.includes('water_potential') ||
            val.includes('temperature'),
          required: true,
          errorTranslationKey: sensorErrors.SENSOR_READING_TYPES,
        },
        Depth: {
          key: 'depth',
          parseFunction: (val) => parseFloat(val),
          validator: (val) => 0 <= val && val <= 1000,
          required: false,
          errorTranslationKey: sensorErrors.SENSOR_DEPTH,
        },
        Brand: {
          key: 'brand',
          parseFunction: (val) => val.trim(),
          validator: (val) => val.length <= 100,
          required: false,
          errorTranslationKey: sensorErrors.SENSOR_BRAND,
        },
        Model: {
          key: 'model',
          parseFunction: (val) => val.trim(),
          validator: (val) => val.length <= 100,
          required: false,
          errorTranslationKey: sensorErrors.SENSOR_MODEL,
        },
        Hardware_version: {
          key: 'hardware_version',
          parseFunction: (val) => val.trim(),
          validator: (val) => val.length <= 100,
          required: false,
          errorTranslationKey: sensorErrors.SENSOR_HARDWARE_VERSION,
        },
      });
      if (errors.length > 0) {
        res.status(400).send({ error_type: 'validation_failure', errors });
      } else {
        // register organization
        const organization = await createOrganization(farm_id, access_token);

        // register webhook for sensor readings
        await registerOrganizationWebhook(farm_id, organization.organization_uuid, access_token);

        // Get esids (Ensemble Scientific IDs)
        const esids = data.reduce((previous, current) => {
          if (current.brand === 'Ensemble Scientific' && current.external_id) {
            previous.push(current.external_id);
          }
          return previous;
        }, []);

        // Register sensors with Ensemble
        const { success, already_owned } = await bulkSensorClaim(
          access_token,
          organization.organization_uuid,
          esids,
        );

        // Filter sensors by those successfully registered
        const registeredSensors = data.filter((sensor) => success.includes(sensor.external_id));

        // Save sensors in database
        const sensorLocations = await Promise.all(
          registeredSensors.map(async (sensor) => {
            return await SensorModel.createSensor(sensor, farm_id, user_id);
          }),
        );

        if (success.length + already_owned.length < esids.length) {
          res.status(400).send({
            error_type: 'unable_to_claim_all_sensors',
            registeredSensors,
          });
        } else {
          res.status(200).send({ message: 'Successfully uploaded!', sensors: sensorLocations });
        }
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e.message);
    }
  },

  async updateSensorbyID(req, res) {
    try {
      //const sensor_esid = req.params.sensor_esid;
      const {
        //brand,
        sensor_name,
        latitude,
        longtitude,
        sensor_id,
        model,
        part_number,
        hardware_version,
        depth,
        //depth_unit,
        // reading_types
      } = req.body;
      // data is formatted in nested object values, these 5 const's are accessing reading types by using
      //  Object.entries and accessing each values via array indexing
      // const x = Object.entries(reading_types)
      //const y = Object.entries(x[0][1])
      // const isSoilWaterContentActive = Object.entries(y[0])[1][1].active
      // const isSoilWaterPotentialActive = Object.entries(y[1])[1][1].active
      // const isTemperatureActive = Object.entries(y[2])[1][1].active

      const sensor_properties = {
        name: sensor_name,
        depth,
        grid_points: { lat: latitude, lng: longtitude },
        model,
        part_number,
        hardware_version,
      };

      await SensorModel.query()
        .patch(sensor_properties)
        .where('partner_id', 1)
        .where('sensor_id', sensor_id);
      // const result = await sensorModel.transaction(async trx => {
      //   // const sensor = await sensorModel.query(trx)
      //   //   .context({ farm_id: req.body.farm_id })
      //   //   .findById('6b2df550-f646-11ec-b719-acde48001122')
      //   //   .patch(sensor_properties).returning('*');
      //   return await sensorModel.query(trx).context({ farm_id: req.body.farm_id }).findById(sensor_esid).patch(sensor_properties).returning('*');
      // });
      // if (result) {
      //   return res.sendStatus(200);
      // } else {
      //   return res.sendStatus(404);
      // }
      return res.sendStatus(200);
    } catch (error) {
      console.log(error);

      return res.status(400).json({
        error,
      });
    }
  },

  async deleteSensor(req, res) {
    try {
      const trx = await transaction.start(Model.knex());
      const isDeleted = await baseController.delete(SensorModel, req.params.sensor_id, req, {
        trx,
      });
      await trx.commit();
      if (isDeleted) {
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      res.status(400).json({
        error,
      });
    }
  },

  async getSensorsByFarmId(req, res) {
    try {
      const { farm_id } = req.body;
      if (!farm_id) {
        return res.status(400).send('No farm selected');
      }
      const data = await baseController.getByFieldId(SensorModel, 'farm_id', farm_id);
      res.status(200).send(data);
    } catch (error) {
      res.status(400).json({
        error,
      });
    }
  },

  async addReading(req, res) {
    const trx = await transaction.start(Model.knex());
    try {
      const infoBody = [];
      for (const sensor of req.body) {
        const corresponding_sensor = await SensorModel.query()
          .select('sensor_id')
          .where('external_id', sensor.sensor_esid)
          .where('partner_id', req.params.partner_id);
        for (let i = 0; i < sensor.value.length; i++) {
          const row = {
            read_time: sensor.time[i],
            sensor_id: corresponding_sensor[0].sensor_id,
            reading_type: sensor.parameter_number,
            value: sensor.value[i],
            unit: sensor.unit,
          };
          // Only include this entry if all required values are poulated
          if (Object.values(row).every((value) => value)) {
            infoBody.push(row);
          }
        }
      }
      if (infoBody.length === 0) {
        res.status(200).send(infoBody);
      } else {
        const result = await baseController.postWithResponse(SensorReadingModel, infoBody, req, {
          trx,
        });
        await trx.commit();
        res.status(200).send(result);
      }
    } catch (error) {
      res.status(400).json({
        error,
      });
    }
  },

  async getAllReadingsBySensorId(req, res) {
    try {
      const { sensor_id } = req.body;
      if (!sensor_id) {
        res.status(400).send('No sensor selected');
      }
      const data = await baseController.getByFieldId(SensorReadingModel, 'sensor_id', sensor_id);
      const validReadings = data.filter((datapoint) => datapoint.valid);
      res.status(200).send(validReadings);
    } catch (error) {
      res.status(400).json({
        error,
      });
    }
  },

  async invalidateReadings(req, res) {
    try {
      const { start_time, end_time } = req.body;
      const result = await SensorReadingModel.query()
        .patch({ valid: false })
        .where('read_time', '>=', start_time)
        .where('read_time', '<=', end_time);
      res.status(200).send(`${result} entries invalidated`);
    } catch (error) {
      res.status(400).json({
        error,
      });
    }
  },

  async retireSensor(req, res) {
    try {
      const { external_id, sensor_id, farm_id, partner_id } = req.body.sensorInfo;
      const { access_token } = await IntegratingPartnersModel.getAccessAndRefreshTokens(
        'Ensemble Scientific',
      );
      const external_integrations_response = await FarmExternalIntegrationsModel.getOrganizationId(
        farm_id,
        partner_id,
      );
      const org_id = external_integrations_response[0].organization_uuid;
      const unclaimResponse = await unclaimSensor(org_id, external_id, access_token);
      const deleteResponse = await SensorModel.query()
        .patch({ deleted: true })
        .where('sensor_id', sensor_id);
      res.status(200).send({ unclaimResponse, deleteResponse });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        error,
      });
    }
  },
};

/**
 * Parses the csv string into an array of objects and an array of any lines that experienced errors.
 * @param {String} csvString
 * @param {Object} mapping - a mapping from csv column headers to object keys, as well as the validators for the data in the columns
 * @param {String} delimiter
 * @returns {Object<data: Array<Object>, errors: Array<Object>>}
 */

const parseCsvString = (csvString, mapping, delimiter = ',') => {
  // regex checks for delimiters that are not contained within quotation marks
  const regex = new RegExp(`(?!\\B"[^"]*)${delimiter}(?![^"]*"\\B)`);
  const headers = csvString.substring(0, csvString.indexOf('\n')).split(regex);
  const allowedHeaders = Object.keys(mapping);
  const { data, errors } = csvString
    .substring(csvString.indexOf('\n') + 1)
    .split('\n')
    .reduce(
      (previous, row, rowIndex) => {
        const values = row.split(regex);
        const parsedRow = headers.reduce((previousObj, current, index) => {
          if (allowedHeaders.includes(current)) {
            const val = mapping[current].parseFunction(
              values[index].replace(/^(["'])(.*)\1$/, '$2'),
            ); // removes any surrounding quotation marks
            if (mapping[current].validator(val)) {
              previousObj[mapping[current].key] = val;
            } else {
              previous.errors.push({
                row: rowIndex + 2,
                column: current,
                translation_key: mapping[current].errorTranslationKey,
              });
            }
          }
          return previousObj;
        }, {});
        previous.data.push(parsedRow);
        return previous;
      },
      { data: [], errors: [] },
    );
  return { data, errors };
};

const SensorNotificationTypes = {
  SENSOR_BULK_UPLOAD_SUCCESS: 'SENSOR_BULK_UPLOAD_SUCCESS',
  SENSOR_BULK_UPLOAD_FAIL: 'SENSOR_BULK_UPLOAD_FAIL',
};

/**
 * Creates a notification for sensor
 * @param {string} receiverId target notification user id
 * @param {string} farmId farm id
 * @param {string} notifyTranslationKey notification translation key
 * @param {Object} ref can be one of three types: { url: string }, { entity: { id: string,
 * type: string } }, or { error_download: { errors: array[string], file_name: string } }
 * @async
 */
// eslint-disable-next-line no-unused-vars
async function sendSensorNotification(
  receiverId,
  farmId,
  notifyTranslationKey,
  ref = { url: '/map' },
) {
  if (!receiverId) return;

  await NotificationUser.notify(
    {
      title: {
        translation_key: `NOTIFICATION.${SensorNotificationTypes[notifyTranslationKey]}.TITLE`,
      },
      body: {
        translation_key: `NOTIFICATION.${SensorNotificationTypes[notifyTranslationKey]}.BODY`,
      },
      variables: [],
      ref,
      context: {
        icon_translation_key: 'SENSOR',
        notification_type: SensorNotificationTypes[notifyTranslationKey],
      },
      farm_id: farmId,
    },
    [receiverId],
  );
}

module.exports = sensorController;
