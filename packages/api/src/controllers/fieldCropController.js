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
const { transaction, Model, raw } = require('objection');
const knex = Model.knex();

const FieldCropController = {
  addFieldCrop() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const result = await baseController.postWithResponse(fieldCropModel, req.body, req, { trx });
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
  },

  delFieldCrop() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(fieldCropModel, req.params.field_crop_id, req, { trx });
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

  updateFieldCrop() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const user_id = req.user.user_id;
        const updated = await baseController.put(fieldCropModel, req.params.field_crop_id, req.body, req, { trx });
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
    };
  },

  getFieldCropByID() {
    return async (req, res) => {
      try {
        const field_crop_id = req.params.field_crop_id;
        const rows = await baseController.getIndividual(fieldCropModel, field_crop_id);
        if (!rows.length) {
          res.status(404).send('Field crop not found');
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

  getFieldCropByFarmID() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const fieldCrops = await fieldCropModel.query().whereNotDeleted()
          .withGraphJoined(`location.[
          figure.[area, line], 
           field, garden, buffer_zone,
          greenhouse
        ]`)
          .where('location.farm_id', farm_id);
        return res.status(200).send(fieldCrops);
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },

  getFieldCropsByDate() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const date = req.params.date;
        const dataPoints = await fieldCropModel.query().whereNotDeleted()
          .join('field', 'field.field_id', 'fieldCrop.field_id')
          .join('farm', 'farm.farm_id', 'field.farm_id')
          .where('farm.farm_id', farmID)
          .where('fieldCrop.end_date', '>=', date);


        if (dataPoints) {
          res.status(200).send(dataPoints);
        } else {
          res.status(200).send([]);
        }
      } catch (error) {
        res.status(400).json({ error });
      }
    };
  },

  getExpiredFieldCrops() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const dataPoints = await fieldCropModel.query().whereNotDeleted()
          .join('field', 'field.field_id', 'fieldCrop.field_id')
          .join('farm', 'farm.farm_id', 'field.farm_id')
          .where('farm.farm_id', farmID)
          .where(raw('"fieldCrop".end_date < now()'));

        if (dataPoints) {
          res.status(200).send(dataPoints);
        } else {
          res.status(200).send([]);
        }
      } catch (error) {
        res.status(400).json({ error });
      }
    }
  },
}

module.exports = FieldCropController;
