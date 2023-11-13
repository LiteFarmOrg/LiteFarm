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
        const farm_id = req.headers.farm_id;
        const data = req.body;
        data.expense_translation_key = baseController.formatTranslationKey(data.expense_name);
        //prevent empty strings
        data.custom_description = data.custom_description || null;

        const record = await this.existsInFarm(trx, farm_id, data.expense_name);

        if (record) {
          // if record exists throw conflict error
          await trx.rollback();
          return res.status(409).send();
        } else {
          const result = await baseController.postWithResponse(ExpenseTypeModel, data, req, {
            trx,
          });
          await trx.commit();
          res.status(201).send(result);
        }
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
          .orWhere('farm_id', farm_id);
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
        await trx.rollback();
        res.sendStatus(403);
      }
      try {
        // do not allow operations to deleted records
        if (await this.isDeleted(req.params.expense_type_id, trx)) {
          await trx.rollback();
          return res.status(404).send();
        }

        // soft delete the record
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

  updateFarmExpenseType() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      const { expense_type_id } = req.params;
      const farm_id = req.headers.farm_id;
      const data = req.body;

      try {
        // do not allow updating of farm_id
        if (data.farm_id && data.farm_id !== farm_id) {
          await trx.rollback();
          return res.status(400).send();
        }

        // do not allow update to deleted records
        if (await this.isDeleted(expense_type_id, trx)) {
          await trx.rollback();
          return res.status(404).send();
        }

        // if record exists then throw Conflict error
        if (await this.existsInFarm(trx, farm_id, data.expense_name, expense_type_id)) {
          await trx.rollback();
          return res.status(409).send();
        }

        data.expense_translation_key = baseController.formatTranslationKey(data.expense_name);
        //prevent empty strings
        data.custom_description = data.custom_description || null;

        const result = await baseController.patch(ExpenseTypeModel, expense_type_id, data, req, {
          trx,
        });
        await trx.commit();
        return result ? res.status(204).send() : res.status(404).send('Expense type not found');
      } catch (error) {
        await trx.rollback();
        return res.status(400).send(error);
      }
    };
  },

  /**
   * Check if records exists in DB
   * @param {Object} trx - transaction object
   * @param {number} farm_id
   * @param {String} expense_name
   * @param {number} expense_type_id - Expesnse type id to be excluded while checking records
   * @async
   * @returns {Promise} - Object DB record promise
   */
  existsInFarm(trx, farm_id, expense_name, expense_type_id = '') {
    let query = ExpenseTypeModel.query(trx).context({ showHidden: true }).where({
      expense_name,
      farm_id,
    });

    if (expense_type_id) {
      query = query.whereNot({ expense_type_id });
    }

    return query.first();
  },

  /**
   * To check if record is deleted or not
   * @param {number} expense_type_id - Expesnse type id
   * @param {Object} trx - transaction object
   * @async
   * @returns {Boolean} - true or false
   */
  async isDeleted(expense_type_id, trx) {
    const expense = await ExpenseTypeModel.query(trx)
      .context({ showHidden: true })
      .where({
        expense_type_id,
      })
      .select('deleted')
      .first();

    return expense.deleted;
  },
};

export default farmExpenseTypeController;
