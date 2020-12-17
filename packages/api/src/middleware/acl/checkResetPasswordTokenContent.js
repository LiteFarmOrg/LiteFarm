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

const passwordModel = require('./../../models/passwordModel');

async function checkResetPasswordTokenContent(req, res, next) {
  const { user_id, created_at } = req.user;
  const result = await passwordModel.query().select('created_at').where('user_id', user_id).first();
  if (result.created_at.getTime() <= created_at) {
    next();
  } else {
    res.status(401).send('date error');
  }
}

module.exports = checkResetPasswordTokenContent;
