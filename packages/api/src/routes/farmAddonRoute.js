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
import { checkFarmAddon } from '../middleware/validation/checkFarmAddon.js';
import FarmAddonController from '../controllers/farmAddonController.js';

const router = express.Router();

router.post(
  '/',
  checkScope(['add:farm_addon']),
  checkFarmAddon(),
  FarmAddonController.addFarmAddon,
);

export default router;
