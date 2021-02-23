/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (pesticideController.js) is part of LiteFarm.
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
const pesticideModel = require('../models/pesiticideModel');
const { transaction, Model } = require('objection');

const pesticideController = {
  getPesticide() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await pesticideModel.query().whereNotDeleted().where('farm_id', null).orWhere({
          farm_id,
          deleted: false,
        });
        res.status(200).send(rows);
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    }
  },
  addPesticide() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const user_id = req.user.user_id;
        const result = await baseController.postWithResponse(pesticideModel, req.body, trx, { user_id });
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

  delPesticide() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(pesticideModel, req.params.pesticide_id, trx, req.user);
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
}

module.exports = pesticideController;
