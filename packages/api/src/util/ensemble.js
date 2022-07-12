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

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const FarmModel = require('../models/farmModel');
const FarmExternalIntegrationsModel = require('../models/farmExternalIntegrationsModel');
const IntegratingPartners = require('../models/integratingPartnersModel');
const { ensembleAPI } = require('../endPoints');

let baseUrl;
if (process.env.NODE_ENV === 'integration') {
  baseUrl = 'https://api.beta.litefarm.org';
} else if (process.env.NODE_ENV === 'production') {
  baseUrl = 'https://api.app.litefarm.org';
} else {
  // NOTE: for testing out the webhook, you may need to ngrok or some other
  // tool to make the endpoint available to Ensemble
  baseUrl = 'http://localhost:5001';
}

/**
 * Sends a request to the Ensemble API for an organization to claim sensors
 * @param {String} accessToken - a JWT token for accessing the Ensemble API
 * @param {uuid} organizationId - a uuid for an Ensemble organization
 * @param {Array} esids - an array of ids for Ensemble devices
 * @returns {Object} - the response from the Ensemble API
 * @async
 */
async function bulkSensorClaim(accessToken, organizationId, esids) {
  const axiosObject = {
    method: 'post',
    url: `${ensembleAPI}/organizations/${organizationId}/devices/bulkclaim/`,
    data: { esids },
  };

  const onError = (error) => {
    if (error.response?.data && error.response?.status) {
      return { ...error.response.data, status: error.response.status };
    } else {
      throw new Error('Failed to claim sensors');
    }
  };

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
 * Sends a request to the Ensemble API to register a webhook to an organization
 * @param {uuid} farmId - the uid for the farm the user is on
 * @param {uuid} organizationId - a uuid for the organization registered with Ensemble
 * @param {String} accessToken - a JWT token for accessing the Ensemble API
 * @returns {Object} - the response from the Ensemble API
 * @async
 */

async function registerOrganizationWebhook(farmId, organizationId, accessToken) {
  const authHeader = `${farmId}${process.env.SENSOR_SECRET}`;
  const existingIntegration = await FarmExternalIntegrationsModel.query()
    .where({ farm_id: farmId, partner_id: 1 })
    .first();
  if (existingIntegration?.webhook_address) {
    return existingIntegration.webhook_address;
  } else {
    const axiosObject = {
      method: 'post',
      url: `${ensembleAPI}/organizations/${organizationId}/webhooks/`,
      data: {
        url: `${baseUrl}/sensors/add_reading/1/${farmId}`,
        authorization_header: authHeader,
        frequency: 15,
      },
    };
    const onError = (error) => {
      console.log(error);
      throw new Error('Failed to register webhook with ESCI');
    };
    const onResponse = async (response) => {
      await FarmExternalIntegrationsModel.updateWebhookAddress(
        farmId,
        `${baseUrl}/sensors/add_reading/1`,
        response.data.id,
      );
      return { ...response.data, status: response.status };
    };
    return await ensembleAPICall(accessToken, axiosObject, onError, onResponse);
  }
}

/**
 * Creates a new ESCI organization if one does not already exist.
 * @param farmId
 * @param accessToken
 * @async
 * @return {Promise<{details: string, status: number}|FarmExternalIntegrations>}
 */
async function createOrganization(farmId, accessToken) {
  try {
    const data = await FarmModel.getFarmById(farmId);
    const existingIntegration = await FarmExternalIntegrationsModel.query()
      .where({ farm_id: farmId, partner_id: 1 })
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
        throw new Error('Unable to create ESCI organization');
      };

      const response = await ensembleAPICall(accessToken, axiosObject, onError);

      return await FarmExternalIntegrationsModel.query().insert({
        farm_id: farmId,
        partner_id: 1,
        organization_uuid: response.data.uuid,
      });
    } else {
      return existingIntegration;
    }
  } catch (e) {
    console.log(e);
    throw new Error('Unable to create ESCI organization');
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
    const { refresh_token } = await IntegratingPartners.getAccessAndRefreshTokens(
      'Ensemble Scientific',
    );
    const response = await axios.post(ensembleAPI + '/token/refresh/', { refresh: refresh_token });
    await IntegratingPartners.patchAccessAndRefreshTokens(
      'Ensemble Scientific',
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
    await IntegratingPartners.patchAccessAndRefreshTokens(
      'Ensemble Scientific',
      response.data?.access,
      response.data?.access,
    );
    return response.data;
  } catch (error) {
    return { status: 500, detail: 'Failed to authenticate with Ensemble.' };
  }
}

/**
 * Communicate with Ensemble API and unclaim a sensor from the litefarm organization
 * @returns Response from Ensemble API
 */
async function unclaimSensor(org_id, external_id, access_token) {
  try {
    const axiosObject = {
      method: 'post',
      url: `${ensembleAPI}/organizations/${org_id}/devices/unclaim/`,
      data: { esid: external_id },
    };

    const onError = () => {
      throw new Error('Unable to unclaim sensor');
    };
    const response = await ensembleAPICall(access_token, axiosObject, onError);
    return response;
  } catch (error) {
    return { status: 400, error };
  }
}

module.exports = {
  bulkSensorClaim,
  registerOrganizationWebhook,
  createOrganization,
  unclaimSensor,
};
