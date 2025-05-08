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
import {
  type OrganisationFarmData,
  type LocationAndCropGraph,
  type EnsembleLocationAndCropData,
  type ManagementPlan,
  type IrrigationPrescription,
  ExternalIrrigationPrescription,
  isExternalIrrigationPrescriptionArray,
} from './ensembleService.types.js';
import TaskModel from '../models/taskModel.js';
import { AddonPartner, Farm, FarmAddon } from '../models/types.js';

/**
 * Retrieves the external organisation IDs for a specific farm and partner.
 *
 * @param farm_id - The ID of the farm to retrieve external organisation IDs for.
 * @returns A promise that resolves to the organisation IDs for the given farm and partner.
 * @throws Will throw an error if the addon partner or the farm addon is not found.
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
 * @param farm_id - The ID of the farm to retrieve external organisation IDs for.
 * @returns A promise that resolves to the organisation IDs for the given farm and partner.
 * @throws Will throw an error if the addon partner or the farm addon is not found.
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
 * Returns a list of mocked prescriptions based on a specific farm_id.
 *
 * @param farm_id - The ID of the farm to retrieve mock data for.
 * @returns A promise that resolves to formatted irrigation prescription data.
 */
export const getIrrigationPrescriptions = async (
  farmId: string,
  startTime?: string,
  endTime?: string,
): Promise<IrrigationPrescription[]> => {
  const addonPartnerId = await getAddonPartnerId();
  const externalOrganizationIds = await getExternalOrganisationIds(farmId, addonPartnerId);

  // Endpoint config
  const axiosObject = {
    method: 'get',
    url: `${ensembleAPI}/organizations/${externalOrganizationIds.org_pk}/irrigation_prescriptions`,
    params: {
      start_time: startTime, // ISO form
      end_time: endTime, // ISO form
    },
  };

  const onError = (error: AxiosError) => {
    const status = error.response?.status || 500;
    const errorDetail = error.message ? `: ${error.message}` : '';
    const message = `Error getting irrigation prescriptions${errorDetail}`;
    throw customError(message, status);
  };

  const { data } = (await ensembleAPICall(axiosObject, onError)) as {
    data: ExternalIrrigationPrescription[];
  };

  if (!data?.length) {
    return [];
  }

  if (!isExternalIrrigationPrescriptionArray(data)) {
    throw customError(`${ENSEMBLE_BRAND} irrigation prescription data not in expected format`);
  }

  const irrigationTasksWithExternalId = await TaskModel.getIrrigationTasksWithExternalIdByFarm(
    farmId,
    data.map(({ id }) => id),
  );

  const irrigationPrescriptions: IrrigationPrescription[] = data.map((irrigationPrescription) => {
    const foundTask = irrigationTasksWithExternalId.find(
      (task) =>
        task.irrigation_task.irrigation_prescription_external_id === irrigationPrescription.id,
    );
    return { ...irrigationPrescription, partner_id: addonPartnerId, task_id: foundTask?.task_id };
  });

  return irrigationPrescriptions;
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

const ESciAddon = {
  getIrrigationPrescriptions,
};
export default ESciAddon;
