/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (farmController.js) is part of LiteFarm.
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

const baseController = require('../controllers/baseController');
const sensorModel = require('../models/sensorModel');
const sensorReadingModel = require('../models/sensorReadingModel');
const { transaction, Model } = require('objection');

const sensorController = {
  addSensors() {
    return async (req, res) => {
      try {
        res.status(200).send('OK');
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  deleteSensor() {
    return async (req, res) => {
      console.log(req);
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(sensorModel, req.params.sensor_id, req, {
          trx,
        });
        await trx.commit();
        if (isDeleted) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  },

  getSensorsByFarmId() {
    return async (req, res) => {
      try {
        const { farm_id } = req.body;
        if (!farm_id) {
          return res.status(400).send('No farm selected');
        }
        const data = await baseController.getByFieldId(sensorModel, 'farm_id', farm_id);
        res.status(200).send(data);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  },

  addReading() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const infoBody = [];
        for (const sensor of req.body) {
          const corresponding_sensor = await sensorModel
            .query()
            .select('sensor_id')
            .where('external_id', sensor.sensor_esid)
            .where('partner_id', req.params.partner_id);
          console.log(corresponding_sensor[0].sensor_id);
          for (let i = 0; i < sensor.value.length; i++) {
            const row = {
              read_time: sensor.time[i],
              sensor_id: corresponding_sensor[0].sensor_id,
              reading_type: sensor.parameter_number,
              value: sensor.value[i],
              unit: sensor.unit,
            };
            console.log(row);
            // Only include this entry if all required values are poulated
            if (Object.values(row).every((value) => value)) {
              infoBody.push(row);
            }
          }
        }

        const result = await baseController.postWithResponse(sensorReadingModel, infoBody, req, {
          trx,
        });
        await trx.commit();
        res.status(200).send(result);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  },

  getAllReadingsBySensorId() {
    return async (req, res) => {
      try {
        const { sensor_id } = req.body;
        if (!sensor_id) {
          return res.status(400).send('No sensor selected');
        }
        const data = await baseController.getByFieldId(sensorReadingModel, 'sensor_id', sensor_id);
        const validReadings = data.filter((datapoint) => datapoint.valid);
        res.status(200).send(validReadings);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  },

  invalidateReadings() {
    return async (req, res) => {
      try {
        const { start_time, end_time } = req.body;
        const result = await sensorReadingModel
          .query()
          .patch({ valid: false })
          .where('read_time', '>=', start_time)
          .where('read_time', '<=', end_time);
        res.status(200).send(`${result} entries invalidated`);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  },
};

module.exports = sensorController;
