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

import baseController from '../controllers/baseController.js';

import SensorModel from '../models/sensorModel.js';
import SensorReadingModel from '../models/sensorReadingModel.js';
import IntegratingPartnersModel from '../models/integratingPartnersModel.js';
import NotificationUser from '../models/notificationUserModel.js';
import FarmExternalIntegrationsModel from '../models/farmExternalIntegrationsModel.js';
import LocationModel from '../models/locationModel.js';
import PointModel from '../models/pointModel.js';
import FigureModel from '../models/figureModel.js';
import UserModel from '../models/userModel.js';
import PartnerReadingTypeModel from '../models/PartnerReadingTypeModel.js';

import { transaction, Model } from 'objection';

import {
  createOrganization,
  registerOrganizationWebhook,
  bulkSensorClaim,
  unclaimSensor,
  ENSEMBLE_UNITS_MAPPING,
} from '../util/ensemble.js';
import { databaseUnit } from '../util/unit.js';
import { sensorErrors, parseSensorCsv } from '../../../shared/validation/sensorCSV.js';
import syncAsyncResponse from '../util/syncAsyncResponse.js';
import knex from '../util/knex.js';

const getSensorTranslations = async (language) => {
  const translations = await import(`../../../shared/locales/${language}/sensorCSV.json`, {
    assert: { type: 'json' },
  });
  return translations.default;
};

