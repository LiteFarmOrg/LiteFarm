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

import axios from 'axios';

import path from 'path';
import * as dotenv from 'dotenv';

const dir = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(dir, '..', '..', '.env') });

import FarmModel from '../models/farmModel.js';
import FarmAddonModel from '../models/farmAddonModel.js';
import AddonPartnerModel from '../models/addonPartnerModel.js';
import endPoints from '../endPoints.js';
import { fileURLToPath } from 'url';
import { toSnakeCase } from './util.js';
import { customError } from './customErrors.js';
const { ensembleAPI } = endPoints;

// Equivalency mapping between Ensemble and convert-units for the new sensor readings controller
const ESCI_TO_CONVERT_UNITS_MAP = {
  '°': 'deg',
  '°C': 'C',
  // No equivalent in convert-units for:
  // 'W/m2' (Solar Radiation)
};

/**
 * Retrieves a valid Ensemble organisation by its UUID.
 * @param {uuid} org_uuid
 * @returns {Object} - The organisation object.
 * @async
 */
const getValidEnsembleOrg = async (org_uuid) => {
  const allRegisteredOrganisations = await getEnsembleOrganisations();

  const organisation = allRegisteredOrganisations?.find(({ uuid }) => uuid === org_uuid);

  return organisation;
};

/**
 * Fetches Ensemble sensors and sensor arrays for a given farm
 * @param {uuid} farm_id
 * @returns {Object} - An object containing arrays of sensors and sensor arrays.
 * @async
 */
const getEnsembleSensors = async (farm_id) => {
  const { id: EnsemblePartnerId } = await AddonPartnerModel.getPartnerId(ENSEMBLE_BRAND);

  const farmEnsembleAddon = await FarmAddonModel.getOrganisationIds(farm_id, EnsemblePartnerId);

  if (!farmEnsembleAddon) {
    return { sensors: [], sensor_arrays: [] };
  }
  const devices = await getOrganisationDevices(farmEnsembleAddon.org_pk);

  if (!devices?.length) {
    return { sensors: [], sensor_arrays: [] };
  }

  const { systems: orgSystems } = await getValidEnsembleOrg(farmEnsembleAddon.org_uuid);

  const farm = await FarmModel.query().findById(farm_id);
  const farmCenterCoordinates = farm.grid_points;

  const sensorArrays = [];
  for (const system of orgSystems) {
    const systemProfiles = await getOrganisationProfiles(farmEnsembleAddon.org_pk, system.pk);

    const mappedProfiles = systemProfiles
      .filter((profile) => profile.water_profile?.sensors?.length)
      .map((profile) =>
        mapProfileToSensorArray(
          enrichProfileWithDefaultPosition(profile, farmCenterCoordinates),
          system.name,
        ),
      );

    if (mappedProfiles?.length) {
      sensorArrays.push(...mappedProfiles);
    }
  }

  const esidToProfileIdMap = {};
  for (const array of sensorArrays) {
    for (const sensorId of array.sensors) {
      esidToProfileIdMap[sensorId] = array.id;
    }
  }

  const sensors = [];

  for (const incomingDevice of devices) {
    if (incomingDevice.category === 'Sensor' && incomingDevice.deployed) {
      const device = enrichDeviceWithDefaultPosition(incomingDevice, farmCenterCoordinates);

      device.profile_id = esidToProfileIdMap[device.esid] || null;

      sensors.push(mapDeviceToSensor(device));
    }
  }

  return { sensors, sensor_arrays: sensorArrays };
};

/**
 * Creates a sensor object out of the incoming Ensemble device object
 * @param {Object} device - The device to map
 * @returns {Object} - The mapped sensor object
 */
const mapDeviceToSensor = (device) => {
  return {
    name: device.name,
    external_id: device.esid,
    last_seen: device.last_seen,
    point: {
      lat: Number(device.latest_position.latitude),
      lng: Number(device.latest_position.longitude),
    },
    depth: device.latest_position.vertical_position,
    depth_unit: 'cm',
    sensor_array_id: device.profile_id,
    label: device.label,

    // For backwards compatibility
    location_id: device.esid,
  };
};

/**
 * Maps an Ensemble profile object to a simplified format for sensor arrays
 * @param {Object} profile - The profile to map
 * @param {string} systemName - The name of the system this profile belongs to
 * @returns {Object} - The mapped sensor array object
 */
