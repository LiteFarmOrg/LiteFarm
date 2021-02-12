/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (saleRoute.js) is part of LiteFarm.
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

const SaleController = require('../controllers/saleController');
const express = require('express');
const router = express.Router();
const checkScope = require('../middleware/acl/checkScope');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const validateSale = require('../middleware/validation/sale');
const conditionallyApplyMiddleware = require('../middleware/acl/conditionally.apply');
const isCreator = require('../middleware/acl/isCreator');

//TODO fix URL
router.post('/', validateSale, hasFarmAccess({ body: 'farm_id' }), checkScope(['add:sales']), SaleController.addOrUpdateSale());
router.get('/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:sales']), SaleController.getSaleByFarmId());
router.delete('/:sale_id',
  checkScope(['delete:sales']),
  (req, res, next) => conditionallyApplyMiddleware(
    req.role === 3,
    isCreator({ params: 'sale_id' }),
    hasFarmAccess({ params: 'sale_id' })
  )(req, res, next),
  SaleController.delSale());
// router.patch('/', checkScope(['edit:sales']), SaleController.patchSales());

module.exports = router;
