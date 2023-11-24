/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
 *  This file is part of LiteFarm.
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
import nominationController from './nominationController.js';
import NominationCrop from '../models/nominationCropModel.js';
import CropModel from '../models/cropModel.js';
import CropVarietyModel from '../models/cropVarietyModel.js';
import objection from 'objection';
import {
  getPublicS3BucketName,
  s3,
  imaginaryPost,
  getPublicS3Url,
} from '../util/digitalOceanSpaces.js';
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand } from '@aws-sdk/client-s3';

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
        const { crop, variety, farm_id } = req.body;
        const duplicateCrop = await CropModel.query().findOne({
          farm_id,
          crop_common_name: crop.crop_common_name,
          crop_genus: crop.crop_genus || null, // Use null if the value is undefined
          crop_specie: crop.crop_specie || null, // Use null if the value is undefined
          deleted: false,
        });
        if (duplicateCrop) {
          await trx.rollback();
          return res.status(400).json({
            error: 'This crop already exists, please edit your crop name, genus or species',
          });
        }
        crop.user_added = true;
        crop.crop_translation_key = crop.crop_common_name;
        const newCrop = await baseController.postWithResponse(CropModel, crop, req, { trx });
        const newVariety = await baseController.postWithResponse(
          CropVarietyModel,
          { ...newCrop, ...variety },
          req,
          { trx },
        );
        if (crop.nominate_crop) {
          req.body.crop_id = newCrop.crop_id;
          await nominationController.addNominationFromController(
            NominationCrop,
            'CROP_NOMINATION',
            'NOMINATED',
            req,
            { trx },
          );
        }

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

  uploadCropImage() {
    return async (req, res, next) => {
      try {
        const TYPE = 'webp';
        const fileName = `crop/${uuidv4()}.${TYPE}`;

        const THUMBNAIL_FORMAT = 'webp';
        const LENGTH = '208';

        const compressedImage = await imaginaryPost(
          req.file,
          {
            width: LENGTH,
            height: LENGTH,
            type: THUMBNAIL_FORMAT,
            aspectratio: '1:1',
          },
          { endpoint: 'smartcrop' },
        );

        await s3.send(
          new PutObjectCommand({
            Body: compressedImage.data,
            Bucket: getPublicS3BucketName(),
            Key: fileName,
            ACL: 'public-read',
          }),
        );

        return res.status(201).json({
          url: `${getPublicS3Url()}/${fileName}`,
        });
      } catch (error) {
        console.log(error);
        return res.status(400).send('Fail to upload image');
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
      .context({ user_id: req.auth.user_id })
      .where(table_id, id)
      .andWhere('user_added', true)
      .delete();
  },
};

export default cropController;
