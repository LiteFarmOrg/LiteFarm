/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fertilizerRoute.js) is part of LiteFarm.
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

const express = require('express');
const router = express.Router();
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const checkScope = require('../middleware/acl/checkScope');
const { modelMapping } = require('../middleware/validation/task');
const taskController = require('../controllers/taskController');

router.patch('/assign/:task_id', hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']), taskController.assignTask());

router.patch('/assign_all_tasks_on_date/:task_id', hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']), taskController.assignAllTasksOnDate());

router.get('/:farm_id', hasFarmAccess({ params: 'farm_id' }), taskController.getTasksByFarmId())

router.post('/soil_amendment_task', modelMapping['soil_amendment_task'],
  hasFarmAccess({ body: 'locations' }), taskController.createTask('soil_amendment_task'));

router.post('/pest_control_task', modelMapping['pest_control_task'],
  hasFarmAccess({ body: 'locations' }), taskController.createTask('pest_control_task'));

router.post('/irrigation_task', modelMapping['irrigation_task'],
  hasFarmAccess({ body: 'locations' }), taskController.createTask('irrigation_task'));

router.post('/scouting_task', modelMapping['scouting_task'],
  hasFarmAccess({ body: 'locations' }), taskController.createTask('scouting_task'));

router.post('/soil_task', modelMapping['soil_task'],
  hasFarmAccess({ body: 'locations' }), taskController.createTask('soil_task'));

router.post('/field_work_task', modelMapping['field_work_task'],
  hasFarmAccess({ body: 'locations' }), taskController.createTask('field_work_task'));

router.post('/harvest_task', modelMapping['harvest_task'],
  hasFarmAccess({ body: 'locations' }), taskController.createTask('harvest_task'));

router.post('/plant_task', modelMapping['plant_task'],
  hasFarmAccess({ body: 'locations' }), taskController.createTask('plant_task'));

module.exports = router;
