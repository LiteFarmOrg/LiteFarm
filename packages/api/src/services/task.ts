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

import TaskModel from '../models/taskModel.js';
import {
  safeGetFarmEnsembleAddonIds,
  patchIrrigationPrescriptionApproval,
} from '../util/ensembleService.js';
import { IRRIGATION_TASK, TASK_TYPES } from '../util/task.js';
import type { Task as BaseTask } from '../models/types.js';

type TaskType = (typeof TASK_TYPES)[number];

interface Task extends BaseTask {
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
            const farmAddon = await safeGetFarmEnsembleAddonIds(farm_id);
            if (!farmAddon) {
              console.error(`Ensemble organization not found for farm ${farm_id}`);
              return;
            }
            await patchIrrigationPrescriptionApproval(esciExternalId, farmAddon.org_pk, true);
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

/**
 * Non‑blocking post‑response side effects; do not send HTTP responses here
 */
export async function triggerPostTaskDeletedActions(
  typeOfTask: TaskType,
  deletedTask: Task,
  farm_id: string,
) {
  try {
    switch (typeOfTask) {
      case IRRIGATION_TASK:
        {
          const { irrigation_prescription_external_id: esciExternalId } =
            (await TaskModel
              // @ts-expect-error known issue on models
              .query()
              .joinRelated('irrigation_task')
              .select('irrigation_task.irrigation_prescription_external_id')
              .where('task.task_id', deletedTask.task_id)
              .first()) || {};

          if (esciExternalId) {
            const farmAddon = await safeGetFarmEnsembleAddonIds(farm_id);
            if (!farmAddon) {
              console.error(`Ensemble organization not found for farm ${farm_id}`);
              return;
            }
            await patchIrrigationPrescriptionApproval(esciExternalId, farmAddon.org_pk, false);
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
