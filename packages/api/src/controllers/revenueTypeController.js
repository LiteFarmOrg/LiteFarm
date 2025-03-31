/*
 *  Copyright (c) 2023 LiteFarm.org
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

import baseController from './baseController.js';

import RevenueTypeModel from '../models/revenueTypeModel.js';
import SaleModel from '../models/saleModel.js';
import { transaction, Model } from 'objection';
import { formatTranslationKey } from '../util/util.js';

const revenueTypeController = {
  addType() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const farm_id = req.headers.farm_id;
        const data = req.body;
        data.revenue_translation_key = formatTranslationKey(data.revenue_name);
        //prevent empty strings
        data.custom_description = data.custom_description || null;

        const record = await baseController.existsInTable(trx, RevenueTypeModel, {
          revenue_name: data.revenue_name,
          farm_id,
          deleted: false,
        });

        if (record) {
          // if active record exists throw conflict error
          await trx.rollback();
          return res.status(409).send();
        } else {
          const result = await baseController.postWithResponse(
            RevenueTypeModel,
            { ...data, farm_id },
            req,
            { trx },
          );
          await trx.commit();
          return res.status(201).send(result);
        }
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        return res.status(400).json({
          error,
        });
      }
    };
  },

  getFarmRevenueType() {
    return async (req, res) => {
      try {
        const farm_id = req.headers.farm_id;
        const rows = await RevenueTypeModel.query().where('farm_id', null).orWhere({ farm_id });
        if (!rows.length) {
          return res.sendStatus(404);
        } else {
          return res.status(200).send(rows);
        }
      } catch (error) {
        //handle more exceptions
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },

  getTypeByID() {
    return async (req, res) => {
      try {
        const id = req.params.revenue_type_id;
        const row = await baseController.getIndividual(RevenueTypeModel, id);
        if (!row.length) {
          return res.sendStatus(404);
        } else {
          return res.status(200).send(row);
        }
      } catch (error) {
        //handle more exceptions
        return res.status(400).json({
          error,
        });
      }
    };
  },

  delType() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      const { revenue_type_id } = req.params;
      try {
        // do not allow operations to deleted records
        if (
          await baseController.isDeleted(trx, RevenueTypeModel, {
            revenue_type_id,
          })
        ) {
          await trx.rollback();
          return res.status(404).send();
        }

        // Default to deletion
        let updatedStatus = { retired: false, deleted: true };

        const associatedRecords = await SaleModel.query(trx)
          .where({ revenue_type_id, deleted: false })
          .first();

        if (associatedRecords) {
          // Retire instead of delete
          updatedStatus = { retired: true, deleted: false };
        }

        await baseController.patch(RevenueTypeModel, revenue_type_id, updatedStatus, req, {
          trx,
        });

        await trx.commit();
        return res.status(200).json(updatedStatus);
      } catch (error) {
        await trx.rollback();
        return res.status(400).json({
          error,
        });
      }
    };
  },
  updateRevenueType() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      const { revenue_type_id } = req.params;
      const farm_id = req.headers.farm_id;
      const data = {
        revenue_name: req.body.revenue_name,
        custom_description: req.body.custom_description || null,
      };

      try {
        // do not allow updates to deleted or retired records
        const isRecordDeleted = await baseController.isDeleted(trx, RevenueTypeModel, {
          revenue_type_id,
        });
        const isRecordRetired = await baseController.isRetired(trx, RevenueTypeModel, {
          revenue_type_id,
        });

        if (isRecordDeleted || isRecordRetired) {
          await trx.rollback();
          return res.status(404).send();
        }

        // if non-deleted record exists then throw Conflict error
        if (
          await baseController.existsInTable(
            trx,
            RevenueTypeModel,
            {
              revenue_name: data.revenue_name,
              farm_id,
              deleted: false,
            },
            { revenue_type_id },
          )
        ) {
          await trx.rollback();
          return res.status(409).send();
        }

        data.revenue_translation_key = formatTranslationKey(data.revenue_name);

        const result = await baseController.patch(RevenueTypeModel, revenue_type_id, data, req, {
          trx,
        });
        await trx.commit();
        return result ? res.sendStatus(204) : res.sendStatus(404);
      } catch (error) {
        await trx.rollback();
        return res.status(400).send(error);
      }
    };
  },
};

export default revenueTypeController;
