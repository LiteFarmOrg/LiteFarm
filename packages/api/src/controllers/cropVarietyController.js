const CropVarietyModel = require('../models/cropVarietyModel');
const CropModel = require('../models/cropModel');
const nutrients = ['protein', 'lipid', 'ph', 'energy', 'ca', 'fe', 'mg', 'k', 'na', 'zn', 'cu',
  'mn', 'vita_rae', 'vitc', 'thiamin', 'riboflavin', 'niacin', 'vitb6', 'folate', 'vitb12', 'nutrient_credits',
  'can_be_cover_crop'];
const { getPublicS3BucketName, getImaginaryThumbnailUrl, s3, DO_ENDPOINT } = require('../util/digitalOceanSpaces');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const path = require('path');

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
        const result = await CropVarietyModel.query().context(req.user).findById(crop_variety_id).delete();
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
        const [relatedCrop] = await CropModel.query().where({ crop_id });
        const cropData = nutrients.reduce((obj, k) => ({ ...obj, [k]: relatedCrop[k] }), {});
        const result = await CropVarietyModel.query().context(req.user).insert({ ...req.body, ...cropData });
        return res.status(201).json(result);
      } catch (error) {
        return res.status(400).json({ error });
      }
    };
  },
  updateCropVariety() {
    return async (req, res, next) => {
      const { crop_variety_id } = req.params;
      try {
        const result = await CropVarietyModel.query().context(req.user).findById(crop_variety_id).patch(req.body);
        return result ? res.status(200).json(result) : res.status(404).send('Crop variety not found');
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error });
      }
    };
  },
  uploadCropImage() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      try {
        const s3BucketName = getPublicS3BucketName();

        const fileName = `crop_variety/${uuidv4()}`;

        await s3.putObject({
          Body: req.file.buffer,
          Bucket: s3BucketName,
          Key: fileName,
          ACL: 'public-read',
        }).promise();

        const presignedUrl = s3.getSignedUrl('getObject', {
          Bucket: s3BucketName,
          Key: fileName,
          Expires: 60,
        });

        const THUMBNAIL_FORMAT = 'webp';
        const THUMBNAIL_WIDTH = '300';

        const thumbnail = await axios.get(getImaginaryThumbnailUrl(presignedUrl, {
          width: THUMBNAIL_WIDTH,
          format: THUMBNAIL_FORMAT,
        }), {
          headers: {
            'API-Key': process.env.IMAGINARY_TOKEN,
          },
          responseType: 'arraybuffer',
        });

        const thumbnailName = `${farm_id}/thumbnail/${uuidv4()}.${THUMBNAIL_FORMAT}`;

        await s3.putObject({
          Body: thumbnail.data,
          Bucket: getPublicS3BucketName(),
          Key: thumbnailName,
          ACL: 'private',
        }).promise();


        return res.status(201).json({
          url: `https://${s3BucketName}.${DO_ENDPOINT}/${fileName}`,
          thumbnail_url: `https://${s3BucketName}.${DO_ENDPOINT}/${thumbnailName}`,
        });
      } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
      }
    };
  },
};
module.exports = cropVarietyController;
