/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (yieldController.js) is part of LiteFarm.
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
const yieldModel = require('../models/yieldModel');
const { transaction, Model } = require('objection');


const YieldController = {

  addYield() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const result = await baseController.postWithResponse(yieldModel, req.body, req, { trx });
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

  delYield() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(yieldModel, req.params.yield_id, req, { trx });
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
    }
  },

  updateYield() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const updated = await baseController.put(yieldModel, req.params.id, req.body, req, { trx });
        await trx.commit();
        if (!updated.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(updated);
        }

      } catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    }
  },

  getYieldByFarmId() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await YieldController.getByForeignKey(farm_id);
        if (!rows.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(rows);
        }
      } catch (error) {
        console.log(error);
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    }
  },

  async getByForeignKey(farm_id) {
    const yields = await yieldModel.query().select('*').from('yield').where('yield.farm_id', farm_id).whereNotDeleted();

    return yields;
  },
}

module.exports = YieldController;
