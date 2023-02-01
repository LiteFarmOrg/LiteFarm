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

import cropController from '../controllers/cropController.js';

import express from 'express';
const router = express.Router();
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import checkScope from '../middleware/acl/checkScope.js';
import multerDiskUpload from '../util/fileUpload.js';
import validateFileExtension from '../middleware/validation/uploadImage.js';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// get an individual crop
router.get(
  '/:crop_id',
  limiter,
  hasFarmAccess({ params: 'crop_id' }),
  checkScope(['get:crops']),
  cropController.getIndividualCrop(),
);
// get all crop INCLUDING crops farm added
router.get(
  '/farm/:farm_id',
  limiter,
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:crops']),
  cropController.getAllCrop(),
);
router.post(
  '/',
  limiter,
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:crops']),
  cropController.addCropWithFarmID(),
);
router.post(
  '/crop_variety',
  limiter,
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:crops']),
  cropController.addCropAndVarietyWithFarmId(),
);
router.put(
  '/:crop_id',
  limiter,
  hasFarmAccess({ params: 'crop_id' }),
  checkScope(['edit:crops']),
  cropController.updateCrop(),
);
// only user added crop can be deleted
router.delete(
  '/:crop_id',
  limiter,
  hasFarmAccess({ params: 'crop_id' }),
  checkScope(['delete:crops']),
  cropController.delCrop(),
);
router.post(
  '/upload/farm/:farm_id',
  limiter,
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['add:crops']),
  multerDiskUpload,
  validateFileExtension,
  cropController.uploadCropImage(),
);

export default router;
