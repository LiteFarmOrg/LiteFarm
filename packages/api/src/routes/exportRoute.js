/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fertilizerRoute.js) is part of LiteFarm.
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
import exportController from '../controllers/exportController.js';
import multerDiskUpload from '../util/fileUpload.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import checkScope from '../middleware/acl/checkScope.js';

router.post('/map/farm/:farm_id', multerDiskUpload, exportController.sendMapToEmail());

router.post(
  '/finances/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['add:finance_report']),
  exportController.createFinanceReport(),
);

export default router;
