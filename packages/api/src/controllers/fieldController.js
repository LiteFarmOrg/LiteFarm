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
const uuidv4 = require('uuid/v4');


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
        res.status(201).send(result);
        req.field = { fieldId: result.field_id, point: result.grid_points[0] }
        next()
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
        const isDeleted = await baseController.delete(fieldModel, req.params.id, trx);
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
    console.log("entering update field fn")
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        console.log("entering try block")
        console.log("req params are")
        console.log(req.params)
        console.log("req params field id is")
        console.log(req.params.field_id)
        console.log("req body is")
        console.log(req.body)
        const updated = await baseController.put(fieldModel, req.params.field_id, req.body, trx);
        console.log("updated is")
        console.log(updated)
        await trx.commit();
        if (!updated.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(updated);
        }

      } catch (error) {
        console.log("entering catch block")
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
