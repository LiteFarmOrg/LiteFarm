/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (farmRoute.js) is part of LiteFarm.
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
const farmController = require('../controllers/farmController');
const organicCertifierSurveyController = require('../controllers/organicCertifierSurveyController');
const authFarmId = require('../middleware/acl/authFarmId');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const checkScope = require('../middleware/acl/checkScope');

router.get('/:farm_id', authFarmId, farmController.getFarmByID());

router.post('/', farmController.addFarm());

router.patch('/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['edit:farms']), farmController.updateFarm(true))

/*To change farm name or units*/
router.put('/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['edit:farms']), farmController.updateFarm());

router.delete('/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['delete:farms']), farmController.deleteFarm());

router.get('/:farm_id/organic_certifier_survey', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:organic_certifier_survey']), organicCertifierSurveyController.getCertifiersByFarmId());

module.exports = router;
