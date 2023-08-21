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

import jsonwebtoken from 'jsonwebtoken';

import userFarmModel from '../../models/userFarmModel.js';
import emailTokenModel from '../../models/emailTokenModel.js';
import { tokenType } from '../../util/jwt.js';

async function checkInvitationTokenContent(req, res, next) {
  let invitation_token_content;
  try {
    invitation_token_content = jsonwebtoken.verify(req.body.invite_token, tokenType.invite);
  } catch (error) {
    return res.status(401).send('Invitation link expired');
  }
  const { user_id, farm_id } = await emailTokenModel
    .query()
    .findById(invitation_token_content.invitation_id);

  const { status } = await userFarmModel.query().where({ user_id, farm_id }).first();
  if (status !== 'Invited') {
    return res.status(401).send('Invitation link is used');
  }
  if (req.auth.email !== invitation_token_content.email) {
    return res.status(403).send('Incorrect email address');
  }
  req.auth = { ...req.auth, ...invitation_token_content, farm_id, user_id };

  return next();
}

export default checkInvitationTokenContent;
