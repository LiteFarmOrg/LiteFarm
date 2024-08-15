/*
 *  Copyright 2024 LiteFarm.org
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
  getPublicS3BucketName,
  s3,
  imaginaryPost,
  getPublicS3Url,
} from '../util/digitalOceanSpaces.js';
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export const uploadPublicImage = (folderName) => {
  return async (req, res, next) => {
    try {
      const TYPE = 'webp';
      const fileName = `${folderName}/${uuidv4()}.${TYPE}`;

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
};
