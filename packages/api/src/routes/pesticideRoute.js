/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (pesticideRoute.js) is part of LiteFarm.
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
import pesticideController from '../controllers/pesticideController.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import checkScope from '../middleware/acl/checkScope.js';

router.get(
  '/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:pesticides']),
  pesticideController.getPesticide(),
);
router.post(
  '/',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:pesticides']),
  pesticideController.addPesticide(),
);
router.delete(
  '/:pesticide_id',
  hasFarmAccess({ params: 'pesticide_id' }),
  checkScope(['delete:pesticides']),
  pesticideController.delPesticide(),
);

export default router;
