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
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

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
        // scope: 'WriteEnterprise', // Specified in GitLab documentation but the keycloak server doesn't accept it
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

/**
 * Minimal JWK type used by Keycloak JWKS responses.
 */
interface Jwk {
  kid: string;
  kty: 'RSA';
  e: string;
  n: string;
  use?: string;
  alg?: string;
  [key: string]: unknown;
}

/**
 * Cache for Keycloak realm public keys
 */
const publicKeysCache = new Map<string, { keys: Jwk[]; expiresAt: number }>();

/**
 * Decode a JWT token WITHOUT verifying it.
 * Use this to get the client_id before verification.
 *
 * WARNING: Do NOT trust this data until you call verifyKeycloakToken!
 */

export function decodeTokenWithoutVerifying(token: string): JwtPayload {
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid token format');
  }

  return (decoded as { payload: JwtPayload }).payload;
}

/**
 * Fetch public keys from Keycloak's JWKS endpoint.
 * These keys are used to verify token signatures.
 */
async function fetchPublicKeys(keycloakUrl: string, keycloakRealm: string): Promise<Jwk[]> {
  const issuer = `${keycloakUrl}/realms/${keycloakRealm}`;

  // Check cache (24 hour TTL)
  const cached = publicKeysCache.get(issuer);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.keys;
  }

  const jwksUrl = `${issuer}/protocol/openid-connect/certs`;

  const response = await axios.get(jwksUrl, { timeout: 10000 });
  const keys = response.data.keys;

  publicKeysCache.set(issuer, {
    keys,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });

  return keys;
}

/**
 * Verify a Keycloak JWT token against a specific realm.
 *
 * This proves the token is legitimate and hasn't been tampered with.
 */
export async function verifyKeycloakToken(
  token: string,
  keycloakUrl: string,
  keycloakRealm: string,
) {
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid token format');
  }

  const { kid } = decoded.header;
  const issuer = `${keycloakUrl}/realms/${keycloakRealm}`;

  const keys = await fetchPublicKeys(keycloakUrl, keycloakRealm);
  const key = keys.find((k) => k.kid === kid);

  if (!key) {
    throw new Error('Token signing key not found');
  }

  // Convert JWK to PEM format
  const publicKeyPem = jwkToPem(key);

  try {
    jwt.verify(token, publicKeyPem, {
      algorithms: ['RS256'],
      issuer,
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
    throw error;
  }
}
