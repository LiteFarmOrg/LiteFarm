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
const EmailTemplates = require('email-templates');
const { JSDOM } = jsdom;

const emails = {
  INVITATION: { subjectReplacements: '', path: 'invitation_to_farm_email' },
  CONFIRMATION: { subjectReplacements: '', path: 'send_confirmation_email' },
  WITHHELD_CONSENT: { path: 'withheld_consent_email' },
  ACCESS_RESTORE: { subjectReplacements: '', path: 'restoration_of_access_to_farm_email' },
  ACCESS_REVOKE: { subjectReplacements: '', path: 'revocation_of_access_to_farm_email' },
  WELCOME: { path: 'welcome_email' },
  PASSWORD_RESET: { path: 'password_reset_email' },
  PASSWORD_RESET_CONFIRMATION: { path: 'reset_password_confirmation' },
  HELP_REQUEST_EMAIL: { path: 'help_request_email' },
};

function addReplacements(template, subject) {
  if (subject.includes('??') && template.subjectReplacements) {
    return subject.replace('??', template.subjectReplacements);
  }
  return subject;
}

function homeUrl(defaultUrl = 'http://localhost:3000') {
  const environment = process.env.NODE_ENV || 'development';
  let homeUrl = defaultUrl;
  if (environment === 'integration') {
    homeUrl = 'https://beta.litefarm.org';
  } else if (environment === 'production') {
    homeUrl = 'https://app.litefarm.org';
  }
  return homeUrl;
}

function sendEmail(template_path, replacements, email_to, sender = 'system@litefarm.org', buttonLink = null, language = 'en', attachments = []) {
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
  const emailRenderer = new EmailTemplates({
    views: {
      root: path.join(__dirname, 'emails'),
    },
    i18n: {
      locales: ['en', 'es', 'fr', 'pt'],
      directory: path.join(__dirname, 'locales'),
      objectNotation: true,
    },
  });
  replacements.url = homeUrl();
  replacements.year = new Date().getFullYear();
  replacements.buttonLink = buttonLink ? `${homeUrl()}${buttonLink}` : `${homeUrl()}/?email=${encodeURIComponent(email_to)}`;
  replacements.imgBaseUrl = homeUrl('https://beta.litefarm.org');
  emailRenderer.render(template_path, replacements).then((html) => {
    const subjectKey = Object.keys(emails).find((k) => emails[k].path === template_path.path);
    const subject = addReplacements(template_path, subjectTranslation[replacements?.locale?.substring(0, 2)][subjectKey]);
    const mailOptions = {
      from: 'LiteFarm <' + sender + '>',
      to: email_to,
      subject,
      html,
      auth: {
        user: 'system@litefarm.org',
        refreshToken: credentials.LiteFarm_Service_Gmail.refresh_token,
      },
    };

    if (template_path === emails.HELP_REQUEST_EMAIL) {
      mailOptions.cc = 'support@litefarm.org';
      if (attachments.length && attachments[0]) {
        mailOptions.attachments = attachments.map(file => ({ filename: file.originalname, content: file.buffer }));
      }
    }
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: ' + info.response);
    });
  });

}

module.exports = {
  emails,
  sendEmail,
};


