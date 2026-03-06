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
import tapeSurveyController from '../controllers/tapeSurveyController.js';

const router = express.Router();

router.post(
  '/',
  checkScope(['add:tape_survey']),
  hasFarmAccess({ body: 'farm_id' }),
  tapeSurveyController.createTapeSurvey(),
);

router.get(
  '/:tape_survey_id',
  checkScope(['get:tape_survey']),
  hasFarmAccess({ params: 'tape_survey_id' }),
  tapeSurveyController.getTapeSurvey(),
);

router.patch(
  '/:tape_survey_id',
  checkScope(['edit:tape_survey']),
  hasFarmAccess({ params: 'tape_survey_id' }),
  tapeSurveyController.updateTapeSurvey(),
);

export default router;
