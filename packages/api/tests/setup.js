/* eslint-disable object-shorthand */
/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (setup.js) is part of LiteFarm.
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

/* eslint-disable no-console */
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const dummy = require('./dummy');
const axios = require('axios');

async function getToken() {
  console.log('retrieving token and clearing test user data');
  const data = dummy.auth;


  const header = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  try {
    const response = await axios.post('https://litefarm.auth0.com/oauth/token', data, header);
    const token = response.data.access_token;
    await axios.delete('http://localhost:5000/user/' + dummy.mockUser.user_id, {
      validateStatus: function (status) {
        return true;
      },
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    })
    await axios.delete('http://localhost:5000/user/' + dummy.mockUserDuplicateEmail.user_id, {
      validateStatus: function (status) {
        return true;
      },
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    })
    return token;
  }
  catch (error) {
    console.log(error)
  }
}

module.exports = getToken;
