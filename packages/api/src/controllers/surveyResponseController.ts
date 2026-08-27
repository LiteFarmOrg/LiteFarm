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
import { transaction, Model } from 'objection';
import { LiteFarmRequest } from '../types.js';
import { handleObjectionError } from '../util/errorCodes.js';
import SurveyResponseModel from '../models/surveyResponseModel.js';
import SurveyDraftModel from '../models/surveyDraftModel.js';

interface SurveyResponseData {
  survey_version: string;
  project_id: string;
  survey_step?: string;
  [key: string]: unknown;
}

interface CreateSurveyResponseReqBody {
  survey_key: string;
  survey_response: SurveyResponseData;
}

interface LatestSurveyResponseQuery {
  survey_key?: string;
}

interface UpdateSurveyResponseParams {
  submission_id: string;
}

interface UpdateSurveyResponseReqBody {
  survey_response: SurveyResponseData;
}

type InsertableQuery = { insert: (data: Record<string, unknown>) => Promise<unknown> };

const surveyResponseController = {
  createSurveyResponse() {
    return async (
      req: LiteFarmRequest<unknown, unknown, unknown, CreateSurveyResponseReqBody>,
      res: Response,
    ) => {
      const trx = await transaction.start(Model.knex());
      try {
        const { farm_id } = req.headers;
        const user_id = req.auth?.user_id;
        const { survey_key, survey_response } = req.body;
        if (!survey_key) {
          await trx.rollback();
          return res.status(400).json({ error: 'survey_key is required' });
        }
        const { survey_version, project_id, survey_step } = survey_response;

        // A live draft, if one exists, hands its submission_id over to the response so a draft
        // write that arrives after this point can recognize its own lineage is now complete.
        /* @ts-expect-error known issue with models */
        const liveDraft = await SurveyDraftModel.query(trx)
          .whereNotDeleted()
          .findOne({ farm_id, survey_key, survey_step: survey_step ?? '' });

        const insertQuery = SurveyResponseModel.query(trx).context({
          user_id,
        }) as unknown as InsertableQuery;
        await insertQuery.insert({
          ...(liveDraft ? { submission_id: liveDraft.submission_id } : {}),
          farm_id,
          survey_key,
          survey_response,
          survey_version,
          project_id,
          survey_step,
        });

        if (liveDraft) {
          /* @ts-expect-error known issue with models */
          await SurveyDraftModel.query(trx).context({ user_id }).deleteById(liveDraft.id);
        }

        await trx.commit();
        return res.status(201).send();
      } catch (error) {
        return await handleObjectionError(error as Error, res, trx);
      }
    };
  },

  getLatestSurveyResponse() {
    return async (req: LiteFarmRequest<LatestSurveyResponseQuery>, res: Response) => {
      try {
        const { farm_id } = req.headers;
        const { survey_key } = req.query;
        if (!survey_key) {
          return res.status(400).json({ error: 'survey_key is required' });
        }
        // Find the latest survey response of this kind for the farm
        const result = await SurveyResponseModel.query()
          .where({ farm_id, survey_key })
          .orderBy('created_at', 'desc')
          .first();
        return res.status(200).json(result ?? null);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  // Note: Not currently called from frontend
  updateSurveyResponse() {
    return async (
      req: LiteFarmRequest<
        unknown,
        UpdateSurveyResponseParams,
        unknown,
        UpdateSurveyResponseReqBody
      >,
      res: Response,
    ) => {
      try {
        const { farm_id } = req.headers;
        const user_id = req.auth?.user_id;
        const { submission_id } = req.params;
        const { survey_response } = req.body;
        const { survey_version, project_id, survey_step } = survey_response;

        const existing = (await SurveyResponseModel.query().findOne({ submission_id })) as
          | { survey_key: string }
          | undefined;
        if (!existing) {
          return res.status(404).json({ error: 'Survey response not found' });
        }

        const insertQuery = SurveyResponseModel.query().context({
          user_id,
        }) as unknown as InsertableQuery;
        await insertQuery.insert({
          submission_id,
          farm_id,
          survey_key: existing.survey_key,
          survey_response,
          survey_version,
          project_id,
          survey_step,
        });

        return res.status(204).send();
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },
};

export default surveyResponseController;
