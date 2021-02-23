/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (logRoute.js) is part of LiteFarm.
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

const logController = require('../controllers/logController');
const express = require('express');
const router = express.Router();
const checkScope = require('../middleware/acl/checkScope');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const isCreator = require('../middleware/acl/isCreator');
const conditionallyApplyMiddleware = require('../middleware/acl/conditionally.apply');

router.post('/', hasFarmAccess({ body: 'fields' }), checkScope(['add:logs']), logController.logController.addLog());
//TODO get log by id specification
router.get('/:activity_id', hasFarmAccess({ mixed: 'activity_id' }), checkScope(['get:logs']), logController.logController.getLogByActivityId());
router.get('/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:logs']), logController.logController.getLogByFarmId());
router.get('/harvest_use_types/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:logs']), logController.logController.getHarvestUseTypesByFarmID());
router.post('/harvest_use_types/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['add:harvest_use']), logController.logController.addHarvestUseType());

router.put('/:activity_id', checkScope(['edit:logs']),
  (req, res, next) => conditionallyApplyMiddleware(
    req.role === 3,
    isCreator({ params: 'activity_id' }),
    hasFarmAccess({ mixed: 'activity_id' }),
  )(req, res, next), logController.logController.putLog());

router.delete('/:activity_id', checkScope(['delete:logs']),
  (req, res, next) => conditionallyApplyMiddleware(
    req.role === 3,
    isCreator({ params: 'activity_id' }),
    hasFarmAccess({ mixed: 'activity_id' }),
  )(req, res, next), logController.logController.deleteLog());

module.exports = router;
