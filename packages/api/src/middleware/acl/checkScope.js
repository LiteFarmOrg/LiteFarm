/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (checkScope.js) is part of LiteFarm.
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

const userFarmModel = require('../../models/userFarmModel')

const getScopes = async (user_id, farm_id) => {
  // essential to fetch the most updated userFarm info to know user's most updated granted access

  const dataPoints = await userFarmModel.query().distinct('permissions.name', 'userFarm.role_id')
    .join('rolePermissions', 'userFarm.role_id', 'rolePermissions.role_id')
    .join('permissions', 'permissions.permission_id', 'rolePermissions.permission_id')
    .where('userFarm.farm_id', farm_id)
    .where('userFarm.user_id', user_id)

  return dataPoints;
};

/**
 * Middleware for checking permissions for user. Read auth0 documentation on adding custom claims to id_tokens, and check rules page in litefarm auth0 dashboard
 * for more information. Permissions were added to id_token by adding a custom claim using rules in auth0
 * @param expectedScopes - array of required scopes to make request [ 'get:crops', 'add:sales' ]
 */
const checkScope = (expectedScopes) => {
  if (!Array.isArray(expectedScopes)){
    throw new Error('Parameter expectedScopes must be an array of strings representing the scopes for the endpoint(s)');
  }

  return async (req, res, next) => {
    if (expectedScopes.length === 0) {
      return next();
    }
    //TODO user_id should comes from token. const user_id = req.user.user_id
    const { headers } = req;
    const { user_id } = req.user;
    const { farm_id } = headers; // these are the minimum props needed for most endpoints' authorization

    if (!user_id) return res.status(400).send('Missing user_id in headers');
    if (!farm_id) return res.status(400).send('Missing farm_id in headers');

    const scopes = await getScopes(user_id, farm_id);

    const allowed = expectedScopes.some(function(expectedScope) {
      return scopes.find(permission => permission.name === expectedScope);
    });
    if (scopes.length) {
      req.role = scopes[0].role_id
    }
    return allowed ?
      next() :
      res.status(403).send(`User does not have the following permission(s): ${expectedScopes.join(', ')}`);
  }
};

module.exports = checkScope;
