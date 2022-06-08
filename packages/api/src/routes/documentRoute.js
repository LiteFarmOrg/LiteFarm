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

const express = require('express');
const router = express.Router();
const checkScope = require('../middleware/acl/checkScope');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const validateFilesLength = require('../middleware/validation/createDocument');
const validateFileExtension = require('../middleware/validation/uploadDocument');

const documentController = require('../controllers/documentController');
const multerDiskUpload = require('../util/fileUpload');

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

module.exports = router;
