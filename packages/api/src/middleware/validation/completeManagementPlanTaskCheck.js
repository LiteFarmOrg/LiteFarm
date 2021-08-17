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

const taskModel = require('../../models/taskModel');


const validateManagementPlanTasks = () => async (req, res, next) => {
  const tasks = await taskModel.query().join('management_tasks', 'management_tasks.task_id', 'task.task_id')
    .where('management_tasks.management_plan_id', req.params.management_plan_id);
  if (tasks.length) return res.status(400).send('Area needed is greater than the field\'s area');
  return next();
};

module.exports = validateManagementPlanTasks;
