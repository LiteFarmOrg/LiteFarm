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
import MarketDirectoryPartner from '../../models/marketDirectoryPartnerModel.js';
import type {
  MarketDirectoryInfo,
  MarketDirectoryPartner as MarketDirectoryPartnerType,
} from '../../models/types.js';
import { LiteFarmCustomError } from '../../util/customErrors.js';

export type MarketDirectoryInfoReqBody = Partial<MarketDirectoryInfo> & {
  market_product_categories?: { market_product_category_id: number }[];
  partner_permissions?: { market_directory_partner_id: number }[];
};

export interface MarketDirectoryInfoRouteParams {
  id: MarketDirectoryInfo['id'];
}

export function checkAndTransformMarketDirectoryInfo() {
  return async (
    req: LiteFarmRequest<unknown, unknown, unknown, MarketDirectoryInfoReqBody>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { address, website, market_product_categories, partner_permissions } = req.body;

      const { id } = req.params as Partial<MarketDirectoryInfoRouteParams>;

      if (req.method === 'POST') {
        // @ts-expect-error: TS doesn't see query() through softDelete HOC; safe at runtime
        const record = await MarketDirectoryInfoModel.query()
          .where({ farm_id: req.headers.farm_id })
          .first();

        if (record) {
          return res.status(409).send('Market directory info for this farm already exists');
        }

        if (!market_product_categories) {
          return res.status(400).send('Invalid market_product_categories');
        }
      }

      if (
        'market_product_categories' in req.body &&
        (!Array.isArray(market_product_categories) || market_product_categories.length === 0)
      ) {
        return res.status(400).send('Invalid market_product_categories');
      }

      // Validate partner_permissions
      if (partner_permissions) {
        if (!Array.isArray(partner_permissions)) {
          return res.status(400).send('Partners must be an array');
        }

        const requestedIds = partner_permissions.map(
          (partner) => partner.market_directory_partner_id,
        );

        if (requestedIds.length) {
          const existingPartners = (await MarketDirectoryPartner.query().whereIn(
            'id',
            requestedIds,
          )) as unknown as MarketDirectoryPartnerType[];

          const existingIds = existingPartners.map((partner) => partner.id);
          const missingIds = requestedIds.filter((id) => !existingIds.includes(id));

          if (missingIds.length) {
            return res
              .status(400)
              .send(`One or more partner does not exist: ${missingIds.join(', ')}`);
          }
        }
      }

      // Transform partner_permissions for upsert
      if (id && partner_permissions) {
        req.body.partner_permissions = partner_permissions.map((partner) => ({
          ...partner,
          market_directory_info_id: id, // needed as joint primary key
          deleted: false, // un-delete if previously deleted
        }));
      }

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
    } catch (error) {
      console.error(error);
      if (error instanceof LiteFarmCustomError) {
        return error.body
          ? res.status(error.code).json({ ...error.body, message: error.message })
          : res.status(error.code).send({
              title: error.message,
              message: error.message,
              status: error.code,
              original: error.message,
            });
      }
      return res.status(500).json({
        error,
      });
    }
  };
}

export function checkMarketDirectoryInfoRecord(
  { errorMessage } = { errorMessage: 'Market directory info not found' },
) {
  return async (
    req: LiteFarmRequest<unknown, unknown, unknown, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params as Partial<MarketDirectoryInfoRouteParams>;

      // @ts-expect-error: TS doesn't see query() through softDelete HOC; safe at runtime
      const record = await MarketDirectoryInfoModel.query().findById(id).whereNotDeleted();

      if (!record) {
        return res.status(404).send(errorMessage);
      }

      next();
    } catch (error) {
      console.error(error);
      if (error instanceof LiteFarmCustomError) {
        return error.body
          ? res.status(error.code).json({ ...error.body, message: error.message })
          : res.status(error.code).send({
              title: error.message,
              message: error.message,
              status: error.code,
              original: error.message,
            });
      }
      return res.status(500).json({
        error,
      });
    }
  };
}
