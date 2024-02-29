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
import checkScope from '../middleware/acl/checkScope.js';
import AnimalBatchController from '../controllers/animalBatchController.js';
import { deleteAnimalEntity } from '../middleware/deleteAnimalEntity.js';
import AnimalBatchModel from '../models/animalBatchModel.js';

router.get('/', checkScope(['get:animal_batches']), AnimalBatchController.getFarmAnimalBatches());
router.post('/', checkScope(['add:animal_batches']), AnimalBatchController.addAnimalBatches());
router.delete(
  '/',
  checkScope(['delete:animal_batches']),
  // Can't use hasFarmAccess as written
  deleteAnimalEntity(AnimalBatchModel),
);

export default router;
