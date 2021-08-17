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

const express = require('express');
const router = express.Router();
const managementPlanController = require('../controllers/managementPlanController');
const checkScope = require('../middleware/acl/checkScope');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const validateManagementPlanTasks = require('../middleware/validation/completeManagementPlanTaskCheck');
const validateLocationId = require('../middleware/validation/managementPlanLocationId');
const { processManagementPlanReq } = require('../middleware/validation/managementPlan');

router.get('/:management_plan_id', hasFarmAccess({ params: 'management_plan_id' }), checkScope(['get:management_plan']), managementPlanController.getManagementPlanByID());

router.get('/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:management_plan']), managementPlanController.getManagementPlanByFarmID());

router.get('/farm/date/:farm_id/:date', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:management_plan']), managementPlanController.getManagementPlansByDate());

router.get('/expired/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:management_plan']), managementPlanController.getExpiredManagementPlans());

router.post('', hasFarmAccess({ body: 'crop_management_plan' }), hasFarmAccess({ body: 'crop_variety_id' }),
  checkScope(['add:management_plan']), processManagementPlanReq, managementPlanController.addManagementPlan());

router.put('/:management_plan_id', hasFarmAccess({ params: 'management_plan_id' }), checkScope(['edit:management_plan']), validateLocationId, managementPlanController.updateManagementPlan());

router.delete('/:management_plan_id', hasFarmAccess({ params: 'management_plan_id' }), checkScope(['delete:management_plan']), managementPlanController.delManagementPlan());
router.patch('/:management_plan_id/complete', hasFarmAccess({ params: 'management_plan_id' }), checkScope(['delete:management_plan']), validateManagementPlanTasks, managementPlanController.completeManagementPlan());
router.patch('/:management_plan_id/abandon', hasFarmAccess({ params: 'management_plan_id' }), checkScope(['delete:management_plan']), validateManagementPlanTasks, managementPlanController.abandonManagementPlan());

module.exports = router;
