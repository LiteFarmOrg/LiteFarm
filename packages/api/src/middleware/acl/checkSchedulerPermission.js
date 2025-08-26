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

/**
 * Middleware for checking permissions in scheduler-issued JWTs.
 *
 * This middleware verifies that the authenticated request has the specified scheduler permission flag set to true. Use with the JWTs issued by scheduler jobs and validated by checkSchedulerJwt middleware.
 *
 * @param {string} permissionsKey - The permission key to check on req.auth
 * @returns {import('express').RequestHandler}
 * @throws {403} If the permission key is not set to true on the auth object
 * */
const checkSchedulerPermission = (permissionsKey) => {
  return (req, res, next) => {
    if (req.auth?.[permissionsKey] === true) {
      next();
    } else {
      return res.status(403).send(`No ${permissionsKey} access`);
    }
  };
};
export default checkSchedulerPermission;
