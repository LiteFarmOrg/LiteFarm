/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (taskTypeController.js) is part of LiteFarm.
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
const TaskTypeModel = require('../models/taskTypeModel');
const { transaction, Model } = require('objection');


class taskTypeController extends baseController {
  static addType() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const user_id = req.user.user_id
        const data = req.body;
        data.task_translation_key = data.task_name;
        const result = await baseController.postWithResponse(TaskTypeModel, data, trx, { user_id });
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

  static getAllTypes() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await TaskTypeModel.query().whereNotDeleted().where('farm_id', null).orWhere({farm_id, deleted: false});
        if (!rows.length) {
          res.sendStatus(404)
        }
        else {
          res.status(200).send(rows)
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

  static getTypeByID() {
    return async (req, res) => {
      try {
        const id = req.params.task_type_id;
        const row = await baseController.getIndividual(TaskTypeModel, id);
        if (!row.length) {
          res.sendStatus(404)
        }
        else {
          res.status(200).send(row)
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

  static delType(){
    return async(req, res) => {
      const trx = await transaction.start(Model.knex());
      try{
        const isDeleted = await baseController.delete(TaskTypeModel, req.params.task_type_id, trx);
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

module.exports = taskTypeController;
