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
const validateManagementPlanArea = require('../middleware/validation/managementPlanArea');
const validateLocationId = require('../middleware/validation/managementPlanLocationId');
router.get('/:management_plan_id', hasFarmAccess({ params: 'management_plan_id' }), checkScope(['get:management_plan']), managementPlanController.getManagementPlanByID());

router.get('/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:management_plan']), managementPlanController.getManagementPlanByFarmID());

router.get('/farm/date/:farm_id/:date', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:management_plan']), managementPlanController.getManagementPlansByDate());

router.get('/expired/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:management_plan']), managementPlanController.getExpiredManagementPlans());

router.post('/', hasFarmAccess({ body: 'location_id' }), checkScope(['add:management_plan']), validateManagementPlanArea, validateLocationId, managementPlanController.addManagementPlan());

router.put('/:management_plan_id', hasFarmAccess({ params: 'management_plan_id' }), checkScope(['edit:management_plan']), validateManagementPlanArea, validateLocationId, managementPlanController.updateManagementPlan());

router.delete('/:management_plan_id', hasFarmAccess({ params: 'management_plan_id' }), checkScope(['delete:management_plan']), managementPlanController.delManagementPlan());

module.exports = router;
