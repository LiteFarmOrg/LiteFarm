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

const baseController = require('../controllers/baseController');
const farmExpenseModel = require('../models/farmExpenseModel');
const expenseTypeModel = require('../models/expenseTypeModel');
const { transaction, Model } = require('objection');

class farmExpenseController extends baseController {
  static addFarmExpense() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const expenses = req.body;
        if(!Array.isArray(expenses)){
          res.status(400).send('needs to be an array of expense items')
        }
        //fuck lint i wanna use let. LET ME
        // eslint-disable-next-line
        for(let e of expenses){
          await baseController.post(farmExpenseModel, e, trx);
        }
        await trx.commit();
        res.sendStatus(201);
      } catch (error) {
        //handle more exceptions

        await trx.rollback();
        res.status(400).send(error)
      }
    };
  }

  static getAllFarmExpense() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await baseController.getByForeignKey(farmExpenseModel, 'farm_id', farm_id);
        res.status(200).send(rows);
      }
      catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    }
  }

  //takes an array of farm_expense_id
  static delFarmExpense() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const farmIDs = req.body;
        if(!Array.isArray(farmIDs)){
          res.status(400).send('Needs to be an array of farm id');
        }
        const table_id = farmExpenseModel.idColumn;
        // eslint-disable-next-line
        for(let id of farmIDs){
          const deleted = await farmExpenseModel.query(trx).where(table_id, id).del();
          if(!deleted){
            await trx.rollback();
            res.status(400).send('cannot delete expense with id ' + id);
          }
        }
        await trx.commit();
        res.sendStatus(200)
      }
      catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    }
  }

  static addFarmExpenseType() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const result = await baseController.postWithResponse(expenseTypeModel, req.body, trx);
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
  }

  static getFarmExpenseType() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const result = await expenseTypeModel.query().where('farm_id', null).orWhere('farm_id', farm_id);
        res.status(200).send(result);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  }

  static getDefaultTypes() {
    return async (req, res) => {
      try {
        const result = await expenseTypeModel.query().where('farm_id', null);
        res.status(200).send(result);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  }
}

module.exports = farmExpenseController;
