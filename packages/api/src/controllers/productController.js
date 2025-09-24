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
import TaskModel from '../models/taskModel.js';
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

        const flattenenedResult = await ProductModel.query(trx)
          .findById(inserted.product_id)
          .joinRelated('product_farm')
          .where('product_farm.farm_id', farm_id)
          .modify('flattenProductFarm')
          .withGraphFetched('soil_amendment_product')
          .first();

        await trx.commit();
        res.status(201).send(flattenenedResult);
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

        const taskModelRelationsToProducts = [
          'pest_control_task',
          'cleaning_task',
          'soil_amendment_task_products',
        ];

        const tasksUsingProduct = await TaskModel.query(trx)
          .where({ deleted: false })
          .where((builder) => {
            taskModelRelationsToProducts.forEach((relation) => {
              builder.orWhereExists(
                TaskModel.relatedQuery(relation).where('product_id', product_id),
              );
            });
          });

        const plannedTasksUsingProduct = tasksUsingProduct.filter(
          (task) => task.complete_date === null && task.abandon_date === null,
        );

        if (plannedTasksUsingProduct.length) {
          return res.status(400).send('Cannot remove; planned tasks are using this product');
        }

        const product = await ProductModel.query(trx)
          .joinRelated('product_farm')
          .findById(product_id);

        if (!product) {
          return res.status(404).send('Product not found');
        }

        if (product.deleted) {
          return res.status(400).send('Product already deleted');
        }

        const isCustomProduct = product.product_translation_key === null;

        if (isCustomProduct && !tasksUsingProduct.length) {
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
