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
const expenseTypeModel = require('../models/expenseTypeModel');
const { transaction, Model } = require('objection');

class farmExpenseTypeController extends baseController {

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
            const result = await expenseTypeModel.query().where('farm_id', null).orWhere('farm_id', farm_id).whereNotDeleted();
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

      static delFarmExpenseType(){
        return async(req, res) => {
          const trx = await transaction.start(Model.knex());
          try{
            const isDeleted = await baseController.delete(expenseTypeModel, req.params.expense_type_id, trx);
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

module.exports = farmExpenseTypeController;


