/*
 *  Copyright 2025 LiteFarm.org
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

/**
 * This file extends the Ensemble service (ensemble.js) using TypeScript. When the TS migration of ensemble.js is done, the contents of this file can be moved there.
 */
import { AxiosError, AxiosResponse } from 'axios';
import FarmAddonModel from '../models/farmAddonModel.js';
import AddonPartnerModel from '../models/addonPartnerModel.js';
import LocationModel from '../models/locationModel.js';
import ManagementPlanModel from '../models/managementPlanModel.js';
import { customError } from './customErrors.js';
import { ENSEMBLE_BRAND, ensembleAPI, ensembleAPICall } from './ensemble.js';
import {
  type OrganisationFarmData,
  type LocationAndCropGraph,
  type EnsembleLocationAndCropData,
  type ManagementPlan,
} from './ensembleService.types.js';
import { AddonPartner, Farm, FarmAddon } from '../models/types.js';

/**
 * Retrieves the addon partner ID using a partners brand name.
 *
 * @returns A promise that resolves to the addon partner id.
 * @throws Not found error as we expect that the addon partner is found.
 */
const getAddonPartnerId = async (): Promise<AddonPartner['id']> => {
  const partner = await AddonPartnerModel.getPartnerId(ENSEMBLE_BRAND);
  if (!partner) {
    throw customError(`${ENSEMBLE_BRAND} partner not found`, 404);
  }
  return partner.id;
};

/**
 * Retrieves the external organisation IDs for a specific farm and partner.
 *
 * @param farmId - The ID of the farm to retrieve external organisation IDs for.
 * @param addonPartnerId - The ID of addOnPartner for whose endpoint the ids are compatible with.
 * @returns A promise that resolves to the organisation IDs for the given farm and partner.
 * @throws Not found error as we expect that the farms addon partner ids exist.
 */
const getExternalOrganisationIds = async (
  farmId: Farm['farm_id'],
  addonPartnerId: AddonPartner['id'],
): Promise<Pick<FarmAddon, 'org_uuid' | 'org_pk'>> => {
  const farmAddonIds = await FarmAddonModel.getOrganisationIds(farmId, addonPartnerId);
  if (!farmAddonIds) {
    throw customError(`Farm not connected to ${ENSEMBLE_BRAND}`, 404);
  }
  return farmAddonIds;
};

/**
 * Returns a list of irrigation prescriptions based for a specific farm.
 *
 * @param farmId - The ID of the farm to retrieve external irrigation prescriptions for.
 * @param startTime - The 'after' date for filtering which irrigation prescriptions suggested start date will be irrigated.
 * @param endTime - The 'before' date for filtering which irrigation prescriptions suggested start date will be irrigated.
 * @returns A promise that resolves to formatted irrigation prescription data.
 */
export const getIrrigationPrescriptions = async (
  farmId: string,
  startTime?: string,
  endTime?: string,
) => {
  // Get external organisation ids
  const addonPartnerId = await getAddonPartnerId();
  const externalOrganizationIds = await getExternalOrganisationIds(farmId, addonPartnerId);

  // Endpoint config
  const axiosObject = {
    method: 'get',
    url: `${ensembleAPI}/organizations/${externalOrganizationIds.org_pk}/irrigation_prescriptions`,
    params: {
      start_time: startTime, // ISO format
      end_time: endTime, // ISO format
    },
  };

  const onError = (error: AxiosError) => {
    const status = error.response?.status || 500;
    const errorDetail = error.message ? `: ${error.message}` : '';
    const message = `Error getting irrigation prescriptions${errorDetail}`;
    throw customError(message, status);
  };

  // Get and check data
  return ensembleAPICall(axiosObject, onError);
};

// TODO: After LF-4674 is merged, this can be removed and that function used instead
export const mockGetFarmIrrigationPrescriptions = async (farm_id: string) => {
  const partner = await AddonPartnerModel.getPartnerId(ENSEMBLE_BRAND);

  if (!partner) {
    throw customError('Ensemble partner not found', 400);
  }

  const farmEnsembleAddon = await FarmAddonModel.getOrganisationIds(farm_id, partner.id);

  if (!farmEnsembleAddon) {
    return [];
  }

  // In the real function, call Ensemble API here
  // Pass organization_id and the correct time parameters

  const ONE_DAY = 24 * 60 * 60 * 1000; // in ms

  const irrigationPrescriptionsMinimalMock = [
    {
      id: new Date().getUTCDay(), // 0-6, 0 = Sunday
      recommended_start_datetime: new Date().toISOString(),
    },
    {
      id: new Date(Date.now() + ONE_DAY).getUTCDay(),
      recommended_start_datetime: new Date(Date.now() + ONE_DAY).toISOString(),
    },
  ];

  const mockData = await mockFetchIrrigationPrescriptionsFromEnsemble(farmEnsembleAddon.org_pk);

  return mockData ?? irrigationPrescriptionsMinimalMock;
};

