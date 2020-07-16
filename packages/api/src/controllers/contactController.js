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

class contactController extends baseController {
  constructor() {
    super();
  }

  static sendContactForm() {
    const smptTransport = nodeMailer.createTransport({
      service: 'Gmail',
      port: 465,
      auth: {
        user: credentials.CONTACT_FORM.user,
        pass: credentials.CONTACT_FORM.pass,
      },
    });
    return async (req, res) => {
      try {
        const mailData = req.body;
        const mailOptions = {
          'from': mailData.email,
          to: credentials.CONTACT_FORM.user,
          subject: mailData.email + ' ' + mailData.name + ': ' + mailData.subject,
          text: 'FARM ID: ' + mailData.farm_id + '\n--\n' + mailData.body,
        };

        await smptTransport.sendMail(mailOptions, (err) => {
          if (err) res.send(err);
          else {
            res.status(200).send('Success')
          }
        })
      } catch (error) {
        res.status(400).json({
          error,
        })
      }
    }
  }
}

module.exports = contactController;