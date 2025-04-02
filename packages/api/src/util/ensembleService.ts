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

export interface LocationAndCropGraph {
  farm_id: string;
  name: string;
  location_id: string;
  figure: {
    area: {
      grid_points: Point[];
    };
  };
  crop_data: {
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
  }[];
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

export interface EnsembleLocationData {
  farm_id: string;
  name: string;
  location_id: string;
  grid_points: Point[];
  crop_data: EnsembleCropData[];
}

interface OrganisationFarmData {
  [org_uuid: string]: EnsembleLocationData[];
}

/**
 * Sends farm data to Ensemble API to initiate irrigation prescription.
 *
 * For development, it can return the data instead of sending it.
 *
 * Supply a farm_id to send data for a specific farm only
 */
export const sendLocationAndCropData = async (farm_id?: string, shouldSend: string = 'false') => {
  const partner = await AddonPartnerModel.getPartnerId(ENSEMBLE_BRAND);
  if (!partner) {
    throw customError('Ensemble partner not found', 400);
  }

  let organisations: Array<{ org_uuid: string; org_pk: number; farm_id: string }> = [];

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
        crop_data: managementPlanGraph,
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

/**
 * Sends field and crop data to Ensemble API
 */
async function sendFieldAndCropDataToEsci(organisationFarmData: OrganisationFarmData) {
  try {
    const axiosObject = {
      method: 'post',
      body: organisationFarmData,
      url: `${ensembleAPI}/irrigation_prescription/request/`, // real URL TBD
    };
    const onError = () => {
      throw customError('Unable to submit field and crop data to ESci', 500);
    };

    await ensembleAPICall(axiosObject, onError);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/**
 * Selects and formats the data for Ensemble API
 */
function selectEnsembleProperties(
  cropsAndLocations: LocationAndCropGraph[],
): EnsembleLocationData[] {
  return cropsAndLocations.map((location) => {
    return {
      ...selectLocationData(location),
      crop_data: selectCropData(location.crop_data),
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

function selectCropData(crop_data: LocationAndCropGraph['crop_data']) {
  if (crop_data.length === 0) {
    return [];
  }

  return crop_data.map((managementPlan: LocationAndCropGraph['crop_data'][0]) => {
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
      ...extractPlangingDetails(managementPlan),
    };
  });
}

/*--------------------
  * Recommended TODO: check with Ensemble and remove planting_details

    The variable information in this data (based on planting method) makes it unlikely to be useful in their calcuations. If they do depend on some part of it, for us it will be more data we need to make sure never changes. I recommend we remove it entirely and only keep crop + seed date
/*--------------------*/
/**
 * Extracts planting details from the management plan to store under planting_details key
 */
function extractPlangingDetails(managementPlan: LocationAndCropGraph['crop_data'][0]) {
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
