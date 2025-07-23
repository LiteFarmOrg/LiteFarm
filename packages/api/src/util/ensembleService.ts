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
import { customError, LiteFarmCustomError } from './customErrors.js';
import { ENSEMBLE_BRAND, ensembleAPI, ensembleAPICall } from './ensemble.js';
import type {
  AllOrganisationsFarmData,
  LocationAndCropGraph,
  EnsembleLocationAndCropData,
  ManagementPlan,
  EsciReturnedPrescriptionDetails,
  IrrigationPrescriptionDetails,
  EsciWeatherUnits,
  LiteFarmWeatherUnits,
  VriPrescriptionData,
} from './ensembleService.types.js';
import { AddonPartner, Farm, FarmAddon } from '../models/types.js';
import { generateMockPrescriptionDetails } from './generateMockPrescriptionDetails.js';
import { getAreaOfPolygon } from './geoUtils.js';

/**
 * Retrieves Ensemble's addon partner id.
 *
 * @returns A promise that resolves to the addon partner id.
 * @throws Not found error as we expect that the addon partner is found.
 */
const getEnsemblePartnerId = async (): Promise<AddonPartner['id']> => {
  const partner = await AddonPartnerModel.getPartnerId(ENSEMBLE_BRAND);
  if (!partner) {
    throw customError(`${ENSEMBLE_BRAND} partner not found`, 404);
  }
  return partner.id;
};

/**
 * Retrieves the Ensemble addon partner ids for the given farm, and throws an error if the farm is not connected to Ensemble.
 *
 * @param farmId - The ID of the farm to retrieve external organisation IDs for.
 * @returns A promise that resolves to the organisation IDs for the given farm and partner.
 * @throws Not found error as we expect that the farms addon partner ids exist.
 */
export const getFarmEnsembleAddonIds = async (
  farmId: Farm['farm_id'],
): Promise<Pick<FarmAddon, 'org_uuid' | 'org_pk'>> => {
  const esciPartnerId = await getEnsemblePartnerId();
  const farmAddonIds = await FarmAddonModel.getOrganisationIds(farmId, esciPartnerId);
  if (!farmAddonIds) {
    throw customError(`Farm not connected to ${ENSEMBLE_BRAND}`, 404);
  }
  return farmAddonIds;
};

/**
 * Safely retrieves the Ensemble addon partner ids for the given farm without throwing errors.
 * This is designed for non-blocking flows where Ensemble connectivity is optional, such as:
 * - Notification controller (postDailyNewIrrigationPrescriptions)
 * - Post-response side effects (triggerPostTaskCreatedActions)
 */
