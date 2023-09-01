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

async function validateSale(req, res, next) {
  // TODO replace upsertGraph
  const { crop_variety_sale, general_sale } = req.body;
  if (!(crop_variety_sale && crop_variety_sale[0]) && !general_sale) {
    return res.status(400).send('crop_variety_sale or general_sale is required');
  }

  if (crop_variety_sale) {
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
