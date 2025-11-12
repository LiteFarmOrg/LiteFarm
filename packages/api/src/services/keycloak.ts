/*
 *  Copyright 2025 LiteFarm.org
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

import axios from 'axios';

/**
 * Cache for Keycloak access tokens.
 */
let cachedToken: {
  token: string;
  expiresAt: number;
} | null = null;

/**
 * Gets a valid access token for calling webhooks.
 * Caches tokens and only requests new ones when expired.
 *
 * @returns Access token string
 * @throws Error if token acquisition fails
 */
export async function getAccessToken(): Promise<string> {
  // Check if we have a cached token that's still valid (with 60 second buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token;
  }

  const keycloakUrl = process.env.KEYCLOAK_URL;
  const keycloakRealm = process.env.KEYCLOAK_REALM;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

  if (!keycloakUrl || !keycloakRealm || !clientId || !clientSecret) {
    throw new Error(
      'Keycloak configuration missing. Required: KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET',
    );
  }

  const tokenUrl = `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`;

  try {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'WriteEnterprise', // As specified in GitLab documentation
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000, // 10 second timeout
      },
    );

    const { access_token, expires_in } = response.data;

    // Cache the token with its expiration time
    cachedToken = {
      token: access_token,
      expiresAt: Date.now() + expires_in * 1000,
    };

    return access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to get access token:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error('Failed to get access token:', error);
    }
    throw new Error('Failed to acquire access token', { cause: error });
  }
}
