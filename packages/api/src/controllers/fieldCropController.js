/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (fieldCropController.js) is part of LiteFarm.
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
const fieldCropModel = require('../models/fieldCropModel');
const { transaction, Model } = require('objection');
const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../knexfile')[environment];
const knex = Knex(config);


class FieldCropController extends baseController {
  static addFieldCrop() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const result = await baseController.postWithResponse(fieldCropModel, req.body, trx);
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

  static delFieldCrop() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(fieldCropModel, req.params.id, trx);
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

  static updateFieldCrop() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const updated = await baseController.put(fieldCropModel, req.params.id, req.body, trx);
        await trx.commit();
        if (!updated.length) {
          res.sendStatus(404);
        } else {
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

  static getFieldCropByFarmID() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await FieldCropController.getByForeignKey(farm_id);
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

    const fieldCrops = await fieldCropModel.query().select('*').from('fieldCrop').join('field', function () {
      this.on('fieldCrop.field_id', '=', 'field.field_id');
    }).where('field.farm_id', farm_id)
      .join('crop', function () {
        this.on('fieldCrop.crop_id', '=', 'crop.crop_id');
      });

    for (const fieldCrop of fieldCrops) {
      await fieldCrop.$loadRelated('crop.[price(getFarm), yield(getFarm)]', {
        getFarm: (builder) => {
          builder.where('farm_id', farm_id);
        },
      })
    }

    return fieldCrops;
  }

  static getFieldCropsByDate() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const date = req.params.date;
        const dataPoints = await knex.raw(
          `SELECT *
          FROM "field" f, "fieldCrop" fc, "crop" c
          WHERE f.farm_id = '${farmID}' and f.field_id = fc.field_id and c.crop_id = fc.crop_id and to_char(date(fc.end_date), 'YYYY-MM-DD') >= '${date}'`);

        if (dataPoints.rows) {
          const body = dataPoints.rows;
          res.status(200).send(body);
        } else {
          res.status(200).send([]);
        }
      } catch (error) {
        res.status(400).json({ error })
      }
    };
  }

  static getExpiredFieldCrops() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const date = formatDate(new Date());
        const dataPoints = await knex.raw(
          `SELECT *
          FROM "field" f, "fieldCrop" fc, "crop" c
          WHERE f.farm_id = '${farmID}' and f.field_id = fc.field_id and c.crop_id = fc.crop_id and to_char(date(fc.end_date), 'YYYY-MM-DD') < '${date}'`);
        if (dataPoints.rows) {
          const body = dataPoints.rows;
          res.status(200).send(body);
        } else {
          res.status(200).send([]);
        }
      } catch (error) {
        res.status(400).json({ error })
      }
    }
  }
}

const formatDate = (currDate) => {
  const d = currDate;
  const year = d.getFullYear();
  let
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

module.exports = FieldCropController;
