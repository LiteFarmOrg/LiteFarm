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

import FarmAddonModel from '../models/farmAddonModel.js';
import { Farm } from '../models/types.js';
import ESciAddon from '../util/ensembleService.js';
import { AddonFunctions, IrrigationPrescription } from '../util/ensembleService.types.js';

// TODO: LF-4710 - Delete partner_id = 0, remove Partial
const PARTNER_ID_MAP: Record<number, Partial<AddonFunctions>> = {
  0: {},
  1: ESciAddon,
};

export const getAddonPartnerIrrigationPrescriptions = async (
  farmId: Farm['farm_id'],
  startTime: string,
  endTime: string,
): Promise<IrrigationPrescription[]> => {
  const irrigationPrescriptions: IrrigationPrescription[] = [];
  const partnerErrors: unknown[] = [];

  // Check for registered farm addons (only esci for now)
  const farmAddonPartnerIds = await FarmAddonModel.getDistinctFarmAddonPartnerIds(farmId);

  // Return empty array if no addons
  if (!farmAddonPartnerIds.length) {
    return irrigationPrescriptions;
  }

  // Loop through addon partners
  for (const farmAddonPartnerId of farmAddonPartnerIds) {
    try {
      const addonPartner = PARTNER_ID_MAP[farmAddonPartnerId.addon_partner_id];
      // TODO: LF-4710 - Skip deprecated partner_id = 0 situation
      // Type guard for undefined functions
      if (!addonPartner || typeof addonPartner.getIrrigationPrescriptions !== 'function') {
        continue;
      }

      irrigationPrescriptions.push(
        ...(await addonPartner.getIrrigationPrescriptions(farmId, startTime, endTime)),
      );
    } catch (error) {
      partnerErrors.push(error);
    }
  }

  // Return an error if there are no prescriptions, but there is an error
  if (!irrigationPrescriptions.length && partnerErrors.length) {
    throw partnerErrors[0];
  }

  return irrigationPrescriptions;
};
