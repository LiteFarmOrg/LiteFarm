/*
 *  Copyright 2026 LiteFarm.org
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

/* This file was adapted from googleMaps.ts on the backend */

// Google Maps address component types
enum AddressType {
  administrative_area_level_1 = 'administrative_area_level_1',
  administrative_area_level_2 = 'administrative_area_level_2',
  country = 'country',
}

export interface ParsedAddress {
  location_province?: string;
  location_municipality?: string;
  country?: string;
}

/**
 * Parses a Google Geocoding API address into structured components.
 * Extracts street, postal code, city, region, and country from Google's response.
 * Requires Google Maps API to be loaded.
 */
export const parseGoogleGeocodedAddress = async (address: string): Promise<ParsedAddress> => {
  if (!address) return {};

  try {
    const geocoder = new google.maps.Geocoder();
    const response = await geocoder.geocode({ address });

    if (!response.results || !response.results.length) {
      return {};
    }

    const components = response.results[0].address_components;
    if (!components) return {};

    // Helper to extract the long_name for a given address component type
    const getValue = (type: AddressType) =>
      components.find((component) => component.types.includes(type))?.long_name;

    return {
      location_province: getValue(AddressType.administrative_area_level_1),
      location_municipality: getValue(AddressType.administrative_area_level_2),
      country: getValue(AddressType.country),
    };
  } catch (error) {
    console.error('Geocoding failed:', error);
    return {};
  }
};
