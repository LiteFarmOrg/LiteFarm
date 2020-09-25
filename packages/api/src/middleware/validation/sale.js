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
  const { cropSale } = req.body;
  if (!(cropSale && cropSale[0])) {
    return res.status(400).send('Crop is required');
  }
  for (const oneCropSale of cropSale) {
    if (!oneCropSale.crop_id || oneCropSale.fieldCrop || oneCropSale.farm || oneCropSale.crop) {
      return res.status(400).send('Crop is required');
    }
  }
  return next();
}

module.exports = validateSale;
