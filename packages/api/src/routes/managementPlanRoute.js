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
router.get('/:field_crop_id', hasFarmAccess({ params: 'field_crop_id' }), checkScope(['get:field_crops']), managementPlanController.getManagementPlanByID());

router.get('/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:field_crops']), managementPlanController.getManagementPlanByFarmID());

router.get('/farm/date/:farm_id/:date', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:field_crops']), managementPlanController.getManagementPlansByDate());

router.get('/expired/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:field_crops']), managementPlanController.getExpiredManagementPlans());

router.post('/', hasFarmAccess({ body: 'location_id' }), checkScope(['add:field_crops']), validateManagementPlanArea, validateLocationId, managementPlanController.addManagementPlan());

router.put('/:field_crop_id', hasFarmAccess({ params: 'field_crop_id' }), checkScope(['edit:field_crops']), validateManagementPlanArea, validateLocationId, managementPlanController.updateManagementPlan());

router.delete('/:field_crop_id', hasFarmAccess({ params: 'field_crop_id' }), checkScope(['delete:field_crops']), managementPlanController.delManagementPlan());

module.exports = router;
