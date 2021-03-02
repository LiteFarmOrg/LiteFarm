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
const subjectTranslation = require('./subject_translation.json');
const path = require('path');
const EmailTemplates = require('email-templates');

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
  MAP_EXPORT_EMAIL: { subjectReplacements: '', path: 'map_export_email' },
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

const emailTransporter = new EmailTemplates({
  views: {
    root: path.join(__dirname, 'emails'),
  },
  i18n: {
    locales: ['en', 'es', 'fr', 'pt'],
    directory: path.join(__dirname, 'locales'),
    objectNotation: true,
  },
  transport: {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      clientId: credentials.LiteFarm_Service_Gmail.client_id,
      clientSecret: credentials.LiteFarm_Service_Gmail.client_secret,
    },
  },
});

function sendEmail(template_path, replacements, email_to, sender = 'system@litefarm.org', buttonLink = null, language = 'en', attachments = []) {
  try {
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
    replacements.url = homeUrl();
    replacements.year = new Date().getFullYear();
    replacements.buttonLink = buttonLink ? `${homeUrl()}${buttonLink}` : `${homeUrl()}/?email=${encodeURIComponent(email_to)}`;
    replacements.imgBaseUrl = homeUrl('https://beta.litefarm.org');
    emailTransporter.render(template_path, replacements).then((html) => {
      const mailOptions = {
        from: 'LiteFarm <' + sender + '>',
        to: email_to,
        html,
        auth: {
          user: 'system@litefarm.org',
          refreshToken: credentials.LiteFarm_Service_Gmail.refresh_token,
        },
      };
      if (attachments.length && attachments[0] && [emails.HELP_REQUEST_EMAIL.path, emails.MAP_EXPORT_EMAIL.path].includes(template_path.path)) {
        if (template_path.path === emails.HELP_REQUEST_EMAIL.path) {
          mailOptions.cc = 'support@litefarm.org';
        }
        mailOptions.attachments = attachments.map(file => ({ filename: file.originalname, content: file.buffer }));

      }
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: ' + info.response);
      });
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  emails,
  sendEmail,
};


