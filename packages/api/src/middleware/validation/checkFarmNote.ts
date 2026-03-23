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
import FarmNoteModel from '../../models/farmNoteModel.js';
import { HttpError, LiteFarmRequest } from '../../types.js';
import { MultipartBody } from '../format/parseMultipartJsonField.js';

export type FarmNoteBody = MultipartBody;

export interface FarmNoteParams {
  id: string;
}

export function checkFarmNoteId(action: string) {
  return async (
    req: LiteFarmRequest<unknown, FarmNoteParams, unknown, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.auth?.user_id;
    const { id } = req.params;

    try {
      /* @ts-expect-error known issue with models */
      const existing = await FarmNoteModel.query().findById(id).whereNotDeleted();
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
