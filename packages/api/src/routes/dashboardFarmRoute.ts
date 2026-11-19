/*
 *  Copyright 2026 LiteFarm.org
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
import checkDashboardApiJwt from '../middleware/acl/checkDashboardApiJwt.js';
import checkHasUserConsent from '../middleware/acl/checkHasUserConsent.js';
import dashboardFarmController from '../controllers/dashboardFarmController.js';

// The dashboard features whose pages call the farm list; each one's token is accepted here.
const FEATURES_USING_FARM_LIST = ['tape'] as const;

const router = express.Router();

router.use(checkDashboardApiJwt(...FEATURES_USING_FARM_LIST));

router.get('/', checkHasUserConsent(), dashboardFarmController.getFarmsByUserId());

export default router;
