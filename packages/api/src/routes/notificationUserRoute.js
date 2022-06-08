/*
 *  Copyright 2019-2022 LiteFarm.org
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

const NotificationUserController = require('../controllers/notificationUserController');
const checkUserFarmStatus = require('../middleware/acl/checkUserFarmStatus');
const express = require('express');
const router = express.Router();

router.get('/subscribe', NotificationUserController.subscribeToAlerts);
router.get('/', checkUserFarmStatus(), NotificationUserController.getNotifications);
router.patch('/', checkUserFarmStatus(), NotificationUserController.patchNotifications);
router.patch('/clear_alerts', checkUserFarmStatus(), NotificationUserController.clearAlerts);

module.exports = router;
