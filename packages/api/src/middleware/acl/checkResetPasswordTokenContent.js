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

const { Model } = require('objection');

async function checkResetPasswordTokenContent(req, res, next) {
  const { user_id } = req.user;
  // const { token_version } = req.user;
  // check whether the token is used by using {user_id, token_version} => token_version_in_database - token_version <= 3 or {user_id} => isValid to query the database
  return next();
}

module.exports = checkResetPasswordTokenContent;
