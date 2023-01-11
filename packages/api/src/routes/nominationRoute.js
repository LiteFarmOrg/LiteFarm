/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (cropRoute.js) is part of LiteFarm.
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

import nominationController from '../controllers/nominationController.js';
import express from 'express';
const router = express.Router();
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import checkScope from '../middleware/acl/checkScope.js';

// This file represents the /nomination route
router.post(
  '/',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:crops']),
  nominationController.addNomination('NOMINATED'),
);

router.put(
  '/:nomination_id',
  hasFarmAccess({ params: 'nomination_id' }),
  checkScope(['edit:crops']),
  nominationController.updateNomination(),
);

router.delete(
  '/:nomination_id',
  hasFarmAccess({ params: 'nomination_id' }),
  nominationController.deleteNomination(),
);

export default router;
