/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (farmExpenseRoute.js) is part of LiteFarm.
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
const farmExpenseTypeController = require('../controllers/farmExpenseTypeController');
const checkScope = require('../middleware/acl/checkScope');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');

router.post('/', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:expense_types']), farmExpenseTypeController.addFarmExpenseType());

router.get('/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:expense_types']), farmExpenseTypeController.getFarmExpenseType());

router.get('/', hasFarmAccess({ params: 'farm_id' }), farmExpenseTypeController.getDefaultTypes());

router.delete('/:expense_type_id', hasFarmAccess({ params: 'expense_type_id'}), checkScope(['delete:expense_types']), farmExpenseTypeController.delFarmExpenseType());

module.exports = router;