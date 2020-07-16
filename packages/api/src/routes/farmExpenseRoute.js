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
const farmExpenseController = require('../controllers/farmExpenseController');
const checkOwnership = require('../middleware/acl/checkOwnership');
const checkScope = require('../middleware/acl/checkScope');

router.get('/farm/:farm_id', checkOwnership('farmExpense'), checkScope(['get:expenses']), farmExpenseController.getAllFarmExpense());

// add farm expense takes an array of expense
router.post('/', checkScope(['add:expenses']), farmExpenseController.addFarmExpense());

//takes an array of farm_expense_id
// this is DELETE
router.put('/', checkScope(['delete:expenses']), farmExpenseController.delFarmExpense());

router.post('/expense_type', checkScope(['add:expense_types']), farmExpenseController.addFarmExpenseType());

router.get('/expense_type/farm/:farm_id', checkScope(['get:expense_types']), farmExpenseController.getFarmExpenseType());

router.get('/expense_type/default', farmExpenseController.getDefaultTypes());


module.exports = router;
