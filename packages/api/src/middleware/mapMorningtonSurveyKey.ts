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
import { LiteFarmRequest } from '../types.js';
import { SurveyDraftParams } from './validation/checkSurveyDraft.js';
import { CreateSurveyResponseReqBody } from '../controllers/surveyResponseController.js';
import { UpsertDraftReqBody } from '../controllers/surveyDraftController.js';

// Older frontends still send Mornington surveys under the FAO `tape` key; store them under `tape_au`.
const isMorningtonAsTape = (surveyKey?: string, surveyVersion?: string) =>
  surveyKey === 'tape' &&
  typeof surveyVersion === 'string' &&
  surveyVersion.startsWith('TAPE_Mornington_');

// TODO: LF-5545 remove once no frontend sends Mornington surveys as `tape`
export function mapMorningtonSurveyResponseKey() {
  return (
    req: LiteFarmRequest<unknown, unknown, unknown, Partial<CreateSurveyResponseReqBody>>,
    _res: Response,
    next: NextFunction,
  ) => {
    const { survey_key, survey_response } = req.body;
    if (isMorningtonAsTape(survey_key, survey_response?.survey_version)) {
      req.body.survey_key = 'tape_au';
    }
    next();
  };
}

// TODO: LF-5545 remove once no frontend sends Mornington surveys as `tape`
export function mapMorningtonSurveyDraftKey() {
  return (
    req: LiteFarmRequest<unknown, SurveyDraftParams, unknown, Partial<UpsertDraftReqBody>>,
    _res: Response,
    next: NextFunction,
  ) => {
    if (isMorningtonAsTape(req.params.survey_key, req.body.survey_version)) {
      req.params.survey_key = 'tape_au';
    }
    next();
  };
}
