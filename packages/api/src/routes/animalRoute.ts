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
import AnimalController from '../controllers/animalController.js';
import AnimalModel from '../models/animalModel.js';
import {
  checkAnimalEntities,
  validateAnimalBatchCreationBody,
} from '../middleware/checkAnimalEntities.js';
import multerDiskUpload from '../util/fileUpload.js';
import validateFileExtension from '../middleware/validation/uploadImage.js';
import { checkRemoveAnimalOrBatch } from '../middleware/validation/checkAnimalOrBatch.js';
import { validateBody } from '../middleware/validation/validate.js';
import { addAnimalsSchema } from '../schemas/animalSchemas.js';

router.get('/', checkScope(['get:animals']), AnimalController.getFarmAnimals());

router.post(
  '/',
  checkScope(['add:animals']),
  validateBody(addAnimalsSchema),
  validateAnimalBatchCreationBody(),
  AnimalController.addAnimals(),
);
router.patch(
  '/remove',
  checkScope(['edit:animals']),
  checkRemoveAnimalOrBatch('animal'),
  // Can't use hasFarmAccess because body is an array & because of non-unique id field
  AnimalController.removeAnimals(),
);
router.delete(
  '/',
  checkScope(['delete:animals']),
  checkAnimalEntities(AnimalModel),
  AnimalController.deleteAnimals(),
);
router.post(
  '/upload/farm/:farm_id',
  //@ts-expect-error Todo: fix type error
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['add:animals']),
  multerDiskUpload,
  validateFileExtension,
  AnimalController.uploadAnimalImage(),
);

export default router;
