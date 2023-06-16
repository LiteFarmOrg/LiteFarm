/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fieldController.js) is part of LiteFarm.
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
import fieldModel from '../models/fieldModel.js';
import { mapFieldsToStationId } from '../jobs/station_sync/mapping.js';
import { v4 as uuidv4 } from 'uuid';

const fieldController = {
  addField() {
    return async (req, res, next) => {
      const trx = await transaction.start(Model.knex());
      try {
        const result = await this.postWithResponse(req, trx);
        if (result.field_name.length === 0 || Object.keys(result.grid_points).length < 3) {
          await trx.rollback();
          return res.sendStatus(403);
        } else {
          await trx.commit();
          res.status(201).send(result);
          req.field = { fieldId: result.field_id, point: result.grid_points[0] };
          next();
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

  delField() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(fieldModel, req.params.field_id, req, {
          trx,
        });
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

  updateField() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const updated = await baseController.put(fieldModel, req.params.field_id, req.body, req, {
          trx,
        });
        await trx.commit();
        if (!updated.length) {
          res.sendStatus(404);
        } else if (updated[0].field_name.length === 0) {
          res.sendStatus(403);
        } else {
          res.status(200).send(updated);
        }
      } catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  },

  getFieldByFarmID() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await fieldController.getByForeignKey(farm_id);
        if (!rows.length) {
          res.status(200).send(rows);
        } else {
          res.status(200).send(rows);
        }
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  async getByForeignKey(farm_id) {
    const fields = await fieldModel
      .query()
      .whereNotDeleted()
      .select('*')
      .from('field')
      .where('field.farm_id', farm_id);

    return fields;
  },

  async postWithResponse(req, trx) {
    const id_column = fieldModel.idColumn;
    req.body[id_column] = uuidv4();
    return await baseController.postWithResponse(fieldModel, req.body, req, { trx });
  },

  // eslint-disable-next-line no-unused-vars
  mapFieldToStation(req, res) {
    mapFieldsToStationId([req.field]);
  },
};

export default fieldController;
