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

async function checkInvitationTokenContent(req, res, next) {

  const { status } = await userFarmModel.query().where({ user_id: invitation_token_content.user_id, farm_id: invitation_token_content.farm_id }).first();
  if (status !== 'Invited') {
    return res.status(401).send('Invitation link is used');
  }
  return next();
}

module.exports = checkInvitationTokenContent;
