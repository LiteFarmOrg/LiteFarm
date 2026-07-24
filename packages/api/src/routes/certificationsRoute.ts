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
import { checkCertification } from '../middleware/validation/checkCertification.js';
import controller from '../controllers/certificationsController.js';
import certificationController from '../controllers/certificationController.js';

const router = express.Router();

router.get('/', checkScope(['get:certification']), controller.getCertifications());

router.post(
  '/',
  checkScope(['add:certification']),
  checkCertification(),
  controller.addCertification(),
);

router.put(
  '/:id',
  checkScope(['edit:certification']),
  hasFarmAccess({ tableName: 'certification' }),
  checkCertification(),
  controller.updateCertification(),
);

router.delete(
  '/:id',
  checkScope(['delete:certification']),
  hasFarmAccess({ tableName: 'certification' }),
  controller.deleteCertification(),
);

router.post(
  '/request_export',
  checkScope(['add:certification']),
  certificationController.triggerExport(),
);

export default router;
