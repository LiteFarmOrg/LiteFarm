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
import FarmNoteModel from '../../models/farmNoteModel.js';
import {
  s3,
  getPublicS3BucketName,
  getPublicS3Url,
  imaginaryPost,
} from '../../util/digitalOceanSpaces.js';
import { HttpError, LiteFarmRequest } from '../../types.js';

export interface FarmNoteBody {
  data: string;
}

export interface FarmNoteParams {
  farm_note_id: string;
}

export function checkFarmNoteBody() {
  return async (
    req: LiteFarmRequest<unknown, FarmNoteParams, unknown, FarmNoteBody> & {
      // eslint-disable-next-line no-undef
      file?: Express.Multer.File;
    },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = JSON.parse(req.body.data);
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
            Bucket: getPublicS3BucketName(),
            Key: fileName,
            ACL: 'public-read',
          }),
        );
        farmNoteData.image_url = `${getPublicS3Url()}/${fileName}`;
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

export function checkFarmNoteId(action: string) {
  return async (
    req: LiteFarmRequest<unknown, FarmNoteParams, unknown, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.auth?.user_id;
    const { farm_note_id } = req.params;

    try {
      /* @ts-expect-error known issue with models */
      const existing = await FarmNoteModel.query().findById(farm_note_id).whereNotDeleted();
      if (!existing) {
        return res.status(404).json({ error: 'Note not found' });
      }
      if (existing.user_id !== user_id) {
        return res.status(403).json({ error: `Not authorized to ${action} this note` });
      }

      next();
    } catch (error: unknown) {
      console.error(error);

      const err = error as HttpError;
      const status = err.status || err.code || 500;
      return res.status(status).json({ error: err.message || err });
    }
  };
}
