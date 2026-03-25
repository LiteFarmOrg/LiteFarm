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
import { LiteFarmRequest } from '../../types.js';

export interface MultipartBody {
  data: string;
}

export default function parseMultipartJsonField(
  req: LiteFarmRequest<unknown, unknown, unknown, MultipartBody> & {
    // eslint-disable-next-line no-undef
    file?: Express.Multer.File;
  },
  res: Response,
  next: NextFunction,
) {
  const contentType = req.get('Content-Type');

  if (contentType?.includes('multipart/form-data') && typeof req.body?.data === 'string') {
    try {
      res.locals.data = JSON.parse(req.body.data);
    } catch (_error) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }

  next();
}
