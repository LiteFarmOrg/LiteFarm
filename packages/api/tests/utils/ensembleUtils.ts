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

import mocks from '../mock.factories.js';
import { ENSEMBLE_BRAND } from '../../src/util/ensemble.js';
import { EsciReturnedPrescriptionDetails } from '../../src/util/ensembleService.types.js';
import { AddonPartner, Farm } from '../../src/models/types.js';
import LocationModel from '../../src/models/locationModel.js';
import ManagementPlanModel from '../../src/models/managementPlanModel.js';
import { getStartOfDate } from '../../src/util/date.js';
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
