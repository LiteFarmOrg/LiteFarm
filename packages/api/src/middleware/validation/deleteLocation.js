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

const managementPlanModel = require('../../models/managementPlanModel');
const activityLogModel = require('../../models/taskModel');
const shiftTaskModel = require('../../models/shiftTaskModel');
const { raw } = require('objection');

async function validateLocationDependency(req, res, next) {

  const location_id = req?.params?.location_id;
  const managementPlans = await managementPlanModel.query().whereNotDeleted().join('crop_management_plan', 'crop_management_plan.management_plan_id', 'management_plan.management_plan_id').where('crop_management_plan.location_id', location_id).andWhere(raw('harvest_date >= now()'));
  if (managementPlans.length) {
    return res.status(400).send('Location cannot be deleted when it has a managementPlan');
  }
  const activityLogs = await activityLogModel.query().whereNotDeleted().join('activityFields', 'activityFields.activity_id', 'activityLog.activity_id').where('activityFields.location_id', location_id).andWhere('activityLog.date', '>=', 'NOW()');
  if (activityLogs.length) {
    return res.status(400).send('Location cannot be deleted when it is referenced by log');
  }
  const locationShifts = await shiftTaskModel.query().join('shift', 'shift.shift_id', 'shiftTask.shift_id').whereNotDeleted().where({ location_id }).andWhere(raw('shift_date >= CURRENT_DATE'));
  if (locationShifts.length) {
    return res.status(400).send('Location cannot be deleted when it has pending shifts');
  }

  const managementPlanShifts = await shiftTaskModel.query().join('crop_management_plan', 'crop_management_plan.management_plan_id', 'shiftTask.management_plan_id').join('shift', 'shift.shift_id', 'shiftTask.shift_id').whereNotDeleted().where('crop_management_plan.location_id', location_id).andWhere(raw('shift_date >= CURRENT_DATE'));
  if (managementPlanShifts.length) {
    return res.status(400).send('Location cannot be deleted when it has pending shifts');
  }

  return next();
}

module.exports = validateLocationDependency;