const mapProfileToSensorArray = (profile, systemName) => {
  return {
    id: profile.id,
    sensors: profile.water_profile.sensors,
    point: {
      lat: profile.water_profile.position?.latitude,
      lng: profile.water_profile.position?.longitude,
    },
    label: profile.description,
    system: systemName,

    // For backwards compatibility
    location_id: profile.id,
  };
};

/**
 * Adds required position properties to a profile object if they are missing
 *
 * @param {Object} profile - The profile object to enrich with default values
 * @param {Object} grid_points - The farm's center coordinates to use as default location
 * @returns {Object} - The profile object with all required display properties
 */
const enrichProfileWithDefaultPosition = (profile, grid_points) => {
  profile.water_profile = profile.water_profile || {};
  profile.water_profile.position = {
    latitude: profile.water_profile.position?.latitude ?? grid_points.lat,
    longitude: profile.water_profile.position?.longitude ?? grid_points.lng,
  };

  return profile;
};

/**
 * Adds required position properties to a device object if they are missing, to ensure it can be properly displayed.
 *
 * @param {Object} device - The device object to enrich with default values
 * @param {Object} grid_points - The farm's center coordinates to use as default location
 * @returns {Object} - The device object with all required display properties
 */
const enrichDeviceWithDefaultPosition = (device, grid_points) => {
  device.latest_position = {
    vertical_position: device.latest_position?.vertical_position ?? null,
    latitude: device.latest_position?.latitude ?? grid_points.lat,
    longitude: device.latest_position?.longitude ?? grid_points.lng,
  };

  return device;
};

/**
 * Fetches Ensemble sensor readings for the given sensor(s)
 * @param {Object} params - The parameters for fetching the sensor readings.
 * @param {uuid} params.farm_id - The ID of the farm.
 * @param {string} params.esids - The external sensor ID(s) as string of comma separated variables ('LSZDWX,BWKBAL')
 * @param {string} [params.startTime] - The start time in ISO 8601 format.
 * @param {string} [params.endTime] - The end time in ISO 8601 format.
 * @param {string} [params.truncPeriod] - The truncation period for the readings.
 * @returns {Array} - An array of formatted sensor readings.
 * @async
 */
const getEnsembleSensorReadings = async ({ farm_id, esids, startTime, endTime, truncPeriod }) => {
  const { id: EnsemblePartnerId } = await AddonPartnerModel.getPartnerId(ENSEMBLE_BRAND);

  const farmEnsembleAddon = await FarmAddonModel.getOrganisationIds(farm_id, EnsemblePartnerId);

  if (!farmEnsembleAddon) {
    throw customError('Farm does not have active Ensemble Scientific addon', 404);
  }

  const data = await fetchDeviceReadings({
    organisation_pk: farmEnsembleAddon.org_pk,
    esids,
    startTime,
    endTime,
    truncPeriod,
  });

  const formattedData = formatSensorReadings(data);

  return formattedData;
};

/**
 * Formats the incoming sensor data into the format needed by sensor charts
 * @param {Object} data - The raw sensor data.
 * @returns {Array} - An array of formatted sensor data.
 *
 * @example
 * Sample output:
 * [
 *   {
 *     reading_type: 'soil_water_potential',
 *     unit: 'kPa',
 *     readings: [
 *       { dateTime: 1713830400, 'BWKBAL': -12.05, 'LSZDWX': -186.59 },
 *       { dateTime: 1726358400, 'BWKBAL': 90.15, 'LSZDWX': -187.76 }
 *     ]
 *   },
 *   {
 *     reading_type: 'temperature',
 *     unit: 'C',
 *     readings: [
 *       { dateTime: 1713830400, 'BWKBAL': 10.3, 'LSZDWX': 8.5 },
 *       { dateTime: 1726358400, 'BWKBAL': -994.6, 'LSZDWX': 8.7 }
 *     ]
 *   }
 * ]
 */
