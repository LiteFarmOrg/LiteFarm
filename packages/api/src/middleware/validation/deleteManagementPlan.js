/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (authFarmId.js) is part of LiteFarm.
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

//import { Model } from 'objection';
import {
  getManagementTasksWithCountByManagementPlanId,
  getTransplantTasksByManagementPlanId,
  getPlantTasksByManagementPlanId,
  getCompletedOrAbandonedTasks,
} from '../../controllers/managementPlanController.js';

async function validateManagementPlanDependency(req, res, next) {
  const { management_plan_id } = req.params;

  const tasksWithManagementPlanCount = await getManagementTasksWithCountByManagementPlanId(
    management_plan_id,
  );
  const transplantTasks = await getTransplantTasksByManagementPlanId(management_plan_id);
  const plantTasks = await getPlantTasksByManagementPlanId(management_plan_id);

  // Reject deletion if any of the tasks are completed or abandoned
  const allTaskIds = [...tasksWithManagementPlanCount, ...transplantTasks, ...plantTasks].map(
    ({ task_id }) => task_id,
  );
  const completedOrAbandonedTasksByIds = await getCompletedOrAbandonedTasks(allTaskIds);
  if (completedOrAbandonedTasksByIds.length) {
    return res.status(400).send('Cannot delete management plan with completed or abandonded tasks');
  }

  return next();
}

export default validateManagementPlanDependency;
