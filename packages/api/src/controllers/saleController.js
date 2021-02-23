/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (saleController.js) is part of LiteFarm.
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
const saleModel = require('../models/saleModel');
const cropSaleModel = require('../models/cropSaleModel');
const { transaction, Model } = require('objection');

const SaleController = {
  // this messed the update up as field Crop id is the same and it will change for all sales with the same field crop id!
  addOrUpdateSale() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      const { user_id } = req.user;
      try {
        // post to sale and crop sale table
        const result = await baseController.upsertGraph(saleModel, req.body, trx, { user_id });
        await trx.commit();
        res.status(201).send(result);
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        res.status(400).json({
          error,
        });
        // eslint-disable-next-line no-console
        console.log(error);
      }
    };
  },

  patchSales() {
    return async (req, res) => {
      const { sale_id } = req.params;
      const { customer_name, sale_date, quantity_kg, sale_value } = req.body;
      const saleData = {};

      if (customer_name) saleData.customer_name = customer_name;
      if (sale_date) saleData.sale_date = sale_date;

      const trx = await transaction.start(Model.knex());
      try {
        const saleResult = await saleModel.query(trx).context(req.user).where('sale_id', sale_id).patch(saleData).returning('*');
        if (!saleResult) {
          await trx.rollback();
          return res.status(400).send('failed to patch data');
        }

        const deletedExistingCropSale = await cropSaleModel.query(trx).where('sale_id', sale_id).delete();
        if (!deletedExistingCropSale) {
          await trx.rollback();
          return res.status(400).send('failed to delete existing crop sales');
        }

        const { cropSale } = req.body;
        for (const cs of cropSale) {
          cs.sale_id = parseInt(sale_id);
          await cropSaleModel.query(trx).context(req.user).insert(cs);
        }

        await trx.commit();
        return res.sendStatus(200);
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        return res.status(400).json({
          error,
        });
      }
    };
  },

  // get sales and related crop sales
  getSaleByFarmId() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const sales = await SaleController.getSalesOfFarm(farm_id);
        // eslint-disable-next-line no-console
        if (!sales.length) {
          // Craig: I think this should return 200 otherwise we get an error in Finances front end, i changed it xD
          // eslint-disable-next-line no-console
          res.status(200).send([]);
        } else {
          for (const sale of sales) {
            // load related prices and yields of this sale
            await sale.$loadRelated('cropSale.crop.[price(getFarm), yield(getFarm)]', {
              getFarm: (builder) => {
                builder.where('farm_id', farm_id);
              },
            });
          }
          res.status(200).send(sales);
        }
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
        // eslint-disable-next-line no-console
        console.log(error);
      }
    };
  },

  delSale() {
    return async (req, res) => {
      const { user_id } = req.user;
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(saleModel, req.params.sale_id, trx, { user_id });
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

  async getSalesOfFarm(farm_id) {
    return await saleModel
      .query().context({ showHidden: true }).whereNotDeleted()
      .distinct('sale.sale_id', 'sale.customer_name', 'sale.sale_date', 'sale.created_by_user_id')
      .join('cropSale', 'cropSale.sale_id', '=', 'sale.sale_id')
      //.join('fieldCrop', 'fieldCrop.field_crop_id', '=', 'cropSale.field_crop_id')
      .join('crop', 'crop.crop_id', '=', 'cropSale.crop_id')
      //.join('field', 'field.field_id', '=', 'fieldCrop.field_id')
      .where('sale.farm_id', farm_id);
  },
}

module.exports = SaleController;
