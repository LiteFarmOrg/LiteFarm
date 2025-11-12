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

import { Response, NextFunction } from 'express';
import { LiteFarmRequest } from '../../types.js';
import { isValidAddress, isValidEmail } from '../../util/validation.js';
import { isValidUrl } from '../../util/url.js';
import { SOCIALS, validateSocialAndExtractUsername } from '../../util/socials.js';
import MarketDirectoryInfoModel from '../../models/marketDirectoryInfoModel.js';

export interface MarketDirectoryInfoReqBody {
  farm_name?: string;
  logo?: string;
  about?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_email?: string;
  email?: string;
  country_code?: number;
  phone_number?: string;
  address?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  x?: string;
}

export function checkAndTransformMarketDirectoryInfo() {
  return async (
    req: LiteFarmRequest<unknown, unknown, unknown, MarketDirectoryInfoReqBody>,
    res: Response,
    next: NextFunction,
  ) => {
    if (req.method === 'POST') {
      // @ts-expect-error: TS doesn't see query() through softDelete HOC; safe at runtime
      const record = await MarketDirectoryInfoModel.query()
        .where({ farm_id: req.headers.farm_id })
        .first();

      if (record) {
        return res.status(409).send('Market directory info for this farm already exists');
      }
    }

    const { address, website } = req.body;

    for (const emailProperty of ['contact_email', 'email'] as const) {
      if (req.body[emailProperty] && !isValidEmail(req.body[emailProperty])) {
        return res.status(400).send(`Invalid ${emailProperty}`);
      }
    }

    if (address && !(await isValidAddress(address))) {
      return res.status(400).send('Invalid address');
    }

    if (website && !(await isValidUrl(website))) {
      return res.status(400).send('Invalid website');
    }

    for (const social of SOCIALS.filter((social) => req.body[social]?.trim())) {
      const socialUsername = validateSocialAndExtractUsername(social, req.body[social]!);

      if (!socialUsername) {
        return res.status(400).send(`Invalid ${social}`);
      }
      req.body[social] = socialUsername;
    }

    next();
  };
}
