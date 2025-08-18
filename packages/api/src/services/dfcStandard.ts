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
import type { MarketListingData } from './marketData.js';

const createAddressUrl = (latLngString: string): string => {
  return `/dfc/address/${latLngString}`;
};

const createUserUrl = (user_id: string): string => {
  return `/dfc/user/${user_id}`;
};

const createEnterpriseUrl = (farm_id: string): string => {
  return `/dfc/farm/${farm_id}`;
};

const connector = new Connector();

export const formatFarmDataToDfcStandard = async (farmListingData: MarketListingData) => {
  const { farm_id, farm_name, country, grid_points, farm_address, user } = farmListingData;

  // Q: Should the createAddress() method be matched to the constructor?
  // @ts-expect-error lat, lng, and region missing from createAddress()
  const address = connector.createAddress({
    // Q: Can I create any semantic ID for an address if it's not an entity in our system
    semanticId: createAddressUrl(`${grid_points.lat},${grid_points.lng}`),
    latitude: grid_points.lat,
    longitude: grid_points.lng,
    street: farm_address.street,
    city: farm_address.city,
    region: farm_address.region,
    postalCode: farm_address.postalCode,
    country,
  });

  const contactUser = connector.createPerson({
    semanticId: createUserUrl(user.user_id),
    firstName: user.first_name,
    lastName: user.last_name,
    // Q: What's the correct way to link up to a phone number?
  });

  // @ts-expect-error name and mainContact missing from createEnterprise
  const farm = connector.createEnterprise({
    // Q: Is this supposed to be completely circular? Is this the same URL we are calling against?
    // Q: Should it include /enterprise at this point, or is dfc/farm equally okay?
    // Q: Relative route correct?
    semanticId: createEnterpriseUrl(farm_id),
    name: farm_name,
    localizations: [address],
    mainContact: [contactUser],
  });

  const exportFormattedData = await connector.export([farm, address, contactUser]);

  return exportFormattedData;
};
