/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (sendEmailTemplate.js) is part of LiteFarm.
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

const nodemailer = require('nodemailer');
const credentials = require('../credentials');
const handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

class sendEmailTemplate {
  static async sendEmail(template_path, subject, replacements, email, sender, joinRelativeURL = null) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        clientId: credentials.LiteFarm_Service_Gmail.client_id,
        clientSecret: credentials.LiteFarm_Service_Gmail.client_secret,
      },
    });

    const filePath = path.join(__dirname, template_path);
    const html = await fs.readFile(filePath, 'utf8');

    // this compiles the html file, but template itself is a function
    const template = handlebars.compile(html);

    // after this the template is converted to strings
    let htmlToSend = template({ ...replacements, url: sendEmailTemplate.homeUrl('https://beta.litefarm.org'), year: new Date().getFullYear() });

    // this changes the join button href for invite a user email
    const html_templates = [
      '../templates/invitation_to_farm_email.html',
      '../templates/send_confirmation_email.html',
      '../templates/withheld_consent_email.html',
      '../templates/restoration_of_access_to_farm_email.html',
      '../templates/welcome_email.html',
    ];
    if (html_templates.includes(template_path)) {
      // using JSDOM to dynamically set the href for the Join button
      const dom = new JSDOM(htmlToSend);

      if (joinRelativeURL) {
        dom.window.document.getElementById('email-button').setAttribute('href', `${sendEmailTemplate.homeUrl()}${joinRelativeURL}`);
      } else {
        const url = `${sendEmailTemplate.homeUrl()}/?email=${email}`;
        dom.window.document.getElementById('email-button').setAttribute('href', url);
      }
      // this exports the dom back to a string
      htmlToSend = dom.serialize();
    }

    const mailOptions = {
      from: 'LiteFarm <' + sender + '>',
      to: email,
      subject,
      html: htmlToSend,
      auth: {
        user: 'system@litefarm.org',
        refreshToken: credentials.LiteFarm_Service_Gmail.refresh_token,
      },
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: ' + info.response);
    });

  }

  static homeUrl(defaultUrl = 'http://localhost:3000') {
    const environment = process.env.NODE_ENV || 'development';
    let homeUrl = defaultUrl;
    if (environment === 'integration') {
      homeUrl = 'https://beta.litefarm.org';
    } else if (environment === 'production') {
      homeUrl = 'https://app.litefarm.org';
    }
    return homeUrl;
  }
}

module.exports = sendEmailTemplate;