function formatSensorReadings(data) {
  const combinedReadings = {};

  for (const deviceId in data) {
    const { data: deviceData, device_esid: deviceEsid } = data[deviceId];

    deviceData.forEach((readingType) => {
      const readingTypeKey = toSnakeCase(readingType.parameter_category);
      const unit = ESCI_TO_CONVERT_UNITS_MAP[readingType.unit] ?? readingType.unit;

      if (!combinedReadings[readingTypeKey]) {
        combinedReadings[readingTypeKey] = { unit, readings: {} };
      }

      readingType.timestamps.forEach((timestamp, index) => {
        if (!combinedReadings[readingTypeKey].readings[timestamp]) {
          combinedReadings[readingTypeKey].readings[timestamp] = {};
        }
        combinedReadings[readingTypeKey].readings[timestamp][deviceEsid] =
          readingType.values[index];
      });
    });
  }

  const formattedData = Object.keys(combinedReadings).map((readingTypeKey) => {
    const { unit, readings } = combinedReadings[readingTypeKey];

    const formattedReadings = Object.entries(readings)
      .map(([timestamp, values]) => ({
        dateTime: Math.floor(new Date(timestamp).getTime() / 1000),
        ...values,
      }))
      .sort((a, b) => a.dateTime - b.dateTime);

    return {
      reading_type: readingTypeKey,
      unit,
      readings: formattedReadings,
    };
  });

  return formattedData;
}

const ENSEMBLE_BRAND = 'Ensemble Scientific';

