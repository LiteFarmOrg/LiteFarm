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

const NotificationUserModel = require('../models/notificationUserModel');

module.exports = {
  async getNotifications(req, res) {
    try {
      const notifications = await NotificationUserModel.getNotificationsForFarmUser(req.headers.farm_id, req.user.user_id);
      res.status(200).send(notifications);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error });
    }
  },
};
