/*
 *  Copyright 2023 LiteFarm.org
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
import { transaction, Model } from 'objection';

const revenueTypeController = {
  addType() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const farm_id = req.headers.farm_id;
        const data = req.body;
        data.revenue_translation_key = data.revenue_name;
        const result = await baseController.postWithResponse(
          RevenueTypeModel,
          { ...data, farm_id },
          req,
          { trx },
        );
        await trx.commit();
        return res.status(201).send(result);
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        return res.status(400).json({
          error,
        });
      }
    };
  },

  getAllTypes() {
    return async (req, res) => {
      // debugger;
      try {
        const farm_id = req.params.farm_id;
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
      // debugger;
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(
          RevenueTypeModel,
          req.params.revenue_type_id,
          req,
          {
            trx,
          },
        );
        await trx.commit();
        if (isDeleted) {
          return res.sendStatus(200);
        } else {
          return res.sendStatus(404);
        }
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
      const farm_id = req.headers.farm_id;
      const data = req.body;

      try {
        data.revenue_translation_key = data.revenue_name;

        const result = await baseController.put(
          RevenueTypeModel,
          req.params.revenue_type_id,
          { ...data, farm_id },
          req,
          {
            trx,
          },
        );
        await trx.commit();
        return result
          ? res.status(201).send(result)
          : res.status(404).send('Revenue type not found');
      } catch (error) {
        await trx.rollback();
        return res.status(400).send(error);
      }
    };
  },
};

export default revenueTypeController;
