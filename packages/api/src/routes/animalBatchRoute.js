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
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import AnimalBatchController from '../controllers/animalBatchController.js';
import AnimalBatchModel from '../models/animalBatchModel.js';
import {
  checkAnimalEntities,
  validateAnimalBatchCreationBody,
} from '../middleware/checkAnimalEntities.js';
import multerDiskUpload from '../util/fileUpload.js';
import validateFileExtension from '../middleware/validation/uploadImage.js';

router.get('/', checkScope(['get:animal_batches']), AnimalBatchController.getFarmAnimalBatches());
router.post(
  '/',
  checkScope(['add:animal_batches']),
  validateAnimalBatchCreationBody('batch'),
  AnimalBatchController.addAnimalBatches(),
);
router.patch(
  '/',
  checkScope(['edit:animal_batches']),
  // Can't use hasFarmAccess because body is an array & because of non-unique id field
  AnimalBatchController.editAnimalBatches(),
);
router.delete(
  '/',
  checkScope(['delete:animal_batches']),
  checkAnimalEntities(AnimalBatchModel),
  AnimalBatchController.deleteAnimalBatches(),
);
router.post(
  '/upload/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['add:animal_batches']),
  multerDiskUpload,
  validateFileExtension,
  AnimalBatchController.uploadAnimalBatchImage(),
);

export default router;
