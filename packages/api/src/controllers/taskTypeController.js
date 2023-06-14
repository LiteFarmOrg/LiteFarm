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

import baseController from '../controllers/baseController.js';

import TaskTypeModel from '../models/taskTypeModel.js';
import { transaction, Model } from 'objection';

const taskTypeController = {
  addType() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        // const user_id = req.auth.user_id;
        const data = req.body;
        data.task_translation_key = data.task_name;
        const result = await baseController.postWithResponse(TaskTypeModel, data, req, { trx });
        await trx.commit();
        return res.status(201).send(result);
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        return res.status(400).json({
          error,
        });
      }
    };
  },

  getAllTypes() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await TaskTypeModel.query().where('farm_id', null).orWhere({ farm_id });
        if (!rows.length) {
          return res.sendStatus(404);
        } else {
          return res.status(200).send(rows);
        }
      } catch (error) {
        //handle more exceptions
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },

  getTypeByID() {
    return async (req, res) => {
      try {
        const id = req.params.task_type_id;
        const row = await baseController.getIndividual(TaskTypeModel, id);
        if (!row.length) {
          return res.sendStatus(404);
        } else {
          return res.status(200).send(row);
        }
      } catch (error) {
        //handle more exceptions
        return res.status(400).json({
          error,
        });
      }
    };
  },

  delType() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(TaskTypeModel, req.params.task_type_id, req, {
          trx,
        });
        await trx.commit();
        if (isDeleted) {
          return res.sendStatus(200);
        } else {
          return res.sendStatus(404);
        }
      } catch (error) {
        await trx.rollback();
        return res.status(400).json({
          error,
        });
      }
    };
  },
};

export default taskTypeController;
