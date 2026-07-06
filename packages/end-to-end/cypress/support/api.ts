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
import { farm as fixtureFarm, onboarding } from '../fixtures/test.fixture'

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

export const createFarm = async (auth, farm = fixtureFarm) => {
  const response = await fetch(`${hostname}/farm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...auth.authHeader,
    },
    
    body: JSON.stringify(farm),
  });

  return await response.json();
}

export const onboardFarm = async(auth, farmId, userId) => {
  await fetch(`${hostname}/user_farm/onboarding/farm/${farmId}/user/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      farm_id: farmId,
      ...auth.authHeader,
    },
    body: JSON.stringify(onboarding),
  });
}

export const onboardRole = async(auth, farmId, userId, roleId = 2) => {
  await fetch(`${hostname}/user_farm/role/farm/${farmId}/user/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      farm_id: farmId,
      user_id: userId,
      ...auth.authHeader,
    },
    body: JSON.stringify({ role_id: roleId }),
  });
}

export const ownerOperated = async(auth, farmId, userId) => {
  console.log(`${hostname}/farm/owner_operated/${farmId}`)
  const response = await fetch(`${hostname}/farm/owner_operated/${farmId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      farm_id: farmId,
      user_id: userId,
      ...auth.authHeader,
    },
    body: JSON.stringify({ owner_operated: true }),
  });

  return await response.json();
}
export const farmConsent = async(auth, farmId, userId, hasConsent = false) => {
  await fetch(`${hostname}/user_farm/consent/farm/${farmId}/user/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      farm_id: farmId,
      user_id: userId,
      ...auth.authHeader,
    },
    body: JSON.stringify({ has_consent: hasConsent, consent_version: '7.1' }),
  });
}

export const organicCertifierSurvey = async (auth, farmId, userId) => {
  const response = await fetch(`${hostname}/organic_certifier_survey`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      farm_id: farmId,
      user_id: userId,
      ...auth.authHeader,
    },
    
    body: JSON.stringify({
      certification_id:null,
      certifier_id:null,
      farm_id:farmId,
      interested:false,
      requested_certification:null,
      requested_certifier:null
    }),
  });

  return await response.json();
}

export const releseBadge = async(auth, farmId, userId) => {
  await fetch(`${hostname}/release_badge`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      farm_id: farmId,
      user_id: userId,
      ...auth.authHeader,
    },
    body: JSON.stringify({app_version:"3.12.0"}),
  });
}
export const showedSpotlight = async(auth, userId) => {
  await fetch(`${hostname}/showed_spotlight`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      user_id: userId,
      ...auth.authHeader,
    },
    body: JSON.stringify({
      notification:true,
      notification_end:"2026-07-01T08:21:04.769Z",
      navigation:true,
      navigation_end:"2026-07-01T08:21:04.776Z"
    }),
  });
}

export const farmToken = async(auth, farmId, userId) => {
  console.log(`${hostname}/farm_token/farm/${farmId}`)
  const response = await fetch(`${hostname}/farm_token/farm/${farmId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      user_id: userId,
      farm_id: farmId,
      ...auth.authHeader,
    }
  });

  return await response.json();
}

