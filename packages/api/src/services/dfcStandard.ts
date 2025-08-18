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

import { Connector } from '@datafoodconsortium/connector';
import { apiUrl } from '../util/appUrls.js';
import type { MarketListingData } from './marketData.js';

const connector = new Connector();

export const formatFarmDataToDfcStandard = async (farmListingData: MarketListingData) => {
  const { farm_id, farm_name, country, grid_points, farm_address } = farmListingData;

  // @ts-expect-error createAddress params don't match the constructor
  // Q3: Should I open a PR to match the createAddress() method to the constructor?
  const address = connector.createAddress({
    // Q4: What is the semantic id for an address?
    semanticId: createAddressUrl(`${grid_points.lat},${grid_points.lng}`),
    latitude: grid_points.lat,
    longitude: grid_points.lng,
    street: farm_address.street,
    city: farm_address.city,
    region: farm_address.region,
    postalCode: farm_address.postalCode,
    country,
  });

  // @ts-expect-error params don't match the constructor
  const farm = connector.createEnterprise({
    // Q1: Is this supposed to be completely circular? Is this the same URL we are calling against?
    // Q2: Should it include /enterprises, or is /farm equally okay?
    semanticId: createEnterpriseUrl(farm_id),
    name: farm_name,
    localizations: [address],
  });

  const exportFormattedData = await connector.export([farm, address]);

  return exportFormattedData;
};

const createEnterpriseUrl = (farm_id: string): string => {
  return `${apiUrl()}/dfc/enterprises/${farm_id}`;
};

const createAddressUrl = (latLngString: string): string => {
  return `${apiUrl()}/dfc/addresses/${latLngString}`;
};
