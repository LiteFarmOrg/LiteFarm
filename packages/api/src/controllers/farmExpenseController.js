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
        const resultArray = [];
        for(let e of expenses){
          const result = await baseController.post(farmExpenseModel, e, trx);
          resultArray.push(result)
        }
        await trx.commit();
        res.sendStatus(201);
      } catch (error) {
        console.log("error is")
        console.log(error)
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
        const rows = await farmExpenseController.getByForeignKey(farm_id);
    
      if (!rows.length) {
        res.sendStatus(404)
      }
      else {
        res.status(200).send(rows);
      }
    }
      catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    }
  }

  static async getByForeignKey(farm_id) {
    const expenses = await farmExpenseModel.query().select('*').from('farmExpense').where('farmExpense.farm_id', farm_id).whereNotDeleted();
    return expenses;
  }

  //takes an array of farm_expense_id
  // static delFarmExpense() {
  //   return async (req, res) => {
  //     const trx = await transaction.start(Model.knex());
  //     try {
  //       console.log("req params is")
  //       console.log(req.params)
  //       const farmIDs = req.body;
  //       console.log("req body is")
  //       console.log(req.body)
  //       if(!Array.isArray(farmIDs)){
  //         res.status(400).send('Needs to be an array of farm id');
  //       }
  //       const table_id = farmExpenseModel.idColumn;
  //       for(let id of farmIDs){
  //         const deleted = await farmExpenseModel.query(trx).where(table_id, id).del();
  //         if(!deleted){
  //           await trx.rollback();
  //           res.status(400).send('cannot delete expense with id ' + id);
  //         }
  //       }
  //       await trx.commit();
  //       res.sendStatus(200)
  //     }
  //     catch (error) {
  //       console.log("error is")
  //       console.log(error)
  //       await trx.rollback();
  //       res.status(400).json({
  //         error,
  //       });
  //     }
  //   }
  // }

  static delFarmExpense(){
    return async(req, res) => {
      const trx = await transaction.start(Model.knex());
      try{
        const isDeleted = await baseController.delete(farmExpenseModel, req.params.farm_expense_id, trx);
        await trx.commit();
        if(isDeleted){
          res.sendStatus(200);
        }
        else{
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
}

module.exports = farmExpenseController;
