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
import { FarmNoteBody, FarmNoteParams } from '../middleware/validation/checkFarmNote.js';
import FarmNoteModel from '../models/farmNoteModel.js';
import { LiteFarmRequest } from '../types.js';

const farmNoteController = {
  getFarmNotes() {
    return async (req: LiteFarmRequest, res: Response) => {
      try {
        const { farm_id } = req.headers;
        const { user_id } = req.auth!;

        /* @ts-expect-error known issue with models */
        const notes = await FarmNoteModel.query()
          .whereNotDeleted()
          .where('farm_id', farm_id)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .where((builder: any) => {
            builder.where('is_private', false).orWhere('user_id', user_id);
          })
          .orderBy('updated_at', 'desc');

        return res.status(200).json(notes);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  createFarmNote() {
    return async (req: LiteFarmRequest<unknown, unknown, unknown, FarmNoteBody>, res: Response) => {
      try {
        const { farm_id } = req.headers;
        const { user_id } = req.auth!;

        /* @ts-expect-error known issue with models */
        const note = await FarmNoteModel.query()
          .context({ user_id })
          .insert({ farm_id, user_id, ...res.locals.farmNoteData })
          .returning('*');

        return res.status(201).json(note);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  editFarmNote() {
    return async (
      req: LiteFarmRequest<unknown, FarmNoteParams, unknown, FarmNoteBody>,
      res: Response,
    ) => {
      try {
        const { id } = req.params;
        const { user_id } = req.auth!;

        /* @ts-expect-error known issue with models */
        const updated = await FarmNoteModel.query()
          .context({ user_id })
          .patchAndFetchById(id, res.locals.farmNoteData);

        return res.status(200).json(updated);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  deleteFarmNote() {
    return async (
      req: LiteFarmRequest<unknown, FarmNoteParams, unknown, unknown>,
      res: Response,
    ) => {
      try {
        const { id } = req.params;
        const { user_id } = req.auth!;

        /* @ts-expect-error known issue with models */
        await FarmNoteModel.query().context({ user_id }).deleteById(id);

        return res.status(200).json({ message: 'Note deleted' });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },
};

export default farmNoteController;
