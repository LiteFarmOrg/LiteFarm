import CropVarietyModel from '../models/cropVarietyModel.js';
import managementPlanModel from '../models/managementPlanModel.js';
import CropModel from '../models/cropModel.js';
import {
  getPublicS3BucketName,
  s3,
  imaginaryPost,
  getPublicS3Url,
} from '../util/digitalOceanSpaces.js';
import { v4 as uuidv4 } from 'uuid';
import { post } from './baseController.js';

const cropVarietyController = {
  getCropVarietiesByFarmId() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      try {
        const result = await CropVarietyModel.query().whereNotDeleted().where({ farm_id });
        return res.status(200).send(result);
      } catch (error) {
        return res.status(400).json({ error });
      }
    };
  },
  getCropVarietyByCropVarietyId() {
    return async (req, res, next) => {
      const { crop_variety_id } = req.params;
      try {
        const result = await CropVarietyModel.query().whereNotDeleted().findById(crop_variety_id);
        return result
          ? res.status(200).send(result)
          : res.status(404).send('Crop variety not found');
      } catch (error) {
        return res.status(400).json({ error });
      }
    };
  },
  deleteCropVariety() {
    return async (req, res, next) => {
      const { crop_variety_id } = req.params;
      try {
        const result = await CropVarietyModel.transaction(async (trx) => {
          const deletedManagementPlans = await managementPlanModel
            .query(trx)
            .context(req.user)
            .where({ crop_variety_id })
            .delete()
            .returning('management_plan_id');
          //TODO: fix when knex implemented deletion on joined for postgres https://github.com/knex/knex/issues/873
          deletedManagementPlans.length &&
            (await trx.raw(
              'delete from management_tasks using planting_management_plan where planting_management_plan.planting_management_plan_id = management_tasks.planting_management_plan_id and planting_management_plan.management_plan_id = any(?)',
              [deletedManagementPlans.map(({ management_plan_id }) => management_plan_id)],
            ));
          return await CropVarietyModel.query(trx)
            .context(req.user)
            .findById(crop_variety_id)
            .delete();
        });
        //TODO: If a task is not related to a location or a management plan, delete or keep the task?
        return result ? res.sendStatus(200) : res.status(404).send('Crop variety not found');
      } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
      }
    };
  },
  createCropVariety() {
    return async (req, res, next) => {
      try {
        const { crop_id } = req.body;
        const [relatedCrop] = await CropModel.query()
          .context({ showHidden: true })
          .where({ crop_id });
        const result = await post(CropVarietyModel, { ...relatedCrop, ...req.body }, req);
        return res.status(201).json(result);
      } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
      }
    };
  },
  updateCropVariety() {
    return async (req, res, next) => {
      const { crop_variety_id } = req.params;
      try {
        const result = await CropVarietyModel.query()
          .context(req.user)
          .findById(crop_variety_id)
          .patch(req.body);
        return result
          ? res.status(200).json(result)
          : res.status(404).send('Crop variety not found');
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });
      }
    };
  },
  uploadCropImage() {
    return async (req, res, next) => {
      try {
        const TYPE = 'webp';
        const fileName = `crop_variety/${uuidv4()}.${TYPE}`;

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

        await s3
          .putObject({
            Body: compressedImage.data,
            Bucket: getPublicS3BucketName(),
            Key: fileName,
            ACL: 'public-read',
          })
          .promise();

        return res.status(201).json({
          url: `${getPublicS3Url()}/${fileName}`,
        });
      } catch (error) {
        console.log(error);
        return res.status(400).send('Fail to upload image');
      }
    };
  },
};
export default cropVarietyController;
