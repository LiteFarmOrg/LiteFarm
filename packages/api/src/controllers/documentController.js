/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import DocumentModel from '../models/documentModel.js';

import { v4 as uuidv4 } from 'uuid';

import {
  getPrivateS3BucketName,
  s3,
  imaginaryPost,
  getRandomFileName,
  getPrivateS3Url,
} from '../util/digitalOceanSpaces.js';

const documentController = {
  getDocumentsByFarmId() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      try {
        const result = await DocumentModel.query()
          .whereNotDeleted()
          .withGraphFetched('[files]')
          .where({ farm_id });
        return result?.length
          ? res.status(200).send(result)
          : res.status(404).send('No documents found');
      } catch (error) {
        console.error(error);
        return res.status(400).json({ error });
      }
    };
  },
  createDocument() {
    return async (req, res, next) => {
      try {
        const result = await DocumentModel.transaction(async (trx) => {
          return await DocumentModel.query(trx)
            .context({ user_id: req.auth.user_id })
            .upsertGraph(req.body, { noUpdate: true, noDelete: true });
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

  patchDocumentArchive() {
    return async (req, res, next) => {
      const { document_id } = req.params;
      try {
        const result = await DocumentModel.query()
          .context(req.auth)
          .findById(document_id)
          .patch({ archived: req.body.archived });
        return result ? res.sendStatus(200) : res.status(404).send('Document not found');
      } catch (error) {
        return res.status(400).json({ error });
      }
    };
  },

  updateDocument() {
    return async (req, res, next) => {
      try {
        const { document_id } = req.params;
        const result = await DocumentModel.transaction(async (trx) => {
          return await DocumentModel.query(trx)
            .context({ user_id: req.auth.user_id })
            .upsertGraph({ document_id, ...req.body });
        });
        return res.status(201).send(result);
      } catch (err) {
        console.log(err);
        return res.status(400).json({
          error: err,
        });
      }
    };
  },

  uploadDocument() {
    return async (req, res, next) => {
      const { farm_id } = req.params;
      try {
        const s3BucketName = getPrivateS3BucketName();

        const fileName = `${farm_id}/document/${getRandomFileName(req.file)}`;

        const uploadOriginalDocumentPromise = s3
          .putObject({
            Body: req.file.buffer,
            Bucket: s3BucketName,
            Key: fileName,
            ACL: 'private',
          })
          .promise();

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

          const [thumbnail] = await Promise.all([
            imaginaryThumbnailPromise,
            uploadOriginalDocumentPromise,
          ]);

          const thumbnailName = `${farm_id}/thumbnail/${uuidv4()}.${THUMBNAIL_FORMAT}`;

          await s3
            .putObject({
              Body: thumbnail.data,
              Bucket: getPrivateS3BucketName(),
              Key: thumbnailName,
              ACL: 'private',
            })
            .promise();

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

export default documentController;
