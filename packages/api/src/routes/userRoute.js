/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
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

import express from 'express';

const router = express.Router();
import userController from '../controllers/userController.js';
import checkScope from '../middleware/acl/checkScope.js';
import isSelf from '../middleware/acl/isSelf.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import checkInviteJwt from '../middleware/acl/checkInviteJwt.js';
import checkInvitationTokenContent from '../middleware/acl/checkInviteTokenContent.js';
import checkInvitationAndGoogleJwtContent from '../middleware/acl/checkInviteAndGoogleJwtContent.js';
import checkPasswordCreated from '../middleware/acl/checkPasswordCreated.js';
import checkGoogleAccessToken from '../middleware/acl/checkGoogleAccessToken.js';

router.post('/', userController.addUser);

router.post(
  '/invite',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:users']),
  userController.addInvitedUser,
);

router.post(
  '/pseudo',
  hasFarmAccess({ body: 'farm_id' }),
  checkScope(['add:users']),
  userController.addPseudoUser,
);

router.post(
  '/accept_invitation',
  checkInviteJwt,
  checkInvitationTokenContent,
  checkPasswordCreated,
  userController.acceptInvitationAndPostPassword,
);

router.put(
  '/accept_invitation',
  checkGoogleAccessToken,
  checkInvitationAndGoogleJwtContent,
  checkPasswordCreated,
  userController.acceptInvitationWithGoogleAccount,
);

router.get('/:user_id', isSelf, userController.getUserByID);

router.put('/:user_id', isSelf, userController.updateUser);

export default router;
