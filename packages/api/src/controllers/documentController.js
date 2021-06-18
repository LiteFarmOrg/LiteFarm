const DocumentModel = require('../models/documentModel');
const S3 = require('aws-sdk/clients/s3');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const path = require('path');


const documentController = {
  getDocumentsByFarmId() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      try {
        const result = await DocumentModel.query().whereNotDeleted().withGraphFetched('[files]').where({ farm_id });
        return result?.length ? res.status(200).send(result) : res.status(404).send('No documents found');
      } catch (error) {
        console.error(error);
        return res.status(400).json({ error });
      }
    };
  },
  createDocument() {
    return async (req, res, next) => {
      try {
        const result = await DocumentModel.query().context(req.user).insert(req.body);
        return res.status(201).json(result);
      } catch (error) {
        return res.status(400).json({ error });
      }
    };
  },

  deleteNewEntity() {
    return async (req, res, next) => {
      const { new_entity_id } = req.params;
      try {
        const result = await NewEntityModel.query().where();
        return result ? res.sendStatus(200):  res.status(404).send('New entity not found');
      } catch (error) {
        return res.status(400).json({ error });
      }
    }
  },
  archiveDocument() {
    return async (req, res, next) => {
      const { document_id } = req.params;
      try {
        const result = await DocumentModel.query().context(req.user).findById(document_id).patch({ valid_until: new Date('2000/1/1').toISOString() });
        return result ? res.status(200).send(result) : res.status(404).send('Document not found');
      } catch (error) {
        return res.status(400).json({ error });
      }
    };
  },
  uploadDocument() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      try {
        const DO_ENDPOINT = 'nyc3.digitaloceanspaces.com';
        const s3BucketName = getS3BucketName();
        const s3 = new S3({
          endpoint: DO_ENDPOINT,
          accessKeyId: process.env.DO_SPACES_ACCESS_KEY_ID,
          secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY,
        });

        const fileName = `${farm_id}/document/${uuidv4()}${path.extname(req.file.originalname)}`;

        await s3.putObject({
          Body: req.file.buffer,
          Bucket: s3BucketName,
          Key: fileName,
          ACL: 'private',
        }).promise();

        const presignedUrl = s3.getSignedUrl('getObject', {
          Bucket: s3BucketName,
          Key: fileName,
          Expires: 60,
        });

        const THUMBNAIL_FORMAT = 'webp';
        const THUMBNAIL_WIDTH = '300';

        const thumbnail = await axios.get(`http://165.227.105.206:8088/thumbnail?width=${THUMBNAIL_WIDTH}&type=${THUMBNAIL_FORMAT}&url=${encodeURIComponent(presignedUrl)}`, {
          headers: {
            'API-Key': process.env.IMAGINARY_TOKEN,
          },
          responseType: 'arraybuffer',
        });

        const thumbnailName = `${farm_id}/thumbnail/${uuidv4()}.${THUMBNAIL_FORMAT}`;

        await s3.putObject({
          Body: thumbnail.data,
          Bucket: getS3BucketName(),
          Key: thumbnailName,
          ACL: 'private',
        }).promise();


        return res.status(201).json({
          url: `https://${s3BucketName}/${DO_ENDPOINT}/${fileName}`,
          thumbnail_url: `https://${s3BucketName}/${DO_ENDPOINT}/${thumbnailName}`,
        });
      } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
      }
    };
  },
};

function getS3BucketName() {
  const node_env = process.env.NODE_ENV;
  if (node_env === 'production') return 'litefarm-app-secret';
  if (node_env === 'integration') return 'litefarm-beta-secret';
  return 'litefarm-dev-secret';
}

module.exports = documentController;
