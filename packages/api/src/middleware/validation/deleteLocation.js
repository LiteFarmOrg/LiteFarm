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

const fieldCropModel = require('../../models/fieldCropModel');
const activityLogModel = require('../../models/activityLogModel');
const shiftTaskModel = require('../../models/shiftTaskModel');
const { raw } = require('objection');

async function validateLocationDependency(req, res, next) {

  const location_id = req?.params?.location_id;
  const fieldCrops = await fieldCropModel.query().whereNotDeleted().where({ location_id }).andWhere(raw('end_date >= now()'));
  if (fieldCrops.length) {
    return res.status(400).send('Location cannot be deleted when it has a fieldCrop');
  }
  const activityLogs = await activityLogModel.query().whereNotDeleted().join('activityFields', 'activityFields.activity_id', 'activityLog.activity_id').where('activityFields.location_id', location_id).andWhere('activityLog.date', '>=', 'CURRENT_DATE');
  if (activityLogs.length) {
    return res.status(400).send('Location cannot be deleted when it is referenced by log');
  }
  const locationShifts = await shiftTaskModel.query().join('shift', 'shift.shift_id', 'shiftTask.shift_id').whereNotDeleted().where({ location_id }).andWhere(raw('shift_date >= CURRENT_DATE'));
  if (locationShifts.length) {
    return res.status(400).send('Location cannot be deleted when it has pending shifts');
  }

  const fieldCropShifts = await shiftTaskModel.query().join('fieldCrop', 'fieldCrop.field_crop_id', 'shiftTask.field_crop_id').join('shift', 'shift.shift_id', 'shiftTask.shift_id').whereNotDeleted().where('fieldCrop.location_id', location_id).andWhere(raw('shift_date >= CURRENT_DATE'));
  if (fieldCropShifts.length) {
    return res.status(400).send('Location cannot be deleted when it has pending shifts');
  }

  return next();
}

module.exports = validateLocationDependency;
