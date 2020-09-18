/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (shiftRoute.js) is part of LiteFarm.
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

const ShiftController = require('../controllers/shiftController');
const express = require('express');
const router = express.Router();
// const checkOwnership = require('../middleware/acl/checkOwnership');
const checkScope = require('../middleware/acl/checkScope');

//router.post('/', checkScope(['add:shifts']),  ShiftController.addShift());
router.post('/', checkScope(['add:shifts']), ShiftController.addShift());
router.post('/multi', checkScope(['add:shifts']), ShiftController.addMultiShift());

router.delete('/:id', checkScope(['delete:shifts']), ShiftController.delShift());
router.get('/:id', checkScope(['get:shifts']), ShiftController.getShiftByID());
router.put('/:id', checkScope(['edit:shifts']), ShiftController.updateShift());


router.get('/user/:user_id', checkScope(['get:shifts']), ShiftController.getShiftByUserID());
router.get('/farm/:farm_id', checkScope(['get:shifts']), ShiftController.getShiftByFarmID());


module.exports = router;
