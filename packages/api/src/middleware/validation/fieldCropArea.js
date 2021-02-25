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

const fieldModel = require('../../models/fieldModel');
const fieldCropModel = require('../../models/fieldCropModel');

async function validateFieldCropArea(req, res, next) {
  let field;
  if(req.body.field_id){
    field = await fieldModel.query().select('area').findById(req.body.field_id);
  }else{
    const fieldCropQuery = fieldCropModel.query().where({ field_crop_id: req.params.field_crop_id });
    field = await fieldModel.query().select('area').findById(fieldCropQuery.field_id);
  }


  if(field.area < req.body.area_used){
    return res.status(400).send('Area needed is greater than the field\'s area');
  } else{
    next();
  }
}

module.exports = validateFieldCropArea;
