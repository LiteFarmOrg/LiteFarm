/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (auth0Config.js) is part of LiteFarm.
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

let token_url;
let audience;
let user_url;
let signup_url;
const client_id = process.env.AUTH0_CLIENT_ID;
const client_secret = process.env.AUTH0_CLIENT_SECRET;

// information from API Explorer Application in auth0
switch (environment) {
case 'integration':
  signup_url = 'https://litefarm.auth0.com/dbconnections/signup';
  token_url = 'https://litefarm.auth0.com/oauth/token';
  audience = 'https://litefarm.auth0.com/api/v2/';
  user_url = 'https://litefarm.auth0.com/api/v2/users';
  break;
case 'production':
  signup_url = 'https://litefarm-production.auth0.com/dbconnections/signup';
  token_url = 'https://litefarm-production.auth0.com/oauth/token';
  audience = 'https://litefarm-production.auth0.com/api/v2/';
  user_url = 'https://litefarm-production.auth0.com/api/v2/users';
  break;
case 'development':
default:
  signup_url = 'https://litefarm-dev.auth0.com/dbconnections/signup';
  token_url = 'https://litefarm-dev.auth0.com/oauth/token';
  audience = 'https://litefarm-dev.auth0.com/api/v2/';
  user_url = 'https://litefarm-dev.auth0.com/api/v2/users';
  break;
}
const auth0Config = {
  token_url,
  token_headers: { 'content-type': 'application/json' },
  token_body: {
    client_id,
    client_secret,
    audience,
    grant_type:'client_credentials',
    scope: 'create:users update:users delete:users',
  },
  user_url,
  signup_url
};

module.exports = auth0Config;
