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
import { tokenType } from '../../util/jwt.js';

const checkSoilLabResultJwt = expressjwt({
  secret: () => {
    const secret = tokenType.soilLabResult;
    if (!secret) {
      throw new UnauthorizedError('invalid_token', {
        message: 'Soil lab result tokens are disabled.',
      });
    }
    return secret;
  },
  algorithms: ['HS256'],
  audience: 'soil_lab_result',
});

export default checkSoilLabResultJwt;
