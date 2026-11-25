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

import { expressjwt, UnauthorizedError } from 'express-jwt';
import { DASHBOARD_AUDIENCES, tokenType } from '../../util/jwt.js';

type DashboardFeature = keyof typeof DASHBOARD_AUDIENCES;

// Takes at least one feature: express-jwt's audience option must be a non-empty list,
// and a token is accepted if its `aud` matches any of the features' audiences.
const checkDashboardApiJwt = (feature: DashboardFeature, ...moreFeatures: DashboardFeature[]) =>
  expressjwt({
    secret: () => {
      const secret = tokenType.dashboardApi;
      if (!secret) {
        throw new UnauthorizedError('invalid_token', {
          message: 'Dashboard API tokens are disabled.',
        });
      }
      return secret;
    },
    algorithms: ['HS256'],
    audience: [
      DASHBOARD_AUDIENCES[feature],
      ...moreFeatures.map((moreFeature) => DASHBOARD_AUDIENCES[moreFeature]),
    ],
  });

export default checkDashboardApiJwt;
