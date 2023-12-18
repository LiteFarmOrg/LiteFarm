/*
 *  Copyright (c) 2023 LiteFarm.org
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

import {
  getPrivateS3BucketName,
  getPrivateS3Url,
  getRandomFileName,
  imaginaryPost,
  s3,
} from '../util/digitalOceanSpaces.js';
import { v4 as uuidv4 } from 'uuid';
import FarmModel from '../models/farmModel.js';
import { DeleteObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';

export function parseMultipartJson(req, res, next) {
  const contentType = req.get('Content-Type');

  if (contentType.includes('multipart/form-data') && req.body?.data) {
    try {
      req.body = JSON.parse(req.body.data);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  next();
}

// handles uploading, deleting, and replacing farm image
export async function handleImageOperations(req, res, next) {
  if (!req.file && !req.body.shouldRemoveImage) return next();

  const farmId = req.params.farm_id;

  try {
    const existingImageKeys = await getExistingImageKeys(farmId);
    const privateS3Url = getPrivateS3Url();

    const setFarmImageUrls = (keys) => {
      req.body.farm_image_url = keys ? `${privateS3Url}/${keys.imageKey}` : null;
      req.body.farm_image_thumbnail_url = keys ? `${privateS3Url}/${keys.thumbnailKey}` : null;
    };

    if (req.file) {
      const newImageKeys = {
        imageKey: `${farmId}/farm_image/${getRandomFileName(req.file)}`,
        thumbnailKey: `${farmId}/farm_image_thumbnail/${uuidv4()}.webp`,
      };

      if (existingImageKeys) {
        await deleteFarmImage(existingImageKeys);
        await uploadFarmImage(req.file, newImageKeys);
      } else {
        await uploadFarmImage(req.file, newImageKeys);
      }

      setFarmImageUrls(newImageKeys);
      return next();
    }

    if (req.body.shouldRemoveImage && existingImageKeys) {
      await deleteFarmImage(existingImageKeys);
      setFarmImageUrls();
    }
  } catch (error) {
    console.error(error.message);
    return res.sendStatus(500);
  }

  next();
}

async function uploadFarmImage(imageFile, keys) {
  const bucketName = getPrivateS3BucketName();
  const thumbnail = await imaginaryPost(imageFile, {
    width: 150,
    type: 'webp',
  });

  await Promise.all([
    s3.send(
      new PutObjectCommand({
        Key: keys.thumbnailKey,
        Bucket: bucketName,
        Body: thumbnail.data,
        ACL: 'private',
      }),
    ),
    s3.send(
      new PutObjectCommand({
        Key: keys.imageKey,
        Bucket: bucketName,
        Body: imageFile.buffer,
        ACL: 'private',
      }),
    ),
  ]);
}

async function deleteFarmImage({ thumbnailKey, imageKey }) {
  const bucketName = getPrivateS3BucketName();

  const deleteCommand = new DeleteObjectsCommand({
    Bucket: bucketName,
    Delete: {
      Objects: [
        {
          Key: thumbnailKey,
        },
        {
          Key: imageKey,
        },
      ],
    },
  });

  const response = await s3.send(deleteCommand);
  if (response.Errors?.length) throw new Error('Unable to delete image');
}

async function getExistingImageKeys(farmId) {
  const {
    farm_image_url: imageUrl,
    farm_image_thumbnail_url: thumbnailUrl,
  } = await FarmModel.query().findById(farmId);

  if (!imageUrl || !thumbnailUrl) return;

  // key is in the image url starting with farmId
  const getKeyFromUrl = (urlString) => {
    const array = urlString.split('/');
    const index = array.indexOf(farmId);
    return array.slice(index).join('/');
  };

  return {
    imageKey: getKeyFromUrl(imageUrl),
    thumbnailKey: getKeyFromUrl(thumbnailUrl),
  };
}
