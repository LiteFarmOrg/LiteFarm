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
import { Location } from '../../src/models/types.js';

export interface Farm {
  farm_id: string;
}

export const connectFarmToEnsemble = async (farm: Farm) => {
  const [farmAddon] = await mocks.farm_addonFactory({
    promisedFarm: Promise.resolve([farm]),
    promisedPartner: mocks.addon_partnerFactory({ name: ENSEMBLE_BRAND }),
  });

  return { farmAddon };
};

/**
 * Returns a list of mocked prescriptions based on a specific farm_id.
 *
 * @param farm_id - The ID of the farm to retrieve mock data for.
 * @returns A promise that resolves to formatted irrigation prescription data.
 */
export const fakeIrrigationPrescriptions = async (
  farmId: Farm['farm_id'],
  prescriptionIds: IrrigationPrescription['id'][] = [1, 2],
  locationId: Location['location_id'],
): Promise<IrrigationPrescription[]> => {
  const PARTNER_ID = 1;
  const ONE_HOUR_IN_MS = 1000 * 60 * 60;
  const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

  const irrigationTasksWithExternalId =
    await TaskModel.getIrrigationTasksWithExternalIdByFarm(farmId);

  const irrigationTask1 = irrigationTasksWithExternalId.find(
    (task) => task.irrigation_task.irrigation_prescription_external_id === prescriptionIds[0],
  );
  const irrigationTask2 = irrigationTasksWithExternalId.find(
    (task) => task.irrigation_task.irrigation_prescription_external_id === prescriptionIds[1],
  );

  return [
    {
      id: prescriptionIds[0],
      location_id: irrigationTask1?.irrigation_task.location_id ?? locationId,
      recommended_start_datetime: new Date(Date.now() - ONE_HOUR_IN_MS).toISOString(),
      partner_id: PARTNER_ID,
      task_id: irrigationTask1?.task_id,
    },
    {
      id: prescriptionIds[1],
      location_id: irrigationTask2?.irrigation_task.location_id ?? locationId,
      recommended_start_datetime: new Date(Date.now() + ONE_DAY_IN_MS).toISOString(),
      partner_id: PARTNER_ID,
      task_id: irrigationTask1?.task_id,
    },
  ];
};
