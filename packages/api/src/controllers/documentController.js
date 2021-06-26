const DocumentModel = require('../models/documentModel');
const { v4: uuidv4 } = require('uuid');
const {
  getPrivateS3BucketName,
  s3,
  imaginaryPost,
  getRandomFileName,
  getPrivateS3Url,
} = require('../util/digitalOceanSpaces');

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
        const result = await DocumentModel.transaction(async trx => {
          return await DocumentModel.query(trx).context({ user_id: req.user.user_id }).upsertGraph(
            req.body, { noUpdate: true, noDelete: true });
        });
        return res.status(201).send(result);
      } catch (error) {
        console.log(error);
        res.status(400).json({
          error,
        });
      }
    };
  },

  archiveDocument() {
    return async (req, res, next) => {
      const { document_id } = req.params;
      try {
        const result = await DocumentModel.query().context(req.user).findById(document_id).patch({ valid_until: new Date('2000/1/1').toISOString() });
        return result ? res.sendStatus(200) : res.status(404).send('Document not found');
      } catch (error) {
        return res.status(400).json({ error });
      }
    };
  },
  uploadDocument() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      try {
        const s3BucketName = getPrivateS3BucketName();

        const fileName = `${farm_id}/document/${getRandomFileName(req.file)}`;

        const uploadOriginalDocumentPromise = s3.putObject({
          Body: req.file.buffer,
          Bucket: s3BucketName,
          Key: fileName,
          ACL: 'private',
        }).promise();

        if (req.isMinimized) {
          await uploadOriginalDocumentPromise;
          return res.status(201).json({
            url: `${getPrivateS3Url()}/${fileName}`,
            thumbnail_url: `${getPrivateS3Url()}/${fileName}`,
          });
        } else if (req.isTextDocument) {
          await uploadOriginalDocumentPromise;
          return res.status(201).json({
            url: `${getPrivateS3Url()}/${fileName}`,
          });
        } else if (req.isNotMinimized) {
          const THUMBNAIL_FORMAT = 'webp';
          const THUMBNAIL_WIDTH = '300';

          const imaginaryThumbnailPromise = imaginaryPost(req.file, {
            width: THUMBNAIL_WIDTH,
            type: THUMBNAIL_FORMAT,
          });

          const [thumbnail] = await Promise.all([imaginaryThumbnailPromise, uploadOriginalDocumentPromise]);

          const thumbnailName = `${farm_id}/thumbnail/${uuidv4()}.${THUMBNAIL_FORMAT}`;

          await s3.putObject({
            Body: thumbnail.data,
            Bucket: getPrivateS3BucketName(),
            Key: thumbnailName,
            ACL: 'private',
          }).promise();


          return res.status(201).json({
            url: `${getPrivateS3Url()}/${fileName}`,
            thumbnail_url: `${getPrivateS3Url()}/${thumbnailName}`,
          });
        }
        return req.status(400);
      } catch (error) {
        console.log(error);
        return res.status(400).send('Fail to upload document');
      }
    };
  },
};

module.exports = documentController;
