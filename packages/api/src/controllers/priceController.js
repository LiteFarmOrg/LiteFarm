/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (priceController.js) is part of LiteFarm.
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
const priceModel = require('../models/priceModel');
const { transaction, Model } = require('objection');


const PriceController = {
  addPrice() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const result = await baseController.postWithResponse(priceModel, req.body, trx);
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
  }

  delPrice() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(priceModel, req.params.price_id, trx);
        await trx.commit();
        if (isDeleted) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      }
      catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    }
  }

  updatePrice() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const updated = await baseController.put(priceModel, req.params.id, req.body, trx);
        await trx.commit();
        if (!updated.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(updated);
        }

      }
      catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    }
  }

  getPriceByFarmId() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await PriceController.getByForeignKey(farm_id);
        if (!rows.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(rows);
        }
      }
      catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    }
  }

  async getByForeignKey(farm_id) {
    const prices = await priceModel.query().select('*').from('price').where('price.farm_id', farm_id).whereNotDeleted();

    return prices;
  },

}

module.exports = PriceController;
