/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (userFarmDataController.js) is part of LiteFarm.
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
const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../knexfile')[environment];
const knex = Knex(config);

/* eslint-disable no-console */

class userFarmDataController extends baseController {
  static registerFarm() {
    return async (req, res) => {
      try {
        const farm_id = req.body.farm_id;
        const user_id = req.body.user_id;
        await knex('farmDataSchedule').insert({ farm_id, user_id });
        res.sendStatus(200);
      }
      catch (error) {
        //handle more exceptions
        res.status(400).send(error);
      }
    }
  }

  static getSchedule(){
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const data = await knex('farmDataSchedule').where({ farm_id, is_processed: false }).returning('*');
        res.status(200).send(data);
      }
      catch (error) {
        //handle more exceptions
        console.log(error);
        res.status(400).send(error);
      }
    }
  }
}

module.exports = userFarmDataController;