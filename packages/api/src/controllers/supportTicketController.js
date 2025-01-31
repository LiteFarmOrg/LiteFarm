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

// const baseController = require('../controllers/baseController');
import SupportTicketModel from '../models/supportTicketModel.js';

import UserModel from '../models/userModel.js';
import { emails, sendEmail } from '../templates/sendEmailTemplate.js';

const supportTicketController = {
  async addSupportTicket(req, res) {
    try {
      const data = JSON.parse(req.body.data);
      data.attachments = [];
      const user_id = req.auth.user_id;
      const user = await UserModel.query().findById(user_id);
      const result = await SupportTicketModel.query()
        .context({ user_id })
        .insert(data)
        .returning('*');
      const replacements = {
        first_name: user.first_name,
        support_type: result.support_type,
        message: result.message,
        contact_method: capitalize(result.contact_method),
        contact: result[result.contact_method],
        locale: user.language_preference,
        ...getOOOMessageReplacements(user.language_preference),
      };
      const email = data.contact_method === 'email' && data.email;
      if (email && email !== user.email) {
        await sendEmail(emails.HELP_REQUEST_EMAIL, replacements, email, {
          sender: 'system@litefarm.org',
          attachments: [req.file],
        });
      } else {
        await sendEmail(emails.HELP_REQUEST_EMAIL, replacements, user.email, {
          sender: 'system@litefarm.org',
          attachments: [req.file],
        });
      }
      res.status(201).send(result);
    } catch (error) {
      console.log(error);
      res.status(400).json({
        error,
      });
    }
  },
};

const getOOOMessageReplacements = (locale) => {
  const ooo_message_enabled = process.env.OOO_MESSAGE_ENABLED === 'true';
  let ooo_end_date = process.env.OOO_END_DATE;
  if (ooo_message_enabled && ooo_end_date) {
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    ooo_end_date = new Date(ooo_end_date).toLocaleDateString(locale, dateOptions);
  }
  return { ooo_message_enabled, ooo_end_date };
};

const capitalize = (string) => {
  return string[0].toUpperCase() + string.slice(1);
};

export default supportTicketController;
