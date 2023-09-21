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
  const { crop_variety_sale, revenue_type_id } = req.body;
  // TODO: implement properly once LF-3595 is complete
  const cropSaleRevenueType = await RevenueTypeModel.query()
    .where('revenue_name', 'Crop Sale')
    .first();
  const isCropRevenue = revenue_type_id === cropSaleRevenueType.revenue_type_id;
  if (isCropRevenue && !(crop_variety_sale && crop_variety_sale[0])) {
    return res.status(400).send('crop_variety_sale is required');
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
