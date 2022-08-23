/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (shiftTaskController.js) is part of LiteFarm.
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

import ShiftTaskModel from '../models/shiftTaskModel.js';
import { transaction, Model } from 'objection';

const shiftTaskController = {
  addShiftTask() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const result = await baseController.postWithResponse(ShiftTaskModel, req.body, req, {
          trx,
        });
        await trx.commit();
        res.status(201).send(result);
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  },

  delShiftTask() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(ShiftTaskModel, req, req, { trx });
        await trx.commit();
        if (isDeleted) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  },
};

export default shiftTaskController;
