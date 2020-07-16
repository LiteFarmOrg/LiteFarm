/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (planController.js) is part of LiteFarm.
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
const planModel = require('../models/planModel');
const uuidv4 = require('uuid/v4');
const { transaction, Model } = require('objection');


class PlanController extends baseController {
  static addPlan() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const result = await PlanController.postWithResponse(req, trx);
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

  static getPlanByFarmId() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const row = await baseController.getByForeignKey(planModel, 'farm_id', farm_id);
        if (!row.length) {
          res.sendStatus(404)
        }
        else {
          res.status(200).send(row);
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

  static delPlan() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(planModel, req.params.id, trx);
        await trx.commit();
        if (isDeleted) {
          res.sendStatus(200);
        }
        else {
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

  static async postWithResponse(req, trx){
    const id_column = planModel.idColumn;
    req.body[id_column] = uuidv4();
    return await super.postWithResponse(planModel, req.body, trx);
  }
}

module.exports = PlanController;
