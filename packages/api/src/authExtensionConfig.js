/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (authExtensionConfig.js) is part of LiteFarm.
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

const environment = process.env.NODE_ENV || 'development';

let auth0Uri;
const authExtensionClientId = process.env.AUTH0_AUTH_EXTENSION_CLIENT_ID;
const authExtensionClientSecret = process.env.AUTH0_AUTH_EXTENSION_CLIENT_SECRET;
const authorizationExtensionUri = process.env.AUTH0_AUTH_EXTENSION_URI;

switch (environment) {
case 'integration':
  auth0Uri = 'https://litefarm.auth0.com';
  break;
case 'production':
  auth0Uri = 'https://litefarm-production.auth0.com';
  break;
case 'development':
default:
  auth0Uri = 'https://litefarm-dev.auth0.com';
  break;
}

const authExtensionConfig = {
  token_url: `${auth0Uri}/oauth/token`,
  token_headers: { 'content-type': 'application/json' },
  token_body: {
    client_id: authExtensionClientId,
    client_secret: authExtensionClientSecret,
    audience: 'urn:auth0-authz-api',
    grant_type: 'client_credentials',
  },
  auth0Uri,
  authExtensionUri: authorizationExtensionUri,
};

module.exports = authExtensionConfig;
