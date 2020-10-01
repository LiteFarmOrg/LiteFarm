/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (contactController.js) is part of LiteFarm.
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
const nodeMailer = require('nodemailer');
const credentials = require('../credentials');
const sendEmailTemplate = require('./../templates/sendEmailTemplate')

class contactController extends baseController {
  constructor() {
    super();
  }

  static sendContactForm() {
    return async (req, res) => {
      try {
        const mailData = req.body;
        await sendEmailTemplate.sendEmail('../templates/contact.html',
          mailData.email + ' ' + mailData.name + ': ' + mailData.subject,
          {
            farm_id: mailData.farm_id,
            body: mailData.body,
          }, credentials.CONTACT_FORM.user, credentials.CONTACT_FORM.user
        )
        res.status(200).send('Success')
      } catch (error) {
        res.status(400).json({
          error,
        })
      }
    }
  }
}

module.exports = contactController;
