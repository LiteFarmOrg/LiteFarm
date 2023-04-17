/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fieldRoute.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify`
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
import validateFilesLength from '../middleware/validation/createDocument.js';
import validateFileExtension from '../middleware/validation/uploadDocument.js';
import documentController from '../controllers/documentController.js';
import multerDiskUpload from '../util/fileUpload.js';

router.get(
  '/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:document']),
  documentController.getDocumentsByFarmId(),
);

router.post(
  '/upload/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['add:document']),
  multerDiskUpload,
  validateFileExtension,
  documentController.uploadDocument(),
);

router.patch(
  '/archive/:document_id',
  hasFarmAccess({ params: 'document_id' }),
  checkScope(['edit:document']),
  documentController.patchDocumentArchive(),
);

router.post(
  '/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['add:document']),
  validateFilesLength,
  documentController.createDocument(),
);

router.put(
  '/:document_id',
  hasFarmAccess({ params: 'document_id' }),
  checkScope(['edit:document']),
  validateFilesLength,
  documentController.updateDocument(),
);

export default router;
