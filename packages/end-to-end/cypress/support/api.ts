/*
 *  Copyright 2026 LiteFarm.org
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

/**
* Anti-cypress file, don't add their nonesense Chainable here.
* Try to keep dependencies at minimum, keep in mind this file
* runs in the UI, therefore no nodejs package can be used.
**/

const PASSWORD = 'Password123!';
let hostname;

export const initApi = (url) => hostname = url;

export const createUser = async (overrides = {}) => {
  const payload = {
    first_name: 'Test',
    last_name: 'User',
    email: `test-${Date.now()}@example.com`,
    password: PASSWORD,
    language_preference: 'en',
    ...overrides,
  };

  const response = await fetch(`${hostname}/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return {password: payload.password, ...await response.json()}
};

export const userAuth = async (email, password = PASSWORD) => {
  const payload = {
    user: {
      email,
      password,
    },
    screenSize: {
      screen_width: 2506,
      screen_height: 411,
    },
  };
  
  const response = await fetch(`${hostname}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const { id_token } = await response.json();
  return { token: id_token, authHeader: { Authorization: `Bearer ${ id_token }`, } };
}
