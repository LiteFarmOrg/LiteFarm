/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (farmExpenseController.js) is part of LiteFarm.
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

import ExpenseTypeModel from '../models/expenseTypeModel.js';
import { transaction, Model } from 'objection';

const farmExpenseTypeController = {
  addFarmExpenseType() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        // const user_id = req.user.user_id;
        const data = req.body;
        data.expense_translation_key = data.expense_name;
        const result = await baseController.postWithResponse(ExpenseTypeModel, data, req, { trx });
        await trx.commit();
        res.status(201).send(result);
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  },

  getFarmExpenseType() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const result = await ExpenseTypeModel.query()
          .where('farm_id', null)
          .orWhere('farm_id', farm_id)
          .whereNotDeleted();
        res.status(200).send(result);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  },

  getDefaultTypes() {
    return async (req, res) => {
      try {
        const result = await ExpenseTypeModel.query()
          .where('farm_id', null)
          .whereNotDeleted()
          .orderBy('expense_type_id', 'asc');
        res.status(200).send(result);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  },

  delFarmExpenseType() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      if (req.headers.farm_id == null) {
        res.sendStatus(403);
      }
      try {
        const isDeleted = await baseController.delete(
          ExpenseTypeModel,
          req.params.expense_type_id,
          req,
          { trx },
        );
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
};

export default farmExpenseTypeController;
