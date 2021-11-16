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

const jsonwebtoken = require('jsonwebtoken');
const userFarmModel = require('../../models/userFarmModel');
const emailTokenModel = require('../../models/emailTokenModel');
const { tokenType } = require('../../util/jwt');

async function checkInvitationTokenContent(req, res, next) {
  let invitation_token_content;
  try {
    invitation_token_content = jsonwebtoken.verify(req.body.invite_token, tokenType.invite);
  } catch (error) {
    return res.status(401).send('Invitation link expired');
  }
  const { user_id, farm_id } = await emailTokenModel.query().findById(invitation_token_content.invitation_id);

  const { status } = await userFarmModel.query().where({ user_id, farm_id }).first();
  if (status !== 'Invited') {
    return res.status(401).send('Invitation link is used');
  }
  if (req.user.email !== invitation_token_content.email) {
    return res.status(403).send('Incorrect email address');
  }
  req.user = { ...req.user, ...invitation_token_content, farm_id, user_id };

  return next();
}

module.exports = checkInvitationTokenContent;
