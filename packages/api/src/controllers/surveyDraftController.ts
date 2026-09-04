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
import knex from '../util/knex.js';
import SurveyDraftModel from '../models/surveyDraftModel.js';
import { SurveyDraftParams, UpsertDraftBody } from '../middleware/validation/checkSurveyDraft.js';
import { LiteFarmRequest } from '../types.js';
import { SurveyDraft } from '../models/types.js';

interface UpsertDraftReqBody extends UpsertDraftBody {
  survey_version: string;
  survey_data: Record<string, unknown>;
  current_page_no?: number;
}

const surveyDraftController = {
  getDraft() {
    return async (req: LiteFarmRequest<unknown, SurveyDraftParams>, res: Response) => {
      try {
        const { farm_id } = req.headers;
        const { survey_key } = req.params;
        /* @ts-expect-error known issue with models */
        const result = await SurveyDraftModel.query()
          .whereNotDeleted()
          .findOne({ farm_id, survey_key });
        return res.status(200).json(result ?? null);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  getDrafts() {
    return async (req: LiteFarmRequest, res: Response) => {
      try {
        const { farm_id } = req.headers;
        /* @ts-expect-error known issue with models */
        const rows = (await SurveyDraftModel.query()
          .whereNotDeleted()
          .where({ farm_id })) as unknown as SurveyDraft[];

        const draftsBySurveyKey = Object.fromEntries(rows.map((row) => [row.survey_key, row]));

        return res.status(200).json(draftsBySurveyKey);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  // Idempotent; full overwrite of the draft at this key, or create it if it doesn't exist yet.
  upsertDraft() {
    return async (
      req: LiteFarmRequest<unknown, SurveyDraftParams, unknown, UpsertDraftReqBody>,
      res: Response,
    ) => {
      try {
        const { farm_id } = req.headers;
        const user_id = req.auth?.user_id;
        const { survey_key } = req.params;
        const { survey_version, survey_data, current_page_no = 0 } = req.body;

        /* @ts-expect-error known issue with models */
        const upserted = await SurveyDraftModel.query()
          .context({ user_id })
          .insert({
            farm_id,
            survey_key,
            survey_version,
            survey_data,
            current_page_no,
          })
          .onConflict(knex.raw('(farm_id, survey_key) where deleted = false'))
          .merge({
            survey_version,
            survey_data,
            current_page_no,
            // $beforeUpdate does NOT fire on this path — Objection only sees an .insert() call,
            // it has no visibility into Postgres resolving it as an UPDATE — so updated_at and
            // updated_by_user_id are set explicitly.
            updated_at: new Date().toISOString(),
            updated_by_user_id: user_id,
          })
          .returning('*');

        const wasCreated =
          new Date(upserted.created_at).getTime() === new Date(upserted.updated_at).getTime();
        return res.status(wasCreated ? 201 : 200).send(upserted);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },
};

export default surveyDraftController;
