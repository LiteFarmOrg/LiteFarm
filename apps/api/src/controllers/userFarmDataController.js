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

import baseController from '../controllers/baseController.js';

import FarmDataScheduleModel from '../models/farmDataScheduleModel.js';

/* eslint-disable no-console */

const userFarmDataController = {
  registerFarm() {
    return async (req, res) => {
      try {
        const farm_id = req.body.farm_id;
        const user_id = req.body.user_id;
        const data = { farm_id, user_id };
        await FarmDataScheduleModel.transaction(async (trx) => {
          await baseController.post(FarmDataScheduleModel, data, req, { trx });
        });
        res.sendStatus(200);
      } catch (error) {
        //handle more exceptions
        res.status(400).send(error);
      }
    };
  },

  getSchedule() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const data = await FarmDataScheduleModel.query()
          .where({ farm_id, is_processed: false })
          .returning('*');
        if (!data.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(data);
        }
      } catch (error) {
        //handle more exceptions
        console.log(error);
        res.status(400).send(error);
      }
    };
  },
};

export default userFarmDataController;
