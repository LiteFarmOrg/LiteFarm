/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (credentials.js) is part of LiteFarm.
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

const credentials = {
  WATER_BALANCE_DIR: './src/jobs/waterBalance/waterBalanceData/',
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  OPEN_WEATHER_APP_ID: process.env.OPEN_WEATHER_APP_ID,
  CONTACT_FORM: {
    user: process.env.CONTACT_FORM_EMAIL,
    pass: process.env.CONTACT_FORM_PASSWORD,
  },
  STATS_TOKENS: { 'Zia': process.env.STATS_TOKENS_ZIA, 'Mollie': process.env.STATS_TOKENS_MOLLIE },
  LiteFarm_Service_Gmail:{
    user: process.env.LITEFARM_SERVICE_EMAIL,
    pass: process.env.LITEFARM_SERVICE_EMAIL_PASSWORD,
    client_id: process.env.GMAIL_API_CLIENT_ID,
    client_secret: process.env.GMAIL_API_CLIENT_SECRET,
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  },
};

module.exports = credentials;
