/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (yieldRoute.js) is part of LiteFarm.
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
const yieldController = require('../controllers/yieldController');
// const authFarmId = require('../middleware/acl/authFarmId');
// const checkOwnership = require('../middleware/acl/checkOwnership');
const checkScope = require('../middleware/acl/checkScope');

// Get the crop on a bed
router.get('/farm/:farm_id', checkScope(['get:yields']), yieldController.getYieldByFarmId());

router.post('/', checkScope(['add:yields']), yieldController.addYield());

router.put('/:id', checkScope(['edit:yields']), yieldController.updateYield());

router.delete('/:id', checkScope(['delete:yields']), yieldController.delYield());

module.exports = router;