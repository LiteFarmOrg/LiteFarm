/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
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
import RevenueTypeController from '../controllers/revenueTypeController.js';
import checkScope from '../middleware/acl/checkScope.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';

router.post(
  '/',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:revenue_types']),
  RevenueTypeController.addType(),
);
router.get(
  '/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:revenue_types']),
  RevenueTypeController.getAllTypes(),
);
router.get(
  '/:revenue_type_id',
  hasFarmAccess({ params: 'revenue_type_id' }),
  checkScope(['get:revenue_types']),
  RevenueTypeController.getTypeByID(),
);
router.delete(
  '/:revenue_type_id',
  hasFarmAccess({ params: 'revenue_type_id' }),
  checkScope(['delete:revenue_types']),
  RevenueTypeController.delType(),
);
router.patch(
  '/:revenue_type_id',
  hasFarmAccess({ params: 'revenue_type_id' }),
  checkScope(['edit:revenue_types']),
  RevenueTypeController.updateRevenueType(),
);

export default router;
