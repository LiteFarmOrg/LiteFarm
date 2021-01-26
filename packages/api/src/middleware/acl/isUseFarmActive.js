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
const userFarmModel = require('../../models/userFarmModel');

async function isUserFarmActive(req, res, next) {
  const { user_id, farm_id } = req.headers;
  const userFarm = await userFarmModel.query().where({ user_id, farm_id }).first();
  return userFarm && userFarm.status === 'Active' ? next() : res.status(403).send('Do not have access to this farm');
}

module.exports = isUserFarmActive;
