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

const baseController = require('../controllers/baseController');
const { transaction, Model } = require('objection');
const fieldModel = require('../models/fieldModel');
const { mapFieldsToStationId } = require('../jobs/station_sync/mapping')
const { v4 : uuidv4 } = require('uuid');


class fieldController extends baseController {
  constructor() {
    super();
  }

  static addField() {
    return async (req, res, next) => {
      const trx = await transaction.start(Model.knex());
      try {
        const result = await fieldController.postWithResponse(req, trx);
        await trx.commit();
        if (result.field_name == 0) {
          res.sendStatus(403)
        }

        else if (Object.keys(result.grid_points).length < 3) {
          res.sendStatus(403);
        }

        else {
          res.status(201).send(result);
          req.field = { fieldId: result.field_id, point: result.grid_points[0] }
          next()
        }
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  }

  static delField() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(fieldModel, req.params.field_id, trx);
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
    }
  }

  static updateField() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const updated = await baseController.put(fieldModel, req.params.field_id, req.body, trx);
        await trx.commit();
        if (!updated.length) {
          res.sendStatus(404);
        }
        else if (updated[0].field_name.length == 0) {
          res.sendStatus(403);
        }

        else {
          res.status(200).send(updated);
        }

      } catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    }
  }

  static getFieldByFarmID() {
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
    }
  }

  static async getByForeignKey(farm_id) {

    const fields = await fieldModel.query().whereNotDeleted().select('*').from('field').where('field.farm_id', farm_id);

    return fields;
  }

  static async postWithResponse(req, trx) {
    const id_column = fieldModel.idColumn;
    req.body[id_column] = uuidv4();
    return await super.postWithResponse(fieldModel, req.body, trx);
  }

  static mapFieldToStation(req, res) {
    mapFieldsToStationId([req.field]);
  }
}

module.exports = fieldController;
