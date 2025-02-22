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
const { ensembleAPI } = endPoints;

let baseUrl;
if (process.env.NODE_ENV === 'integration') {
  baseUrl = 'https://api.beta.litefarm.org';
} else if (process.env.NODE_ENV === 'production') {
  baseUrl = 'https://api.app.litefarm.org';
} else if (process.env.NODE_ENV === 'development') {
  /*
   * NOTE: for testing out the webhook run the following:
   * - 'npm run ngrok:api' (or 'npm run ngrok' for both frontend and backend forwarding)
   * - 'npm run ngrok:setup'
   */
  baseUrl = process.env.NGROK_API;
} else {
  baseUrl = 'http://localhost:' + process.env.PORT;
}

//Known aliases for units from ensemble mapping to convert-units representation
const ENSEMBLE_UNITS_MAPPING = {
  Celsius: {
    conversionKey: 'C',
    system: 'metric',
  },
  kPa: {
    conversionKey: 'kPa',
    system: 'metric',
  },
  Percent: {
    conversionKey: '%',
    system: 'all',
  },
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

  const sensors = [];
  const sensorArrayMap = {};

  const farm = await FarmModel.query().findById(farm_id);
  const farmCenterCoordinates = farm.grid_points;

  for (const incomingDevice of devices) {
    if (incomingDevice.category === 'Sensor' && incomingDevice.deployed) {
      // This is a temporary solution until the Ensemble API is updated to return depth, position, and profiles
      const device = enrichWithMockData(incomingDevice, farmCenterCoordinates);

      sensors.push(mapDeviceToSensor(device));

      if (device.profile_id) {
        if (!sensorArrayMap[device.profile_id]) {
          sensorArrayMap[device.profile_id] = [];
        }
        sensorArrayMap[device.profile_id].push({
          external_id: device.external_id,
          latest_position: device.latest_position,
        });
      }
    }
  }

  const sensor_arrays = createSensorArrays(sensorArrayMap);

  return { sensors, sensor_arrays };
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
    sensor_reading_types: device.parameter_types.map(
      (type) => ENSEMBLE_READING_TYPES_MAPPING[type],
    ),
    last_seen: device.last_seen,
    point: {
      lat: device.latest_position.coordinates.lat,
      lng: device.latest_position.coordinates.lng,
    },
    depth: device.latest_position.depth,
    depth_unit: 'cm', // to be confirmed
    sensor_array_id: device.profile_id,

    // For backwards compatibility
    location_id: device.esid,
  };
};

/**
 * Creates sensor arrays from a lookup structure keyed by device profile ids
 * @param {Object} sensorArrayMap - A lookup object where each key is a device.profile_id and the value is an array of sensor objects.
 * @returns {Array} - An array of sensor array objects.
 */
const createSensorArrays = (sensorArrayMap) => {
  return Object.entries(sensorArrayMap).map(([id, sensors]) => ({
    id,
    sensors: sensors.map(({ external_id }) => external_id),
    point: calculateSensorArrayPoint(sensors),

    // For backwards compatibility
    location_id: id,
    name: `Sensor Array ${id}`,
  }));
};

/**
 * Calculates the point for a sensor array based on the position of the sensor with the shallowest sensor depth (point closest to ground level)
 * @param {Array} sensors - An array of sensors.
 * @returns {Object} - An object containing latitude and longitude.
 */
const calculateSensorArrayPoint = (sensors) => {
  let selectedSensor = sensors[0];

  for (const sensor of sensors) {
    if (Math.abs(sensor.latest_position.depth) < Math.abs(selectedSensor.latest_position.depth)) {
      selectedSensor = sensor;
    }
  }

  return {
    lat: selectedSensor.latest_position.coordinates.lat,
    lng: selectedSensor.latest_position.coordinates.lng,
  };
};

// This is awaiting the list of all potential reading_types from Ensemble. Please match to the frontend apiSlice type once confirmed
const ENSEMBLE_READING_TYPES_MAPPING = {
  'Soil Water Potential': 'soil_water_potential',
  Temperature: 'temperature',
};

// Add mock data to a incoming Ensemble device to emulate positions (based on farm center) and randomly assigned profiles. Only necessary until we are receiving real data for this
const enrichWithMockData = (
  device,
  grid_points = {
    lat: 49.2504,
    lng: -123.1119,
  },
) => {
  device.last_seen = new Date().toISOString();
  const random = Math.random();
  device.profile_id = random > 0.5 ? 1 : random > 0.25 ? 2 : null;

  if (device.profile_id === 1) {
    const depths = [10, 20, 30, -10, -20, -30];
    const randomDepth = depths[Math.floor(Math.random() * depths.length)];

    // This is based on my speculation of what this data will look like. I have not seen real data yet.
    device.latest_position = {
      depth: randomDepth,
      coordinates: {
        lat: grid_points.lat,
        lng: grid_points.lng,
      },
    };
  } else if (device.profile_id === 2) {
    const depths = [10, 20, 30, -10, -20, -30];
    const randomDepth = depths[Math.floor(Math.random() * depths.length)];
    const randomOffset = () => (Math.random() - 0.5) * 0.00025; // ~25m in degrees
    // This is based on my speculation of what this data will look like. I have not seen real data yet.
    device.latest_position = {
      depth: randomDepth,
      coordinates: {
        lat: grid_points.lat + randomOffset(),
        lng: grid_points.lng + randomOffset(),
      },
    };
  } else {
    const randomOffset = () => (Math.random() - 0.5) * 0.0001; // ~10m in degrees

    device.latest_position = {
      depth: 10,
      coordinates: {
        lat: grid_points.lat + randomOffset(),
        lng: grid_points.lng + randomOffset(),
      },
    };
  }

  return device;
};

