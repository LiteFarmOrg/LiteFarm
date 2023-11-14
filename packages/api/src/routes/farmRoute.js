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

import express from 'express';

const router = express.Router();
import farmController from '../controllers/farmController.js';
import authFarmId from '../middleware/acl/authFarmId.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import checkScope from '../middleware/acl/checkScope.js';
import checkSchedulerJwt from '../middleware/acl/checkSchedulerJwt.js';
import hasTimeNotificationsAccess from '../middleware/acl/hasTimeNotificationsAccess.js';
import multerDiskUpload from '../util/fileUpload.js';
import { parseMultipartJson, handleImageOperations } from '../middleware/farm.js';
import validateFileExtension from '../middleware/validation/uploadImage.js';

router.get('/:farm_id', authFarmId, farmController.getFarmByID());

router.post('/', farmController.addFarm());

router.patch(
  '/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['edit:farms'], { checkConsent: false }),
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

/*To change farm name, image, or units*/
router.put(
  '/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['edit:farms']),
  multerDiskUpload,
  validateFileExtension,
  parseMultipartJson,
  handleImageOperations,
  farmController.updateFarm(),
);

router.delete(
  '/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['delete:farms']),
  farmController.deleteFarm(),
);

router.get(
  '/utc_offset_by_range/:min/:max',
  checkSchedulerJwt,
  hasTimeNotificationsAccess,
  farmController.getFarmsByOffsetRange,
);

export default router;
