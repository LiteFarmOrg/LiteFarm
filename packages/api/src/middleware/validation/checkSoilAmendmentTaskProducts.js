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

import ProductModel from '../../models/productModel.js';
import SoilAmendmentPurposeModel from '../../models/soilAmendmentPurposeModel.js';

export function checkSoilAmendmentTaskProducts() {
  return async (req, res, next) => {
    try {
      const { soil_amendment_task_products } = req.body.soil_amendment_task;

      if (!Array.isArray(soil_amendment_task_products)) {
        return res.status(400).send('soil_amendment_task_products must be an array');
      }

      if (!soil_amendment_task_products.length) {
        return res.status(400).send('soil_amendment_task_products is required');
      }

      for (const product of soil_amendment_task_products) {
        if (!product.product_id) {
          return res.status(400).send('product_id is required');
        }

        if (!product.volume && !product.weight) {
          return res.status(400).send('volume or weight is required');
        }

        if (product.volume && !product.volume_unit && !product.application_rate_volume_unit) {
          return res.status(400).send('volume_unit and application_rate_volume_unit is required');
        }

        if (product.weight && !product.weight_unit && !product.application_rate_weight_unit) {
          return res.status(400).send('weight_unit and application_rate_weight_unit is required');
        }

        if (!product.percent_of_location_amended || !product.total_area_amended) {
          return res
            .status(400)
            .send('percent_of_location_amended and total_area_amended is required');
        }

        if (!Array.isArray(product.purpose_relationships)) {
          return res.status(400).send('purpose_relationships must be an array');
        }

        if (!product.purpose_relationships?.length) {
          return res.status(400).send('purpose_relationships is required');
        }

        const otherPurpose = await SoilAmendmentPurposeModel.query()
          .where({ key: 'OTHER' })
          .first();

        for (const relationship of product.purpose_relationships) {
          if (relationship.purpose_id != otherPurpose.id && relationship.other_purpose) {
            return res.status(400).send('other_purpose is for other purpose');
          }
        }

        const existingProduct = await ProductModel.query()
          .where({
            product_id: product.product_id,
            farm_id: req.headers.farm_id,
            type: 'soil_amendment_task',
          })
          .first();

        if (!existingProduct) {
          return res
            .status(400)
            .send(
              `Soil amendment product ${product.product_id} does not exist or does not belong to the given farm`,
            );
        }
      }
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error,
      });
    }
  };
}
