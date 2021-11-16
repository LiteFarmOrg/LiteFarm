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

const express = require('express');
const router = express.Router();
const userFarmController = require('../controllers/userFarmController');
const hasFarmAccess = require('../middleware/acl/hasFarmAccess');
const checkScope = require('../middleware/acl/checkScope');
const isSelf = require('../middleware/acl/isSelf');
const checkInviteJwt = require('../middleware/acl/checkInviteJwt');
const checkInvitationTokenContent = require('../middleware/acl/checkInviteTokenContent');
const checkUserFarmStatus = require('../middleware/acl/checkUserFarmStatus');

// Get all userFarms for a specified user
// no permission limits
router.get('/user/:user_id', userFarmController.getUserFarmByUserID());

// Get info on all users (userFarm) at a farm
router.get('/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:user_farm_info']), userFarmController.getUserFarmsByFarmID());

// Get info on all active users (userFarm) at a farm
router.get('/active/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:user_farm_info']), userFarmController.getActiveUserFarmsByFarmID());

// Update consent status for a userFarm referenced by user_id
// If userFarm status is Inactive or Invited, status will be set to Active
// no permission limits
router.patch('/consent/farm/:farm_id/user/:user_id', isSelf, hasFarmAccess({ params: 'farm_id' }), checkUserFarmStatus('Active'), userFarmController.updateConsent());

// Update the role on a userFarm
router.patch('/role/farm/:farm_id/user/:user_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['edit:user_role']), userFarmController.updateRole());

// Update the status on a userFarm
router.patch('/status/farm/:farm_id/user/:user_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['edit:user_status']), userFarmController.updateStatus());

// Accept an invitation and validate invitation token
router.patch('/accept_invitation', checkInviteJwt, checkInvitationTokenContent, userFarmController.acceptInvitation());

// Accept an invitation and validate accessToken
router.patch('/accept_invitation/farm/:farm_id', hasFarmAccess({ params: 'farm_id' }), checkUserFarmStatus('Invited'), userFarmController.acceptInvitationWithAccessToken());

// [DEPRECATE] Get specific info related to userFarm
router.get('/farm/:farm_id/user/:user_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['get:user_farm_info']), userFarmController.getFarmInfo());

router.post('/invite/farm/:farm_id/user/:user_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['edit:users']), userFarmController.patchPseudoUserEmail());

// Update wage of userFarm
router.patch('/wage/farm/:farm_id/user/:user_id', hasFarmAccess({ params: 'farm_id' }), checkScope(['edit:user_wage']), userFarmController.updateWage());

// Update step_one
router.patch('/onboarding/farm/:farm_id/user/:user_id', userFarmController.updateOnboardingFlags());

module.exports = router;
