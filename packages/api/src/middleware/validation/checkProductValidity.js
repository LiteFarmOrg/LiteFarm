/*
 *  Copyright (c) 2024 LiteFarm.org
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

import { transaction } from 'objection';
import { handleObjectionError } from '../../util/errorCodes.js';
import ProductModel from '../../models/productModel.js';

export function checkProductValidity() {
  return async (req, res, next) => {
    // Check that npk values are positive
    if (req.body.n < 0 || req.body.p < 0 || req.body.k < 0) {
      return res.status(400).send('npk values must all be positive');
    }

    // Check that a unit has been provided along with npk values
    if ((req.body.n || req.body.p || req.body.k) && !req.body.npk_unit) {
      return res.status(400).send('npk_unit is required');
    }

    // Check that npk values do not exceed 100 if npk_unit is percent
    if (req.body.npk_unit === 'percent' && req.body.n + req.body.p + req.body.k > 100) {
      return res.status(400).send('percent npk values must not exceed 100');
    }

    const trx = await transaction.start(ProductModel.knex());

    // Check name uniqueness
    try {
      const { farm_id } = req.headers;
      const { product_id } = req.params;
      let { type, name } = req.body;

      if (product_id) {
        const currentRecord = await ProductModel.query(trx).findById(product_id);
        type = type ?? currentRecord.type;
        name = name ?? currentRecord.name;
      }

      const existingRecord = await ProductModel.query(trx)
        .where({ farm_id })
        .andWhere({ type })
        .andWhere({ name })
        .whereNot({ product_id: product_id ?? null })
        .whereNotDeleted();

      if (existingRecord.length) {
        await trx.rollback();
        return res.status(409).send('Product with this name already exists');
      }

      await trx.commit();
      next();
    } catch (error) {
      handleObjectionError(error, res, trx);
    }
  };
}
