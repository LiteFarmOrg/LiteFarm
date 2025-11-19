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

import { NextFunction, Request, Response } from 'express';
import MarketDirectoryPartnerAuth from '../models/marketDirectoryPartnerAuthModel.js';
import { decodeTokenWithoutVerifying, verifyKeycloakToken } from '../services/keycloak.js';
import type { MarketDirectoryPartnerAuth as MarketDirectoryPartnerAuthType } from '../models/types.js';

export default () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Step 1: Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Step 2: Decode (but don't verify yet) to get client_id
    let payload;
    try {
      payload = decodeTokenWithoutVerifying(token);
    } catch {
      return res.status(401).send('Invalid token format');
    }

    const client_id = payload.azp || payload.client_id;

    if (!client_id) {
      return res.status(401).send('Missing client_id in token');
    }

    // Step 3: Look up partner by client_id to get Keycloak realm info
    const partnerAuth = (await MarketDirectoryPartnerAuth.query().where({ client_id }).first()) as
      | MarketDirectoryPartnerAuthType
      | undefined;

    if (!partnerAuth) {
      return res.status(404).send('Market directory partner not found');
    }

    // Step 4: Check if farm has opted in (placeholder for now)
    // TODO: Add actual permission check against opt-in table
    const farmPermission = true;

    if (!farmPermission) {
      return res.status(403).send('Farm did not authorize directory partner');
    }

    // Step 5: Verify the token against the partner's Keycloak realm
    try {
      await verifyKeycloakToken(token, partnerAuth.keycloak_url, partnerAuth.keycloak_realm);
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).send('Invalid or expired token');
    }

    next();
  } catch (error) {
    console.error('hasMarketDirectoryPartnerAccess middleware error:', error);
    return res.status(500).send('Internal server error checking partner access');
  }
};
