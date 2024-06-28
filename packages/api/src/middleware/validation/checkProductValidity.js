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
import { checkAndTrimString } from '../../util/util.js';

export function checkProductValidity() {
  return async (req, res, next) => {
    const { farm_id } = req.headers;
    const { product_id } = req.params;
    const { soil_amendment_product: sap } = req.body;
    let { type, name } = req.body;

    const elements = [
      'n',
      'p',
      'k',
      'calcium',
      'magnesium',
      'sulfur',
      'copper',
      'manganese',
      'boron',
    ];
    const molecularCompounds = ['ammonium', 'nitrate'];
    const typesOfProducts = ['soil_amendment_product'];
    const taskTypeProductMap = {
      soil_amendment_task: 'soil_amendment_product',
      cleaning_task: null,
      pest_control_task: null,
    };

    if (sap) {
      // Check that element values are all positive
      if (!elements.every((element) => !sap[element] || sap[element] >= 0)) {
        return res.status(400).send('element values must all be positive');
      }

      // Check that a unit has been provided along with element values
      if (elements.some((element) => sap[element]) && !sap.elemental_unit) {
        return res.status(400).send('elemental_unit is required');
      }

      // Check that element values do not exceed 100 if element_unit is percent
      if (
        sap.elemental_unit === 'percent' &&
        elements.reduce((sum, element) => sum + (sap[element] || 0), 0) > 100
      ) {
        return res.status(400).send('percent elemental values must not exceed 100');
      }

      // Check that compound values are all positive
      if (!molecularCompounds.every((compound) => !sap[compound] || sap[compound] >= 0)) {
        return res.status(400).send('compounds values must all be positive');
      }

      if (sap.moisture_content_percent && !sap.moisture_content_percent >= 0) {
        return res.status(400).send('moisture content value must be positive');
      }
    }

    // Null empty strings
    ['name', 'supplier'].forEach((key) => {
      if (req.body[key]) {
        req.body[key] = checkAndTrimString(req.body[key]);
      }
    });

    const trx = await transaction.start(ProductModel.knex());

    try {
      if (product_id) {
        const currentRecord = await ProductModel.query(trx).findById(product_id);

        if (type && type != currentRecord.type) {
          return res.status(400).send('cannot change product type');
        }

        type = type ?? currentRecord.type;
        name = name ?? currentRecord.name;
      }

      if (!name) {
        return res.status(400).send('new product must have name');
      }

      if (!type) {
        return res.status(400).send('new product must have type');
      }

      const nonModifiableAssets = typesOfProducts.filter((a) => a !== taskTypeProductMap[type]);

      if (taskTypeProductMap[type] && !req.body[taskTypeProductMap[type]]) {
        return res.status(400).send('must have product details');
      }

      if (nonModifiableAssets.some((asset) => Object.hasOwn(req.body, asset))) {
        return res.status(400).send('must not have other product type details');
      }

      // Check name uniqueness
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
