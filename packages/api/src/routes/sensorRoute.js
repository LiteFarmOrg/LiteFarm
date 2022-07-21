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

const express = require('express');
const multer = require('multer');
const checkScope = require('../middleware/acl/checkScope');
const validateRequest = require('../middleware/validation/validateWebhook');

const SensorController = require('../controllers/sensorController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post('/get_sensors/', SensorController.getSensorsByFarmId);
router.post(
  '/',
  checkScope(['add:sensors']),
  upload.single('sensors'),
  SensorController.addSensors,
);

router.delete('/:sensor_id', SensorController.deleteSensor);
router.patch('/:location_id', SensorController.updateSensorbyID);
router.post('/readings/:partner_id/:farm_id', validateRequest, SensorController.addReading);
router.get('/readings/:location_id', SensorController.getAllReadingsByLocationId);
router.get('/readings/:farm_id/:days', SensorController.getReadingsByFarmId);
router.post('/reading/invalidate', SensorController.invalidateReadings);
router.post('/unclaim', SensorController.retireSensor);
router.get('/reading_type/:location_id', SensorController.getSensorReadingTypes);
router.get('/brand_name/:partner_id', SensorController.getBrandName);
router.post('/reading/visualization', SensorController.getAllSensorReadingsByLocationIds);
module.exports = router;
