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

const plantingManagementPlanModel = require('../../models/plantingManagementPlanModel');
const taskModel = require('../../models/taskModel');
const { raw } = require('objection');

async function validateLocationDependency(req, res, next) {

  const location_id = req?.params?.location_id;
  const managementPlans = await plantingManagementPlanModel.query()
    .join('management_plan', 'management_plan.management_plan_id', 'planting_management_plan.management_plan_id')
    .where('planting_management_plan.location_id', location_id).where('management_plan.deleted', false).whereNull('complete_date').whereNull('abandon_date');

  if (managementPlans.length) {
    return res.status(400).send('Location cannot be deleted when it has a managementPlan');
  }
  const activityLogs = await taskModel.query().whereNotDeleted().join('location_tasks', 'location_tasks.task_id', 'task.task_id').where('location_tasks.location_id', location_id).andWhere('task.due_date', '>=', 'NOW()');
  if (activityLogs.length) {
    return res.status(400).send('Location cannot be deleted when it is referenced by a task');
  }

  const managementPlanShifts = await taskModel.query()
    .join('management_tasks', 'management_tasks.task_id', 'task.task_id')
    .join('planting_management_plan', 'management_tasks.planting_management_plan_id', 'planting_management_plan.planting_management_plan_id')
    .whereNotDeleted().where('planting_management_plan.location_id', location_id).andWhere(raw('task.due_date >= CURRENT_DATE'));
  if (managementPlanShifts.length) {
    return res.status(400).send('Location cannot be deleted when it has pending shifts');
  }

  return next();
}

module.exports = validateLocationDependency;