export const safeGetFarmEnsembleAddonIds = async (
  farmId: Farm['farm_id'],
): Promise<Pick<FarmAddon, 'org_uuid' | 'org_pk'> | null> => {
  try {
    const partner = await AddonPartnerModel.getPartnerId(ENSEMBLE_BRAND);
    if (!partner) return null;

    const farmAddonIds = await FarmAddonModel.getOrganisationIds(farmId, partner.id);
    if (!farmAddonIds) return null;

    return farmAddonIds;
  } catch (error) {
    console.error(`Error checking Ensemble connection for farm ${farmId}:`, error);
    return null;
  }
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
  const externalOrganizationIds = await getFarmEnsembleAddonIds(farmId);

  // Endpoint config
  const axiosObject = {
    method: 'get',
    url: `${ensembleAPI}/organizations/${externalOrganizationIds.org_pk}/prescriptions/`,
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

/**
 * Retrieves detailed information for a specific irrigation prescription.
 *
 * @param {string} farm_id - The ID of the farm to retrieve the irrigation prescription for.
 * @param {number} irrigationPrescriptionId - The ID of the irrigation prescription to retrieve.
 * @returns {Promise<IrrigationPrescriptionDetails>} A promise that resolves to the irrigation prescription details with water consumption estimate.
 * @throws {Error} Throws an error if the prescription is not found, belongs to a different farm, or if data is missing.
 */
export const getEnsembleIrrigationPrescriptionDetails = async (
  farm_id: string,
  irrigationPrescriptionId: number,
): Promise<IrrigationPrescriptionDetails> => {
  // Validate farm connection to Ensemble (will throw if not connected)
  const { org_pk } = await getFarmEnsembleAddonIds(farm_id);

  // Fetch prescription data (real or mock)
  const irrigationPrescription =
    process.env.NODE_ENV === 'development' && process.env.USE_IP_MOCK_DETAILS
      ? await generateMockPrescriptionDetails({ farm_id, irrigationPrescriptionId })
      : await fetchIrrigationPrescriptionDetails(irrigationPrescriptionId, org_pk);

  if (!irrigationPrescription) {
    throw customError(`Irrigation prescription with id ${irrigationPrescriptionId} not found`, 404);
  }

  // Validate prescription location and farm association
  const prescriptionFarmRecord = await LocationModel.getFarmIdByLocationId(
    irrigationPrescription.location_id,
  );
  if (!prescriptionFarmRecord) {
    throw customError(
      `location_id on IP ${irrigationPrescriptionId} does not exist or has been deleted`,
      404,
    );
  }
  if (prescriptionFarmRecord.farm_id !== farm_id) {
    throw customError(
      `Irrigation prescription ${irrigationPrescriptionId} belongs to a different farm`,
      403,
    );
  }

  // Transform prescription data to LiteFarm format and validate details
  const mappedPrescription = transformEnsemblePrescription(irrigationPrescription);
  const prescriptionDetails = mappedPrescription.prescription;
  if (!prescriptionDetails) {
    throw customError('Prescription data is missing', 500);
  }

  // Calculate and return water consumption
  const waterConsumptionL =
    'uriData' in prescriptionDetails
      ? calculateURIWaterConsumption(
          prescriptionDetails,
          mappedPrescription.pivot?.radius ?? 0,
          mappedPrescription.pivot?.arc?.start_angle,
          mappedPrescription.pivot?.arc?.end_angle,
        )
      : calculateVRIWaterConsumption(prescriptionDetails);

  return {
    ...mappedPrescription,
    estimated_water_consumption: waterConsumptionL,
    estimated_water_consumption_unit: 'l',
  };
};

/**
 * Maps units from Ensemble API format to LiteFarm format.
 *
 * @param {EsciReturnedPrescriptionDetails} prescription - The prescription details from Ensemble API.
 * @returns {EsciReturnedPrescriptionDetails} The prescription with units mapped to LiteFarm format.
 */
const mapEnsembleUnitsToLiteFarmUnits = (prescription: EsciReturnedPrescriptionDetails) => {
  const { metadata, ...rest } = prescription;

  const mapWeatherUnit = (unit: EsciWeatherUnits): LiteFarmWeatherUnits => {
    if (unit === '˚C') return 'C';
    return unit;
  };

  const mappedWeatherForecast = {
    ...metadata.weather_forecast,
    temperature_unit: mapWeatherUnit(metadata.weather_forecast.temperature_unit),
    wind_speed_unit: mapWeatherUnit(metadata.weather_forecast.wind_speed_unit),
    cumulative_rainfall_unit: mapWeatherUnit(metadata.weather_forecast.cumulative_rainfall_unit),
  };

  return {
    ...rest,
    metadata: {
      weather_forecast: mappedWeatherForecast,
    },
  };
};

/**
 * Processes pivot data from Ensemble API format to LiteFarm format.
 * Converts string values to numbers and swaps angle directions from CCW to CW.
 *
 * @param {EsciReturnedPrescriptionDetails['pivot']} pivot - The pivot data from Ensemble API.
 * @returns {EsciReturnedPrescriptionDetails['pivot']} The processed pivot data.
 */
const processPivotData = (pivot: EsciReturnedPrescriptionDetails['pivot']) => {
  if (!pivot) return null;

  return {
    ...pivot,
    center: {
      lat: Number(pivot.center.lat),
      lng: Number(pivot.center.lng),
    },
    arc: pivot.arc
      ? {
          start_angle: Number(pivot.arc?.end_angle),
          end_angle: Number(pivot.arc?.start_angle), // defined CCW but we use CW
        }
      : undefined,
  };
};

/**
 * Transforms prescription data from Ensemble API format to LiteFarm format.
 * Maps units and processes pivot data to match LiteFarm's expected structure.
 */
const transformEnsemblePrescription = (prescription: EsciReturnedPrescriptionDetails) => {
  const unitsMappedPrescription = mapEnsembleUnitsToLiteFarmUnits(prescription);

  return {
    ...unitsMappedPrescription,
    pivot: processPivotData(unitsMappedPrescription.pivot),
  };
};

/**
 * Calculates water consumption for Uniform Rate Irrigation (URI),
 * supporting both full circles and partial circle sectors.
 *
 * @param {EsciReturnedPrescriptionDetails['prescription']} prescription - The prescription object containing URI data.
 * @param {number} pivotRadius - The radius of the pivot irrigation system in meters.
 * @param {number} [startAngle] - Optional start angle in degrees (if defining a sector).
 * @param {number} [endAngle] - Optional end angle in degrees (if defining a sector).
 * @returns {number} The calculated water consumption in liters.
 */
const calculateURIWaterConsumption = (
  prescription: EsciReturnedPrescriptionDetails['prescription'],
  pivotRadius: number,
  startAngle?: number,
  endAngle?: number,
): number => {
  const applicationDepthMm = prescription?.uriData?.application_depth ?? 0;

  let pivotAreaM2;
  if (startAngle !== undefined && endAngle !== undefined) {
    const angleDiff = (startAngle - endAngle + 360) % 360 || 360;
    const proportion = angleDiff / 360;
    pivotAreaM2 = proportion * Math.PI * Math.pow(pivotRadius, 2);
  } else {
    pivotAreaM2 = Math.PI * Math.pow(pivotRadius, 2);
  }
  return pivotAreaM2 * applicationDepthMm;
};

/**
 * Calculates water consumption for Variable Rate Irrigation (VRI).
 *
 * @param {EsciReturnedPrescriptionDetails['prescription']} prescription - The prescription object containing VRI data.
 * @returns {number} The calculated water consumption in liters.
 */
const calculateVRIWaterConsumption = (
  prescription: EsciReturnedPrescriptionDetails['prescription'],
): number => {
  const prescriptionZones: VriPrescriptionData[] = prescription.vriData!.zones;

  return prescriptionZones.reduce((acc, zone) => {
    const zoneAreaM2 = getAreaOfPolygon(zone.grid_points) ?? 0;
    const zoneDepthMm = zone.application_depth;

    return acc + zoneAreaM2 * zoneDepthMm;
  }, 0);
};

/**
Gathers location and crop data to Ensemble API to initiate irrigation prescriptions
 *
 * @param {string} [farm_id] - Supply a farm_id to get data for a specific farm only. If no farm_id is provided, all farms connected to Ensemble will be queried.
 * @returns {Promise<AllOrganisationsFarmData>} - Returns organisation farm data
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

  const organisationFarmData: AllOrganisationsFarmData = {};

  for (const org of organisations) {
    if (!org.org_pk) {
      continue;
    }
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

    (organisationFarmData[org.org_pk] ??= []).push(...selectEnsembleProperties(cropsAndLocations));
  }

  return organisationFarmData;
};

/**
 * Process and send data for multiple organizations to Ensemble API sequentially
 * Continues processing other organizations even if individual requests fail
 */
export async function sendAllFieldAndCropDataToEsci(allFarmData: AllOrganisationsFarmData) {
  const results = [];

  for (const [orgPk, orgData] of Object.entries(allFarmData)) {
    if (!orgData || orgData.length === 0) {
      continue;
    }
    try {
      await sendFieldAndCropDataToEsci(orgData, Number(orgPk));
      results.push({
        organisationId: Number(orgPk),
        status: 'success',
      });
    } catch (error) {
      const { message, code } = error as LiteFarmCustomError;

      results.push({
        organisationId: orgPk,
        status: 'error',
        code,
        message,
      });
    }
  }

  return results;
}

/**
 * Sends field and crop data to Ensemble API for a single organization
 */
export async function sendFieldAndCropDataToEsci(
  organisationFarmData: EnsembleLocationAndCropData[],
  org_pk: number,
) {
  try {
    const axiosObject = {
      method: 'post',
      data: organisationFarmData,
      url: `${ensembleAPI}/organizations/${org_pk}/prescriptions/`,
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
export async function patchIrrigationPrescriptionApproval(id: number, org_pk: number) {
  try {
    const axiosObject = {
      method: 'patch',
      data: {
        approved: true,
      },
      url: `${ensembleAPI}/organizations/${org_pk}/prescriptions/${id}/`,
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

/* Fetch details for a particular irrigation_prescription by id */
export async function fetchIrrigationPrescriptionDetails(
  id: number,
  org_pk: number,
): Promise<EsciReturnedPrescriptionDetails> {
  try {
    const axiosObject = {
      method: 'get',
      url: `${ensembleAPI}/organizations/${org_pk}/prescriptions/${id}/`,
    };

    const onError = (error: AxiosError) => {
      const status = error.response?.status || 500;
      const errorDetail = error.message ? `: ${error.message}` : '';
      const message = `Error fetching details for IP ${id} from ESci${errorDetail}`;
      throw customError(message, status);
    };

    const { data: irrigationPrescription } = await ensembleAPICall(axiosObject, onError);

    return irrigationPrescription;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const ESciAddon = {
  getIrrigationPrescriptions,
};
export default ESciAddon;
