/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import express from 'express';

const router = express.Router();
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import checkScope from '../middleware/acl/checkScope.js';
import { modelMapping, isWorkerToSelfOrAdmin } from '../middleware/validation/task.js';
import {
  validateAssigneeId,
  checkTaskStatusForAssignment,
} from '../middleware/validation/assignTask.js';
import taskController from '../controllers/taskController.js';
import { createOrPatchProduct } from '../middleware/validation/product.js';
import {
  checkAbandonTask,
  checkCompleteTask,
  checkCreateTask,
  checkDeleteTask,
} from '../middleware/validation/checkTask.js';

router.patch(
  '/assign/:task_id',
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  validateAssigneeId,
  checkTaskStatusForAssignment,
  taskController.assignTask,
);

router.patch(
  '/assign_all_tasks_on_date/:task_id',
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  validateAssigneeId,
  checkTaskStatusForAssignment,
  taskController.assignAllTasksOnDate,
);

router.patch(
  '/patch_due_date/:task_id',
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  taskController.patchTaskDate,
);

router.patch(
  '/patch_wage/:task_id',
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:user_wage']),
  taskController.patchWage,
);

router.patch(
  '/abandon/:task_id',
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  checkAbandonTask(),
  taskController.abandonTask,
);

router.get('/:farm_id', hasFarmAccess({ params: 'farm_id' }), taskController.getTasksByFarmId);
/**
 * endpoint name should follow
 * /task/task_type.task_translation_key.toLowerCase()
 */
router.post(
  '/harvest_tasks',
  hasFarmAccess({ mixed: 'taskManagementPlanAndLocation' }),
  isWorkerToSelfOrAdmin({ hasManyTasks: true }),
  taskController.createHarvestTasks,
);

router.post(
  '/soil_amendment_task',
  modelMapping['soil_amendment_task'],
  hasFarmAccess({ mixed: 'taskManagementPlanAndLocation' }),
  isWorkerToSelfOrAdmin(),
  checkCreateTask('soil_amendment_task'),
  taskController.createTask('soil_amendment_task'),
);

router.post(
  '/soil_sample_task',
  modelMapping['soil_sample_task'],
  hasFarmAccess({ mixed: 'taskManagementPlanAndLocation' }),
  isWorkerToSelfOrAdmin(),
  checkCreateTask('soil_sample_task'),
  taskController.createTask('soil_sample_task'),
);

router.post(
  '/cleaning_task',
  modelMapping['cleaning_task'],
  hasFarmAccess({ mixed: 'taskManagementPlanAndLocation' }),
  isWorkerToSelfOrAdmin(),
  createOrPatchProduct('cleaning_task'),
  taskController.createTask('cleaning_task'),
);

router.post(
  '/pest_control_task',
  modelMapping['pest_control_task'],
  hasFarmAccess({ mixed: 'taskManagementPlanAndLocation' }),
  isWorkerToSelfOrAdmin(),
  createOrPatchProduct('pest_control_task'),
  taskController.createTask('pest_control_task'),
);

router.post(
  '/irrigation_task',
  modelMapping['irrigation_task'],
  hasFarmAccess({ mixed: 'taskManagementPlanAndLocation' }),
  isWorkerToSelfOrAdmin(),
  checkCreateTask('irrigation_task'),
  taskController.createTask('irrigation_task'),
);

router.post(
  '/scouting_task',
  modelMapping['scouting_task'],
  hasFarmAccess({ mixed: 'taskManagementPlanAndLocation' }),
  isWorkerToSelfOrAdmin(),
  taskController.createTask('scouting_task'),
);

router.post(
  '/soil_task',
  modelMapping['soil_task'],
  hasFarmAccess({ mixed: 'taskManagementPlanAndLocation' }),
  isWorkerToSelfOrAdmin(),
  taskController.createTask('soil_task'),
);

