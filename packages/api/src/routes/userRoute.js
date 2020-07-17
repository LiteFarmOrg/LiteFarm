/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (userRoute.js) is part of LiteFarm.
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
const userController = require('../controllers/userController');
const checkScope = require('../middleware/acl/checkScope');

// Get the crop on a bed
// router.get('/', userController.getAllFarms());
//
router.get('/:id', userController.getUserByID());

router.get('/farm/:farm_id', checkScope(['get:users']), userController.getUserByFarmID());

router.get('/active/farm/:farm_id', checkScope(['get:users']), userController.getActiveUserByFarmID());

router.post('/',   userController.addUser());

router.post('/pseudo',   userController.addPseudoUser());

router.put('/:id', checkScope(['edit:users']), userController.updateUser());

router.delete('/:id', checkScope(['delete:users']), userController.delUser());

router.patch('/deactivate/:id', checkScope(['delete:users']), userController.deactivateUser());

router.patch('/consent/:id', userController.updateConsent());

module.exports = router;
