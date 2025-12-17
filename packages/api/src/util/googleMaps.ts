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

import { Client, AddressType } from '@googlemaps/google-maps-services-js';
const googleClient = new Client({});

export interface ParsedAddress {
  street?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
}

/**
 * Fetches address components from Google Geocoding API for a given address string. Works with lat-lng
 */
export async function getAddressComponents(address: string) {
  try {
    const response = await googleClient.geocode({
      params: {
        address,
        key: process.env.GOOGLE_API_KEY!,
      },
    });
    return response.data.results[0]?.address_components;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Parses a Google Geocoding API address into structured components.
 * Extracts street, postal code, city, region, and country from Google's response.
 */
export const parseGoogleGeocodedAddress = async (address: string): Promise<ParsedAddress> => {
  const components = await getAddressComponents(address);
  if (!components) return {};

  // Helper to extract the long_name for a given address component type
  const getValue = (type: AddressType) =>
    components.find((component) => component.types.includes(type))?.long_name;

  // Google's short_name for countries is 2-character ISO
  const countryCode = components.find((component) =>
    component.types.includes(AddressType.country),
  )?.short_name;

  const streetNumber = getValue(AddressType.street_number);
  const route = getValue(AddressType.route);
  const street = streetNumber && route ? `${streetNumber} ${route}` : streetNumber || route;

  return {
    street,
    postalCode: getValue(AddressType.postal_code),
    city: getValue(AddressType.locality),
    region: getValue(AddressType.administrative_area_level_1),
    country: getValue(AddressType.country),
    countryCode,
  };
};
