/*
 *  Copyright 2026 LiteFarm.org
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
import rowPlanController from '../controllers/rowPlanController.js';
import checkScope from '../middleware/acl/checkScope.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';

const router = express.Router();

router.post(
  '/import',
  hasFarmAccess({ body: 'location_id' }),
  checkScope(['edit:row_plan']),
  rowPlanController.importRowPlan(),
);

router.get(
  '/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:row_plan']),
  rowPlanController.listRowPlans(),
);

// Task rows come before /:row_plan_id so the routes cannot be confused.
router.get(
  '/task/:task_id/rows',
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['get:task']),
  rowPlanController.getTaskRows(),
);

router.put(
  '/task/:task_id/rows',
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  rowPlanController.setTaskRows(),
);

router.patch(
  '/task/:task_id/rows',
  hasFarmAccess({ params: 'task_id' }),
  checkScope(['edit:task']),
  rowPlanController.patchTaskRows(),
);

router.get(
  '/:row_plan_id/geojson',
  hasFarmAccess({ params: 'row_plan_id' }),
  checkScope(['get:row_plan']),
  rowPlanController.exportRowPlan(),
);

router.get(
  '/:row_plan_id',
  hasFarmAccess({ params: 'row_plan_id' }),
  checkScope(['get:row_plan']),
  rowPlanController.getRowPlan(),
);

router.delete(
  '/:row_plan_id',
  hasFarmAccess({ params: 'row_plan_id' }),
  checkScope(['edit:row_plan']),
  rowPlanController.deleteRowPlan(),
);

export default router;
