/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (insightRoute.js) is part of LiteFarm.
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
const insightController = require('../controllers/insightController');
const authFarmId = require('../middleware/acl/authFarmId');
const checkOwnership = require('../middleware/acl/checkOwnership');
const checkScope = require('../middleware/acl/checkScope');

// people fed specific stuff
// get all the nutritional data that is displayed as a view on People Fed Module
router.get('/people_fed/:farm_id', authFarmId, checkScope(['get:insights']), insightController.getPeopleFedData());
// get one single number for generating meals page on the main insight page

// soil om submodule
// grabs soil data logs based on user_id
// sorted by field_id so its easy to use in the soil_om submodule
router.get('/soil_om/:farm_id', checkScope(['get:insights']), insightController.getSoilDataByFarmID());

router.get('/labour_happiness/:farm_id', authFarmId, checkScope(['get:insights']), insightController.getLabourHappinessByFarmID());

router.get('/biodiversity/:farm_id', authFarmId, checkScope(['get:insights']), insightController.getBiodiversityByFarmID());

router.get('/prices/distance/:farm_id', authFarmId, checkScope(['get:insights']), insightController.getPricesNearbyByFarmID());

router.get('/waterbalance/:farm_id', authFarmId, checkScope(['get:insights']), insightController.getWaterBalance());

router.get('/waterbalance/schedule/:farm_id', authFarmId, checkScope(['get:insights']), insightController.getWaterSchedule());

router.get('/nitrogenbalance/:farm_id', authFarmId, checkScope(['get:insights']), insightController.getNitrogenBalance());

router.get('/nitrogenbalance/schedule/:farm_id', authFarmId, checkScope(['get:insights']), insightController.getNitrogenSchedule());

// add calls
router.post('/waterbalance', checkScope(['add:insights']), insightController.addWaterBalance());
router.post('/waterbalance/schedule', checkScope(['add:insights']), insightController.addWaterBalanceSchedule());
router.post('/nitrogenbalance/schedule', checkScope(['add:insights']), insightController.addNitrogenSchedule());

// delete calls
router.delete('/nitrogenbalance/schedule/:id', checkOwnership('nitrogenSchedule'), checkScope(['delete:insights']), insightController.delNitrogenSchedule());

module.exports = router;
