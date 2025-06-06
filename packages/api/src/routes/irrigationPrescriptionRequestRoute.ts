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
import IrrigationPrescriptionRequestController, {
  InitiateFarmIrrigationPrescriptionQueryParams,
} from '../controllers/irrigationPrescriptionRequestController.js';
import { ScopeCheckedLiteFarmRequest } from '../types.js';
import checkSchedulerJwt from '../middleware/acl/checkSchedulerJwt.js';
import checkSchedulerPermission from '../middleware/acl/checkSchedulerPermission.js';

const router = express.Router();

router.post('/', checkScope(['get:smart_irrigation']), (req, res) => {
  const typedReq =
    req as ScopeCheckedLiteFarmRequest<InitiateFarmIrrigationPrescriptionQueryParams>;
  IrrigationPrescriptionRequestController.initiateFarmIrrigationPrescription()(typedReq, res);
});

router.post(
  '/scheduler',
  checkSchedulerJwt,
  checkSchedulerPermission('requestScheduledEndpoint'),
  IrrigationPrescriptionRequestController.initiateFarmIrrigationPrescription(),
);

export default router;
