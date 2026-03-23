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

import { Response } from 'express';
import FarmNotesReadModel from '../models/farmNotesReadModel.js';
import { HttpError, LiteFarmRequest } from '../types.js';

interface FarmNotesReadModelType {
  user_id: string;
  farm_id: string;
  last_read_at: string;
}

const farmNotesReadController = {
  getFarmNotesRead() {
    return async (req: LiteFarmRequest, res: Response) => {
      try {
        const { user_id } = req.auth!;
        const { farm_id } = req.headers;

        const row = (await FarmNotesReadModel.query().where({ user_id, farm_id }).first()) as
          | FarmNotesReadModelType
          | undefined;

        return res.status(200).json({ last_read_at: row ? row.last_read_at : null });
      } catch (error: unknown) {
        console.error(error);
        const err = error as HttpError;
        const status = err.status || err.code || 500;
        return res.status(status).json({ error: err.message || err });
      }
    };
  },

  markFarmNotesRead() {
    return async (req: LiteFarmRequest, res: Response) => {
      try {
        const { user_id } = req.auth!;
        const { farm_id } = req.headers;

        await FarmNotesReadModel.query()
          .insert({
            user_id,
            farm_id,
            last_read_at: new Date().toISOString(),
          })
          .onConflict(['user_id', 'farm_id'])
          .merge();

        return res.status(204).send();
      } catch (error: unknown) {
        console.error(error);
        const err = error as HttpError;
        const status = err.status || err.code || 500;
        return res.status(status).json({ error: err.message || err });
      }
    };
  },
};

export default farmNotesReadController;
