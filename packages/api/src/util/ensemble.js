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

const REFRESH_REQUIRED = 'REFRESH_REQUIRED';
const REFRESH =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTY1NTczNzUxNCwiaWF0IjoxNjU1MTMyNzE0LCJqdGkiOiJjZTU3NjcwMDA5NGI0MDY4YjdlZDI4YWJiNzk0MDBmOCIsInVzZXJfaWQiOjE1fQ.3li2gjEpRH_3GUX-voL3v-fcWs03O9nC7uAQbNXBlWo';

/**
 * Sends a request to the Ensemble API for an organization to claim sensors
 * @param {String} accessToken - a JWT token for accessing the Ensemble API
 * @param {uuid} organizationId - a uuid for an Ensemble organization
 * @param {Array} esids - an array of ids for Ensemble devices
 * @returns {Object} - the response from the Ensemble API
 * @async
 */
async function bulkSensorClaim(accessToken, organizationId, esids) {
  try {
    const response = await axios.post(
      `${ensembleAPI}/organizations/${organizationId}/devices/bulkclaim/`,
      { esids },
      { headers: getHeaders(accessToken) },
    );
    return { ...response.data, status: response.status };
  } catch (error) {
    if (isAuthError(error)) {
      throw Error(REFRESH_REQUIRED);
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
    error.response?.data?.code === 'token_not_valid' ||
    error.response?.data?.detail === 'Authentication credentials were not provided.'
  );
}

async function fetchAndRefreshTokens() {
  const refreshToken = REFRESH; // TODO: get refresh token from database
  return refreshTokens(refreshToken);
}

async function refreshTokens(refreshToken) {
  try {
    const response = await axios.post(`${ensembleAPI}/token/refresh`, { refresh: refreshToken });
    // TODO: save new refresh and access token to database
    return response.data;
  } catch (error) {
    return { status: 500, detail: 'Failed to authenticate.' };
  }
}

async function callWithRetry(retries, ensembleAPIFunc, accessToken, ...args) {
  try {
    return ensembleAPIFunc(accessToken, ...args);
  } catch (error) {
    if (error.message === REFRESH_REQUIRED && retries > 0) {
      const result = fetchAndRefreshTokens();
      if (!result?.access || !result?.refresh) return result;
      return callWithRetry(retries - 1, ensembleAPIFunc, result.access, ...args);
    } else {
      return { status: 500, detail: 'Failed to authenticate.' };
    }
  }
}

module.exports = {
  bulkSensorClaim,
  callWithRetry,
};
