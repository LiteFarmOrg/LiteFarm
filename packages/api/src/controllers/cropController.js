/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (cropController.js) is part of LiteFarm.
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
const cropModel = require('../models/cropModel');
const cropVarietyModel = require('../models/cropVarietyModel');
const { transaction, Model, UniqueViolationError } = require('objection');

const cropController = {

  addCropWithFarmID() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const data = req.body;
        data.user_added = true;
        data.crop_translation_key = data.crop_common_name;
        const result = await baseController.postWithResponse(cropModel, data, req, { trx });
        await trx.commit();
        res.status(201).send(result);
      } catch (error) {
        let violationError = false;
        if (error instanceof UniqueViolationError) {
          violationError = true;
          await trx.rollback();
          res.status(400).json({
            error,
            violationError,
          });

        }

        //handle more exceptions
        else {
          await trx.rollback();
          res.status(400).json({
            error,
            violationError,
          });
        }

      }
    };
  },

  addCropAndVarietyWithFarmId() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const { crop , variety } = req.body;
        crop.user_added = true;
        crop.crop_translation_key = crop.crop_common_name;
        const newCrop = await baseController.postWithResponse(cropModel, crop, req, { trx });
        const newVariety = await baseController.postWithResponse(cropVarietyModel, { crop_id: newCrop.crop_id, ...variety }, req, { trx });
        await trx.commit();
        res.status(201).send({ crop: newCrop, variety: newVariety });
      } catch (error) {
        let violationError = false;
        if (error instanceof UniqueViolationError) {
          violationError = true;
          await trx.rollback();
          res.status(400).json({
            error,
            violationError,
          });

        }

        //handle more exceptions
        else {
          await trx.rollback();
          res.status(400).json({
            error,
            violationError,
          });
        }

      }
    };
  },

  getAllCrop() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await cropController.get(farm_id);
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

  getIndividualCrop() {
    return async (req, res) => {
      try {
        const id = req.params.crop_id;
        const row = await baseController.getIndividual(cropModel, id);
        if (!row.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(row);
        }
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  // should only delete user added crop
  delCrop() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await cropController.del(req, trx);
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

  updateCrop() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const user_id = req.user.user_id;
        const data = req.body;
        data.crop_translation_key = data.crop_common_name;
        const updated = await baseController.put(cropModel, req.params.crop_id, data, req, { trx });
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

  async get(farm_id) {
    //TODO fix user added flag
    return await cropModel.query().whereNotDeleted().where('user_added', false).orWhere({ farm_id, deleted: false });
  },

  async del(req, trx) {
    const id = req.params.crop_id;
    const table_id = cropModel.idColumn;
    return await cropModel.query(trx).context({ user_id: req.user.user_id }).where(table_id, id).andWhere('user_added', true).delete();
  },
};

module.exports = cropController;
