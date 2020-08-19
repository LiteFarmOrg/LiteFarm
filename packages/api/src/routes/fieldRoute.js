/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fieldRoute.js) is part of LiteFarm.
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
const fieldController = require('../controllers/fieldController');
const authFarmId = require('../middleware/acl/authFarmId');
const checkOwnership = require('../middleware/acl/checkOwnership');
const checkScope = require('../middleware/acl/checkScope');

// Get the crop on a bed
router.get('/farm/:farm_id', authFarmId, checkScope(['get:fields']), fieldController.getFieldByFarmID());

router.post('/', checkScope(['add:fields']), fieldController.addField(), fieldController.mapFieldToStation);

router.put('/:id', checkOwnership('field'), checkScope(['edit:fields']), fieldController.updateField());

router.delete('/:id', checkOwnership('field'), checkScope(['delete:fields']), fieldController.delField());

module.exports = router;
