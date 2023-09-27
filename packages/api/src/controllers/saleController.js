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

import baseController from '../controllers/baseController.js';

import SaleModel from '../models/saleModel.js';
import CropVarietySaleModel from '../models/cropVarietySaleModel.js';
import RevenueType from '../models/revenueTypeModel.js';
import { transaction, Model } from 'objection';

const SaleController = {
  // this messed the update up as field Crop id is the same and it will change for all sales with the same field crop id!
  addOrUpdateSale() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        // post to sale and crop sale table
        const result = await baseController.upsertGraph(SaleModel, req.body, req, { trx });
        await trx.commit();
        res.status(201).send(result);
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        console.log(error);
        res.status(400).json({
          error,
        });
        // eslint-disable-next-line no-console
      }
    };
  },

  patchSales() {
    return async (req, res) => {
      const { sale_id } = req.params;
      const { customer_name, sale_date, value, note, revenue_type_id } = req.body;
      const saleData = {
        customer_name,
        sale_date,
        note,
        revenue_type_id,
      };

      const trx = await transaction.start(Model.knex());
      try {
        const oldSale = await SaleModel.query(trx)
          .context(req.auth)
          .join('revenue_type', 'sale.revenue_type_id', '=', 'revenue_type.revenue_type_id')
          .where('sale_id', sale_id)
          .first();
        const oldRevenueType = await RevenueType.query(trx)
          .context(req.auth)
          .where('revenue_type_id', oldSale.revenue_type_id)
          .first();
        const newRevenueType = await RevenueType.query(trx)
          .context(req.auth)
          .where('revenue_type_id', revenue_type_id)
          .first();

        // TODO: LF-3595 - properly determine if value needs to be updated, using crop sale column
        const isCropSale = Boolean(!newRevenueType.farm_id);
        const wasCropSale = Boolean(!oldRevenueType.farm_id);
        if (isCropSale) {
          saleData.value = null;
        } else {
          saleData.value = value;
        }

        const newSale = await SaleModel.query(trx)
          .context(req.auth)
          .where('sale_id', sale_id)
          .patch(saleData)
          .returning('*');
        if (!newSale) {
          await trx.rollback();
          return res.status(400).send('failed to patch data');
        }
        // TODO: LF-3595 - properly determine if crop_variety_sale needs to be updated
        if (wasCropSale) {
          const deletedExistingCropVarietySale = await CropVarietySaleModel.query(trx)
            .where('sale_id', sale_id)
            .delete();
          if (!deletedExistingCropVarietySale) {
            await trx.rollback();
            return res.status(400).send('failed to delete existing crop variety sales');
          }
        }

        if (isCropSale) {
          const { crop_variety_sale } = req.body;
          if (!crop_variety_sale.length) {
            await trx.rollback();
            return res.status(400).send('should not patch sale with no crop variety sales');
          }
          for (const cvs of crop_variety_sale) {
            cvs.sale_id = parseInt(sale_id);
            await CropVarietySaleModel.query(trx).context(req.auth).insert(cvs);
          }
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
        const { farm_id } = req.params;
        const sales = await SaleModel.query()
          .whereNotDeleted()
          .where({ farm_id })
          .withGraphFetched('crop_variety_sale');
        if (!sales.length) {
          // Craig: I think this should return 200 otherwise we get an error in Finances front end, i changed it xD
          res.status(200).send([]);
        } else {
          // for (const sale of sales) {
          //   // load related prices and yields of this sale
          //   await sale.$loadRelated('cropSale.crop.[price(getFarm), yield(getFarm)]', {
          //     getFarm: (builder) => {
          //       builder.where('farm_id', farm_id);
          //     },
          //   });
          // }
          res.status(200).send(sales);
        }
      } catch (error) {
        console.log(error);
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  delSale() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(SaleModel, req.params.sale_id, req, { trx });
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
    return await SaleModel.query()
      .context({ showHidden: true })
      .whereNotDeleted()
      .distinct('sale.sale_id', 'sale.customer_name', 'sale.sale_date', 'sale.created_by_user_id')
      .join('cropSale', 'cropSale.sale_id', '=', 'sale.sale_id')
      //.join('management_plan', 'management_plan.management_plan_id', '=', 'cropSale.management_plan_id')
      .join('crop', 'crop.crop_id', '=', 'cropSale.crop_id')
      //.join('field', 'field.field_id', '=', 'management_plan.field_id')
      .where('sale.farm_id', farm_id);
  },
};

export default SaleController;
