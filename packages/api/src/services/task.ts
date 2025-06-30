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

import { patchIrrigationPrescriptionApproval } from '../util/ensembleService.js';
import AddonPartnerModel from '../models/addonPartnerModel.js';
import FarmAddonModel from '../models/farmAddonModel.js';
import { ENSEMBLE_BRAND } from '../util/ensemble.js';
import { IRRIGATION_TASK, TASK_TYPES } from '../util/task.js';

type TaskType = (typeof TASK_TYPES)[number];

interface Task {
  irrigation_task?: {
    irrigation_prescription_external_id?: number;
  };
}

/**
 * Non‑blocking post‑response side effects; do not send HTTP responses here
 */
export async function triggerPostTaskCreatedActions(
  typeOfTask: TaskType,
  createdTask: Task,
  farm_id: string,
) {
  try {
    switch (typeOfTask) {
      case IRRIGATION_TASK:
        {
          const esciExternalId = createdTask.irrigation_task?.irrigation_prescription_external_id;

          if (esciExternalId) {
            // Using the model methods here, and not the Ensemble helper functions that send HTTP responses for the errors, to avoid 'Cannot set headers after they are sent to the client'
            const ensembleRecord = await AddonPartnerModel.getPartnerId(ENSEMBLE_BRAND);
            if (!ensembleRecord) {
              console.error(`Partner not found for ${ENSEMBLE_BRAND}`);
              return;
            }
            const farmEnsembleAddon = await FarmAddonModel.getOrganisationIds(
              farm_id,
              ensembleRecord.id,
            );
            if (!farmEnsembleAddon) {
              console.error(
                `Organization not found for farm ${farm_id} and partner ${ENSEMBLE_BRAND}`,
              );
              return;
            }

            await patchIrrigationPrescriptionApproval(esciExternalId, farmEnsembleAddon.org_pk);
          }
        }
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(error);
  }
}
