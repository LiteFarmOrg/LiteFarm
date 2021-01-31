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

const passwordModel = require('../../models/passwordModel');
const userModel = require('../../models/userModel');

async function checkPasswordCreated(req, res, next) {
  const passwordRows = await passwordModel.query().whereIn('user_id', [req.user.sub || req.user.user_id, req.user.user_id]);
  const userRows = await userModel.query().whereIn('user_id', [req.user.sub || req.user.user_id, req.user.user_id]);
  if (passwordRows.length || userRows.reduce((notValid, user)=> notValid || user.status_id !== 2, false)) {
    return res.status(401).send('Invitation link is used');
  }
  return next();
}

module.exports = checkPasswordCreated;
