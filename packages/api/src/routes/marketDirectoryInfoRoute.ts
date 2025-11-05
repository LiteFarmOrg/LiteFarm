/*
 *  Copyright 2025 LiteFarm.org
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
import checkScope from '../middleware/acl/checkScope.js';
import { checkAndTransformMarketDirectoryInfo } from '../middleware/validation/checkMarketDirectoryInfo.js';
import MarketDirectoryInfoController from '../controllers/marketDirectoryInfoController.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import multerDiskUpload from '../util/fileUpload.js';
import validateFileExtension from '../middleware/validation/uploadImage.js';

const router = express.Router();

router.post(
  '/',
  checkScope(['add:market_directory_info']),
  checkAndTransformMarketDirectoryInfo(),
  MarketDirectoryInfoController.addMarketDirectoryInfo(),
);

router.post(
  '/upload/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['add:market_directory_info']),
  multerDiskUpload,
  validateFileExtension,
  MarketDirectoryInfoController.uploadFarmLogo(),
);

export default router;
