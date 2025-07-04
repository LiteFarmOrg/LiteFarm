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

import { AxiosResponse } from 'axios';
import FarmAddonModel from '../models/farmAddonModel.js';
import TaskModel from '../models/taskModel.js';
import { Farm } from '../models/types.js';
import { customError } from '../util/customErrors.js';
import ESciAddon from '../util/ensembleService.js';
import {
  IrrigationPrescription,
  isExternalIrrigationPrescriptionArray,
} from '../util/ensembleService.types.js';
import MockAddonPartner from '../util/mockAddonPartner.js';

const PARTNER_ID_MAP: Partial<Record<number, (shouldSend?: string) => AddonPartnerFunctions>> = {
  1: (shouldSend) => {
    return shouldSend === 'true' ? ESciAddon : MockAddonPartner;
  },
};

export const getAddonPartnerIrrigationPrescriptions = async (
  farmId: Farm['farm_id'],
  startTime: string,
  endTime: string,
  shouldSend: string,
): Promise<IrrigationPrescription[]> => {
  const irrigationPrescriptions: IrrigationPrescription[] = [];
  const partnerErrors: unknown[] = [];

  // Check for registered farm addons (only esci for now)
  const farmAddonPartnerIds = await FarmAddonModel.getDistinctFarmAddonPartnerIds(farmId);

  // Return empty array if no addons
  if (!farmAddonPartnerIds.length) {
    return irrigationPrescriptions;
  }

  // Loop through addon partners
  for (const farmAddonPartnerId of farmAddonPartnerIds) {
    try {
      const addonPartner = PARTNER_ID_MAP[farmAddonPartnerId.addon_partner_id];

      if (!addonPartner) {
        continue;
      }

      const { data } = await addonPartner(shouldSend).getIrrigationPrescriptions(
        farmId,
        startTime,
        endTime,
      );

      if (Array.isArray(data) && !data?.length) {
        continue;
      }

      if (!isExternalIrrigationPrescriptionArray(data)) {
        throw customError(
          `Partner id: ${farmAddonPartnerId} - irrigation prescription data not in expected format`,
        );
      }

      // Add partner id to return object
      const irrigationPrescriptionsWithPartnerId = data.map((irrigationPrescription) => ({
        ...irrigationPrescription,
        partner_id: farmAddonPartnerId.addon_partner_id,

        // Temporary, until Ensemble returns a date
        recommended_start_datetime:
          irrigationPrescription.recommended_start_datetime ?? new Date().toISOString(),
      }));

      // Push prescriptions to return array
      irrigationPrescriptions.push(...irrigationPrescriptionsWithPartnerId);
    } catch (error) {
      partnerErrors.push(error);
    }
  }

  // Return an error if there are no prescriptions, but there is an error
  if (!irrigationPrescriptions.length && partnerErrors.length) {
    throw partnerErrors[0];
  }

  // Get irrigation tasks
  const irrigationTasksWithExternalId = await TaskModel.getIrrigationTasksWithExternalIdByFarm(
    farmId,
    irrigationPrescriptions.map(({ id }) => id),
  );

  // Format response
  const irrigationPrescriptionsWithTasks = irrigationPrescriptions.map((irrigationPrescription) => {
    const foundTask = irrigationTasksWithExternalId.find(
      (task) =>
        task.irrigation_task.irrigation_prescription_external_id === irrigationPrescription.id,
    );
    return { ...irrigationPrescription, task_id: foundTask?.task_id };
  });

  return irrigationPrescriptionsWithTasks;
};

type AddonPartnerFunctions = {
  getIrrigationPrescriptions: (
    farmId: string,
    startTime?: string,
    endTime?: string,
  ) => Promise<AxiosResponse<unknown>>;
};
