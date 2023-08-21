/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (yieldController.js) is part of LiteFarm.
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

import parser from 'ua-parser-js';
import UserLogModel from '../models/userLogModel.js';

const userLogController = {
  addUserLog() {
    return async (req, res) => {
      // uses email to identify which user is attempting to log in, can also use user_id for this
      const { user_id } = req.auth;
      const { screen_width, screen_height, farm_id } = req.body;
      try {
        const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
        const ua = parser(req.headers['user-agent']);
        const languages = req.acceptsLanguages();
        await UserLogModel.query().insert({
          user_id,
          ip,
          languages,
          browser: ua.browser.name,
          browser_version: ua.browser.version,
          os: ua.os.name,
          os_version: ua.os.version,
          device_vendor: ua.device.vendor,
          device_model: ua.device.model,
          device_type: ua.device.type,
          screen_width,
          screen_height,
          farm_id,
        });
        return res.status(201).json({
          ua,
        });
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },
};

export default userLogController;
