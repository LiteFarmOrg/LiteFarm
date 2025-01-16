/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import multer from 'multer';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import checkScope from '../middleware/acl/checkScope.js';
import validateRequest from '../middleware/validation/validateWebhook.js';
import validateLocationDependency from '../middleware/validation/deleteLocation.js';
import SensorController from '../controllers/sensorController.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get('/:farm_id', SensorController.getSensorsByFarmId);
router.post(
  '/',
  checkScope(['add:sensors']),
  upload.single('sensors'),
  SensorController.addSensors,
);

router.post('/associate_esci_org', SensorController.associateEnsembleOrganization);

router.delete('/:location_id', SensorController.deleteSensor);
router.patch('/:location_id', SensorController.updateSensorbyID);
router.post(
  '/reading/partner/:partner_id/farm/:farm_id',
  validateRequest,
  SensorController.addReading,
);
router.get('/:location_id/reading', SensorController.getAllReadingsByLocationId);
router.get('/reading/farm/:farm_id', SensorController.getReadingsByFarmId);
router.post('/reading/invalidate', SensorController.invalidateReadings);
router.post(
  '/unclaim',
  hasFarmAccess({ body: 'location_id' }),
  checkScope(['delete:fields']),
  validateLocationDependency,
  SensorController.retireSensor,
);
router.get('/:location_id/reading_type', SensorController.getSensorReadingTypes);
router.get('/farm/:farm_id/reading_type', SensorController.getAllSensorReadingTypes);
router.get('/partner/:partner_id/brand_name', SensorController.getBrandName);
router.post(
  '/reading/visualization',
  hasFarmAccess({ body: 'farm_id' }),
  hasFarmAccess({ body: 'locationIds' }),
  SensorController.getAllSensorReadingsByLocationIds,
);
export default router;
