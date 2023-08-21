/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (insightRoute.js) is part of LiteFarm.
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

import express from 'express';

const router = express.Router();
import insightController from '../controllers/insightController.js';
import checkScope from '../middleware/acl/checkScope.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';

// get one single number for generating meals page on the main insight page

// soil om submodule
// grabs soil data logs based on user_id
// sorted by field_id so its easy to use in the soil_om submodule
router.get(
  '/soil_om/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:insights']),
  insightController.getSoilDataByFarmID(),
);

router.get(
  '/labour_happiness/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:insights']),
  insightController.getLabourHappinessByFarmID(),
);

router.get(
  '/biodiversity/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:insights']),
  insightController.getBiodiversityByFarmID(),
);

router.get(
  '/prices/distance/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:insights']),
  insightController.getPricesNearbyByFarmID(),
);

export default router;
