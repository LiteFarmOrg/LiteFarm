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
import { IrrigationPrescription } from '../../src/util/ensembleService.types.js';
import TaskModel from '../../src/models/taskModel.js';
import { AddonPartner, Farm, Location, ManagementPlan } from '../../src/models/types.js';

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
  prescriptionIds?: IrrigationPrescription['id'][];
  locationIds?: Location['location_id'][];
  managementPlanIds?: ManagementPlan['management_plan_id'][];
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
export const fakeIrrigationPrescriptions = async ({
  farmId,
  prescriptionIds = [1, 2],
  locationIds,
  managementPlanIds,
  startTime,
  endTime,
}: fakeIrrigationPrescriptionsProps): Promise<IrrigationPrescription[]> => {
  const PARTNER_ID = 1;
  const ONE_HOUR_IN_MS = 1000 * 60 * 60;
  const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

  const irrigationTasksWithExternalId = await TaskModel.getIrrigationTasksWithExternalIdByFarm(
    farmId,
    prescriptionIds,
  );

  const irrigationTask1 = irrigationTasksWithExternalId.find(
    (task) => task.irrigation_task.irrigation_prescription_external_id === prescriptionIds[0],
  );
  const irrigationTask2 = irrigationTasksWithExternalId.find(
    (task) => task.irrigation_task.irrigation_prescription_external_id === prescriptionIds[1],
  );

  const locationId1 = irrigationTask1?.irrigation_task?.location_id ?? locationIds?.[0];
  const locationId2 =
    irrigationTask2?.irrigation_task.location_id ?? locationIds?.[1] ?? locationId1;

  if (!locationId1 || !locationId2) {
    return [];
  }

  return [
    {
      id: prescriptionIds[0],
      location_id: locationId1,
      management_plan_id: managementPlanIds?.[0] || undefined,
      recommended_start_datetime: startTime
        ? startTime
        : new Date(Date.now() - ONE_HOUR_IN_MS).toISOString(),
      partner_id: PARTNER_ID,
      task_id: irrigationTask1?.task_id,
    },
    {
      id: prescriptionIds[1],
      location_id: locationId2,
      management_plan_id: managementPlanIds?.[1] || undefined,
      recommended_start_datetime: endTime
        ? endTime
        : new Date(Date.now() + ONE_DAY_IN_MS).toISOString(),
      partner_id: PARTNER_ID,
      task_id: irrigationTask1?.task_id,
    },
  ];
};
