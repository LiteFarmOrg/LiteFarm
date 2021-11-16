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
const checkScope = require('../middleware/acl/checkScope');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const conditionallyApplyMiddleware = require('../middleware/acl/conditionally.apply');
const isCreator = require('../middleware/acl/isCreator');

router.get('/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:expenses']), farmExpenseController.getAllFarmExpense());

router.post('/farm/:farm_id', hasFarmAccess({ body: 'farm_id' }), checkScope(['add:expenses']), farmExpenseController.addFarmExpense());

router.patch('/:farm_expense_id',
  checkScope(['delete:expenses']),
  (req, res, next) => conditionallyApplyMiddleware(
    req.role === 3,
    isCreator({ params: 'farm_expense_id' }),
    hasFarmAccess({ params: 'farm_expense_id' }),
  )(req, res, next),
  farmExpenseController.updateFarmExpense());

router.delete('/:farm_expense_id',
  checkScope(['delete:expenses']),
  (req, res, next) => conditionallyApplyMiddleware(
    req.role === 3,
    isCreator({ params: 'farm_expense_id' }),
    hasFarmAccess({ params: 'farm_expense_id' }),
  )(req, res, next),
  farmExpenseController.delFarmExpense());

module.exports = router;
