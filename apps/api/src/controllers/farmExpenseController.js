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

import FarmExpenseModel from '../models/farmExpenseModel.js';
import { transaction, Model } from 'objection';

const farmExpenseController = {
  addFarmExpense() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const expenses = req.body;
        if (!Array.isArray(expenses)) {
          res.status(400).send('needs to be an array of expense items');
        }
        const resultArray = [];
        for (const e of expenses) {
          const result = await baseController.post(FarmExpenseModel, e, req, { trx });
          resultArray.push(result);
        }
        await trx.commit();
        res.sendStatus(201);
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        res.status(400).send(error);
      }
    };
  },

  getAllFarmExpense() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await farmExpenseController.getByForeignKey(farm_id);

        if (!rows.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(rows);
        }
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  async getByForeignKey(farm_id) {
    const expenses = await FarmExpenseModel.query()
      .select('*')
      .from('farmExpense')
      .where('farmExpense.farm_id', farm_id)
      .whereNotDeleted();
    return expenses;
  },

  updateFarmExpense() {
    return async (req, res) => {
      const data = req.body;
      const { farm_expense_id } = req.params;
      const { user_id } = req.auth;

      const trx = await transaction.start(Model.knex());
      try {
        const result = await FarmExpenseModel.query(trx)
          .context({ user_id })
          .where('farm_expense_id', farm_expense_id)
          .patch(data)
          .returning('*');
        if (!result) {
          await trx.rollback();
          return res.status(400).send('failed to patch data');
        }

        await trx.commit();
        return res.status(200).send(result);
      } catch (error) {
        console.log(error);
        await trx.rollback();
        return res.status(400).json({
          error,
        });
      }
    };
  },

  delFarmExpense() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(
          FarmExpenseModel,
          req.params.farm_expense_id,
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

export default farmExpenseController;
