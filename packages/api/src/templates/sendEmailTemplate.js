/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
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

import credentials from '../credentials.js';
import { getEnvInt, getEnvBool, getEnv } from '../util/env.js'

const dir = path.dirname(fileURLToPath(import.meta.url));

import path from 'path';
import EmailTemplates from 'email-templates';
import { fileURLToPath } from 'url';

const emails = {
  INVITATION: { path: 'invitation_to_farm_email' },
  CONFIRMATION: { path: 'send_confirmation_email' },
  WITHHELD_CONSENT: { path: 'withheld_consent_email' },
  ACCESS_RESTORE: { path: 'restoration_of_access_to_farm_email' },
  ACCESS_REVOKE: { path: 'revocation_of_access_to_farm_email' },
  WELCOME: { path: 'welcome_email' },
  PASSWORD_RESET: { path: 'password_reset_email' },
  PASSWORD_RESET_CONFIRMATION: { path: 'reset_password_confirmation' },
  HELP_REQUEST_EMAIL: { path: 'help_request_email' },
  MAP_EXPORT_EMAIL: { path: 'map_export_email' },
  EXPORT_EMAIL: { path: 'export_email' },
};

function homeUrl(defaultUrl = 'http://localhost:3000') {
  const environment = process.env.NODE_ENV || 'development';
  let homeUrl = defaultUrl;
  if(process.env.HOME_PUBLIC_URL) {
    homeUrl = process.env.HOME_PUBLIC_URL;
  } else if (environment === 'integration') {
    homeUrl = 'https://beta.litefarm.org';
  } else if (environment === 'production') {
    homeUrl = 'https://app.litefarm.org';
  }
  return homeUrl;
}

function gmailAuth() {
  const environment = process.env.NODE_ENV || 'development';
  if(process.env.EMAIL_TRANSPORT_USER && process.env.EMAIL_TRANSPORT_PASSWORD) {
    return {
      user: process.env.EMAIL_TRANSPORT_USER,
      pass: process.env.EMAIL_TRANSPORT_PASSWORD,
    }
  }

  if (environment === 'development' && process.env.DEV_GMAIL) {
    return {
      user: process.env.DEV_GMAIL,
      pass: process.env.DEV_GMAIL_APP_PASSWORD,
    };
  }
  return {
    type: 'OAuth2',
    clientId: credentials.LiteFarm_Service_Gmail.client_id,
    clientSecret: credentials.LiteFarm_Service_Gmail.client_secret,
    user:
      environment === 'development'
        ? credentials.LiteFarm_Service_Gmail.user || 'system@litefarm.org'
        : 'system@litefarm.org',
    refreshToken: credentials.LiteFarm_Service_Gmail.refresh_token,
  };
}

const emailTransporter = new EmailTemplates({
  views: {
    root: path.join(dir, 'emails'),
  },
  i18n: {
    locales: ['en', 'es', 'fr', 'pt', 'de', 'hi', 'pa', 'ml'],
    directory: path.join(dir, 'locales'),
    objectNotation: true,
  },
  send: true,
  preview: process.env.DEBUG === 'email-templates' || process.env.DEBUG === 'i18n:*',
  subjectPrefix: process.env.NODE_ENV === 'production' ? false : '[Development] ',
  transport: {
    host: getEnv('EMAIL_TRANSPORT_HOST', 'smtp.gmail.com'),
    port: getEnvInt('EMAIL_TRANSPORT_PORT', 465),
    secure: getEnvBool('EMAIL_TRANSPORT_SECURE', true),
    service: getEnv('EMAIL_TRANSPORT_SERVICE', 'gmail'),
    auth: gmailAuth(),
  },
});

function sendEmail(
  template_path,
  replacements,
  email_to,
  { sender = getEnv('EMAIL_SENDER', 'system@litefarm.org'), buttonLink = null, attachments = [] },
) {
  try {
    replacements.url = homeUrl();
    replacements.year = new Date().getFullYear();
    replacements.dateTime = new Date().toISOString().replace('T', ' ');
    replacements.buttonLink = buttonLink
      ? `${homeUrl()}${buttonLink}`
      : `${homeUrl()}/?email=${encodeURIComponent(email_to)}`;
    replacements.imgBaseUrl = homeUrl('https://beta.litefarm.org');
    const mailOptions = {
      message: {
        from: 'LiteFarm <' + sender + '>',
        to: email_to,
      },
      template: template_path,
      locals: replacements,
    };
    if (template_path.path === emails.HELP_REQUEST_EMAIL.path) {
      mailOptions.message.cc = getEnv('EMAIL_SUPPORT', 'support@litefarm.org');
    }
    if (
      attachments.length &&
      attachments[0] &&
      [emails.HELP_REQUEST_EMAIL.path, emails.MAP_EXPORT_EMAIL.path].includes(template_path.path)
    ) {
      mailOptions.message.attachments = attachments.map((file) => ({
        filename: file.originalname,
        content: file.buffer,
      }));
    }
    return emailTransporter.send(mailOptions).then(console.log).catch(console.error);
  } catch (error) {
    console.log(error);
  }
}

export { emails, sendEmail };
