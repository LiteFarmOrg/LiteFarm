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

import express from 'express';
import checkScope from '../middleware/acl/checkScope.js';
import { checkSurveyDraftKey } from '../middleware/validation/checkSurveyDraft.js';
import surveyDraftController from '../controllers/surveyDraftController.js';

const router = express.Router();

// One live draft per farm_id + survey_key + survey_step (survey_step is optional,
// and it defaults to '' on the survey_draft row).
router.get(
  // TODO: LF-5475 Update the Express 4-specific `?` optional-param syntax to `{/:survey_step}`
  '/:survey_key/:survey_step?',
  checkScope(['get:survey_draft']),
  checkSurveyDraftKey(),
  surveyDraftController.getDraft(),
);

// Idempotent create-or-replace at this exact key — PUT, not POST, since the resource's
// address is fully known up front rather than server-assigned.
router.put(
  // TODO: LF-5475 Update the Express 4-specific `?` optional-param syntax to `{/:survey_step}`
  '/:survey_key/:survey_step?',
  checkScope(['edit:survey_draft']),
  checkSurveyDraftKey(),
  surveyDraftController.upsertDraft(),
);

export default router;
