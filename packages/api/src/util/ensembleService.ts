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
import { ENSEMBLE_BRAND } from './ensemble.js';

interface Point {
  lat: number;
  lng: number;
}

type MethodDetails = {
  planting_management_plan_id?: string;
};

interface PlantingManagementPlan {
  bed_method: MethodDetails | null;
  container_method: MethodDetails | null;
  broadcast_method: MethodDetails | null;
  row_method: MethodDetails | null;
}

interface LocationAndCropGraph {
  farm_id: string;
  name: string;
  location_id: string;
  figure: {
    area: {
      grid_points: Point[];
    };
  };
  crop_data: {
    crop_management_plan: {
      seed_date: string;
      planting_management_plans: PlantingManagementPlan[];
    };
    crop_variety: {
      crop: {
        crop_common_name: string;
        crop_genus: string;
        crop_species: string;
        crop_group: string;
      };
    };
  }[];
}

interface EnsembleCropData {
  crop_common_name: string;
  crop_genus: string;
  crop_species: string;
  crop_group: string;
  seed_date: string;
}

export interface EnsembleLocationData {
  farm_id: string;
  name: string;
  location_id: string;
  // type: string;
  grid_points: Point[];
  crop_data: EnsembleCropData[] | string;
}

interface OrganisationFarmData {
  [org_uuid: string]: EnsembleLocationData[];
}

/**
 * Sends farm data to Ensemble API to initiate irrigation prescription.
 *
 * Currently set up to send data for one farm or all of them, but depending on our needs we may want to keep just one or the other
 *
 * @param {uuid} farm_id
 * @returns {Promise<void>}
 * @async
 */
export const sendIrrigationData = async (farm_id?: string, trimmed: string = 'true') => {
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

    if (trimmed === 'true') {
      (organisationFarmData[org.org_uuid] ??= []).push(
        ...selectEnsembleProperties(cropsAndLocations),
      );
    } else {
      /* @ts-expect-error not typing this return of the full graph; it is for dev purposes */
      (organisationFarmData[org.org_uuid] ??= []).push(...cropsAndLocations);
    }
  }

  return organisationFarmData;
};

const selectEnsembleProperties = (
  cropsAndLocations: LocationAndCropGraph[],
): EnsembleLocationData[] => {
  return cropsAndLocations.map((location) => {
    return {
      ...selectLocationData(location),
      crop_data: selectCropData(location.crop_data),
    };
  });
};

const selectLocationData = (location: LocationAndCropGraph) => {
  const { farm_id, name, location_id, figure } = location;
  return {
    farm_id,
    name,
    location_id,
    // type: figure.type,
    grid_points: figure.area.grid_points,
  };
};

const selectCropData = (crop_data: LocationAndCropGraph['crop_data']) => {
  if (crop_data.length === 0) {
    return [];
  }

  // TODO: is something like this wanted or should multiple crops be returned anyway?
  if (crop_data.length > 1) {
    return 'ERR! More than one crop on this location';
  }

  return crop_data.map((singleCrop: LocationAndCropGraph['crop_data'][0]) => {
    const { crop_common_name, crop_genus, crop_species, crop_group } = singleCrop.crop_variety.crop;

    const seed_date = singleCrop.crop_management_plan?.seed_date;

    const { bed_method, container_method, broadcast_method, row_method } =
      singleCrop.crop_management_plan?.planting_management_plans?.[0] || {};

    const methodObj = bed_method
      ? { bed_method }
      : container_method
        ? { container_method }
        : broadcast_method
          ? { broadcast_method }
          : row_method
            ? { row_method }
            : {};

    removePlanIdFromMethod(methodObj);

    return {
      crop_common_name,
      crop_genus,
      crop_species,
      crop_group,
      seed_date,
      ...methodObj,
    };
  });
};

const removePlanIdFromMethod = (methodObj: Partial<PlantingManagementPlan>) => {
  const keys: (keyof PlantingManagementPlan)[] = [
    'bed_method',
    'container_method',
    'broadcast_method',
    'row_method',
  ];
  keys.forEach((key) => {
    if (methodObj[key]) {
      delete methodObj[key].planting_management_plan_id;
    }
  });
};
