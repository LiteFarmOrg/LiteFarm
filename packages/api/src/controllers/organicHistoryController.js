/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
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

const baseController = require('./baseController');
const { transaction, Model } = require('objection');
const model = require('../models/organicHistoryModel');
const locationModel = require('../models/locationModel');

module.exports = {
  async addEntry(req, res) {
    if (!locationModel.isCropEnabled(req.body.location_id)) {
      return res.status(400).send('Location must be crop enabled.');
    }

    const trx = await transaction.start(Model.knex());
    try {
      const result = await baseController.postWithResponse(model, req.body, req, { trx });
      await trx.commit();
      res.status(201).send(result);
    } catch (error) {
      await trx.rollback();
      res.status(400).json({
        error,
      });
    }
  },

  // delSensor() {
  //   return async (req, res) => {
  //     const trx = await transaction.start(Model.knex());
  //     try {
  //       const isDeleted = await baseController.delete(sensorModel, req.params.sensor_id, req, { trx });
  //       await trx.commit();
  //       if (isDeleted) {
  //         res.sendStatus(200);
  //       } else {
  //         res.sendStatus(404);
  //       }
  //     } catch (error) {
  //       await trx.rollback();
  //       res.status(400).json({
  //         error,
  //       });
  //     }
  //   };
  // },

  // updateSensor() {
  //   return async (req, res) => {
  //     const trx = await transaction.start(Model.knex());
  //     try {
  //       const updated = await baseController.put(sensorModel, req.params.sensor_id, req.body, req, { trx });
  //       await trx.commit();
  //       if (!updated.length) {
  //         res.sendStatus(404);
  //       }
  //       else {
  //         res.status(200).send(updated);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //       await trx.rollback();
  //       res.status(400).json({
  //         error,
  //       });
  //     }
  //   }
  // },

  // getSensorByID() {
  //   return async (req, res) => {
  //     try {
  //       const sensor_id = req.params.sensor_id;
  //       const sensor = await sensorModel.query().whereNotDeleted().findById(sensor_id)
  //       return sensor ? res.status(200).send(sensor) : res.status(404).send('Sensor not found');
  //     } catch (error) {
  //       console.log(error);
  //       res.status(400).json({
  //         error,
  //       });
  //     }
  //   };
  // },

  // getSensorsByFarmID() {
  //   return async (req, res) => {
  //     try {
  //       const farm_id = req.params.farm_id;
  //       const sensors = await sensorModel.query().whereNotDeleted()
  //         .join('location', 'sensor.location_id', 'location.location_id')
  //         .where('location.farm_id', farm_id);
  //       return sensors?.length ? res.status(200).send(sensors) : res.status(404).send('Sensor not found');
  //     } catch (error) {
  //       console.log(error);
  //       return res.status(400).json({
  //         error,
  //       });
  //     }
  //   };
  // },

  // getSensorsByFieldID() {
  //   return async (req, res) => {
  //     try {
  //       const field_id = req.params.field_id;
  //       const sensors = await sensorModel.query().whereNotDeleted()
  //         .join('field', 'sensor.location_id', 'field.location_id')
  //         .where('field.location_id', field_id);
  //       return sensors?.length ? res.status(200).send(sensors) : res.status(404).send('Sensor not found');
  //     } catch (error) {
  //       console.log(error);
  //       return res.status(400).json({
  //         error,
  //       });
  //     }
  //   };
  // },
};
