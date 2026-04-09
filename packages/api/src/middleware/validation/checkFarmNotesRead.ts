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

export interface FarmNoteReadBody {
  read_through: string;
}

export const checkFarmNotesRead = async (
  req: LiteFarmRequest<unknown, unknown, unknown, FarmNoteReadBody>,
  res: Response,
  next: NextFunction,
) => {
  const { read_through } = req.body;

  if (!read_through) {
    return res.status(400).json({ error: 'read_through is required' });
  }
  if (isNaN(Date.parse(read_through))) {
    return res.status(400).json({ error: 'Invalid read_through' });
  }

  next();
};
