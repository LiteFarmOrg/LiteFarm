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
const checkScope = require('../middleware/acl/checkScope');
const checkEditPrivilege = require('../middleware/acl/checkEditPrivilege');

router.get('/user/:id', userFarmController.getUserFarmByUserID());

router.get('/role/permissions', userFarmController.getAllRolePermissions());

router.post('/', userFarmController.addUserFarm());

router.patch('/consent/farm/:farm_id/user/:user_id', userFarmController.updateConsent());

router.patch('/role/farm/:farm_id/user/:user_id', checkScope(['edit:user_role']), userFarmController.updateRole());

router.patch('/status/farm/:farm_id/user/:user_id', checkScope(['edit:user_status']), userFarmController.updateStatus());

router.get('/farm/:farm_id/user/:user_id', checkScope(['get:user_farm_info']), userFarmController.getFarmInfo());

router.patch('/update/farm/:farm_id/user/:user_id', checkEditPrivilege(), userFarmController.updateUser());

module.exports = router;
