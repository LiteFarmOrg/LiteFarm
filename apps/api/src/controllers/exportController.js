/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fertilizerController.js) is part of LiteFarm.
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

import UserModel from '../models/userModel.js';

import { emails, sendEmail } from '../templates/sendEmailTemplate.js';
import FarmModel from '../models/farmModel.js';

const exportController = {
  sendMapToEmail() {
    return async (req, res) => {
      try {
        const user_id = req.auth.user_id;
        const { farm_id } = req.params;
        const user = await UserModel.query().findById(user_id);
        const { farm_name } = await FarmModel.query().findById(farm_id);
        const replacements = {
          first_name: user.first_name,
          locale: user.language_preference,
          farm_name,
        };
        const template_path = emails.MAP_EXPORT_EMAIL;
        sendEmail(template_path, replacements, user.email, {
          sender: 'system@litefarm.org',
          attachments: [req.file],
        });
        res.sendStatus(200);
      } catch (error) {
        console.log(error);
        res.status(400).json({
          error,
        });
      }
    };
  },
};

export default exportController;
