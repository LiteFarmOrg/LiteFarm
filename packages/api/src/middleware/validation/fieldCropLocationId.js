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

async function validateLocationId(req, res, next) {
  const location = await locationModel.query().whereNotDeleted().findById(req.body.location_id)
    .withGraphJoined(`[
           field, garden, buffer_zone,
          greenhouse
        ]`);

  if (location?.field || location?.garden || location?.buffer_zone || location?.greenhouse) {
    return next();
  } else {
    return res.status(400).send('Location must be type of field, garden, buffer_zone, or greenhouse');
  }
}

module.exports = validateLocationId;
