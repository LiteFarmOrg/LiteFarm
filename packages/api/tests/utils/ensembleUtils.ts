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
import { ExternalIrrigationPrescription } from '../../src/util/ensembleService.types.js';
import { AddonPartner, Farm } from '../../src/models/types.js';
import LocationModel from '../../src/models/locationModel.js';
import { addDaysToDate, getEndOfDate, getStartOfDate } from './date.js';
import { AxiosResponse } from 'axios';

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
