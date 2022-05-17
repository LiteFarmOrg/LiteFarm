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
const timeNotificationController = require('../controllers/timeNotificationController');
const express = require('express');
const checkSchedulerJwt = require('../middleware/acl/checkSchedulerJwt');
const hasTimeNotificationsAccess = require('../middleware/acl/hasTimeNotificationsAccess');
const router = express.Router();

router.post(
  '/weekly_unassigned_tasks/:farm_id',
  checkSchedulerJwt,
  hasTimeNotificationsAccess,
  timeNotificationController.postWeeklyUnassignedTasks,
);

router.post(
  '/daily_due_today_tasks/:user_id',
  checkSchedulerJwt,
  hasTimeNotificationsAccess,
  timeNotificationController.postDailyDueTodayTasks,
);

module.exports = router;
