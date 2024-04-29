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

import baseController from '../controllers/baseController.js';
import ProductModel from '../models/productModel.js';
import { transaction, Model } from 'objection';
import { handleObjectionError } from '../util/errorCodes.js';

const productController = {
  getProductsByFarm() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await ProductModel.query()
          .context({ user_id: req.auth.user_id })
          .whereNotDeleted()
          .where({
            farm_id,
          });
        return res.status(200).send(rows);
      } catch (error) {
        //handle more exceptions
        console.log(error);
        res.status(400).json({
          error,
        });
      }
    };
  },
  addProduct() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const { farm_id } = req.headers;
        const data = req.body;

        const result = await baseController.postWithResponse(
          ProductModel,
          { ...data, farm_id },
          req,
          { trx },
        );
        await trx.commit();
        res.status(201).send(result);
      } catch (error) {
        await handleObjectionError(error, res, trx);
      }
    };
  },
};

export default productController;
