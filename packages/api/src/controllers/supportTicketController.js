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

const baseController = require('../controllers/baseController');
const supportTicketModel = require('../models/supportTicketModel');
const userModel = require('../models/userModel');
const { sendEmailTemplate, emails } = require('../templates/sendEmailTemplate');

class supportTicketController extends baseController {
  // Disabled
  static getSupportTicketsByFarmId() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const result = await supportTicketModel.query().whereNotDeleted().where({ farm_id });
        if (!result) {
          res.sendStatus(404);
        } else {
          res.status(200).send(result);
        }
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  }

  static addSupportTicket() {
    return async (req, res) => {
      try {
        const user_id = req.user.user_id;
        const user = await userModel.query().findById(user_id);
        const result = await supportTicketModel.query().context({ user_id }).insert(req.body).returning('*');
        const replacements = {
          first_name: user.first_name,
          support_type: result.support_type,
          message: result.message,
          contact_method: capitalize(result.contact_method),
          contact: result[result.contact_method],
        };
        const email = req.body.contact_method === 'email' && req.body.email;
        await sendEmailTemplate.sendEmail(emails.HELP_REQUEST_EMAIL, replacements, user.email, 'system@litefarm.org', null, user.language_preference, req.body.attachments);
        email && email !== user.email && await sendEmailTemplate.sendEmail(emails.HELP_REQUEST_EMAIL, replacements, email, 'system@litefarm.org', null, user.language_preference, req.body.attachments);
        res.status(201).send(result);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  }

  // Disabled
  static patchStatus() {
    return async (req, res) => {
      const support_ticket_id = req.params.support_ticket_id;
      try {
        const user_id = req.user.user_id;
        const status = req.body.status;
        const result = await supportTicketModel.query().context({ user_id }).findById(support_ticket_id).patch({ status });
        res.sendStatus(200);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  }
}

const capitalize = string => {
  return string[0].toUpperCase() + string.slice(1);
};

module.exports = supportTicketController;
