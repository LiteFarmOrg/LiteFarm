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
import RevenueTypeModel from '../models/revenueTypeModel.js';
import CropVarietySaleModel from '../models/cropVarietySaleModel.js';
import { transaction, Model } from 'objection';

const SaleController = {
  // this messed the update up as field Crop id is the same and it will change for all sales with the same field crop id!
  addSale() {
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
      const {
        customer_name,
        sale_date,
        value,
        note,
        revenue_type_id,
        crop_variety_sale,
      } = req.body;
      const saleData = {
        customer_name,
        sale_date,
        note,
        revenue_type_id,
      };

      const trx = await transaction.start(Model.knex());
      try {
        const oldSale = await SaleModel.query(trx).findById(sale_id);
        const oldRevenueType = await RevenueTypeModel.query(trx).findById(oldSale.revenue_type_id);
        const newRevenueType = revenue_type_id
          ? await RevenueTypeModel.query(trx).findById(revenue_type_id)
          : oldRevenueType;
        const isCropSale = Boolean(newRevenueType.crop_generated);
        const wasCropSale = Boolean(oldRevenueType.crop_generated);

        if (isCropSale && value) {
          await trx.rollback();
          return res.status(400).send('cannot add value to crop sale');
        }
        if (!isCropSale && crop_variety_sale) {
          await trx.rollback();
          return res
            .status(400)
            .send('must be crop generated revenue type to add crop variety sale');
        }
        if (isCropSale && crop_variety_sale && !crop_variety_sale.length) {
          await trx.rollback();
          return res.status(400).send('crop sales cannot be empty');
        }

        // Value lives on the Sale model, crop sales are handled differently
        if (!isCropSale) {
          saleData.value = value;
        }

        // do not allow updates to deleted records
        if (await baseController.isDeleted(trx, SaleModel, { sale_id })) {
          await trx.rollback();
          return res.status(409).send('sale deleted');
        }

        // do not allow to change to deleted sale/revenue type
        if (
          revenue_type_id &&
          (await baseController.isDeleted(trx, RevenueTypeModel, { revenue_type_id }))
        ) {
          await trx.rollback();
          return res.status(409).send('revenue type deleted');
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

        // Hard delete previous crop variety sales
        if ((wasCropSale && isCropSale && crop_variety_sale) || (wasCropSale && !isCropSale)) {
          const deletedExistingCropVarietySales = await CropVarietySaleModel.query(trx)
            .where('sale_id', sale_id)
            .delete();
          if (!deletedExistingCropVarietySales) {
            await trx.rollback();
            return res.status(400).send('failed to delete existing crop variety sales');
          }
        }

        // Add back updated crop variety sales
        if (isCropSale && crop_variety_sale) {
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
