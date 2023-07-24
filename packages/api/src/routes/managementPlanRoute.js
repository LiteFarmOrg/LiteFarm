/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (managementPlanRoute.js) is part of LiteFarm.
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
import managementPlanController from '../controllers/managementPlanController.js';
import checkScope from '../middleware/acl/checkScope.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import validateManagementPlanTasks from '../middleware/validation/completeManagementPlanTaskCheck.js';
import { processManagementPlanReq } from '../middleware/validation/managementPlan.js';

router.get(
  '/:management_plan_id',
  hasFarmAccess({ params: 'management_plan_id' }),
  checkScope(['get:management_plan']),
  managementPlanController.getManagementPlanByID(),
);

router.get(
  '/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:management_plan']),
  managementPlanController.getManagementPlanByFarmID(),
);

router.get(
  '/farm/date/:farm_id/:date',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:management_plan']),
  managementPlanController.getManagementPlansByDate(),
);

router.get(
  '/expired/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:management_plan']),
  managementPlanController.getExpiredManagementPlans(),
);

router.post(
  '',
  hasFarmAccess({ body: 'crop_management_plan' }),
  hasFarmAccess({ body: 'crop_variety_id' }),
  checkScope(['add:management_plan']),
  processManagementPlanReq,
  managementPlanController.addManagementPlan(),
);

router.post(
  '/repeat_plan',
  hasFarmAccess({ body: 'management_plan_id' }),
  checkScope(['add:management_plan']),
  managementPlanController.repeatManagementPlan(),
);

router.patch(
  '/:management_plan_id',
  hasFarmAccess({ params: 'management_plan_id' }),
  checkScope(['edit:management_plan']),
  managementPlanController.updateManagementPlan(),
);

router.delete(
  '/:management_plan_id',
  hasFarmAccess({ params: 'management_plan_id' }),
  checkScope(['delete:management_plan']),
  managementPlanController.delManagementPlan(),
);
router.patch(
  '/:management_plan_id/complete',
  hasFarmAccess({ params: 'management_plan_id' }),
  checkScope(['delete:management_plan']),
  validateManagementPlanTasks,
  managementPlanController.completeManagementPlan(),
);
router.patch(
  '/:management_plan_id/abandon',
  hasFarmAccess({ params: 'management_plan_id' }),
  checkScope(['delete:management_plan']),
  managementPlanController.abandonManagementPlan(),
);

export default router;
