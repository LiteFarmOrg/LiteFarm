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
import { AxiosError } from 'axios';
import FarmAddonModel from '../models/farmAddonModel.js';
import AddonPartnerModel from '../models/addonPartnerModel.js';
import LocationModel from '../models/locationModel.js';
import ManagementPlanModel from '../models/managementPlanModel.js';
import { customError } from './customErrors.js';
import { ENSEMBLE_BRAND, ensembleAPI, ensembleAPICall } from './ensemble.js';
import type {
  OrganisationFarmData,
  LocationAndCropGraph,
  EnsembleLocationAndCropData,
  ManagementPlan,
} from './ensembleService.types.js';

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

  return irrigationPrescriptionsMinimalMock;
};

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
      const managementPlanGraph = await ManagementPlanModel.getManagementPlansByLocationId(
        location.location_id,
      );
      cropsAndLocations.push({
        ...location,
        management_plans: managementPlanGraph,
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
      crop_data: selectCropData(location.management_plans),
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

function selectCropData(managementPlans: ManagementPlan[]) {
  if (managementPlans.length === 0) {
    return [];
  }

  return managementPlans.map((managementPlan: ManagementPlan) => {
    const { crop_common_name, crop_genus, crop_specie } = managementPlan.crop_variety.crop;

    const seed_date = managementPlan.crop_management_plan?.seed_date;

    return {
      // plan_id for dev purposes; remove after QA on endpoint
      management_plan_id: managementPlan.management_plan_id,
      crop_common_name,
      crop_genus,
      crop_specie,
      seed_date,
    };
  });
}
