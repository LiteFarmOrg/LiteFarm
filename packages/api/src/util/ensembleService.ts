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
 * This file extends the Ensemble service (ensemble.js) using TypeScript. When the TS migration of ensemble.js is done, the contents of this file can be moved there.
 */

import FarmAddonModel from '../models/farmAddonModel.js';
import AddonPartnerModel from '../models/addonPartnerModel.js';
import LocationModel from '../models/locationModel.js';
import ManagementPlanModel from '../models/managementPlanModel.js';
import { customError } from './customErrors.js';
import { ENSEMBLE_BRAND } from './ensemble.js';

export interface Point {
  lat: number;
  lng: number;
}

interface CropData {
  crop: string; // taken from crop_variety_id
  seed_date: string; // ISO 8601
}

interface FarmLocation {
  farm_id: string;
  location_id: string;
  grid_points: Point[];
}

interface OrganisationFarmData {
  [org_uuid: string]: Array<FarmLocation & { crop_data: CropData }>;
}

/**
 * Sends farm data to Ensemble API to initiate irrigation prescription.
 *
 * Currently set up to send data for one farm or all of them, but depending on our needs we may want to keep just one or the other
 *
 * @param {uuid} farm_id
 * @returns {Promise<void>}
 * @async
 */
export const sendIrrigationData = async (farm_id?: string) => {
  const partner = await AddonPartnerModel.getPartnerId(ENSEMBLE_BRAND);
  if (!partner) {
    throw customError('Ensemble partner not found', 400);
  }

  let organisations: Array<{ org_uuid: string; org_pk: number; farm_id: string }> = [];

  if (farm_id) {
    const farmEnsembleAddon = await FarmAddonModel.getOrganisationIds(farm_id, partner.id);
    if (!farmEnsembleAddon) {
      throw customError('Farm not connected to Ensemble', 400);
    }
    organisations = [{ ...farmEnsembleAddon, farm_id }];
  } else {
    organisations = await FarmAddonModel.getAllOrganisationIds(partner.id);
    if (!organisations || organisations.length === 0) {
      throw customError('No organizations connected to Ensemble', 400);
    }
  }

  const organisationFarmData: OrganisationFarmData = {};

  for (const org of organisations) {
    const locations = await LocationModel.getCropSupportingLocationsByFarmId(org.farm_id);

    const cropsAndLocations: Array<FarmLocation & { crop_data: CropData }> = [];

    for (const location of locations) {
      const managementPlanGraph = await ManagementPlanModel.getManagementPlansByLocationId(
        location.location_id,
      );
      cropsAndLocations.push({
        ...location,
        crop_data: managementPlanGraph,
      });
    }

    (organisationFarmData[org.org_uuid] ??= []).push(...cropsAndLocations);
  }

  return organisationFarmData;
};
