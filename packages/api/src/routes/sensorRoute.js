/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (userFarmRoute.js) is part of LiteFarm.
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
const router = express.Router();
const sensor_controller = require('../controllers/sensorController');

router.post('/get_sensors/', sensor_controller.getSensorsByFarmId());
router.post('/add_sensors', sensor_controller.addSensors());
router.delete('/delete_sensor/:sensor_id', sensor_controller.deleteSensor());
router.post('/add_reading/:partner_id', sensor_controller.addReading());
router.post('/get_readings', sensor_controller.getAllReadingsBySensorId());
router.post('/invalidate_readings', sensor_controller.invalidateReadings());

module.exports = router;
