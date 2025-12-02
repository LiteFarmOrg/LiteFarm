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
import ProductFarmModel from '../models/productFarmModel.js';
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
          .joinRelated('product_farm')
          .where('product_farm.farm_id', farm_id)
          .modify('flattenProductFarm')
          .withGraphFetched('soil_amendment_product');
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
        const { supplier, on_permitted_substances_list, ...productData } = data;

        const inserted = await ProductModel.query(trx)
          .context({ user_id: req?.auth?.user_id })
          .insertGraph({
            ...productData,
            product_farm: [{ farm_id, supplier, on_permitted_substances_list }],
          });

        const flattenedResult = await ProductModel.query(trx)
          .findById(inserted.product_id)
          .joinRelated('product_farm')
          .where('product_farm.farm_id', farm_id)
          .modify('flattenProductFarm')
          .withGraphFetched('soil_amendment_product')
          .first();

        await trx.commit();
        res.status(201).send(flattenedResult);
      } catch (error) {
        await handleObjectionError(error, res, trx);
      }
    };
  },
  updateProduct() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const { farm_id } = req.headers;
        const { product_id } = req.params;
        const data = req.body;

        const { supplier, on_permitted_substances_list, ...productData } = data;

        // This will replace the entire related object (e.g. soil_amendment_product) so keep that in mind when constructing the request
        await baseController.upsertGraph(
          ProductModel,
          {
            ...productData,
            product_id: parseInt(product_id),
            product_farm: [
              {
                product_id: parseInt(product_id),
                farm_id,
                supplier,
                on_permitted_substances_list,
              },
            ],
          },
          req,
          { trx },
        );
        await trx.commit();
        res.status(204).send();
      } catch (error) {
        await handleObjectionError(error, res, trx);
      }
    };
  },
  removeProduct() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const { farm_id } = req.headers;
        const { product_id } = req.params;
        const { isUnusedByTasks } = res.locals;

        const product = await ProductModel.query(trx)
          .joinRelated('product_farm')
          .findById(product_id);

        if (!product) {
          return res.status(404).send('Product not found');
        }

        // LF-4963 - confirm property that will distinguish custom from library products
        // const isLibraryProduct = product.product_translation_key;
        // if (!isLibraryProduct && isUnusedByTasks) {
        if (isUnusedByTasks) {
          await baseController.delete(ProductModel, product_id, req, { trx });
        }

        await ProductFarmModel.query(trx)
          .where({
            product_id,
            farm_id,
          })
          .patch({ removed: true });

        await trx.commit();
        res.status(204).send();
      } catch (error) {
        await handleObjectionError(error, res, trx);
      }
    };
  },
};

export default productController;
