/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fertilizerRoute.js) is part of LiteFarm.
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

const express = require('express');
const router = express.Router();
const organicCertifierSurveyController = require('../controllers/organicCertifierSurveyController');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const checkScope = require('../middleware/acl/checkScope');

router.get('/:farm_id/supported_certifications', hasFarmAccess({ params: 'farm_id' }), organicCertifierSurveyController.getAllSupportedCertifications());
router.get('/:farm_id/supported_certifiers/:certification_type', hasFarmAccess({ params: 'farm_id', body: 'certification_type' }), organicCertifierSurveyController.getAllSupportedCertifiers())
router.post('/', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:organic_certifier_survey']), organicCertifierSurveyController.addOrganicCertifierSurvey());


router.patch('/:survey_id/requested_certifier', hasFarmAccess({ params: 'survey_id' }), checkScope(['edit:organic_certifier_survey']), organicCertifierSurveyController.patchRequestedCertifiers());
router.patch('/:survey_id/requested_certification', hasFarmAccess({ params: 'survey_id' }), checkScope(['edit:organic_certifier_survey']), organicCertifierSurveyController.patchRequestedCertification());

router.patch('/:survey_id/certifiers', hasFarmAccess({ params: 'survey_id' }), checkScope(['edit:organic_certifier_survey']), organicCertifierSurveyController.patchCertifiers());
router.patch('/:survey_id/interested', hasFarmAccess({ params: 'survey_id' }), checkScope(['edit:organic_certifier_survey']), organicCertifierSurveyController.patchInterested());
router.delete('/:survey_id', hasFarmAccess({ params:'survey_id' }), checkScope(['delete:organic_certifier_survey']), organicCertifierSurveyController.delOrganicCertifierSurvey());

module.exports = router;
