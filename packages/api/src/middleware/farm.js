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

// handles uploading new image, replacing or deleting existing image
export async function handleImageOperations(req, res, next) {
  if (!req.file && !req.body.shouldRemoveImage) return next();

  const farmId = req.params.farm_id;
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

  next();
}

async function uploadFarmImage(imageFile, keys) {
  const bucketName = getPrivateS3BucketName();
  const thumbnail = await imaginaryPost(imageFile, {
    width: 175,
    type: 'webp',
  });

  const thumbnailUploadPromise = s3
    .putObject({
      Body: thumbnail.data,
      Bucket: bucketName,
      Key: keys.thumbnailKey,
      ACL: 'private',
    })
    .promise();

  const imageUploadPromise = s3
    .putObject({
      Body: imageFile.buffer,
      Bucket: bucketName,
      Key: keys.imageKey,
      ACL: 'private',
    })
    .promise();

  await Promise.all([thumbnailUploadPromise, imageUploadPromise]);
}

async function deleteFarmImage({ thumbnailKey, imageKey }) {
  const bucketName = getPrivateS3BucketName();

  const deleteImagePromsie = s3.deleteObject({ Bucket: bucketName, Key: imageKey }).promise();

  const deleteThumbnailPromise = s3
    .deleteObject({ Bucket: bucketName, Key: thumbnailKey })
    .promise();

  await Promise.all([deleteImagePromsie, deleteThumbnailPromise]);
}

export async function getExistingImageKeys(farmId) {
  const {
    farm_image_url: imageUrl,
    farm_image_thumbnail_url: thumbnailUrl,
  } = await FarmModel.query().findById(farmId);

  if (!imageUrl && !thumbnailUrl) return;

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
