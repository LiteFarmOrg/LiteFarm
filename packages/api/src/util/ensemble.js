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
const { ensembleAPI } = require('../endPoints');
const IntegratingPartners = require('../models/integratingPartnersModel');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

/**
 * Sends a request to the Ensemble API for an organization to claim sensors
 * @param {String} accessToken - a JWT token for accessing the Ensemble API
 * @param {uuid} organizationId - a uuid for an Ensemble organization
 * @param {Array} esids - an array of ids for Ensemble devices
 * @returns {Object} - the response from the Ensemble API
 * @async
 */
async function bulkSensorClaim(accessToken, organizationId, esids, retries = 1) {
  const axiosObject = {
    method: 'post',
    url: `${ensembleAPI}/organizations/${organizationId}/devices/bulkclaim/`,
    data: { esids },
  };

  const onError = (error) => {
    if (error.response?.data && error.response?.status) {
      return { ...error.response.data, status: error.response.status };
    } else {
      return { status: 500, detail: 'Failed to claim sensors.' };
    }
  };

  return await ensembleAPICall(accessToken, axiosObject, onError, retries);
}

/**
 * Sends a request to the Ensemble API. On error, refreshes API tokens and retries the request.
 * @param {String} accessToken - a JWT token for accessing the Ensemble API
 * @param {uuid} axiosObject - the axios request config (see https://axios-http.com/docs/req_config)
 * @param {Array} onError - a function for handling errors with the api call
 * @param {number} retries - number of times the api call can be retried
 * @returns {Object} - the response from the Ensemble API
 * @async
 */
async function ensembleAPICall(accessToken, axiosObject, onError, retries = 1) {
  const axiosObjWithHeaders = { headers: getHeaders(accessToken), ...axiosObject };
  try {
    return await axios(axiosObjWithHeaders);
  } catch (error) {
    if (isAuthError(error) && retries > 0) {
      return refreshAndRecall(axiosObject, onError, retries);
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
async function refreshAndRecall(axiosObject, onError, retries) {
  const result = await refreshTokens();
  if (!result?.access || !result?.refresh) return result;
  return ensembleAPICall(result.access, axiosObject, onError, retries - 1);
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

module.exports = {
  bulkSensorClaim,
};
