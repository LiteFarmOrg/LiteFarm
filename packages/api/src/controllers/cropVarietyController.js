const CropVarietyModel = require('../models/cropVarietyModel');
const baseController = require('./baseController');
const cropVarietyController = {
  getCropVarietiesByFarmId() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      try {
        const result = await CropVarietyModel.query().withGraphFetched('[crop]').where({ farm_id });
        return result?.length ? res.status(200).send(result) : res.status(404).send('Crop variety not found');
      } catch (error) {
        return res.status(400).json({ error });
      }
    };
  },
  getCropVarietyByCropVarietyId() {
    return async (req, res, next) => {
      const { crop_variety_id } = req.params;
      try {
        const result = await CropVarietyModel.query().withGraphFetched('[crop]').findById(crop_variety_id);
        return result ? res.status(200).send(result) : res.status(404).send('Crop variety not found');
      } catch (error) {
        return res.status(400).json({ error });
      }
    };
  },
  deleteCropVariety() {
    return async (req, res, next) => {
      const { crop_variety_id } = req.params;
      try {
        const result = await CropVarietyModel.query().where();
        return result ? res.sendStatus(200) : res.status(404).send('Crop variety not found');
      } catch (error) {
        return res.status(400).json({ error });
      }
    };
  },
  createCropVariety() {
    return async (req, res, next) => {
      try {
        const result = await CropVarietyModel.query().where();
        return res.status(201).send(result);
      } catch (error) {
        return res.status(400).json({ error });
      }
    };
  },
  updateCropVariety() {
    return async (req, res, next) => {
      const { crop_variety_id } = req.params;
      try {
        const result = await CropVarietyModel.query().where();
        return result ? res.status(200).send(result) : res.status(404).send('Crop variety not found');
      } catch (error) {
        return res.status(400).send({ error });
      }
    };
  },
};
module.exports = cropVarietyController;
