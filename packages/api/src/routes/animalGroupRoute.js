/*
 *  Copyright 2024 LiteFarm.org
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

const router = express.Router();
import AnimalGroupController from '../controllers/animalGroupController.js';
import checkScope from '../middleware/acl/checkScope.js';

router.get('/', checkScope(['get:animal_groups']), AnimalGroupController.getFarmAnimalGroups());
router.post('/', checkScope(['add:animal_groups']), AnimalGroupController.addAnimalGroup());

export default router;
