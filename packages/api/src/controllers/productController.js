/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (productController.js) is part of LiteFarm.
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
const productModel = require('../models/productModel');
const { transaction, Model } = require('objection');

const productController = {
  getProductsByFarm() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await productModel.query().context({ user_id: req.user.user_id }).whereNotDeleted().where('farm_id', null).orWhere({
          farm_id,
          deleted: false,
        });
        if (!rows.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(rows);
        }
      } catch (error) {
        //handle more exceptions
        console.log(error);
        res.status(400).json({
          error,
        });
      }
    }
  },
  addProduct() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const data = req.body;
        data.product_translation_key = data.name;
        const result = await baseController.postWithResponse(productModel, data, req, { trx });
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
}

module.exports = productController;
