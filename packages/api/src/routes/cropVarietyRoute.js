/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (cropRoute.js) is part of LiteFarm.
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

const cropVarietyController = require('../controllers/cropVarietyController');
const express = require('express');
const router = express.Router();
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const checkScope = require('../middleware/acl/checkScope');
const organicCertifierCheck = require('../middleware/validation/organicCertifierCheck');
const activeManagementPlanCheck = require('../middleware/validation/activeManagementPlanCheck');
const multerDiskUpload = require('../util/fileUpload');
const validateFileExtension = require('../middleware/validation/uploadImage');

router.get('/:crop_variety_id', hasFarmAccess({ params: 'crop_variety_id' }), checkScope(['get:crop_variety']), cropVarietyController.getCropVarietyByCropVarietyId());
router.get('/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:crop_variety']), cropVarietyController.getCropVarietiesByFarmId());
router.post('/', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:crop_variety']), cropVarietyController.createCropVariety());
router.put('/:crop_variety_id', hasFarmAccess({ params: 'crop_variety_id' }), checkScope(['edit:crop_variety']), cropVarietyController.updateCropVariety());
router.delete('/:crop_variety_id', hasFarmAccess({ params: 'crop_variety_id' }), checkScope(['delete:crop_variety']), activeManagementPlanCheck, cropVarietyController.deleteCropVariety());
router.patch('/:crop_variety_id', hasFarmAccess({ params: 'crop_variety_id' }), checkScope(['edit:crop_variety']), organicCertifierCheck, cropVarietyController.updateCropVariety());
router.post('/upload/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['add:crop_variety']), multerDiskUpload, validateFileExtension, cropVarietyController.uploadCropImage());


module.exports = router;