/**
 * Fetches Ensemble sensor readings for a given sensor
 * @param {uuid} farm_id - The ID of the farm.
 * @param {string} esid - The external sensor ID.
 * @param {number} startUnixTime - The start time in Unix timestamp format.
 * @param {number} endUnixTime - The end time in Unix timestamp format.
 * @returns {Array} - An array of formatted sensor readings.
 * @async
 */
const getEnsembleSensorReadings = async (farm_id, esid, startUnixTime, endUnixTime) => {
  const { id: EnsemblePartnerId } = await AddonPartnerModel.getPartnerId(ENSEMBLE_BRAND);

  const farmEnsembleAddon = await FarmAddonModel.getOrganisationIds(farm_id, EnsemblePartnerId);

  if (!farmEnsembleAddon) {
    return [];
  }

  const start_time = startUnixTime && new Date(startUnixTime * 1000).toISOString();
  const end_time = endUnixTime && new Date(endUnixTime * 1000).toISOString();

  const data = await getDeviceReadings({
    organisation_pk: farmEnsembleAddon.org_pk,
    esid,
    start_time,
    end_time,
  });

  const formattedData = formatSensorReadings(data);

  return formattedData;
};

/**
 * Formats the sensor data into the desired structure.
 * @param {Object} data - The raw sensor data.
 * @returns {Array} - An array of formatted sensor data.
 */
function formatSensorReadings(data) {
  const formattedData = [];

  for (const key in data) {
    const deviceData = data[key].data;

    deviceData.forEach((readingType) => {
      const readings = readingType.values.map((value, index) => {
        return {
          dateTime: readingType.timestamps[index],
          value,
        };
      });
      formattedData.push({
        reading_type: readingType.parameter_category,
        unit: readingType.unit,
        readings,
      });
    });
  }

  return formattedData;
}

const ENSEMBLE_BRAND = 'Ensemble Scientific';

// Return Ensemble Scientific IDs (esids) from sensor data
const extractEsids = (data) =>
  data
    .filter((sensor) => sensor.brand === 'Ensemble Scientific' && sensor.external_id)
    .map((sensor) => sensor.external_id);

// Function to encapsulate the logic for claiming sensors
async function registerFarmAndClaimSensors(farm_id, esids) {
  // Register farm as an organisation with Ensemble
  const organisation = await createOrganisation(farm_id);

  // Create a webhook for the organisation
  await registerOrganisationWebhook(farm_id, organisation.org_uuid);

  // Register sensors with Ensemble and return Ensemble API results
  return await bulkSensorClaim(organisation.org_uuid, esids);
}

/**
 * Sends a request to the Ensemble API for an organisation to claim sensors
 * @param {uuid} organisationId - a uuid for an Ensemble organisation
 * @param {Array} esids - an array of ids for Ensemble devices
 * @returns {Object} - the response from the Ensemble API
 * @async
 */
async function bulkSensorClaim(organisationId, esids) {
  const axiosObject = {
    method: 'post',
    url: `${ensembleAPI}/organizations/${organisationId}/devices/bulkclaim/`,
    data: { esids },
  };

  // partial or complete failures (at least some esids failed to claim)
  const onError = (error) => {
    if (error.response?.data && error.response?.status) {
      return { ...error.response.data, status: error.response.status };
    } else {
      throw new Error('Failed to claim sensors');
    }
  };

  // full success (all esids successfully claimed)
  const onResponse = (response) => {
    return {
      success: esids,
      does_not_exist: [],
      already_owned: [],
      occupied: [],
      detail: response.data.detail,
    };
  };
  return await ensembleAPICall(axiosObject, onError, onResponse);
}

/**
 * Sends a request to the Ensemble API to register a webhook to an organisation
 * @param {uuid} farmId - the uid for the farm the user is on
 * @param {uuid} organisationId - a uuid for the organisation registered with Ensemble
 * @returns {Object} - the response from the Ensemble API
 * @async
 */

