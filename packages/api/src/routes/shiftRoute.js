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

import ShiftController from '../controllers/shiftController';

import express from 'express';
const router = express.Router();

// const checkOwnership = require('../middleware/acl/checkOwnership');
import checkScope from '../middleware/acl/checkScope';

import conditionallyApplyMiddleware from '../middleware/acl/conditionally.apply';
import {
  isShiftOwnerOrIsAdmin,
  isOwnerOrAssignee,
  isAdmin,
} from '../middleware/acl/isOwnerOrAssigne';
import isCreator from '../middleware/acl/isCreator';
import hasFarmAccess from '../middleware/acl/hasFarmAccess';

router.post(
  '/',
  isShiftOwnerOrIsAdmin,
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:shifts']),
  ShiftController.addShift(),
);

router.delete(
  '/:shift_id',
  checkScope(['delete:shifts']),
  (req, res, next) =>
    conditionallyApplyMiddleware(
      req.role === 3,
      isCreator({ params: 'shift_id' }),
      hasFarmAccess({ params: 'shift_id' }),
    )(req, res, next),
  ShiftController.delShift(),
);
router.get(
  '/:shift_id',
  isOwnerOrAssignee({ params: 'shift_id' }),
  checkScope(['get:shifts']),
  ShiftController.getShiftByID(),
);

router.get(
  '/user/:user_id',
  isOwnerOrAssignee({ params: 'user_id' }),
  checkScope(['get:shifts']),
  ShiftController.getShiftByUserID(),
);
router.get(
  '/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:shifts']),
  isAdmin,
  ShiftController.getShiftByFarmID(),
);

router.get(
  '/userFarm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:shifts']),
  ShiftController.getShiftByUserFarm(),
);

export default router;
