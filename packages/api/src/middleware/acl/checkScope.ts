/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import { RequestHandler } from 'express';
import { getPermissions } from '../../queries/userFarmQueries.js';
import { FarmId, UserId } from '../../types.js';

const getScopes = async (
  user_id: UserId,
  farm_id: FarmId,
  { checkConsent }: { checkConsent: boolean },
) => {
  // essential to fetch the most updated userFarm info to know user's most updated granted access
  try {
    return await getPermissions(farm_id, user_id, checkConsent);
  } catch (error) {
    console.log('getScopes query error', error);
    return [];
  }
};

/**
 * Middleware for checking permissions for user. Read auth0 documentation on adding custom claims to id_tokens, and check rules page in litefarm auth0 dashboard
 * for more information. Permissions were added to id_token by adding a custom claim using rules in auth0
 * @param expectedScopes - array of required scopes to make request [ 'get:crops', 'add:sales' ]
 * @param checkConsent {boolean}
 */
const checkScope = (expectedScopes: string[], { checkConsent = true } = {}): RequestHandler => {
  if (!Array.isArray(expectedScopes)) {
    throw new Error(
      'Parameter expectedScopes must be an array of strings representing the scopes for the endpoint(s)',
    );
  }

  return async (req, res, next) => {
    if (expectedScopes.length === 0) {
      return next();
    }
    const { headers } = req;
    const user_id = req.auth?.user_id;
    const { farm_id } = headers; // these are the minimum props needed for most endpoints' authorization

    if (!user_id || user_id === 'undefined')
      return res.status(400).send('Missing user_id in headers');
    if (!farm_id || farm_id === 'undefined')
      return res.status(400).send('Missing farm_id in headers');
    try {
      const scopes = await getScopes(user_id, farm_id, { checkConsent });

      const allowed = expectedScopes.some(function (expectedScope) {
        return scopes.find((permission) => permission.name === expectedScope);
      });
      if (scopes.length) {
        req.role = scopes[0].role_id;
      }
      return allowed
        ? next()
        : res
            .status(403)
            .send(`User does not have the following permission(s): ${expectedScopes.join(', ')}`);
    } catch (error) {
      console.log('Error checking permissions', error);
      return res.status(403).send('Error checking permissions');
    }
  };
};

export default checkScope;
