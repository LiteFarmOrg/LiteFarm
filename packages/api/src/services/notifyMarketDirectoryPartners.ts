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

import MarketDirectoryPartnerAuth from '../models/marketDirectoryPartnerAuthModel.js';
import MarketDirectoryPartnerPermissionsModel from '../models/marketDirectoryPartnerPermissions.js';
import { notifyPartnerRefresh } from './datafoodconsortium/dfcWebhook.js';
import type {
  MarketDirectoryPartnerAuth as MarketDirectoryPartnerAuthType,
  MarketDirectoryPartnerPermissions,
} from '../models/types.js';

/**
 * Non-blocking post-response side effects; do not send HTTP responses here
 *
 * Notifies all partners who need to know about changes to market directory info:
 * - Partners who currently have access
 * - Partners who just lost access
 *
 * @param marketDirectoryInfoId - ID of the market directory info that was updated
 * @param previousPartnerIds - Array of partner IDs that had access before the update
 */
export async function notifyMarketDirectoryPartners(
  marketDirectoryInfoId: string,
  previousPartnerIds: number[],
) {
  try {
    // Get current partners after the update
    const currentPartners: MarketDirectoryPartnerPermissions[] =
      await MarketDirectoryPartnerPermissionsModel
        // @ts-expect-error: TS doesn't see query() through softDelete HOC; safe at runtime
        .query()
        .where({ market_directory_info_id: marketDirectoryInfoId })
        .whereNotDeleted();

    const currentPartnerIds = currentPartners.map((partner) => partner.market_directory_partner_id);

    // Calculate if any partners have changed
    const addedPartners = currentPartnerIds.filter((id) => !previousPartnerIds.includes(id));
    const removedPartners = previousPartnerIds.filter((id) => !currentPartnerIds.includes(id));
    const partnersChanged = addedPartners.length > 0 || removedPartners.length > 0;

    let partnerIdsToNotify: number[];

    if (partnersChanged) {
      partnerIdsToNotify = [...new Set([...addedPartners, ...removedPartners])];
    } else {
      partnerIdsToNotify = currentPartnerIds;
    }

    if (partnerIdsToNotify.length === 0) {
      return;
    }

    const partnerAuths = (await MarketDirectoryPartnerAuth.query().whereIn(
      'market_directory_partner_id',
      partnerIdsToNotify,
    )) as unknown as MarketDirectoryPartnerAuthType[];

    // Send webhooks to each partner with a webhook URL
    for (const auth of partnerAuths) {
      if (!auth.webhook_endpoint) {
        continue;
      }

      await notifyPartnerRefresh(auth.webhook_endpoint);
    }
  } catch (error) {
    console.error(error);
  }
}
