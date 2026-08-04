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
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import surveyResponseController from '../controllers/surveyResponseController.js';

const router = express.Router();

router.post(
  '/',
  checkScope(['add:survey_response']),
  hasFarmAccess({ body: 'farm_id' }),
  surveyResponseController.createSurveyResponse(),
);

// Latest survey response of the kind given by the survey_key query param
router.get(
  '/',
  checkScope(['get:survey_response']),
  surveyResponseController.getLatestSurveyResponse(),
);

// Non-destructive update: appends a new version sharing the submission_id
router.patch(
  '/:submission_id',
  checkScope(['edit:survey_response']),
  hasFarmAccess({ params: 'submission_id' }),
  surveyResponseController.updateSurveyResponse(),
);

export default router;
