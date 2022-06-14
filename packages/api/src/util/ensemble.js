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

/**
 * Sends a request to the Ensemble API for an organization to claim sensors
 * @param {String} accessToken - a JWT token for accessing the Ensemble API
 * @param {uuid} organizationId - a uuid for an Ensemble organization
 * @param {Array} esids - an array of ids for Ensemble devices
 * @returns {Object} - the response from the Ensemble API
 * @async
 */
async function bulkSensorClaim(accessToken, organizationId, esids, retries = 1) {
  try {
    const response = await axios.post(
      `${ensembleAPI}/organizations/${organizationId}/devices/bulkclaim/`,
      { esids },
      { headers: getHeaders(accessToken) },
    );
    return { ...response.data, status: response.status };
  } catch (error) {
    if (isAuthError(error) && retries > 0) {
      return refreshAndRecall(bulkSensorClaim, accessToken, organizationId, esids, retries - 1);
    } else if (error.response?.data && error.response?.status) {
      return { ...error.response.data, status: error.response.status };
    } else {
      return { status: 500, detail: 'Failed to claim sensors.' };
    }
  }
}

/**
 * Returns the headers for an Ensemble API call
 * @param {String} accessToken - a JWT token for accessing the Ensemble API
 */
function getHeaders(accessToken) {
  return { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken };
}

function isAuthError(error) {
  return (
    error.response.status === 403 ||
    error.response.status === 401 ||
    error.response?.data?.code === 'token_not_valid' ||
    error.response?.data?.detail === 'Authentication credentials were not provided.' ||
    error.response?.data?.code === 'bad_authorization_header'
  );
}

async function fetchAndRefreshTokens() {
  const refreshToken = null; // TODO: get refresh token from database
  return await refreshTokens(refreshToken);
}

async function refreshTokens(refreshToken) {
  try {
    const response = await axios.post(ensembleAPI + '/token/refresh/', { refresh: refreshToken });
    // TODO: save new refresh and access token to database
    return response.data;
  } catch (error) {
    if (isAuthError(error)) {
      return await authenticateToGetTokens();
    } else {
      return { status: 500, detail: 'Failed to authenticate with Ensemble.' };
    }
  }
}

async function authenticateToGetTokens() {
  try {
    // TODO: get username and password from database
    const username = null;
    const password = null;
    const response = await axios.post(ensembleAPI + '/token/refresh/', { username, password });
    return response.data;
  } catch (error) {
    return { status: 500, detail: 'Failed to authenticate with Ensemble.' };
  }
}

async function refreshAndRecall(ensembleAPIFunc, ...args) {
  const result = await fetchAndRefreshTokens();
  if (!result?.access || !result?.refresh) return result;
  args[0] = result.access;
  return ensembleAPIFunc(...args);
}

bulkSensorClaim('invalid token', 'fb52d24c-8929-4e8f-a9c2-607ff65d25eb', ['123']);

module.exports = {
  bulkSensorClaim,
};
