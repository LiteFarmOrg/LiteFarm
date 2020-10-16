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

const cropController = require('../controllers/cropController');
const express = require('express');
const router = express.Router();
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const checkScope = require('../middleware/acl/checkScope');

// get an individual crop
router.get('/:crop_id', hasFarmAccess({params:'crop_id'}), checkScope(['get:crops']), cropController.getIndividualCrop());
// get all crop INCLUDING crops farm added
router.get('/farm/:farm_id', hasFarmAccess({params: 'farm_id'}), checkScope(['get:crops']), cropController.getAllCrop());
router.post('/', hasFarmAccess({body: 'farm_id'}), checkScope(['add:crops']), cropController.addCropWithFarmID());
router.put('/:crop_id', hasFarmAccess({params: 'crop_id'}), checkScope(['edit:crops']), cropController.updateCrop());
// only user added crop can be deleted
router.delete('/:crop_id', hasFarmAccess({params: 'crop_id'}), checkScope(['delete:crops']), cropController.delCrop());

module.exports = router;
