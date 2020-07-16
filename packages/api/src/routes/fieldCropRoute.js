/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (fieldCropRoute.js) is part of LiteFarm.
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
const fieldCropController = require('../controllers/fieldCropController');
const authFarmId = require('../middleware/acl/authFarmId');
const checkScope = require('../middleware/acl/checkScope');

router.get('/farm/:farm_id', authFarmId, checkScope(['get:field_crops']), fieldCropController.getFieldCropByFarmID());

router.get('/farm/date/:farm_id/:date', authFarmId, checkScope(['get:field_crops']), fieldCropController.getFieldCropsByDate());

router.get('/expired/farm/:farm_id', authFarmId, checkScope(['get:field_crops']), fieldCropController.getExpiredFieldCrops());

router.post('/', checkScope(['add:field_crops']), fieldCropController.addFieldCrop());

router.put('/:id', checkScope(['edit:field_crops']), fieldCropController.updateFieldCrop());

router.delete('/:id', checkScope(['delete:field_crops']), fieldCropController.delFieldCrop());

module.exports = router;
