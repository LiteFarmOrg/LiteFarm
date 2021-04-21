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
const { fieldCropEnabledLocations } = require('./location');

async function validateLogLocationId(req, res, next) {
  req.body.locations = req.body.locations.map(location => ({ location_id: location.location_id }));
  const locations = await locationModel.query().whereNotDeleted().whereIn('location_id', req.body.locations.map(location => location.location_id))
    .withGraphFetched('figure');

  for (const location of locations) {
    if (!fieldCropEnabledLocations.includes(location.figure.type)) {
      return res.status(400).send('Location must be type of field, garden, buffer_zone, or greenhouse');
    }
  }
  return next();
}

module.exports = validateLogLocationId;
