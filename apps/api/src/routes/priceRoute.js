/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (priceRoute.js) is part of LiteFarm.
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
import priceController from '../controllers/priceController.js';
import checkScope from '../middleware/acl/checkScope.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';

// Get the crop on a bed
router.get(
  '/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:prices']),
  priceController.getPriceByFarmId(),
);

router.post(
  '/',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:prices']),
  priceController.addPrice(),
);

router.put(
  '/:id',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['edit:prices']),
  priceController.updatePrice(),
);

router.delete(
  '/:price_id',
  hasFarmAccess({ params: 'price_id' }),
  checkScope(['delete:prices']),
  priceController.delPrice(),
);

export default router;
