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
const emailTokenModel = require('../../models/emailTokenModel');

async function checkInvitationTokenContent(req, res, next) {
  const emailToken = await emailTokenModel.query().findById(req.user.invitation_id);
  const { user_id, farm_id } = emailToken;
  req.user.user_id = user_id;
  req.user.farm_id = farm_id;
  const { status } = await userFarmModel.query().where({
    user_id,
    farm_id,
  }).first();
  if (status !== 'Invited') {
    return res.status(401).send('Invitation link is used');
  }
  return next();
}

module.exports = checkInvitationTokenContent;
