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
const { transaction, Model } = require('objection');
// const knex = Model.knex();

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
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(sensorModel, '2', req, { trx });
        await trx.commit();
        if (isDeleted) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  editSensor() {
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

  getSensorsByFarmId() {
    return async (req, res) => {
      try {
        // TODO: Add this back
        // const { farm_id } = req.body.farm_id;
        // if (!farm_id){
        //     return res.status(400).send('No country selected');
        // }
        const data = await baseController.getByFieldId(sensorModel, 'farm_id', 'Testing');
        res.status(200).send(data);
      } catch (error) {
        //handle exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  addReading() {
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

  getAllReadingsBySensorId() {
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
};

module.exports = sensorController;
