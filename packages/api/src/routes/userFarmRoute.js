/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (userFarmRoute.js) is part of LiteFarm.
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
const userFarmController = require('../controllers/userFarmController');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const checkScope = require('../middleware/acl/checkScope');
const checkEditPrivilege = require('../middleware/acl/checkEditPrivilege');

// Get all userFarms for a specified user
// no permission limits
router.get('/user/:user_id', userFarmController.getUserFarmByUserID());

// Get info on all users (userFarm) at a farm
router.get('/farm/:farm_id', hasFarmAccess({params: 'farm_id'}), checkScope(['get:user_farm_info']), userFarmController.getUserFarmsByFarmID());

// Get info on all active users (userFarm) at a farm
router.get('/active/farm/:farm_id', hasFarmAccess({params: 'farm_id'}), checkScope(['get:user_farm_info']), userFarmController.getActiveUserFarmsByFarmID());

// [DEPRECATE] Displays list of permissions for user calling this endpoint
// router.get('/role/permissions', userFarmController.getAllRolePermissions());

// Create userFarm
// to be used in the future
// router.post('/', hasFarmAccess(), checkScope(['add:users']), userFarmController.addUserFarm());

// Update consent status for a userFarm referenced by user_id
// no permission limits
router.patch('/consent/farm/:farm_id/user/:user_id', userFarmController.updateConsent());

// Update the role on a userFarm
router.patch('/role/farm/:farm_id/user/:user_id', hasFarmAccess({params: 'farm_id'}), checkScope(['edit:user_role']), userFarmController.updateRole());

// Update the status on a userFarm
router.patch('/status/farm/:farm_id/user/:user_id', hasFarmAccess({params: 'farm_id'}), checkScope(['edit:user_status']), userFarmController.updateStatus());

// [DEPRECATE] Get specific info related to userFarm
router.get('/farm/:farm_id/user/:user_id', checkScope(['get:user_farm_info']), userFarmController.getFarmInfo());

// [DEPRECATE] Update user_farm
router.patch('/update/farm/:farm_id/user/:user_id', checkEditPrivilege(), userFarmController.updateUser());

// Update wage of userFarm
router.patch('/wage/farm/:farm_id/user/:user_id', hasFarmAccess({params: 'farm_id'}), checkScope(['edit:user_wage']), userFarmController.updateWage());

module.exports = router;
