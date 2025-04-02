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

interface Point {
  lat: number;
  lng: number;
}

enum PlantingMethod {
  BED_METHOD = 'bed_method',
  CONTAINER_METHOD = 'container_method',
  BROADCAST_METHOD = 'broadcast_method',
  ROW_METHOD = 'row_method',
}

type MethodDetails = {
  planting_management_plan_id?: string;
};

interface PlantingManagementPlan {
  planting_method: PlantingMethod;
  bed_method: MethodDetails | null;
  container_method: MethodDetails | null;
  broadcast_method: MethodDetails | null;
  row_method: MethodDetails | null;
}

interface ManagementPlan {
  management_plan_id: string;
  crop_management_plan: {
    seed_date: string;
    planting_management_plans: PlantingManagementPlan[];
  };
  crop_variety: {
    crop: {
      crop_common_name: string;
      crop_genus: string;
      crop_specie: string;
    };
  };
}

export interface LocationAndCropGraph {
  farm_id: string;
  name: string;
  location_id: string;
  figure: {
    area: {
      grid_points: Point[];
    };
  };
  management_plans: ManagementPlan[];
}

interface EnsembleCropData {
  crop_common_name: string;
  crop_genus: string;
  crop_specie: string;
  seed_date: string;
  planting_details?: {
    planting_method: PlantingMethod;
    [key: string]: unknown;
  };
}

export interface EnsembleLocationAndCropData {
  farm_id: string;
  name: string;
  location_id: string;
  grid_points: Point[];
  crop_data: EnsembleCropData[];
}

interface OrganisationFarmData {
  [org_uuid: string]: EnsembleLocationAndCropData[];
}

/**
Sends location and crop data to Ensemble API to initiate irrigation prescriptions
 *
 * @param {string} [farm_id] - Supply a farm_id to send data for a specific farm only. If no farm_id is provided, all farms connected to Ensemble will be sent.
 * @param {string} [shouldSend=true] - Use shouldSend = 'false' to return the data object without sending it to Ensemble (for dev + QA)
 * @returns {Promise<OrganisationFarmData | void>} - Returns organisation farm data if shouldSend is 'false'; otherwise sends the data.
 */
export const sendLocationAndCropData = async (farm_id?: string, shouldSend: string = 'true') => {
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
      throw customError('No organizations connected to Ensemble', 400);
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

  if (shouldSend === 'true') {
    await sendFieldAndCropDataToEsci(organisationFarmData);
  } else {
    return organisationFarmData;
  }
};

/* Sends field and crop data to Ensemble API */
async function sendFieldAndCropDataToEsci(organisationFarmData: OrganisationFarmData) {
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

      // See below
      ...extractPlantingDetails(managementPlan),
    };
  });
}

/*--------------------
Recommended TODO: check with Ensemble and remove planting_details

The variable information in this data (based on planting method) makes it unlikely to be useful in their calcuations. If they do depend on some part of it, for us it will be more data we need to make sure never changes. I recommend we remove it entirely and only keep crop + seed date

/* Extracts planting details from the management plan to store under planting_details key */
function extractPlantingDetails(managementPlan: ManagementPlan) {
  let planting_details: EnsembleCropData['planting_details'] | undefined;

  // because the graph was filtered on is_final_planting_management_plan = true, there will only be one planting management plan in this array
  const plantingManagementPlan =
    managementPlan.crop_management_plan?.planting_management_plans?.[0];

  if (plantingManagementPlan) {
    const key = plantingManagementPlan.planting_method.toLowerCase() as PlantingMethod;
    const details = plantingManagementPlan[key];

    if (details) {
      delete details.planting_management_plan_id;

      planting_details = {
        planting_method: plantingManagementPlan.planting_method,
        ...details,
      };
    }
  }

  return planting_details ? { planting_details } : {};
}
/*--------------------*/
