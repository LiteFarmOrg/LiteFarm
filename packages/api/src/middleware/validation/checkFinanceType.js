/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
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

import RevenueTypeModel from '../../models/revenueTypeModel.js';

export const checkEntityTypeImmutable = async (req, res, next) => {
  if (!req.body.entity_type) {
    return next();
  }

  try {
    const currentType = await RevenueTypeModel.query().findById(req.body.revenue_type_id);

    if (currentType.entity_type !== req.body.entity_type) {
      return res.status(400).send('Entity type is not allowed to be changed');
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
};
