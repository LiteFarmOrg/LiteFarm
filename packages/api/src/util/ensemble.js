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
import AddonPartner from '../models/addonPartnerModel.js';
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

// Based on discussion with Ensemble, the sensor array point will be pulled from the sensor with the shallowest depth (to be revisited)
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

  device.profile_id = Math.random() > 0.5 ? 1 : null;

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

const ENSEMBLE_BRAND = 'Ensemble Scientific';

// Return Ensemble Scientific IDs (esids) from sensor data
const extractEsids = (data) =>
  data
    .filter((sensor) => sensor.brand === 'Ensemble Scientific' && sensor.external_id)
    .map((sensor) => sensor.external_id);

// Function to encapsulate the logic for claiming sensors
async function registerFarmAndClaimSensors(farm_id, access_token, esids) {
  // Register farm as an organisation with Ensemble
  const organisation = await createOrganisation(farm_id, access_token);

  // Create a webhook for the organisation
  await registerOrganisationWebhook(farm_id, organisation.org_uuid, access_token);

  // Register sensors with Ensemble and return Ensemble API results
  return await bulkSensorClaim(access_token, organisation.org_uuid, esids);
}

/**
 * Sends a request to the Ensemble API for an organisation to claim sensors
 * @param {String} accessToken - a JWT token for accessing the Ensemble API
 * @param {uuid} organisationId - a uuid for an Ensemble organisation
 * @param {Array} esids - an array of ids for Ensemble devices
 * @returns {Object} - the response from the Ensemble API
 * @async
 */
async function bulkSensorClaim(accessToken, organisationId, esids) {
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
  return await ensembleAPICall(accessToken, axiosObject, onError, onResponse);
}

/**
 * Sends a request to the Ensemble API to register a webhook to an organisation
 * @param {uuid} farmId - the uid for the farm the user is on
 * @param {uuid} organisationId - a uuid for the organisation registered with Ensemble
 * @param {String} accessToken - a JWT token for accessing the Ensemble API
 * @returns {Object} - the response from the Ensemble API
 * @async
 */

async function registerOrganisationWebhook(farmId, organisationId, accessToken) {
  const authHeader = `${farmId}${process.env.SENSOR_SECRET}`;
  const existingIntegration = await FarmAddonModel.query()
    .where({ farm_id: farmId, addon_partner_id: 1 })
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
  await ensembleAPICall(accessToken, axiosObject, onError, onResponse);
}

async function getEnsembleOrganisations(accessToken) {
  try {
    const axiosObject = {
      method: 'get',
      url: `${ensembleAPI}/organizations/`,
    };
    const onError = () => {
      throw new Error('Unable to fetch ESCI organisation');
    };

    const response = await ensembleAPICall(accessToken, axiosObject, onError);

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function getOrganisationDevices(organisation_pk, accessToken) {
  try {
    const axiosObject = {
      method: 'get',
      url: `${ensembleAPI}/organizations/${organisation_pk}/devices/`,
    };
    const onError = () => {
      throw new Error('Unable to fetch ESCI devices');
    };

    const response = await ensembleAPICall(accessToken, axiosObject, onError);

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Creates a new ESCI organisation if one does not already exist.
 * @param farmId
 * @param accessToken
 * @async
 * @return {Promise<{details: string, status: number}|FarmAddon>}
 */
async function createOrganisation(farmId, accessToken) {
  try {
    const data = await FarmModel.getFarmById(farmId);
    const existingIntegration = await FarmAddonModel.query()
      .where({ farm_id: farmId, addon_partner_id: 1 })
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

      const response = await ensembleAPICall(accessToken, axiosObject, onError);

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
 * @param {String} accessToken - a JWT token for accessing the Ensemble API
 * @param {Object} axiosObject - the axios request config (see https://axios-http.com/docs/req_config)
 * @param {Function} onError - a function for handling errors with the api call
 * @param {Function} onResponse -  a function to determine how to handle the response of the api call
 * @param {number} retries - number of times the api call can be retried
 * @returns {Object} - the response from the Ensemble API
 * @async
 */
async function ensembleAPICall(
  accessToken,
  axiosObject,
  onError,
  onResponse = (r) => r,
  retries = 1,
) {
  const axiosObjWithHeaders = { headers: getHeaders(accessToken), ...axiosObject };
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
  return ensembleAPICall(result.access, axiosObject, onError, onResponse, retries - 1);
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
    const { refresh_token } = await AddonPartner.getAccessAndRefreshTokens(ENSEMBLE_BRAND);
    const response = await axios.post(ensembleAPI + '/token/refresh/', { refresh: refresh_token });
    await AddonPartner.patchAccessAndRefreshTokens(
      ENSEMBLE_BRAND,
      response.data?.access,
      response.data?.access,
    );
    return response.data;
  } catch (error) {
    if (isAuthError(error)) {
      return await authenticateToGetTokens();
    } else {
      return { status: 500, detail: 'Failed to authenticate with Ensemble.' };
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
    await AddonPartner.patchAccessAndRefreshTokens(
      ENSEMBLE_BRAND,
      response.data?.access,
      response.data?.access,
    );
    return response.data;
  } catch (error) {
    return { status: 500, detail: 'Failed to authenticate with Ensemble.' };
  }
}

/**
 * Communicate with Ensemble API and unclaim a sensor from the litefarm organisation
 * @returns Response from Ensemble API
 */
async function unclaimSensor(org_id, external_id, access_token) {
  try {
    const onError = () => {
      throw new Error('Unable to unclaim sensor');
    };

    const getDeviceAxiosObject = {
      method: 'get',
      url: `${ensembleAPI}/devices/${external_id}`,
    };

    const { data: currentDeviceData } = await ensembleAPICall(
      access_token,
      getDeviceAxiosObject,
      onError,
    );

    if (currentDeviceData?.owner_organisation?.uuid !== org_id) {
      return { status: 200, data: { detail: 'Device not currently owned by this organisation' } };
    }

    const unclaimAxiosObject = {
      method: 'post',
      url: `${ensembleAPI}/organizations/${org_id}/devices/unclaim/`,
      data: { esid: external_id },
    };

    const response = await ensembleAPICall(access_token, unclaimAxiosObject, onError);
    return response;
  } catch (error) {
    return { status: 400, error };
  }
}

export {
  ENSEMBLE_BRAND,
  getEnsembleOrganisations,
  getOrganisationDevices,
  calculateSensorArrayPoint,
  enrichWithMockData,
  extractEsids,
  registerFarmAndClaimSensors,
  unclaimSensor,
  ENSEMBLE_UNITS_MAPPING,
  ENSEMBLE_READING_TYPES_MAPPING,
};
