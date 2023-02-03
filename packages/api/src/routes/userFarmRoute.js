/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (userFarmRoute.js) is part of LiteFarm.
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
import userFarmController from '../controllers/userFarmController.js';
import hasFarmAccess from '../middleware/acl/hasFarmAccess.js';
import checkScope from '../middleware/acl/checkScope.js';
import isSelf from '../middleware/acl/isSelf.js';
import checkInviteJwt from '../middleware/acl/checkInviteJwt.js';
import checkInvitationTokenContent from '../middleware/acl/checkInviteTokenContent.js';
import checkUserFarmStatus from '../middleware/acl/checkUserFarmStatus.js';

// Get all userFarms for a specified user
// no permission limits
router.get('/user/:user_id', userFarmController.getUserFarmByUserID());

// Get info on all users (userFarm) at a farm
router.get(
  '/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:user_farm_info']),
  userFarmController.getUserFarmsByFarmID(),
);

// Get info on all active users (userFarm) at a farm
router.get(
  '/active/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:user_farm_info']),
  userFarmController.getActiveUserFarmsByFarmID(),
);

// Update consent status for a userFarm referenced by user_id
// If userFarm status is Inactive or Invited, status will be set to Active
// no permission limits
router.patch(
  '/consent/farm/:farm_id/user/:user_id',
  isSelf,
  hasFarmAccess({ params: 'farm_id' }),
  checkUserFarmStatus('Active'),
  userFarmController.updateConsent(),
);

// Update the role on a userFarm
router.patch(
  '/role/farm/:farm_id/user/:user_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['edit:user_role'], { checkConsent: false }),
  userFarmController.updateRole(),
);

// Update the status on a userFarm
router.patch(
  '/status/farm/:farm_id/user/:user_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['edit:user_status']),
  userFarmController.updateStatus(),
);

// Accept an invitation and validate invitation token
router.patch(
  '/accept_invitation',
  checkInviteJwt,
  checkInvitationTokenContent,
  userFarmController.acceptInvitation(),
);

// Accept an invitation and validate accessToken
router.patch(
  '/accept_invitation/farm/:farm_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkUserFarmStatus('Invited'),
  userFarmController.acceptInvitationWithAccessToken(),
);

// [DEPRECATE] Get specific info related to userFarm
router.get(
  '/farm/:farm_id/user/:user_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['get:user_farm_info']),
  userFarmController.getFarmInfo(),
);

router.post(
  '/invite/farm/:farm_id/user/:user_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['edit:users']),
  userFarmController.upgradePseudoUser(),
);

// Update wage of userFarm
router.patch(
  '/wage/farm/:farm_id/user/:user_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['edit:user_wage']),
  userFarmController.updateWage(),
);

router.patch(
  '/wage_do_not_ask_again/farm/:farm_id/user/:user_id',
  hasFarmAccess({ params: 'farm_id' }),
  checkScope(['edit:users']),
  userFarmController.setWageDoNotAskAgain(),
);

// Update step_one
router.patch('/onboarding/farm/:farm_id/user/:user_id', userFarmController.updateOnboardingFlags());

export default router;
