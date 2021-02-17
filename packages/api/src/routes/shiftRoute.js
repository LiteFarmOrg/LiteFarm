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
const {
  isShiftOwnerOrIsAdmin,
  isOwnerOrAssignee,
  isSelfOrAdmin,
  isShiftOwnerOrAdmin,
} = require('../middleware/acl/isOwnerOrAssigne');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');

router.post('/',
  isShiftOwnerOrIsAdmin,
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:shifts']),
  ShiftController.addShift());

router.delete('/:shift_id',
  isShiftOwnerOrAdmin,
  ShiftController.delShift());
router.get('/:shift_id',
  isOwnerOrAssignee({ params: 'shift_id' }),
  checkScope(['get:shifts']),
  ShiftController.getShiftByID());
// router.put('/:shift_id',
//   checkScope(['edit:shifts']),
//   (req, res, next) =>
//     conditionallyApplyMiddleware(
//       req.role === 3,
//       isOwnerOrAssignee({ params: 'shift_id' }),
//       hasFarmAccess({ params: 'shift_id' }))(req, res, next),
//   ShiftController.updateShift());


router.get('/user/:user_id',
  isOwnerOrAssignee({ params: 'user_id' }),
  checkScope(['get:shifts']),
  ShiftController.getShiftByUserID());
router.get('/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:shifts']),
  ShiftController.getShiftByFarmID());


router.get('/farm/:farm_id/user/:user_id',
  hasFarmAccess({ params: 'farm_id' }),
  isSelfOrAdmin,
  checkScope(['get:shifts']),
  ShiftController.getShiftByUserFarm());


module.exports = router;
