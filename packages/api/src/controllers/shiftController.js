/* eslint-disable */
/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (shiftController.js) is part of LiteFarm.
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
const { transaction, Model } = require('objection');
const shiftModel = require('../models/shiftModel');
const shiftTaskModel = require('../models/shiftTaskModel');
const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../knexfile')[environment];
const knex = Knex(config);

class shiftController extends baseController {
  static addShift() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const body = req.body;
        console.log(body);
        if (!body.tasks) {
          res.status(400).send('missing tasks');
          return;
        }
        const tasks = body.tasks;
        let shift_result = await baseController.postWithResponse(shiftModel, body, trx);
        const shift_id = shift_result.shift_id;
        shift_result.tasks = await shiftController.insertTasks(tasks, trx, shift_id);
        console.log(shift_result);
        await trx.commit();
        res.status(201).send(shift_result);
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  }

  static addMultiShift() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const body = req.body;
        if (!body.tasks) {
          res.status(400).send('missing tasks');
          return;
        }
        const tasks = body.tasks;
        const shiftUsers = body.shift_users;
        for(let sUser of shiftUsers){ // eslint-disable-line
          const temp = body;
          temp.user_id = sUser.value;
          temp.wage_at_moment = sUser.wage;
          temp.mood = sUser.mood;
          const shift_result = await baseController.postWithResponse(shiftModel, temp, trx);
          const shift_id = shift_result.shift_id;
          shift_result.tasks = await shiftController.insertTasks(tasks, trx, shift_id);
        }
        await trx.commit();
        res.sendStatus(201);
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  }

  static delShift() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const sID = (req.params.id).toString();
        const isShiftTaskDeleted = await shiftTaskModel.query(trx).where('shift_id', sID).del();
        const isShiftDeleted = await baseController.delete(shiftModel, sID, trx);
        await trx.commit();
        if (isShiftDeleted && isShiftTaskDeleted) {
          res.sendStatus(200);
        }
        else {
          await trx.rollback();
          res.sendStatus(404);
        }
      }
      catch (error) {
        await trx.rollback();
        res.status(400).send(error);
      }
    }
  }

  static getShiftByID() {
    return async (req, res) => {
      try {
        const id = req.params.id;
        const shiftRow = await baseController.getIndividual(shiftModel, id);
        if (!shiftRow.length) {
          res.status(404).send('Shift not found');
        }
        const taskRow = await baseController.getByForeignKey(shiftTaskModel, 'shift_id', id);
        if (!taskRow.length) {
          res.status(404).send('Shit tasks not found');
        }
        shiftRow[0].tasks = taskRow;
        res.status(200).send(shiftRow);
      }
      catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    }
  }

  static updateShift() {
    return async (req, res) => {
      //eslint-disable-next-line
      let trx = await transaction.start(Model.knex());
      try {
        if (!req.body.tasks) {
          res.status(400).send('missing tasks')
        }
        const updatedShift = await baseController.put(shiftModel, req.params.id, req.body, trx);
        if (!updatedShift.length) {
          res.sendStatus(404).send('can not find shift');
        }
        const isShiftTaskDeleted = await shiftTaskModel.query(trx).delete().where('shift_id', req.params.id);//await baseController.delete(shiftTaskModel, req.params.id, trx);
        if (!isShiftTaskDeleted) {
          await trx.rollback();
          res.status(404).send('can not find shift tasks');
        }
        const tasks_added = await shiftController.insertTasks(req.body.tasks, trx, req.params.id);
        updatedShift[0].tasks = tasks_added;
        await trx.commit();
        res.status(200).send(updatedShift);
      }
      catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    }
  }

  static getShiftByUserID() {
    return async (req, res) => {
      try {
        const user_id = req.params.user_id;
        const shiftIDs = await shiftModel.query().where('user_id', user_id).select('shift_id');
        //eslint-disable-next-line
        let shifts = [];
        //eslint-disable-next-line
        for (let idObj of shiftIDs) {
          const shift_id = idObj.shift_id;
          const shiftRow = await baseController.getIndividual(shiftModel, shift_id);
          if (!shiftRow.length) {
            //res.status(404).send('Shift not found');
            continue;
          }
          const taskRow = await baseController.getByForeignKey(shiftTaskModel, 'shift_id', shift_id);
          if (!taskRow.length) {
            //res.status(404).send('Shift task not found');
            continue;
          }
          shiftRow[0].tasks = taskRow;
          shifts.push(shiftRow[0]);
        }
        res.status(200).send(shifts);
      }
      catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    }
  }

  // old query for get shift by farm id
  /*  `SELECT *
            FROM "shiftTask" t, "shift" s, "users" u, "crop" c, "fieldCrop" f, "taskType" tp
            WHERE s.shift_id = t.shift_id AND s.user_id = u.user_id AND u.farm_id = '${farm_id}'
            AND t.field_crop_id = f.field_crop_id AND f.crop_id = c.crop_id AND t.task_id = tp.task_id`*/

  static getShiftByFarmID() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const data = await knex.raw(
          `
          SELECT t.task_id, tp.task_name, t.shift_id, t.is_field, t.field_id, x.field_name, t.field_crop_id, t.duration, s.start_time, s.end_time, s.wage_at_moment, u.user_id, u.farm_id, s.mood, u.wage, u.first_name, u.last_name, s.break_duration, x.crop_id, x.crop_common_name, x.variety, x.area_used, x.estimated_production, x.estimated_revenue, x.start_date, x.end_date
          FROM "shiftTask" t
          LEFT JOIN (
	          SELECT f.field_crop_id, c.crop_id, crop_common_name, f.area_used, f.estimated_production, f.estimated_revenue, f.start_date, f.end_date, f.variety, fd.field_name
	          FROM "fieldCrop" f, "crop" c, "field" fd
	          WHERE f.crop_id = c.crop_id AND f.field_id = fd.field_id
	          )
	          x ON x.field_crop_id = t.field_crop_id,
	        "shift" s, "users" u, "taskType" tp, "userFarm" uf
          WHERE s.shift_id = t.shift_id AND uf.user_id = u.user_id AND uf.farm_id = '${farm_id}'
          AND t.task_id = tp.task_id 
          `
        );
        if (data.rows) {
          res.status(200).send(data.rows);
        } else {
          res.status(200).send([]);
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

  static async insertTasks(tasks, trx, shift_id) {
    //eslint-disable-next-line
    let result = [];
    try {
      //eslint-disable-next-line
      for (let task of tasks) {
        if (task.is_field && !task.field_id) {
          throw 'missing field_id';
        }
        task.shift_id = shift_id;
        //eslint-disable-next-line
        let inserted = await shiftTaskModel.query(trx).insert(task).returning('*');
        result.push(inserted);
      }
      return result;
    }
    catch (error) {
      return error;
    }

  }
}

module.exports = shiftController;
