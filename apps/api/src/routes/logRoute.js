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

export default router;
