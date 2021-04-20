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
const activityFieldsModel = require('../../models/activityFieldsModel');
const activityLogModel = require('../../models/activityLogModel');
const { fieldCropEnabledLocations } = require('./location');

async function validateLocationDependency(req, res, next) {

  const location_id = req?.params?.location_id;
  const fieldCrops = await fieldCropModel.query().whereNotDeleted().where({ location_id });
  if (fieldCrops.length) {
    return res.status(400).send('Location can be deleted when it has a fieldCrop');
  }
  const activityLogs = await activityLogModel.query().whereNotDeleted().join('activityFields', 'activityFields.activity_id', 'activityLog.activity_id').where('activityFields.location_id', location_id);

  if (activityLogs.length) {
    return res.status(400).send('Location can be deleted when it is referenced by log');
  } else {
    return next();
  }


}

module.exports = validateLocationDependency;