router.post(
  '/field_work_task',
  modelMapping['field_work_task'],
  hasFarmAccess({ mixed: 'taskManagementPlanAndLocation' }),
  isWorkerToSelfOrAdmin(),
  taskController.createTask('field_work_task'),
);

router.post(
  '/harvest_task',
  modelMapping['harvest_task'],
  hasFarmAccess({ mixed: 'taskManagementPlanAndLocation' }),
  isWorkerToSelfOrAdmin(),
  taskController.createTask('harvest_task'),
);

router.post(
  '/transplant_task',
  modelMapping['transplant_task'],
  hasFarmAccess({ mixed: 'transplant_task' }),
  isWorkerToSelfOrAdmin(),
  taskController.createTransplantTask,
);

router.post(
  '/animal_movement_task',
  modelMapping['animal_movement_task'],
  hasFarmAccess({ body: 'locations' }),
  isWorkerToSelfOrAdmin(),
  checkCreateTask('animal_movement_task'),
  taskController.createTask('animal_movement_task'),
);

router.post(
  '/custom_task',
  modelMapping['custom_task'],
  hasFarmAccess({ mixed: 'taskManagementPlanAndLocation' }),
  isWorkerToSelfOrAdmin(),
  checkCreateTask('custom_task'),
  taskController.createTask('custom_task'),
);

router.patch(
  '/complete/soil_amendment_task/:task_id',
  modelMapping['soil_amendment_task'],
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  checkCompleteTask('soil_amendment_task'),
  taskController.completeTask('soil_amendment_task'),
);

router.patch(
  '/complete/soil_sample_task/:task_id',
  modelMapping['soil_sample_task'],
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  checkCompleteTask('soil_sample_task'),
  taskController.completeTask('soil_sample_task'),
);

router.patch(
  '/complete/cleaning_task/:task_id',
  modelMapping['cleaning_task'],
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  createOrPatchProduct('cleaning_task'),
  taskController.completeTask('cleaning_task'),
);

router.patch(
  '/complete/pest_control_task/:task_id',
  modelMapping['pest_control_task'],
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  createOrPatchProduct('pest_control_task'),
  taskController.completeTask('pest_control_task'),
);

router.patch(
  '/complete/irrigation_task/:task_id',
  modelMapping['irrigation_task'],
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  taskController.completeTask('irrigation_task'),
);

router.patch(
  '/complete/scouting_task/:task_id',
  modelMapping['scouting_task'],
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  taskController.completeTask('scouting_task'),
);

router.patch(
  '/complete/soil_task/:task_id',
  modelMapping['soil_task'],
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  taskController.completeTask('soil_task'),
);

router.patch(
  '/complete/field_work_task/:task_id',
  modelMapping['field_work_task'],
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  taskController.completeTask('field_work_task'),
);

router.patch(
  '/complete/harvest_task/:task_id',
  modelMapping['harvest_task'],
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  taskController.completeHarvestTask,
);

router.patch(
  '/complete/plant_task/:task_id',
  modelMapping['plant_task'],
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  taskController.completeTask('plant_task'),
);

router.patch(
  '/complete/transplant_task/:task_id',
  modelMapping['plant_task'],
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  taskController.completeTask('transplant_task'),
);

router.patch(
  '/complete/animal_movement_task/:task_id',
  modelMapping['animal_movement_task'],
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  checkCompleteTask('animal_movement_task'),
  taskController.completeTask('animal_movement_task'),
);

router.patch(
  '/complete/custom_task/:task_id',
  modelMapping['custom_task'],
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  checkCompleteTask('custom_task'),
  taskController.completeTask('custom_task'),
);

router.get(
  '/harvest_uses/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  taskController.getHarvestUsesByFarmId,
);

router.get(
  '/get_field_work_types/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  taskController.getFieldWorkTypes,
);

router.get(
  '/irrigation_task_types/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  taskController.getIrrigationTaskTypes,
);

router.delete(
  '/:task_id',
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['delete:task']),
  checkDeleteTask(),
  taskController.deleteTask,
);

export default router;