async function getEnsembleOrganisations() {
  try {
    const axiosObject = {
      method: 'get',
      url: `${ensembleAPI}/organizations/`,
    };
    const onError = () => {
      const err = new Error('Unable to fetch ESCI organisations');
      err.status = 500;
      throw err;
    };

    const response = await ensembleAPICall(axiosObject, onError);

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Retrieves all profiles that belong to a given organisation and system
 * @param {number} organisation_pk - The primary key of the organisation.
 * @param {number} system_id - The primary key of the system.
 * @returns {Array} - An array of profile objects
 * @throws {Error} - Throws an error if ESci API call fails
 * @async
 */
async function getOrganisationProfiles(organisation_pk, system_id) {
  try {
    const axiosObject = {
      method: 'get',
      url: `${ensembleAPI}/organizations/${organisation_pk}/pivot_irrigation/${system_id}/profiles`,
    };

    const onError = () => {
      const err = new Error('Unable to fetch ESCI profiles');
      err.status = 500;
      throw err;
    };

    const response = await ensembleAPICall(axiosObject, onError);

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/**
 * Retrieves all devices that belong to a given organisation
 * @param {number} organisation_pk - The primary key of the organisation.
 * @returns {Array} - An array of device objects.
 * @throws {Error} - Throws an error if ESci API call fails
 * @async
 */
async function getOrganisationDevices(organisation_pk) {
  try {
    const axiosObject = {
      method: 'get',
      url: `${ensembleAPI}/organizations/${organisation_pk}/devices/?with_latest_position=true`,
    };
    const onError = () => {
      const err = new Error('Unable to fetch ESCI devices');
      err.status = 500;
      throw err;
    };

    const response = await ensembleAPICall(axiosObject, onError);

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/**
 * Fetches the sensor data for the given esids and (optionally) a given time range in specified intervals
 * @param {Object} params - The parameters for fetching the sensor data.
 * @param {uuid} params.organisation_pk - The primary key of the organisation.
 * @param {string} params.esids - The esid(s) of the device(s)
 * @param {string} [params.startTime] - The start date of the data in ISO 8601 format.
 * @param {string} [params.endTime] - The end date of the data in ISO 8601 format.
 * @param {string} [params.trunc_period] - Sampling interval for returned data. Allowed values are 'second', 'minute', 'hour', 'day'. Default is 'hour'.
 * @returns {Array} - An array of device objects.
 * @throws {Error} - Throws an error if ESci API call fails.
 * @async
 */
async function fetchDeviceReadings({
  organisation_pk,
  esids,
  startTime,
  endTime,
  truncPeriod = 'hour',
}) {
  try {
    const params = new URLSearchParams({
      sensor_esid: esids,
      validated: true,
      trunc_period: truncPeriod,
    });
    if (startTime) params.append('start_time', startTime);
    if (endTime) params.append('end_time', endTime);

    const axiosObject = {
      method: 'get',
      url: `${ensembleAPI}/organizations/${organisation_pk}/data/?${params.toString()}`,
    };

    const onError = () => {
      const err = new Error('Unable to fetch ESci device readings');
      err.status = 500;
      throw err;
    };

    const response = await ensembleAPICall(axiosObject, onError);

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/**
 * Sends a request to the Ensemble API. On error, refreshes API tokens and retries the request.
 * @param {Object} axiosObject - the axios request config (see https://axios-http.com/docs/req_config)
 * @param {Function} onError - a function for handling errors with the api call
 * @param {Function} onResponse -  a function to determine how to handle the response of the api call
 * @param {number} retries - number of times the api call can be retried
 * @returns {import('axios').AxiosResponse} - the response from the Ensemble API
 * @async
 */
async function ensembleAPICall(axiosObject, onError, onResponse = (r) => r, retries = 1) {
  const access_token = await fetchAccessToken();
  const axiosObjWithHeaders = { headers: getHeaders(access_token), ...axiosObject };
  try {
    const response = await axios(axiosObjWithHeaders);
    return onResponse(response);
  } catch (error) {
    if (isAuthError(error) && retries > 0) {
      return refreshAndRecall(axiosObject, onError, onResponse, retries);
    } else {
      return onError(error);
    }
  }
}

/**
 * Fetches the Ensemble access token from the addon_partner table.
 * @returns {string} - The access token.
 * @async
 */
async function fetchAccessToken() {
  const { access_token } = await AddonPartnerModel.getAccessAndRefreshTokens(ENSEMBLE_BRAND);
  return access_token;
}

/**
 * Refreshes ensemble API tokens and retries the request.
 * @param {uuid} axiosObject - the axios request config (see https://axios-http.com/docs/req_config)
 * @param {Array} onError - a function for handling errors with the api call
 * @param {number} retries - number of times the api call can be retried
 * @returns {Object} - the response from the Ensemble API
 * @async
 */
async function refreshAndRecall(axiosObject, onError, onResponse, retries) {
  const result = await refreshTokens();
  if (!result?.access || !result?.refresh) return result;
  return ensembleAPICall(axiosObject, onError, onResponse, retries - 1);
}

/**
 * Returns the headers for an Ensemble API call
 * @param {String} accessToken - a JWT token for accessing the Ensemble API
 */
function getHeaders(accessToken) {
  return { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken };
}

/**
 * Returns whether the error is an authentication/authorization error
 * @param {String} error - error object
 */
function isAuthError(error) {
  return (
    error.response?.status === 403 ||
    error.response?.status === 401 ||
    error.response?.data?.code === 'token_not_valid' ||
    error.response?.data?.code === 'bad_authorization_header' ||
    error.response?.data?.refresh ||
    error.response?.data?.access
  );
}

/**
 * Refreshes tokens for the Ensemble API and stores them in the database.
 * @returns The access and refresh tokens.
 * @async
 */
async function refreshTokens() {
  try {
    const { refresh_token } = await AddonPartnerModel.getAccessAndRefreshTokens(ENSEMBLE_BRAND);
    const response = await axios.post(ensembleAPI + '/token/refresh/', { refresh: refresh_token });
    await AddonPartnerModel.patchAccessAndRefreshTokens(
      ENSEMBLE_BRAND,
      response.data?.access,
      response.data?.access,
    );
    return response.data;
  } catch (error) {
    if (isAuthError(error)) {
      return await authenticateToGetTokens();
    } else {
      const err = new Error('Failed to authenticate with Ensemble.');
      err.status = 500;
      throw err;
    }
  }
}

/**
 * Re-authenticates with the Ensemble API. Stores the new access and refresh
 * tokens them in the database.
 * @returns The access and refresh tokens.
 * @async
 */
async function authenticateToGetTokens() {
  try {
    const username = process.env.ENSEMBLE_USERNAME;
    const password = process.env.ENSEMBLE_PASSWORD;
    const response = await axios.post(ensembleAPI + '/token/', { username, password });
    await AddonPartnerModel.patchAccessAndRefreshTokens(
      ENSEMBLE_BRAND,
      response.data?.access,
      response.data?.access,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    const err = new Error('Failed to authenticate with Ensemble.');
    err.status = 500;
    throw err;
  }
}

export {
  ENSEMBLE_BRAND,
  getEnsembleSensors,
  getEnsembleSensorReadings,
  getValidEnsembleOrg,
  ensembleAPICall,
  ensembleAPI,
};
