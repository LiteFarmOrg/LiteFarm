/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (farmRoute.js) is part of LiteFarm.
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

const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farmController');
const authFarmId = require('../middleware/acl/authFarmId');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const checkScope = require('../middleware/acl/checkScope');
const addUTCOffsetToFarm = require('../middleware/validation/addUTCOffsetToFarm');

router.get('/:farm_id', authFarmId, farmController.getFarmByID());

router.post('/', addUTCOffsetToFarm, farmController.addFarm());

router.patch(
  '/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['edit:farms'], { checkConsent: false }),
  addUTCOffsetToFarm,
  farmController.updateFarm(true),
);

router.patch(
  '/:farm_id/default_initial_location',
  hasFarmAccess({ params: 'farm_id' }),
  hasFarmAccess({ body: 'default_initial_location_id' }),
  checkScope(['edit:farms']),
  farmController.patchDefaultInitialLocation(),
);

router.patch(
  '/owner_operated/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['edit:farms'], { checkConsent: false }),
  farmController.patchOwnerOperated(),
);

/*To change farm name or units*/
router.put(
  '/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['edit:farms']),
  farmController.updateFarm(),
);

router.delete(
  '/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['delete:farms']),
  farmController.deleteFarm(),
);

module.exports = router;
