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

import { ExternalIrrigationPrescription } from './ensembleService.types.js';
import { Farm } from '../models/types.js';
import LocationModel from '../models/locationModel.js';
import { addDaysToDate } from './date.js';
import { AxiosResponse } from 'axios';

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
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const tomorrowString = addDaysToDate(today, 1).toISOString().split('T')[0];

  const startDate = startTime ? new Date(startTime) : today;

  const PRESCRIPTION_CONFIG = [
    {
      id: startDate.getUTCDate(),
      recommendedDate: startTime ?? todayString,
    },
    {
      id: startDate.getUTCDate() + 1,
      recommendedDate: endTime ?? tomorrowString,
    },
  ];

  const locations = await LocationModel.getCropSupportingLocationsByFarmId(farmId);
  if (!locations.length) {
    return [];
  }

  return PRESCRIPTION_CONFIG.map(({ id, recommendedDate }) => ({
    id,
    location_id: locations[0].location_id,
    farm_id: farmId,
    system_name: 'NW System',
    system_id: 5,
    management_plan_id: null,
    recommended_start_date: recommendedDate,
  }));
};

const MockAddonPartner = {
  getIrrigationPrescriptions: async (farmId: string, startTime?: string, endTime?: string) =>
    ({
      data: await getIrrigationPrescriptions({ farmId, startTime, endTime }),
    }) as unknown as AxiosResponse<unknown>,
};

export default MockAddonPartner;
