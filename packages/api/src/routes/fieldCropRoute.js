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
const checkScope = require('../middleware/acl/checkScope');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const validateFieldCropArea = require('../middleware/validation/fieldCropArea');

router.get('/:field_crop_id', hasFarmAccess({ params: 'field_crop_id' }), checkScope(['get:field_crops']), fieldCropController.getFieldCropByID());

router.get('/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:field_crops']), fieldCropController.getFieldCropByFarmID());

router.get('/farm/date/:farm_id/:date', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:field_crops']), fieldCropController.getFieldCropsByDate());

router.get('/expired/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:field_crops']), fieldCropController.getExpiredFieldCrops());

router.post('/', hasFarmAccess({ body: 'field_id' }), checkScope(['add:field_crops']), validateFieldCropArea, fieldCropController.addFieldCrop());

router.put('/:field_crop_id', hasFarmAccess({ params: 'field_crop_id' }), checkScope(['edit:field_crops']), validateFieldCropArea, fieldCropController.updateFieldCrop());

router.delete('/:field_crop_id', hasFarmAccess({ params: 'field_crop_id' }), checkScope(['delete:field_crops']), fieldCropController.delFieldCrop());

module.exports = router;
