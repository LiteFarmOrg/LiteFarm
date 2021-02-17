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
const knex = Model.knex();

const shiftController = {
  addShift() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const body = req.body;
        if (!body.tasks) {
          res.status(400).send('missing tasks');
          return;
        }
        const tasks = body.tasks;
        const user_id = req.user.user_id;
        const shift_result = await baseController.postWithResponse(shiftModel, body, trx, { user_id });
        const shift_id = shift_result.shift_id;
        shift_result.tasks = await shiftController.insertTasks(tasks, trx, shift_id);
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

  addMultiShift() {
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
          const user_id = req.user.user_id
          const shift_result = await baseController.postWithResponse(shiftModel, temp, trx, { user_id });
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

  delShift() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const sID = (req.params.shift_id).toString();
        const isShiftTaskDeleted = await shiftTaskModel.query(trx).context({ user_id: req.user.user_id }).where('shift_id', sID).delete();
        const isShiftDeleted = await baseController.delete(shiftModel, sID, trx, { user_id: req.user.user_id });
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

  getShiftByID() {
    return async (req, res) => {
      try {
        const id = req.params.shift_id;
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

  updateShift() {
    return async (req, res) => {
      //eslint-disable-next-line
      let trx = await transaction.start(Model.knex());
      try {
        if (!req.body.tasks) {
          res.status(400).send('missing tasks');
        }
        const user_id = req.user.user_id;
        const updatedShift = await baseController.put(shiftModel, req.params.shift_id, req.body, trx, { user_id });
        if (!updatedShift.length) {
          res.sendStatus(404).send('can not find shift');
        }
        const isShiftTaskDeleted = await shiftTaskModel.query(trx).context({ user_id: req.user.user_id }).delete().where('shift_id', req.params.shift_id);
        if (!isShiftTaskDeleted) {
          await trx.rollback();
          res.status(404).send('can not find shift tasks');
        }
        const tasks_added = await shiftController.insertTasks(req.body.tasks, trx, req.params.shift_id);
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

  getShiftByUserID() {
    return async (req, res) => {
      try {
        const user_id = req.params.user_id;
        const shiftIDs = await shiftModel.query().where('user_id', user_id).select('shift_id');
        const shifts = [];
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

  getShiftByFarmID() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const { user_id } = req.headers;
        const role = req.role;
        const data = await knex.select([
          'taskType.task_name', 'taskType.task_translation_key', 'shiftTask.task_id', 'shiftTask.shift_id', 'shiftTask.is_field',
          'shiftTask.field_id', 'shiftTask.field_crop_id', 'field.field_name', 'crop.crop_id', 'crop.crop_translation_key',
          'crop.crop_common_name', 'fieldCrop.variety', 'fieldCrop.area_used', 'fieldCrop.estimated_production', 'shift.shift_date',
          'fieldCrop.estimated_revenue', 'fieldCrop.start_date', 'fieldCrop.end_date', 'shift.wage_at_moment', 'shift.mood',
            'userFarm.user_id', 'userFarm.farm_id', 'userFarm.wage', 'users.first_name', 'users.last_name', 'shiftTask.duration'
          ]).from('shiftTask', 'taskType')
          .leftJoin('taskType', 'taskType.task_id', 'shiftTask.task_id')
          .leftJoin('fieldCrop', 'fieldCrop.field_crop_id', 'shiftTask.field_crop_id')
          .leftJoin('field', 'fieldCrop.field_id', 'field.field_id')
          .leftJoin('crop', 'fieldCrop.crop_id','crop.crop_id')
          .join('shift', 'shiftTask.shift_id', 'shift.shift_id')
          .join('userFarm',function(){
            this
              .on('shift.farm_id', 'userFarm.farm_id')
              .on('shift.user_id', 'userFarm.user_id')
          })
          .join('users', 'userFarm.user_id', 'users.user_id')
          .where(function() {
            role === 3 ? this.where('shift.farm_id', farm_id)
                .andWhere('shift.user_id', user_id)
                .andWhere('shift.deleted', false)
                .andWhere('shiftTask.deleted', false) :
              this.where('shift.farm_id', farm_id)
                .andWhere('shift.deleted', false)
                .andWhere('shiftTask.deleted', false);
          });
        if (data) {
          res.status(200).send(data);
        } else {
          res.status(200).send([]);
        }
      } catch (error) {
        //handle more exceptions
        console.log(error);
        res.status(400).json({
          error,
        });
      }
    }
  }

  getShiftByUserFarm() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const { user_id } = req.headers;
        const role = req.role;
        const data = await knex.select([
          'taskType.task_name', 'taskType.task_translation_key', 'shiftTask.task_id', 'shiftTask.shift_id', 'shiftTask.is_field',
          'shiftTask.field_id', 'shiftTask.field_crop_id', 'field.field_name', 'crop.crop_id', 'crop.crop_translation_key',
          'crop.crop_common_name', 'fieldCrop.variety', 'fieldCrop.area_used', 'fieldCrop.estimated_production', 'shift.shift_date',
          'fieldCrop.estimated_revenue', 'fieldCrop.start_date', 'fieldCrop.end_date', 'shift.wage_at_moment', 'shift.mood',
          'userFarm.user_id', 'userFarm.farm_id', 'userFarm.wage', 'users.first_name', 'users.last_name', 'shiftTask.duration',
        ]).from('shiftTask', 'taskType')
          .leftJoin('taskType', 'taskType.task_id', 'shiftTask.task_id')
          .leftJoin('fieldCrop', 'fieldCrop.field_crop_id', 'shiftTask.field_crop_id')
          .leftJoin('field', 'fieldCrop.field_id', 'field.field_id')
          .leftJoin('crop', 'fieldCrop.crop_id', 'crop.crop_id')
          .join('shift', 'shiftTask.shift_id', 'shift.shift_id')
          .join('userFarm', function() {
            this
              .on('shift.farm_id', 'userFarm.farm_id')
              .on('shift.user_id', 'userFarm.user_id');
          })
          .join('users', 'userFarm.user_id', 'users.user_id')
          .where(function() {
            this.where('shift.farm_id', farm_id)
              .andWhere('shift.user_id', user_id)
              .andWhere('shift.deleted', false)
              .andWhere('shiftTask.deleted', false);
          });
        if (data) {
          res.status(200).send(data);
        } else {
          res.status(200).send([]);
        }
      } catch (error) {
        //handle more exceptions
        console.log(error);
        res.status(400).json({
          error,
        });
      }
    }
  }

  async insertTasks(tasks, trx, shift_id) {
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
