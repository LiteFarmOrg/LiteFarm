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

const jwt = require('express-jwt');

const checkJwt = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
}).unless({
  path: [
    '/user',
    '/login',
    '/password_reset',
    '/user/accept_invitation',
    '/user_farm/accept_invitation',
    '/notification_user/subscribe',
    /\/time_notification\//i,
    /\/farm\/utc_offset_by_range\//i,
  ],
});

module.exports = checkJwt;
