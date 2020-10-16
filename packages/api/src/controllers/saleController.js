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
const sale = require('../models/saleModel');
const cropSaleModel = require('../models/cropSaleModel');
const { transaction, Model } = require('objection');

class SaleController extends baseController {
  // this messed the update up as field Crop id is the same and it will change for all sales with the same field crop id!
  static addOrUpdateSale() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        // post to sale and crop sale table
        const result = await baseController.upsertGraph(sale, req.body, trx);
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
  }

  static patchSales() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const sale_id = req.body.sale_id;
        const result = await sale.query(trx).where('sale_id', sale_id)
          .patch(req.body).returning('*');

        if(result){
          const cropSale = req.body.cropSale;
          const isExistingDeleted = await cropSaleModel.query(trx).where('sale_id', req.body.sale_id).delete();

          if(isExistingDeleted){
            for(const cs of cropSale){
              await cropSaleModel.query(trx).insert(cs);
            }
          }else{
            res.status(400).send({ 'error': 'Failed to patch sales, failed to delete existing sales' })
          }

        }else{
          res.status(400).send({ 'error': 'Failed to patch sales' })
        }

        await trx.commit();
        res.sendStatus(204);
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
  }

  // get sales and related crop sales
  static getSaleByFarmId() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const sales = await SaleController.getSalesOfFarm(farm_id);
        // eslint-disable-next-line no-console
        if (!sales.length) {
          // Craig: I think this should return 200 otherwise we get an error in Finances front end, i changed it xD
          // eslint-disable-next-line no-console
          res.status(200).send([]);
        }
        else {
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
      }
      catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
        // eslint-disable-next-line no-console
        console.log(error);
      }
    }
  }

  static delSale() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(sale, req.params.sale_id, trx);
        await trx.commit();
        if (isDeleted) {
          res.sendStatus(200);
        }
        else {
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

  static async getSalesOfFarm(farm_id) {
    return await sale
      .query().whereNotDeleted()
      .distinct('sale.sale_id', 'sale.customer_name', 'sale.sale_date')
      .join('cropSale', 'cropSale.sale_id', '=', 'sale.sale_id')
      //.join('fieldCrop', 'fieldCrop.field_crop_id', '=', 'cropSale.field_crop_id')
      .join('crop', 'crop.crop_id', '=', 'cropSale.crop_id')
      //.join('field', 'field.field_id', '=', 'fieldCrop.field_id')
      .where('sale.farm_id', farm_id)
  }
}

module.exports = SaleController;