// Mock Ensemble API call allows mocking axios in tests
export async function mockFetchIrrigationPrescriptionsFromEnsemble(org_pk: number) {
  try {
    const axiosObject = {
      method: 'get',
      url: `${ensembleAPI}/${org_pk}/irrigation_prescriptions/`,
    };

    const onError = (error: AxiosError) => {
      const status = error.response?.status || 500;
      const errorDetail = error.message ? `: ${error.message}` : '';
      const message = `Error fetching IPs from ESci${errorDetail}`;
      throw customError(message, status);
    };

    const { data } = (await ensembleAPICall(axiosObject, onError)) as AxiosResponse;

    return data;
  } catch (error) {
    console.log(error);
    return;
  }
}

/**
Gathers location and crop data to Ensemble API to initiate irrigation prescriptions
 *
 * @param {string} [farm_id] - Supply a farm_id to get data for a specific farm only. If no farm_id is provided, all farms connected to Ensemble will be queried.
 * @returns {Promise<OrganisationFarmData>} - Returns organisation farm data
 */
export const getOrgLocationAndCropData = async (farm_id?: string) => {
  const partner = await AddonPartnerModel.getPartnerId(ENSEMBLE_BRAND);
  if (!partner) {
    throw customError('Ensemble partner not found', 400);
  }

  let organisations = [];

  if (farm_id) {
    const farmEnsembleAddon = await FarmAddonModel.getOrganisationIds(farm_id, partner.id);
    if (!farmEnsembleAddon) {
      throw customError('Farm not connected to Ensemble', 400);
    }
    organisations = [{ ...farmEnsembleAddon, farm_id }];
  } else {
    organisations = await FarmAddonModel.getAllOrganisationIds(partner.id);
    if (!organisations || organisations.length === 0) {
      return {};
    }
  }

  const organisationFarmData: OrganisationFarmData = {};

  for (const org of organisations) {
    const locations = await LocationModel.getCropSupportingLocationsByFarmId(org.farm_id);

    const cropsAndLocations: LocationAndCropGraph[] = [];

    for (const location of locations) {
      const managementPlanGraph = await ManagementPlanModel.getMostRecentManagementPlanByLocationId(
        location.location_id,
      );
      cropsAndLocations.push({
        ...location,
        management_plan: managementPlanGraph,
      });
    }

    (organisationFarmData[org.org_uuid] ??= []).push(
      ...selectEnsembleProperties(cropsAndLocations),
    );
  }

  return organisationFarmData;
};

/* Sends field and crop data to Ensemble API */
export async function sendFieldAndCropDataToEsci(organisationFarmData: OrganisationFarmData) {
  try {
    const axiosObject = {
      method: 'post',
      body: organisationFarmData,
      url: `${ensembleAPI}/irrigation_prescription/request/`, // real URL TBD
    };

    const onError = (error: AxiosError) => {
      const status = error.response?.status || 500;
      const errorDetail = error.message ? `: ${error.message}` : '';
      const message = `Error sending field and crop data to ESci${errorDetail}`;
      throw customError(message, status);
    };

    await ensembleAPICall(axiosObject, onError);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/* Selects and formats the data for POST to Ensemble */
function selectEnsembleProperties(
  cropsAndLocations: LocationAndCropGraph[],
): EnsembleLocationAndCropData[] {
  return cropsAndLocations.map((location) => {
    return {
      ...selectLocationData(location),
      crop_data: selectCropData(location.management_plan),
    };
  });
}

function selectLocationData(location: LocationAndCropGraph) {
  const { farm_id, name, location_id, figure } = location;
  return {
    farm_id,
    name,
    location_id,
    grid_points: figure.area.grid_points,
  };
}

function selectCropData(managementPlan: ManagementPlan) {
  if (!managementPlan) {
    return [];
  }

  const { crop_common_name, crop_genus, crop_specie } = managementPlan.crop_variety.crop;

  const seed_date = managementPlan.crop_management_plan?.seed_date;

  return [
    {
      management_plan_id: managementPlan.management_plan_id,
      crop_common_name,
      crop_genus,
      crop_specie,
      seed_date,
    },
  ];
}

/* Update Ensemble to indicate an irrigation prescription has been approved */
export async function patchIrrigationPrescriptionApproval(id: number) {
  try {
    const axiosObject = {
      method: 'patch',
      body: {
        approved: true,
      },
      url: `${ensembleAPI}/irrigation_prescription/${id}/`, // real URL TBD
    };

    const onError = (error: AxiosError) => {
      const status = error.response?.status || 500;
      const errorDetail = error.message ? `: ${error.message}` : '';
      const message = `Error patching approval status with ESci${errorDetail}`;
      throw customError(message, status);
    };

    await ensembleAPICall(axiosObject, onError);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const ESciAddon = {
  getIrrigationPrescriptions,
};
export default ESciAddon;
