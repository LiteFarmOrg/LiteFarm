import CropVarietyModel from '../models/cropVarietyModel.js';
import ManagementPlanModel from '../models/managementPlanModel.js';
import CropModel from '../models/cropModel.js';
import baseController from './baseController.js';
import { uploadPublicImage } from '../util/imageUpload.js';

const { post } = baseController;

const cropVarietyController = {
  getCropVarietiesByFarmId() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      try {
        const result = await CropVarietyModel.query().whereNotDeleted().where({ farm_id });
        return res.status(200).send(result);
      } catch (error) {
        console.error(error);
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
        console.error(error);
        return res.status(400).json({ error });
      }
    };
  },
  deleteCropVariety() {
    return async (req, res, next) => {
      const { crop_variety_id } = req.params;
      try {
        const result = await CropVarietyModel.transaction(async (trx) => {
          const deletedManagementPlans = await ManagementPlanModel.query(trx)
            .context(req.auth)
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
            .context(req.auth)
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
        const { crop_id, crop_variety_name, farm_id } = req.body;
        const [relatedCrop] = await CropModel.query()
          .context({ showHidden: true })
          .where({ crop_id });
        if (farm_id && crop_id && crop_variety_name) {
          const duplicateVariety = await CropVarietyModel.query().findOne({
            farm_id,
            crop_id,
            crop_variety_name,
            deleted: false,
          });
          if (duplicateVariety) {
            return res.status(400).json({
              error: 'This crop variety already exists, please choose a different variety name',
            });
          }
        }
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
      const { farm_id, crop_id, crop_variety_name } = req.body;
      try {
        if (farm_id && crop_id && crop_variety_name && crop_variety_id) {
          const duplicateVariety = await CropVarietyModel.query()
            .whereNot('crop_variety_id', crop_variety_id)
            .findOne({
              farm_id,
              crop_id,
              crop_variety_name,
              deleted: false,
            });
          if (duplicateVariety) {
            return res.status(400).json({
              error: 'This crop variety already exists, please choose a different variety name',
            });
          }
        }
        const result = await CropVarietyModel.query()
          .context(req.auth)
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
      await uploadPublicImage('crop_variety')(req, res, next);
    };
  },
};
export default cropVarietyController;
