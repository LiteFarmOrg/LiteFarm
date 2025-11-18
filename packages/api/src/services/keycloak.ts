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
import jwkToPem, { JWK } from 'jwk-to-pem';

/**
 * Keycloak Authentication Service
 *
 * Handles communication with Keycloak (an identity/authentication provider) to:
 * - Get access tokens for making authenticated requests
 * - Verify that JWT tokens are legitimate and haven't been tampered with
 */

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
  /**
   * Check if we have a cached token that's still valid.
   * Refresh 60 seconds early to avoid using an expired token mid-request.
   */
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
        // scope: 'WriteEnterprise', // Note: this scope is specified in the GitLab documentation but the keycloak servers we've been set up on don't accept it
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
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
 * Cache for Keycloak realm public keys
 *
 * Public keys rarely change, so we cache them for 24 hours to reduce network requests.
 */
const publicKeysCache = new Map<string, { keys: JWK[]; expiresAt: number }>();

/**
 * Extract information from a JWT token without checking if it's valid.
 *
 * This is safe to use for reading non-sensitive data like client_id,
 * because we verify the token's authenticity in the next step.
 * We need the client_id first to know which Keycloak realm to verify against.
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
async function fetchPublicKeys(keycloakUrl: string, keycloakRealm: string): Promise<JWK[]> {
  const issuer = `${keycloakUrl}/realms/${keycloakRealm}`;

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
 * This proves the token is:
 * - Legitimately issued by Keycloak (not forged)
 * - Hasn't been tampered with since creation
 * - Not expired
 */
export async function verifyKeycloakToken(
  token: string,
  keycloakUrl: string,
  keycloakRealm: string,
) {
  // Extract the token's header to find which key signed it
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid token format');
  }

  const { kid } = decoded.header;
  const issuer = `${keycloakUrl}/realms/${keycloakRealm}`;

  const keys = await fetchPublicKeys(keycloakUrl, keycloakRealm);
  const key = keys.find((k) => 'kid' in k && k.kid === kid);

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
