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

import baseController from '../controllers/baseController.js';

import CropModel from '../models/cropModel.js';
import CropVarietyModel from '../models/cropVarietyModel.js';
import objection from 'objection';
const { transaction, Model, UniqueViolationError } = objection;

const cropController = {
  addCropWithFarmID() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const data = req.body;
        data.user_added = true;
        data.crop_translation_key = data.crop_common_name;
        const result = await baseController.postWithResponse(CropModel, data, req, { trx });
        await trx.commit();
        res.status(201).send(result);
      } catch (error) {
        console.log(error);
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
        const { crop, variety } = req.body;
        crop.user_added = true;
        crop.crop_translation_key = crop.crop_common_name;
        const newCrop = await baseController.postWithResponse(CropModel, crop, req, { trx });
        const newVariety = await baseController.postWithResponse(
          CropVarietyModel,
          { ...newCrop, ...variety },
          req,
          { trx },
        );
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
        const rows =
          req.query?.fetch_all === 'false'
            ? await CropModel.query().whereNotDeleted().where({
                farm_id,
              })
            : await cropController.get(farm_id);
        return res.status(200).send(rows);
      } catch (error) {
        //handle more exceptions
        return res.status(400).json({
          error,
        });
      }
    };
  },

  getIndividualCrop() {
    return async (req, res) => {
      try {
        const id = req.params.crop_id;
        const row = await baseController.getIndividual(CropModel, id);
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
        // const user_id = req.user.user_id;
        const data = req.body;
        data.crop_translation_key = data.crop_common_name;
        const updated = await baseController.put(CropModel, req.params.crop_id, data, req, { trx });
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
    return await CropModel.query()
      .whereNotDeleted()
      .where('reviewed', true)
      .orWhere({ farm_id, deleted: false });
  },

  async del(req, trx) {
    const id = req.params.crop_id;
    const table_id = CropModel.idColumn;
    return await CropModel.query(trx)
      .context({ user_id: req.user.user_id })
      .where(table_id, id)
      .andWhere('user_added', true)
      .delete();
  },
};

export default cropController;
