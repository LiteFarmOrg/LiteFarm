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
import SurveyResponseModel from '../../models/surveyResponseModel.js';
import { LiteFarmRequest } from '../../types.js';

export interface SurveyDraftParams {
  survey_key: string;
  survey_step?: string;
}

export interface UpsertDraftBody {
  submission_id?: string;
}

export function checkSurveyDraftKey() {
  return (req: LiteFarmRequest<unknown, SurveyDraftParams>, res: Response, next: NextFunction) => {
    const { survey_key } = req.params;
    if (!survey_key) {
      return res.status(400).json({ error: 'survey_key is required' });
    }
    next();
  };
}

// TODO: LF-5192 Adjust logic
// Only correct while retake isn't supported: "a response exists" is treated as permanently done.
// Once retakes exist, this will incorrectly block starting a new attempt after a prior one completes.
export function checkDraftNotCompleted() {
  return async (
    req: LiteFarmRequest<unknown, SurveyDraftParams, unknown, UpsertDraftBody>,
    res: Response,
    next: NextFunction,
  ) => {
    const { farm_id } = req.headers;
    const { survey_key, survey_step = '' } = req.params;

    const existing = await SurveyResponseModel.query().findOne({
      farm_id,
      survey_key,
      survey_step,
    });
    if (existing) {
      return res.status(409).json({ error: 'Survey has already been completed' });
    }
    next();
  };
}
