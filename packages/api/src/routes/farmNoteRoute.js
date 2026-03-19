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
import checkScope from '../middleware/acl/checkScope.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import multerDiskUpload from '../util/fileUpload.js';
import controller from '../controllers/farmNoteController.js';
import { checkFarmNoteBody, checkFarmNoteId } from '../middleware/validation/checkFarmNote.js';

const router = express.Router();

router.get('/', checkScope(['get:farm_notes']), hasFarmAccess({}), controller.getFarmNotes());

router.post(
  '/',
  checkScope(['add:farm_notes']),
  hasFarmAccess({}),
  multerDiskUpload,
  checkFarmNoteBody(),
  controller.createFarmNote(),
);

router.patch(
  '/:id',
  checkScope(['edit:farm_notes']),
  hasFarmAccess({ tableName: 'farm_note' }),
  checkFarmNoteId('edit'),
  multerDiskUpload,
  checkFarmNoteBody(),
  controller.editFarmNote(),
);

router.delete(
  '/:id',
  checkScope(['delete:farm_notes']),
  hasFarmAccess({ tableName: 'farm_note' }),
  checkFarmNoteId('delete'),
  controller.deleteFarmNote(),
);

export default router;
