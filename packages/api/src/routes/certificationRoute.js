/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fertilizerRoute.js) is part of LiteFarm.
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
import certificationController from '../controllers/certificationController.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import checkScope from '../middleware/acl/checkScope.js';
import validateCertification from '../middleware/validation/addAndPutCertification.js';

router.get(
  '/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:certification']),
  certificationController.getCertificationByFarmId(),
);
router.get(
  '/:farm_id/supported_certifications',
  hasFarmAccess({ params: 'farm_id' }),
  certificationController.getAllSupportedCertificationSystemTypes(),
);
router.get(
  '/:farm_id/supported_certifiers',
  hasFarmAccess({ params: 'farm_id' }),
  certificationController.getAllSupportedCertifiers(),
);
router.post(
  '/',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:certification']),
  validateCertification,
  certificationController.addCertification(),
);
router.put(
  '/',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['edit:certification']),
  validateCertification,
  certificationController.putCertification(),
);

router.delete(
  '/:id',
  hasFarmAccess({ tableName: 'certification' }),
  checkScope(['delete:certification']),
  certificationController.delCertification(),
);

router.post(
  '/request_export',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:certification']),
  certificationController.triggerExport(),
);

export default router;
