/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (authFarmId.js) is part of LiteFarm.
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

async function validateSale(req, res, next) {
  // TODO replace upsertGraph
  const { crop_variety_sale, revenue_type_id, value } = req.body;

  if (!revenue_type_id) {
    return res.status(400).send('revenue type is required');
  }

  const revenueType = await RevenueTypeModel.query().findById(revenue_type_id);
  const isCropRevenue = revenueType.crop_generated;
  if (isCropRevenue && !(crop_variety_sale && crop_variety_sale[0])) {
    return res.status(400).send('crop_variety_sale is required');
  }
  if (isCropRevenue && value) {
    return res.status(400).send('cannot add value to crop sale');
  }
  if (!isCropRevenue && crop_variety_sale) {
    return res.status(400).send('must be crop generated revenue type to add crop variety sale');
  }

  if (isCropRevenue && crop_variety_sale) {
    for (const singleCropVarietySale of crop_variety_sale) {
      if (
        !singleCropVarietySale.crop_variety_id ||
        singleCropVarietySale.managementPlan ||
        singleCropVarietySale.farm ||
        singleCropVarietySale.crop_variety
      ) {
        return res.status(400).send('Crop is required');
      }
    }
  }
  return next();
}

export default validateSale;
