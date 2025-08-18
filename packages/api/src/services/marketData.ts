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

import FarmModel from '../models/farmModel.js';
import UserFarmModel from '../models/userFarmModel.js';
import UserModel from '../models/userModel.js';
import { getAddressComponents } from '../util/googleMaps.js';

export interface MarketListingData {
  farm_address: FarmAddressDetails;
  country: string;
  farm_name: string;
  farm_phone_number: string | null;
  farm_id: string;
  grid_points: {
    lat: number;
    lng: number;
  };
  user: {
    user_id: string;
    first_name: string;
    last_name: string;
    phone_number: string | null;
  };
}

export const getMarketListingData = async (farm_id: string): Promise<MarketListingData> => {
  // TODO check for participation in this program against the FarmAddonModel

  // Grab data already on the farm record
  const farmRecord = await FarmModel.getFarmById(farm_id);

  const { address, country_name, farm_name, farm_phone_number, grid_points } = farmRecord;

  const addressComponents = (await getAddressComponents(address)) ?? [];

  // I think email, website, etc might need to go on a different DB table? Or we can define a main contact for the farm?

  const userFarmRecords = await UserFarmModel.getFarmManagementByFarmId(farm_id);

  // TODO: don't simply pick one arbitrarily, but assign a contact user
  const managementUserId = userFarmRecords[0].user_id;

  const user = await UserModel.query().findById(managementUserId);

  return {
    // @ts-expect-error strings in actual return not matching strings from package
    farm_address: parseAddressComponents(addressComponents),
    grid_points,
    country: country_name,
    farm_name,
    farm_phone_number,
    farm_id,
    user: {
      user_id: managementUserId,
      first_name: user?.first_name,
      last_name: user?.last_name,
      // @ts-expect-error Maybe it's the union type ['string', 'null'] that makes this property problematic?
      phone_number: user?.phone_number,
    },
  };
};
export interface FarmAddressDetails {
  street?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  country?: string;
}

type AddressComponentTypes =
  | 'street_number'
  | 'route'
  | 'locality'
  | 'administrative_area_level_1'
  | 'country'
  | 'postal_code';

const parseAddressComponents = (
  components: {
    long_name: string;
    short_name: string;
    types: AddressComponentTypes[];
  }[],
) => {
  const getValue = (type: AddressComponentTypes) =>
    components.find((components) => components.types.includes(type))?.long_name;

  const streetNumber = getValue('street_number');
  const route = getValue('route');
  const street = streetNumber && route ? `${streetNumber} ${route}` : streetNumber || route;

  return {
    street,
    postalCode: getValue('postal_code'),
    city: getValue('locality'),
    region: getValue('administrative_area_level_1'),
    country: getValue('country'),
  };
};
