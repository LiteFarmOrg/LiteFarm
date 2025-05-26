/*
 *  Copyright (c) 2025 LiteFarm.org
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

import { AxiosResponse } from 'axios';
import mocks from '../mock.factories.js';
import { ENSEMBLE_BRAND } from '../../src/util/ensemble.js';
import {
  EsciReturnedPrescriptionDetails,
  ExternalIrrigationPrescription,
} from '../../src/util/ensembleService.types.js';
import { AddonPartner, Farm } from '../../src/models/types.js';
import LocationModel from '../../src/models/locationModel.js';
import ManagementPlanModel from '../../src/models/managementPlanModel.js';
import { addDaysToDate, getEndOfDate, getStartOfDate } from './date.js';
import { customError } from '../../src/util/customErrors.js';

export const connectFarmToEnsemble = async (farm: Farm, partner?: AddonPartner) => {
  const [farmAddon] = await mocks.farm_addonFactory({
    promisedFarm: Promise.resolve([farm]),
    promisedPartner: partner
      ? Promise.resolve([partner])
      : mocks.addon_partnerFactory({ name: ENSEMBLE_BRAND }),
  });

  return { farmAddon };
};

type fakeIrrigationPrescriptionsProps = {
  farmId: Farm['farm_id'];
  startTime?: string;
  endTime?: string;
};

/**
 * Returns a list of mocked prescriptions based on a specific farm_id.
 * TODO: refactor once it is no longer used on beta to be tests specific
 *
 * @param farm_id - The ID of the farm to retrieve mock data for.
 * @returns A promise that resolves to formatted irrigation prescription data.
 */
export const getIrrigationPrescriptions = async ({
  farmId,
  startTime,
  endTime,
}: fakeIrrigationPrescriptionsProps): Promise<ExternalIrrigationPrescription[]> => {
  const PRESCRIPTION_CONFIG = [
    {
      id: 1,
      recommendedDate: startTime ? new Date(startTime) : getStartOfDate(new Date(Date.now())),
    },
    {
      id: 2,
      recommendedDate: endTime
        ? new Date(endTime)
        : getEndOfDate(addDaysToDate(new Date(Date.now()), 1)),
    },
  ];

  const locations = await LocationModel.getCropSupportingLocationsByFarmId(farmId);
  if (!locations.length) {
    return [];
  }

  return PRESCRIPTION_CONFIG.map(({ id, recommendedDate }) => ({
    id,
    location_id: locations[0].location_id,
    management_plan_id: undefined,
    recommended_start_datetime: recommendedDate.toISOString(),
  }));
};

export const Mocks = {
  getIrrigationPrescriptions: async (farmId: string, startTime?: string, endTime?: string) =>
    ({
      data: await getIrrigationPrescriptions({ farmId, startTime, endTime }),
    }) as unknown as AxiosResponse<unknown>,
};

/* Reverse the logic generating the mock id to pull a datetime from it */
export const getDateTimeFromDayOfMonth = (day: number): Date => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), day);

  return getStartOfDate(date);
};

export const generateMockPrescriptionDetails = async (
  farm_id: string,
  ip_id: number,
): Promise<EsciReturnedPrescriptionDetails | undefined> => {
  const locations = await LocationModel.getCropSupportingLocationsByFarmId(farm_id);

  if (locations.length === 0) {
    throw customError('No crop supporting locations found for the farm', 404);
  }

  const managementPlans = await ManagementPlanModel.getManagementPlansByLocationId(
    locations[0].location_id,
  );

  // Use frontend mock's random toggle between URI and VRI
  // generate the zones if VRI -- use Duncan's function

  return {
    id: ip_id,
    location_id: locations[0].location_id,
    management_plan_id: managementPlans[0]?.management_plan_id ?? null,
    recommended_start_datetime: getDateTimeFromDayOfMonth(ip_id).toISOString(),
    pivot: {
      center: {
        // TODO -- use Duncan's function
        lat: 49.06547,
        lng: -123.15597,
      },
      radius: 150,
    },
    metadata: {
      weather_forecast: {
        temperature: 20,
        temperature_unit: '˚C',
        wind_speed: 10,
        wind_speed_unit: 'm/s',
        cumulative_rainfall: 5,
        cumulative_rainfall_unit: 'mm',
        et_rate: 2,
        et_rate_unit: 'mm/h',
        weather_icon_code: '02d',
      },
    },
    estimated_time: 2,
    estimated_time_unit: 'h',
    prescription: {
      vriData: {
        file_url: '<https://example.com/vri_data.json>',
        zones: [
          {
            soil_moisture_deficit: 50,
            application_depth: 15,
            application_depth_unit: 'mm',
            grid_points: [
              {
                lat: 49.06682,
                lng: -123.15597,
              },
              // ...
              {
                lat: 49.0663,
                lng: -123.1563,
              },
            ],
          },
          {
            soil_moisture_deficit: 60,
            application_depth: 20,
            application_depth_unit: 'mm',
            grid_points: [
              {
                lat: 49.06479,
                lng: -123.15776,
              },
              // ...
              {
                lat: 49.0654,
                lng: -123.1575,
              },
            ],
          },
        ],
      },
    },
  };
};
