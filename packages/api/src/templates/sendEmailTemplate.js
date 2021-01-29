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
const subjectTranslation = require('./subject_translation.json');
const fs = require('fs-extra');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const emails = {
  INVITATION: { subjectReplacements: '', path: 'invitation_to_farm_email.html' },
  CONFIRMATION: { subjectReplacements: '', path: 'send_confirmation_email.html' },
  WITHHELD_CONSENT: { path: 'withheld_consent_email.html' },
  ACCESS_RESTORE: { subjectReplacements: '', path: 'restoration_of_access_to_farm_email.html' },
  ACCESS_REVOKE: { subjectReplacements: '', path: 'revocation_of_access_to_farm_email.html' },
  WELCOME: { path: 'welcome_email.html' },
  PASSWORD_RESET: { path: 'password_reset_email.html' },
  PASSWORD_RESET_CONFIRMATION: { path: 'reset_password_confirmation.html' },
  HELP_REQUEST_EMAIL: { path: 'help_request_email.html' },
};

class sendEmailTemplate {
  static async sendEmail(template_path, replacements, email, sender = 'system@litefarm.org', joinRelativeURL = null, language = 'en', attachments = []) {
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
    const subjectKey = Object.keys(emails).find((k) => emails[k].path === template_path.path);
    const subject = addReplacements(template_path, subjectTranslation[language.substring(0, 2)][subjectKey]);
    const filePath = path.join(__dirname, `../templates/${language}/${template_path.path}`);
    const html = await fs.readFile(filePath, 'utf8');

    // this compiles the html file, but template itself is a function
    const template = handlebars.compile(html);

    // after this the template is converted to strings
    let htmlToSend = template({
      ...replacements,
      url: sendEmailTemplate.homeUrl('https://beta.litefarm.org'),
      year: new Date().getFullYear(),
    });

    // this changes the join button href for invite a user email
    const html_templates = [
      'invitation_to_farm_email.html',
      'send_confirmation_email.html',
      'withheld_consent_email.html',
      'restoration_of_access_to_farm_email.html',
      'welcome_email.html',
      'password_reset_email.html',
      'reset_password_confirmation.html',
      'help_request_email.html',
    ];
    if (html_templates.includes(template_path.path)) {
      // using JSDOM to dynamically set the href for the Join button
      const dom = new JSDOM(htmlToSend);

      if (joinRelativeURL) {
        dom.window.document.getElementById('email-button').setAttribute('href', `${sendEmailTemplate.homeUrl()}${joinRelativeURL}`);
      } else {
        const $button = dom.window.document.getElementById('email-button');
        if ($button) {
          const url = `${sendEmailTemplate.homeUrl()}/?email=${encodeURIComponent(email)}`;
          dom.window.document.getElementById('email-button').setAttribute('href', url);
        }
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

    if (template_path === emails.HELP_REQUEST_EMAIL) {
      mailOptions.cc = 'support@litefarm.org';
      if (attachments.length && attachments[0]) {
        mailOptions.attachments = attachments.map(file => ({ filename: file?.originalname, content: file?.buffer }));
      }
    }
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

function addReplacements(template, subject) {
  if (subject.includes('??') && template.subjectReplacements) {
    return subject.replace('??', template.subjectReplacements);
  }
  return subject;
}

module.exports = {
  sendEmailTemplate,
  emails,
};
