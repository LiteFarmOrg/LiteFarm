/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (logRoute.js) is part of LiteFarm.
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

import logController from '../controllers/logController.js';

import express from 'express';
const router = express.Router();
import checkScope from '../middleware/acl/checkScope.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import isCreator from '../middleware/acl/isCreator.js';
import conditionallyApplyMiddleware from '../middleware/acl/conditionally.apply.js';
import validateLogLocationId from '../middleware/validation/logLocationId.js';

router.post(
  '/',
  hasFarmAccess({ body: 'locations' }),
  checkScope(['add:logs']),
  validateLogLocationId,
  logController.addLog(),
);
//TODO get log by id specification
router.get(
  '/:activity_id',
  hasFarmAccess({ mixed: 'activity_id' }),
  checkScope(['get:logs']),
  logController.getLogByActivityId(),
);
router.get(
  '/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:logs']),
  logController.getLogByFarmId(),
);
router.get(
  '/harvest_use_types/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:logs']),
  logController.getHarvestUseTypesByFarmID(),
);
router.post(
  '/harvest_use_types/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['add:harvest_use']),
  logController.addHarvestUseType(),
);

router.put(
  '/:activity_id',
  checkScope(['edit:logs']),
  (req, res, next) =>
    conditionallyApplyMiddleware(
      req.role === 3,
      isCreator({ params: 'activity_id' }),
      hasFarmAccess({ mixed: 'activity_id' }),
    )(req, res, next),
  validateLogLocationId,
  logController.putLog(),
);

router.delete(
  '/:activity_id',
  checkScope(['delete:logs']),
  (req, res, next) =>
    conditionallyApplyMiddleware(
      req.role === 3,
      isCreator({ params: 'activity_id' }),
      hasFarmAccess({ mixed: 'activity_id' }),
    )(req, res, next),
  logController.deleteLog(),
);

export default router;
