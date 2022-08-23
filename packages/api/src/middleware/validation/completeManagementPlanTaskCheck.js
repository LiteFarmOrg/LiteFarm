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

import taskModel from '../../models/taskModel.js';

const validateManagementPlanTasks = async (req, res, next) => {
  const tasks = await taskModel
    .query()
    .join('management_tasks', 'management_tasks.task_id', 'task.task_id')
    .join(
      'planting_management_plan',
      'planting_management_plan.planting_management_plan_id',
      'management_tasks.planting_management_plan_id',
    )
    .where('planting_management_plan.management_plan_id', req.params.management_plan_id)
    .whereNull('complete_date')
    .whereNull('abandon_date');
  if (tasks.length)
    return res.status(400).send(`Can't complete or abandon management plans with pending tasks`);
  return next();
};

export default validateManagementPlanTasks;
