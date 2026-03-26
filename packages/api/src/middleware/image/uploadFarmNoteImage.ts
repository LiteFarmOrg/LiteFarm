/*
 *  Copyright 2026 LiteFarm.org
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

import { NextFunction, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import {
  s3,
  getPrivateS3Url,
  getPrivateS3BucketName,
  imaginaryPost,
} from '../../util/digitalOceanSpaces.js';
import { HttpError, LiteFarmRequest } from '../../types.js';
import { FarmNoteBody, FarmNoteParams } from '../validation/checkFarmNote.js';

export default function uploadFarmNoteImage() {
  return async (
    req: LiteFarmRequest<unknown, FarmNoteParams, unknown, FarmNoteBody> & {
      // eslint-disable-next-line no-undef
      file?: Express.Multer.File;
    },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { data = {} } = res.locals;
      const { farm_id } = req.headers;
      const farmNoteData = {
        note: data.note,
        is_private: data.is_private,
        image_url: undefined as string | undefined | null,
      };

      if (req.file) {
        const fileName = `${farm_id}/farm_note/${uuidv4()}.webp`;
        const compressedImage = await imaginaryPost(
          req.file,
          { width: '1024', type: 'webp' },
          { endpoint: 'resize' },
        );
        await s3.send(
          new PutObjectCommand({
            Body: compressedImage.data,
            Bucket: getPrivateS3BucketName(),
            Key: fileName,
            ACL: 'private',
          }),
        );
        farmNoteData.image_url = `${getPrivateS3Url()}/${fileName}`;
      } else if (data.image_url === null) {
        farmNoteData.image_url = null;
      }
      res.locals.farmNoteData = farmNoteData;

      next();
    } catch (error: unknown) {
      console.error(error);

      const err = error as HttpError;
      const status = err.status || err.code || 500;
      return res.status(status).json({ error: err.message || err });
    }
  };
}
