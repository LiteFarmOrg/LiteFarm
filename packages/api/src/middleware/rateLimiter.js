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

// import rateLimit from 'express-rate-limit';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const RateLimit = require('express-rate-limit');

// set up rate limiter: each IP to maximum of ten requests per second
export const rateLimiterUsingThirdParty = RateLimit({
  windowMs: 1000, // 1 second
  max: 10,
  message: 'You have exceeded the 10 requests in 1 second limit!',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
