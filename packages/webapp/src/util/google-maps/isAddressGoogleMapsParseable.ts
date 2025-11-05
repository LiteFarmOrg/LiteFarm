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
 * Validate if an address can be parsed by Google Maps Geocoding API
 * Mirrors backend getAddressComponents validation
 *
 * @param address - Address string to validate
 * @returns true if valid, false if not parseable
 */
export const isAddressGoogleMapsParseable = async (address?: string): Promise<boolean> => {
  if (!address?.trim()) {
    return false;
  }

  try {
    const geocoder = new google.maps.Geocoder();
    const response = await geocoder.geocode({ address });

    return !!response.results?.[0]?.address_components;
  } catch (error) {
    return false;
  }
};
