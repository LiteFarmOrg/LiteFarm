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

const locationModel = require('../../models/locationModel');
const fieldCropModel = require('../../models/fieldCropModel');

async function validateFieldCropArea(req, res, next) {
  let location;
  if (req.body.location_id) {
    location = await locationModel.query()
      .whereNotDeleted().findById(req.body.location_id)
      .withGraphJoined('figure.[area, line]');
  } else {
    const fieldCrop = await fieldCropModel.query().whereNotDeleted().findById(req.params.field_crop_id)
      .withGraphFetched(`[location.[
          figure.[area, line]]]`);
    location = fieldCrop?.location;
  }

  if (location?.figure?.area?.total_area && location?.figure?.area?.total_area < req.body.area_used) {
    return res.status(400).send('Area needed is greater than the field\'s area');
  } else {
    return next();
  }
}

module.exports = validateFieldCropArea;
