/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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

import { OAuth2Client } from 'google-auth-library';
const client_id = process.env.GOOGLE_OAUTH_CLIENT_ID;
const client = new OAuth2Client(client_id);

// Token returned from the @react-oauth useGoogleLogin() hook in the email invite view
async function checkGoogleAccessToken(req, res, next) {
  const authorization = req.headers['authorization'];
  if (!authorization) {
    return res.status(401).send('Not authenticated');
  }
  const token = authorization.replace('Bearer ', '');

  try {
    const tokenInfo = await client.getTokenInfo(token);
    req.user = { email: tokenInfo.email, sub: tokenInfo.sub };
    return next();
  } catch (error) {
    console.error(error);
  }
}

export default checkGoogleAccessToken;
