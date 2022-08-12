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

import SaleController from '../controllers/saleController.js';

import express from 'express';
const router = express.Router();
import checkScope from '../middleware/acl/checkScope.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import validateSale from '../middleware/validation/sale.js';
import conditionallyApplyMiddleware from '../middleware/acl/conditionally.apply.js';
import isCreator from '../middleware/acl/isCreator.js';

//TODO fix URL
router.post(
  '/',
  validateSale,
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:sales']),
  SaleController.addOrUpdateSale(),
);
router.get(
  '/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:sales']),
  SaleController.getSaleByFarmId(),
);
router.delete(
  '/:sale_id',
  checkScope(['delete:sales']),
  (req, res, next) =>
    conditionallyApplyMiddleware(
      req.role === 3,
      isCreator({ params: 'sale_id' }),
      hasFarmAccess({ params: 'sale_id' }),
    )(req, res, next),
  SaleController.delSale(),
);
router.patch(
  '/:sale_id',
  checkScope(['edit:sales']),
  (req, res, next) =>
    conditionallyApplyMiddleware(
      req.role === 3,
      isCreator({ params: 'sale_id' }),
      hasFarmAccess({ params: 'sale_id' }),
    )(req, res, next),
  SaleController.patchSales(),
);

export default router;
