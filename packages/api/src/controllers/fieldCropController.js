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
        console.log(error);
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
        const updated = await baseController.put(fieldCropModel, req.params.field_crop_id, req.body, req, { trx });
        await trx.commit();
        if (!updated.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(updated);
        }

      } catch (error) {
        console.log(error);
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
        const fieldCrop = await fieldCropModel.query().whereNotDeleted().findById(field_crop_id)
          .withGraphFetched(`[location.[
          figure.[area, line], 
           field, garden, buffer_zone,
          greenhouse
        ], crop_variety.[crop]]`);
        return fieldCrop ? res.status(200).send(fieldCrop) : res.status(404).send('Field crop not found');
      } catch (error) {
        console.log(error);
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
          .withGraphJoined(`[location.[
          figure.[area, line], 
           field, garden, buffer_zone,
          greenhouse
        ], crop_variety.[crop]]`)
          .where('location.farm_id', farm_id);
        return fieldCrops?.length ? res.status(200).send(fieldCrops) : res.status(404).send('Field crop not found');
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
        const farm_id = req.params.farm_id;
        const date = req.params.date;
        const fieldCrops = await fieldCropModel.query().whereNotDeleted()
          .withGraphJoined(`[location.[
          figure.[area, line], 
           field, garden, buffer_zone,
          greenhouse
        ], crop_variety.[crop]]`)
          .where('location.farm_id', farm_id)
          .andWhere('fieldCrop.end_date', '>=', date);


        return fieldCrops?.length ? res.status(200).send(fieldCrops) : res.status(404).send('Field crop not found');
      } catch (error) {
        res.status(400).json({ error });
      }
    };
  },

  getExpiredFieldCrops() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const fieldCrops = await fieldCropModel.query().whereNotDeleted()
          .withGraphJoined(`[location.[
          figure.[area, line], 
           field, garden, buffer_zone,
          greenhouse
        ], crop_variety.[crop]]`)
          .where('location.farm_id', farm_id)
          .andWhere(raw('"fieldCrop".end_date < now()'));


        return fieldCrops?.length ? res.status(200).send(fieldCrops) : res.status(404).send('Field crop not found');
      } catch (error) {
        res.status(400).json({ error });
      }
    }
  },
}

module.exports = FieldCropController;