const sensorController = {
  async getSensorReadingTypes(req, res) {
    const { location_id } = req.params;
    try {
      const sensorReadingTypesResponse = await SensorModel.getSensorReadingTypes(location_id);
      const readingTypes = sensorReadingTypesResponse.rows.map(
        (datapoint) => datapoint.readable_value,
      );
      res.status(200).send(readingTypes);
    } catch (error) {
      res.status(404).send('Sensor not found');
    }
  },
  async getAllSensorReadingTypes(req, res) {
    const { farm_id } = req.params;
    try {
      const allSensorReadingTypesResponse = await SensorModel.getAllSensorReadingTypes(farm_id);
      const allReadingTypesObject = allSensorReadingTypesResponse.rows.reduce((obj, item) => {
        if (item.location_id in obj) {
          obj[item.location_id].push(item.readable_value);
        } else {
          obj[item.location_id] = [item.readable_value];
        }
        return obj;
      }, {});
      const allReadingTypes = Object.keys(allReadingTypesObject).map((key) => {
        return {
          location_id: key,
          reading_types: allReadingTypesObject[key],
        };
      });
      res.status(200).send(allReadingTypes);
    } catch (error) {
      res.status(404).send('No sensors found');
    }
  },
  async getBrandName(req, res) {
    try {
      const { partner_id } = req.params;
      const brand_name_response = await IntegratingPartnersModel.getBrandName(partner_id);
      res.status(200).send(brand_name_response.partner_name);
    } catch (error) {
      res.status(404).send('Partner not found');
    }
  },
  async addSensors(req, res) {
    let timeLimit = 5000;
    const testTimerOverride = Number(req.query?.sensorUploadTimer);
    // For testing, query string can set timer limit, 0 to 30 seconds.
    if (!isNaN(testTimerOverride) && testTimerOverride >= 0 && testTimerOverride <= 30000) {
      timeLimit = testTimerOverride;
      console.log(`Custom time limit for sensor upload: ${timeLimit} ms`);
    }
    const { sendResponse } = syncAsyncResponse(res, timeLimit);
    const { farm_id } = req.headers;
    const { user_id } = req.auth;
    try {
      const { access_token } = await IntegratingPartnersModel.getAccessAndRefreshTokens(
        'Ensemble Scientific',
      );

      const [{ language_preference }] = await baseController.getIndividual(UserModel, user_id);

      const translations = await getSensorTranslations(language_preference);
      const { data, errors } = parseSensorCsv(
        req.file.buffer.toString(),
        language_preference,
        translations,
      );

      if (errors.length > 0) {
        return await sendResponse(
          () => {
            return res.status(400).send({ error_type: 'validation_failure', errors });
          },
          async () => {
            return await sendSensorNotification(
              user_id,
              farm_id,
              SensorNotificationTypes.SENSOR_BULK_UPLOAD_FAIL,
              {
                error_download: {
                  errors,
                  file_name: 'sensor-upload-outcomes.txt',
                  error_type: 'validation',
                },
              },
            );
          },
        );
      } else if (!data.length > 0) {
        return await sendResponse(
          () => {
            return res.status(400).send({ error_type: 'empty_file' });
          },
          async () => {
            return await sendSensorNotification(
              user_id,
              farm_id,
              SensorNotificationTypes.SENSOR_BULK_UPLOAD_FAIL,
              {
                error_download: {
                  errors: [],
                  file_name: 'sensor-upload-outcomes.txt',
                  error_type: 'generic',
                },
              },
            );
          },
        );
      } else {
        const esids = data.reduce((previous, current) => {
          if (current.brand === 'Ensemble Scientific' && current.external_id) {
            previous.push(current.external_id);
          }
          return previous;
        }, []);
        let success = [];
        let already_owned = [];
        let does_not_exist = [];
        let occupied = [];
        if (esids.length > 0) {
          const organization = await createOrganization(farm_id, access_token);

          // register webhook for sensor readings
          await registerOrganizationWebhook(farm_id, organization.organization_uuid, access_token);

          // Register sensors with Ensemble
          ({ success, already_owned, does_not_exist, occupied } = await bulkSensorClaim(
            access_token,
            organization.organization_uuid,
            esids,
          ));
        }
        // register organization

        // Filter sensors by those successfully registered and those with errors
        const { registeredSensors, errorSensors } = data.reduce(
          (prev, curr, idx) => {
            if (success?.includes(curr.external_id) || already_owned?.includes(curr.external_id)) {
              prev.registeredSensors.push(curr);
            } else if (curr.brand !== 'Ensemble Scientific') {
              prev.registeredSensors.push(curr);
            } else if (does_not_exist?.includes(curr.external_id)) {
              prev.errorSensors.push({
                row: idx + 2,
                column: 'External_ID',
                translation_key: sensorErrors.SENSOR_DOES_NOT_EXIST,
                variables: { sensorId: curr.external_id },
              });
            } else if (occupied?.includes(curr.external_id)) {
              prev.errorSensors.push({
                row: idx + 2,
                column: 'External_ID',
                translation_key: sensorErrors.SENSOR_ALREADY_OCCUPIED,
                variables: { sensorId: curr.external_id },
              });
            } else {
              // we know that it is an ESID but for some reason it was not returned in the expected format from the API
              prev.errorSensors.push({
                row: idx + 2,
                column: 'External_ID',
                translation_key: sensorErrors.INTERNAL_ERROR,
                variables: { sensorId: curr.external_id },
              });
            }
            return prev;
          },
          { registeredSensors: [], errorSensors: [] },
        );

        // Save sensors in database
        const sensorLocations = [];
        for (const sensor of registeredSensors) {
          try {
            const value = await SensorModel.createSensor(
              sensor,
              farm_id,
              user_id,
              esids.includes(sensor.external_id) ? 1 : 0,
            );
            sensorLocations.push({ status: 'fulfilled', value });
          } catch (error) {
            sensorLocations.push({ status: 'rejected', reason: error });
          }
        }

        const successSensors = sensorLocations.reduce((prev, curr, idx) => {
          if (curr.status === 'fulfilled') {
            prev.push(curr.value);
          } else {
            // These are sensors that were not saved to the database as locations
            errorSensors.push({
              row: data.findIndex((elem) => elem === registeredSensors[idx]) + 2,
              translation_key: sensorErrors.INTERNAL_ERROR,
              variables: {
                sensorId: registeredSensors[idx].external_id || registeredSensors[idx].name,
              },
            });
          }
          return prev;
        }, []);

        if (successSensors.length < data.length) {
          return sendResponse(
            () => {
              return res.status(400).send({
                error_type: 'unable_to_claim_all_sensors',
                success: successSensors, // We need the full sensor objects to update the redux store
                errorSensors,
              });
            },
            async () => {
              return await sendSensorNotification(
                user_id,
                farm_id,
                SensorNotificationTypes.SENSOR_BULK_UPLOAD_FAIL,
                {
                  error_download: {
                    errors: errorSensors,
                    file_name: 'sensor-upload-outcomes.txt',
                    success: successSensors.map((s) => s.sensor?.external_id || s.name), // Notification download needs an array of only ESIDs
                    error_type: 'claim',
                  },
                },
              );
            },
          );
        } else {
          return sendResponse(
            () => {
              return res
                .status(200)
                .send({ message: 'Successfully uploaded!', sensors: successSensors });
            },
            async () => {
              return await sendSensorNotification(
                user_id,
                farm_id,
                SensorNotificationTypes.SENSOR_BULK_UPLOAD_SUCCESS,
              );
            },
          );
        }
      }
    } catch (e) {
      console.log(e);
      return sendResponse(
        () => {
          return res.status(500).send({ message: e.message });
        },
        async () => {
          return await sendSensorNotification(
            user_id,
            farm_id,
            SensorNotificationTypes.SENSOR_BULK_UPLOAD_FAIL,
            {
              error_download: {
                errors: [],
                file_name: 'sensor-upload-outcomes.txt',
                error_type: 'generic',
              },
            },
          );
        },
      );
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
        model,
        depth,
        depth_unit,
        reading_types,
        location_id,
        user_id,
      } = req.body;

      if (reading_types.length !== 0) {
        const status = reading_types['STATUS'];

        const isSoilWaterContentActive = {
          name: 'soil_water_content',
          active: status['soil_water_content'].active,
        };
        const isSoilWaterPotentialActive = {
          name: 'soil_water_potential',
          active: status['soil_water_potential'].active,
        };
        const isTemperatureActive = {
          name: 'temperature',
          active: status['temperature'].active,
        };

        const readingTypes = {
          soilWaterContent: isSoilWaterContentActive,
          soilWaterPotential: isSoilWaterPotentialActive,
          temperature: isTemperatureActive,
        };
        await SensorModel.patchSensorReadingTypes(location_id, readingTypes);
      }
      const sensor_properties = {
        depth,
        depth_unit,
        model,
      };

      const figureID = await FigureModel.query()
        .select('figure_id')
        .where('location_id', location_id);

      const sensorLocation = { point: { lat: latitude, lng: longtitude } };

      await PointModel.query().patch(sensorLocation).where('figure_id', figureID[0].figure_id);

      await LocationModel.query()
        .context({ user_id })
        .patch({ name: sensor_name })
        .where('location_id', location_id);

      await SensorModel.query().patch(sensor_properties).where('location_id', location_id);

      return res.status(200).send('Success');
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        error,
      });
    }
  },

  async deleteSensor(req, res) {
    const trx = await transaction.start(Model.knex());
    try {
      const isDeleted = await baseController.delete(SensorModel, req.params.location_id, req, {
        trx,
      });
      await trx.commit();
      if (isDeleted) {
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      await trx.rollback();
      res.status(400).json({
        error,
      });
    }
  },

  async getSensorsByFarmId(req, res) {
    try {
      const { farm_id } = req.params;
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
      const {
        rows: partnerSensorReadingTypes = [],
      } = await PartnerReadingTypeModel.getPartnerReadingTypeByPartnerId(partnerId);
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
          const system = ENSEMBLE_UNITS_MAPPING[sensorInfo.unit]?.system;
          const unit = ENSEMBLE_UNITS_MAPPING[sensorInfo.unit]?.conversionKey;
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

  async getAllReadingsByLocationId(req, res) {
    try {
      const { location_id } = req.params;
      if (!location_id) {
        res.status(400).send('No sensor selected');
      }
      const data = await baseController.getByFieldId(
        SensorReadingModel,
        'location_id',
        location_id,
      );
      const validReadings = data.filter((datapoint) => datapoint.valid);
      res.status(200).send(validReadings);
    } catch (error) {
      res.status(400).json({
        error,
      });
    }
  },

  async getReadingsByFarmId(req, res) {
    try {
      const { farm_id } = req.params;
      if (!farm_id) {
        return res.status(400).send('Invalid farm id');
      }
      const result = await SensorReadingModel.getSensorReadingsInDaysByFarmId(farm_id);
      res.status(200).send(result);
    } catch (error) {
      res.status(400).send(error);
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
  async getAllSensorReadingsByLocationIds(req, res) {
    try {
      const { locationIds = [], readingTypes = [], endUnixTime = 0, startUnixTime = 0 } = req.body;

      if (!locationIds.length || !Array.isArray(locationIds)) {
        return res.status(400).send('No location ids are present');
      }

      if (!locationIds.every((i) => typeof i === 'string' && i.length === 36)) {
        return res.status(400).send('Invalid location ids are present');
      }

      if (!readingTypes.length) {
        return res.status(400).send('No read type is present');
      }
      if (!endUnixTime) {
        return res.status(400).send('No end date is present');
      }

      if (!startUnixTime) {
        return res.status(400).send('No start date is present');
      }
      const startDateTime = new Date(startUnixTime * 1000);
      const endDateTime = new Date(endUnixTime * 1000);

      const result = await SensorReadingModel.getSensorReadingsByLocationIds(
        locationIds,
        readingTypes,
        endDateTime,
        startDateTime,
      );

      const sensorsPoints = await SensorModel.getSensorLocationByLocationIds(locationIds);
      res
        .status(200)
        .send({ length: result.length, sensorReading: result, sensorsPoints: sensorsPoints.rows });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  async retireSensor(req, res) {
    const trx = await transaction.start(Model.knex());
    try {
      const { location_id } = req.body;

      const location = await baseController.getByFieldId(LocationModel, 'location_id', location_id);
      const { farm_id } = location[0];

      const sensor = await baseController.getByFieldId(SensorModel, 'location_id', location_id);
      const { external_id, partner_id } = sensor[0];

      const brand = await baseController.getByFieldId(
        IntegratingPartnersModel,
        'partner_id',
        partner_id,
      );
      const { partner_name } = brand[0];

      const user_id = req.auth.user_id;
      const { access_token } = await IntegratingPartnersModel.getAccessAndRefreshTokens(
        'Ensemble Scientific',
      );
      let unclaimResponse;
      if (partner_name != 'No Integrating Partner' && external_id != '') {
        const external_integrations_response = await FarmExternalIntegrationsModel.getOrganizationId(
          farm_id,
          partner_id,
        );
        const org_id = external_integrations_response.organization_uuid;
        unclaimResponse = await unclaimSensor(org_id, external_id, access_token);

        if (unclaimResponse?.status != 200) {
          await trx.rollback();
          return res.status(500).send('Unable to unclaim ESCI sensor');
        }
      }
      const deleteResponse = await LocationModel.deleteLocation(trx, location_id, { user_id });
      if (deleteResponse == 1) {
        await trx.commit();
        return res.status(200).send(unclaimResponse?.data);
      } else {
        await trx.rollback();
        return res.status(500).send('Delete Sensor Failed');
      }
    } catch (error) {
      console.log(error);
      await trx.rollback();
      return res.status(400).send({
        error,
      });
    }
  },
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

export default sensorController;
