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

import baseController from '../controllers/baseController.js';

import { transaction, Model } from 'objection';
import ShiftModel from '../models/shiftModel.js';
import ShiftTaskModel from '../models/shiftTaskModel.js';
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
        const shift_result = await baseController.postWithResponse(ShiftModel, body, req, { trx });
        const shift_id = shift_result.shift_id;
        shift_result.tasks = await shiftController.insertTasks(tasks, trx, shift_id, user_id);
        await trx.commit();
        res.status(201).send(shift_result);
      } catch (error) {
        console.log(error);
        //handle more exceptions
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  },

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
        for (const sUser of shiftUsers) {
          // eslint-disable-line
          const temp = body;
          temp.user_id = sUser.value;
          temp.wage_at_moment = sUser.wage;
          temp.mood = sUser.mood;
          // const user_id = req.user.user_id;
          const shift_result = await baseController.postWithResponse(ShiftModel, temp, req, {
            trx,
          });
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
  },

  delShift() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const sID = req.params.shift_id.toString();
        const isShiftTaskDeleted = await ShiftTaskModel.query(trx)
          .context({ user_id: req.user.user_id })
          .where('shift_id', sID)
          .delete();
        const isShiftDeleted = await baseController.delete(ShiftModel, sID, req, { trx });
        await trx.commit();
        if (isShiftDeleted && isShiftTaskDeleted) {
          res.sendStatus(200);
        } else {
          await trx.rollback();
          res.sendStatus(404);
        }
      } catch (error) {
        await trx.rollback();
        res.status(400).send(error);
      }
    };
  },

  getShiftByID() {
    return async (req, res) => {
      try {
        const id = req.params.shift_id;
        const shiftRow = await baseController.getIndividual(ShiftModel, id);
        if (!shiftRow.length) {
          res.status(404).send('Shift not found');
        }
        const taskRow = await baseController.getByForeignKey(ShiftTaskModel, 'shift_id', id);
        if (!taskRow.length) {
          res.status(404).send('Shit tasks not found');
        }
        shiftRow[0].tasks = taskRow;
        res.status(200).send(shiftRow);
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  updateShift() {
    return async (req, res) => {
      //eslint-disable-next-line
      let trx = await transaction.start(Model.knex());
      try {
        if (!req.body.tasks) {
          res.status(400).send('missing tasks');
        }
        const user_id = req.user.user_id;
        const updatedShift = await baseController.put(
          ShiftModel,
          req.params.shift_id,
          req.body,
          req,
          { trx },
        );
        if (!updatedShift.length) {
          res.sendStatus(404).send('can not find shift');
        }
        const isShiftTaskDeleted = await ShiftTaskModel.query(trx)
          .context({ user_id: req.user.user_id })
          .delete()
          .where('shift_id', req.params.shift_id);
        if (!isShiftTaskDeleted) {
          await trx.rollback();
          res.status(404).send('can not find shift tasks');
        }
        const tasks_added = await shiftController.insertTasks(
          req.body.tasks,
          trx,
          req.params.shift_id,
          user_id,
        );
        updatedShift[0].tasks = tasks_added;
        await trx.commit();
        res.status(200).send(updatedShift);
      } catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  },

  getShiftByUserID() {
    return async (req, res) => {
      try {
        const user_id = req.params.user_id;
        const shiftIDs = await ShiftModel.query().where('user_id', user_id).select('shift_id');
        const shifts = [];
        for (const idObj of shiftIDs) {
          const shift_id = idObj.shift_id;
          const shiftRow = await baseController.getIndividual(ShiftModel, shift_id);
          if (!shiftRow.length) {
            //res.status(404).send('Shift not found');
            continue;
          }
          const taskRow = await baseController.getByForeignKey(
            ShiftTaskModel,
            'shift_id',
            shift_id,
          );
          if (!taskRow.length) {
            //res.status(404).send('Shift task not found');
            continue;
          }
          shiftRow[0].tasks = taskRow;
          shifts.push(shiftRow[0]);
        }
        res.status(200).send(shifts);
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  getShiftByFarmID() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        // const { user_id } = req.headers;
        // const role = req.role;
        const data = await knex
          .select([
            'task_type.task_name',
            'task_type.task_translation_key',
            'shiftTask.task_id',
            'shiftTask.shift_id',
            'shiftTask.is_location',
            'shiftTask.location_id',
            'shiftTask.management_plan_id',
            'location.name',
            'crop.crop_id',
            'crop.crop_translation_key',
            'crop.crop_common_name',
            'crop_variety.crop_variety_name',
            'shift.shift_date',
            'management_plan.start_date',
            'shift.wage_at_moment',
            'shift.mood',
            'userFarm.user_id',
            'userFarm.farm_id',
            'userFarm.wage',
            'users.first_name',
            'users.last_name',
            'shiftTask.duration',
          ])
          .from('shiftTask')
          .leftJoin('task', 'task.task_id', 'shiftTask.task_id')
          .leftJoin('task_type', 'task_type.task_type_id', 'task.task_type_id')
          .leftJoin(
            'management_plan',
            'management_plan.management_plan_id',
            'shiftTask.management_plan_id',
          )
          .leftJoin('location', 'shiftTask.location_id', 'location.location_id')
          .leftJoin(
            'crop_variety',
            'management_plan.crop_variety_id',
            'crop_variety.crop_variety_id',
          )
          .leftJoin('crop', 'crop_variety.crop_id', 'crop.crop_id')
          .join('shift', 'shiftTask.shift_id', 'shift.shift_id')
          .join('userFarm', function () {
            this.on('shift.farm_id', 'userFarm.farm_id').on('shift.user_id', 'userFarm.user_id');
          })
          .join('users', 'userFarm.user_id', 'users.user_id')
          .where('shift.farm_id', farm_id)
          .andWhere('shift.deleted', false)
          .andWhere('shiftTask.deleted', false);

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
    };
  },

  getShiftByUserFarm() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const { user_id } = req.headers;
        const data = await knex
          .select([
            'task_type.task_name',
            'task_type.task_translation_key',
            'shiftTask.task_id',
            'shiftTask.shift_id',
            'shiftTask.is_location',
            'shiftTask.location_id',
            'shiftTask.management_plan_id',
            'location.name',
            'crop.crop_id',
            'crop.crop_translation_key',
            'crop.crop_common_name',
            'crop_variety.crop_variety_name',
            'management_plan.estimated_production',
            'shift.shift_date',
            'management_plan.estimated_revenue',
            'management_plan.start_date',
            'management_plan.end_date',
            'shift.wage_at_moment',
            'shift.mood',
            'userFarm.user_id',
            'userFarm.farm_id',
            'userFarm.wage',
            'users.first_name',
            'users.last_name',
            'shiftTask.duration',
            'shift.created_by_user_id as created_by',
          ])
          .from('shiftTask')
          .leftJoin('task', 'task.task_id', 'shiftTask.task_id')
          .leftJoin('task_type', 'task_type.task_type_id', 'task.task_type_id')
          .leftJoin(
            'management_plan',
            'management_plan.management_plan_id',
            'shiftTask.management_plan_id',
          )
          .leftJoin('location', 'shiftTask.location_id', 'location.location_id')
          .leftJoin(
            'crop_variety',
            'management_plan.crop_variety_id',
            'crop_variety.crop_variety_id',
          )
          .leftJoin('crop', 'crop_variety.crop_id', 'crop.crop_id')
          .join('shift', 'shiftTask.shift_id', 'shift.shift_id')
          .join('userFarm', function () {
            this.on('shift.farm_id', 'userFarm.farm_id').on('shift.user_id', 'userFarm.user_id');
          })
          .join('users', 'userFarm.user_id', 'users.user_id')
          .where('shift.farm_id', farm_id)
          .andWhere('shift.user_id', user_id)
          .andWhere('shift.deleted', false)
          .andWhere('shiftTask.deleted', false);
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
    };
  },

  async insertTasks(tasks, trx, shift_id, user_id) {
    //eslint-disable-next-line
    let result = [];
    try {
      //eslint-disable-next-line
      for (let task of tasks) {
        if (task.is_location && !task.location_id) {
          throw 'missing location_id';
        }
        task.shift_id = shift_id;
        //eslint-disable-next-line
        let inserted = await ShiftTaskModel.query(trx)
          .context({ user_id })
          .insert(task)
          .returning('*');
        result.push(inserted);
      }
      return result;
    } catch (error) {
      console.error(error);
      throw new Error('Could not insert tasks');
    }
  },
};

export default shiftController;