async function registerOrganisationWebhook(farmId, organisationId) {
  const authHeader = `${farmId}${process.env.SENSOR_SECRET}`;
  const existingIntegration = await FarmAddonModel.query()
    .where({ farm_id: farmId, addon_partner_id: 1 })
    .whereNotDeleted()
    .first();
  if (existingIntegration?.webhook_id) {
    return;
  }

  const axiosObject = {
    method: 'post',
    url: `${ensembleAPI}/organizations/${organisationId}/webhooks/`,
    data: {
      url: `${baseUrl}/sensor/reading/partner/1/farm/${farmId}`,
      authorization_header: authHeader,
      frequency: 15,
    },
  };
  const onError = (error) => {
    console.log(error);
    throw new Error('Failed to register webhook with ESCI');
  };
  const onResponse = async (response) => {
    await FarmAddonModel.updateWebhookId(farmId, response.data.id);
    return { ...response.data, status: response.status };
  };
  await ensembleAPICall(axiosObject, onError, onResponse);
}

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
 * Retrieves all devices that belong to a given organisation
 * @param {uuid} organisation_pk - The primary key of the organisation.
 * @returns {Array} - An array of device objects.
 * @throws {Error} - Throws an error if ESci API call fails
 * @async
 */
async function getOrganisationDevices(organisation_pk) {
  try {
    const axiosObject = {
      method: 'get',
      url: `${ensembleAPI}/organizations/${organisation_pk}/devices/`,
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
 * Fetches the sensor data for a given esid and (optionally) a given time range.
 * @param {Object} params - The parameters for fetching the sensor data.
 * @param {uuid} params.organisation_pk - The primary key of the organisation.
 * @param {string} params.esid - The esid of the device.
 * @param {string} [params.start_time] - The start date of the data in ISO 8601 format (2025-02-12T08:00:00.000Z).
 * @param {string} [params.end_time] - The end date of the data in ISO 8601 format.
 * @returns {Array} - An array of device objects.
 * @throws {Error} - Throws an error if ESci API call fails.
 * @async
 */
async function getDeviceReadings({ organisation_pk, esid, start_time, end_time }) {
  try {
    const params = new URLSearchParams({ sensor_esid: esid, validated: true });
    if (start_time) params.append('start_time', start_time);
    if (end_time) params.append('end_time', end_time);

    const axiosObject = {
      method: 'get',
      url: `${ensembleAPI}/organizations/${organisation_pk}/data/?${params.toString()}`,
    };

    const onError = () => {
      const err = new Error('Unable to fetch ESci device data');
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
 * Creates a new ESCI organisation if one does not already exist.
 * @param farmId
 * @async
 * @return {Promise<{details: string, status: number}|FarmAddon>}
 */
async function createOrganisation(farmId) {
  try {
    const data = await FarmModel.getFarmById(farmId);
    const existingIntegration = await FarmAddonModel.query()
      .where({ farm_id: farmId, addon_partner_id: 1 })
      .whereNotDeleted()
      .first();
    if (!existingIntegration) {
      const axiosObject = {
        method: 'post',
        url: `${ensembleAPI}/organizations/`,
        data: {
          name: data.farm_name,
          phone: data.farm_phone_number,
        },
      };
      const onError = () => {
        throw new Error('Unable to create ESCI organisation');
      };

      const response = await ensembleAPICall(axiosObject, onError);

      return await FarmAddonModel.query().insert({
        farm_id: farmId,
        addon_partner_id: 1,
        org_uuid: response.data.uuid,
      });
    } else {
      return existingIntegration;
    }
  } catch (e) {
    console.log(e);
    throw new Error('Unable to create ESCI organisation');
  }
}

/**
 * Sends a request to the Ensemble API. On error, refreshes API tokens and retries the request.
 * @param {Object} axiosObject - the axios request config (see https://axios-http.com/docs/req_config)
 * @param {Function} onError - a function for handling errors with the api call
 * @param {Function} onResponse -  a function to determine how to handle the response of the api call
 * @param {number} retries - number of times the api call can be retried
 * @returns {Object} - the response from the Ensemble API
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

/**
 * Communicate with Ensemble API and unclaim a sensor from the litefarm organisation
 * @returns Response from Ensemble API
 */
async function unclaimSensor(org_id, external_id) {
  try {
    const onError = () => {
      throw new Error('Unable to unclaim sensor');
    };

    const getDeviceAxiosObject = {
      method: 'get',
      url: `${ensembleAPI}/devices/${external_id}`,
    };

    const { data: currentDeviceData } = await ensembleAPICall(getDeviceAxiosObject, onError);

    if (currentDeviceData?.owner_organisation?.uuid !== org_id) {
      return { status: 200, data: { detail: 'Device not currently owned by this organisation' } };
    }

    const unclaimAxiosObject = {
      method: 'post',
      url: `${ensembleAPI}/organizations/${org_id}/devices/unclaim/`,
      data: { esid: external_id },
    };

    const response = await ensembleAPICall(unclaimAxiosObject, onError);
    return response;
  } catch (error) {
    return { status: 400, error };
  }
}

export {
  ENSEMBLE_BRAND,
  getEnsembleSensors,
  getEnsembleSensorReadings,
  getEnsembleOrganisations,
  getValidEnsembleOrg,
  getOrganisationDevices,
  calculateSensorArrayPoint,
  enrichWithMockData,
  extractEsids,
  registerFarmAndClaimSensors,
  unclaimSensor,
  ENSEMBLE_UNITS_MAPPING,
  ENSEMBLE_READING_TYPES_MAPPING,
};
