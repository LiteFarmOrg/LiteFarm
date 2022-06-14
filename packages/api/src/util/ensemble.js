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

const FarmModel = require('../models/farmModel');
const FarmExternalIntegrationsModel = require('../models/farmExternalIntegrationsModel');
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
      const response = await axios.post(
        `${ensembleAPI}/organizations/`,
        {
          name: data.farm_name,
          phone: data.farm_phone_number,
        },
        {
          headers: getHeaders(accessToken),
        },
      );
      return await FarmExternalIntegrationsModel.query().insert({
        farm_id: farmId,
        partner_id: 1,
        registration_uuid: response.data.uuid,
      });
    } else {
      return existingIntegration;
    }
  } catch (e) {
    throw new Error('Unable to create ESCI organization');
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
  createOrganization,
};
