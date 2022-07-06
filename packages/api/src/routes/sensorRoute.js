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
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

const SensorController = require('../controllers/sensorController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post('/get_sensors/', SensorController.getSensorsByFarmId);
router.post(
  '/add_sensors/',
  checkScope(['add:sensors']),
  upload.single('sensors'),
  SensorController.addSensors,
);
router.delete('/delete_sensor/:sensor_id', SensorController.deleteSensor);
router.post('/add_reading/:partner_id/:farm_id', validateRequest, SensorController.addReading);
router.post('/get_readings', SensorController.getAllReadingsBySensorId);
router.get('/sensor_readings/:farm_id/:days', SensorController.getReadingsByFarmId);
router.post('/invalidate_readings', SensorController.invalidateReadings);

function validateRequest(req, res, next) {
  const farmId = req.params.farm_id;
  const authKey = `${farmId}${process.env.SENSOR_SECRET}`;
  if (req.headers.authorization === authKey) {
    next();
  } else {
    console.error('forbidden');
    res.status(403);
  }
}

module.exports = router;
