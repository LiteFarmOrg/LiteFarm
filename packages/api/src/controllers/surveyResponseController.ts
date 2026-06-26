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
import { LiteFarmRequest } from '../types.js';
import SurveyResponseModel from '../models/surveyResponseModel.js';

interface SurveyResponseData {
  survey_version: string;
  project_id: string;
  survey_step: string;
  [key: string]: unknown;
}

interface CreateSurveyResponseReqBody {
  survey_key: string;
  survey_response: SurveyResponseData;
}

interface LatestSurveyResponseQuery {
  survey_key?: string;
}

// Objection's query builder does not expose columns of JS-defined models as TS properties, so
// writes go through this minimally-typed insert.
type InsertableQuery = { insert: (data: Record<string, unknown>) => Promise<unknown> };

const surveyResponseController = {
  createSurveyResponse() {
    return async (
      req: LiteFarmRequest<unknown, unknown, unknown, CreateSurveyResponseReqBody>,
      res: Response,
    ) => {
      try {
        const { farm_id } = req.headers;
        const user_id = req.auth?.user_id;
        const { survey_key, survey_response } = req.body;
        if (!survey_key) {
          return res.status(400).json({ error: 'survey_key is required' });
        }
        const { survey_version, project_id, survey_step } = survey_response;

        const insertQuery = SurveyResponseModel.query().context({
          user_id,
        }) as unknown as InsertableQuery;
        await insertQuery.insert({
          farm_id,
          survey_key,
          survey_response,
          survey_version,
          project_id,
          survey_step,
        });

        return res.status(201).send();
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
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
        // The latest survey response of this kind for the farm, or null if none has been submitted.
        const result = await SurveyResponseModel.query()
          .where({ farm_id, survey_key })
          .orderBy('created_at', 'desc')
          .first();
        return res.status(200).send(result ?? null);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },
};

export default surveyResponseController;
