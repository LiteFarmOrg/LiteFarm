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
 * @param {Response} res - The HTTP response object.
 * @param {uuid} organizationId - a uuid for an Ensemble organization
 * @param {Array} esids - an array of ids for Ensemble devices
 * @param {String} accessToken - a JWT token for accessing the Ensemble API
 * @returns {Object} - the response from the Ensemble API
 * @async
 */
async function bulkSensorClaim(organizationId, esids, accessToken) {
  try {
    const response = await axios.post(
      `${ensembleAPI}/organizations/${organizationId}/devices/bulkclaim/`,
      { esids },
      { headers: getHeaders(accessToken) },
    );
    return { ...response.data, status: response.status };
  } catch (error) {
    if (error.response?.data && error.response?.status) {
      return { ...error.response.data, status: error.response.status };
    } else {
      return { status: 500, detail: 'Failed to claim sensors.' };
    }
  }
}

/**
 * Sends a request to the Ensemble API to register a webhook to an organization
 * @param {Response} res - The HTTP response object.
 * @param {uuid} organizationId - a uuid for the organization registered with Ensemble
 * @param {String} accessToken - a JWT token for accessing the Ensemble API
 * @returns {Object} - the response from the Ensemble API
 * @async
 */

async function registerOrganizationWebhook(organizationId, accessToken) {
  try {
    const response = await axios.post(
      `${ensembleAPI}/organizations/${organizationId}/webhooks/`,
      {
        url: 'ADD Beta.litefarm or URL provided by pipedream.com',
        frequency: 15,
      },
      { headers: getHeaders(accessToken) },
    );
    return { ...response.data, status: response.status };
  } catch (error) {
    if (error.response?.data && error.response?.status) {
      return { ...error.response.data, status: error.response.status };
    } else {
      return { status: 500, detail: 'Lite Farm failed to register organization webhook.' };
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

module.exports = {
  bulkSensorClaim,
  registerOrganizationWebhook,
};
