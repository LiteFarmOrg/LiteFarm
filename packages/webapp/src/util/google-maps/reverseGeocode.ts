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
 * Convert lat/lng coordinates to a formatted address using Google Geocoding API

 * @param latLng - Comma-separated lat/lng string (e.g., "22.3740157, 114.1792392")
 * @returns Formatted address string or original input if not lat/lng format
 */
export const reverseGeocode = async (latLng: string): Promise<string> => {
  if (!isLatLng(latLng)) {
    return latLng;
  }

  try {
    const [lat, lng] = latLng.split(',').map((coord) => parseFloat(coord.trim()));

    if (isNaN(lat) || isNaN(lng)) {
      return latLng;
    }

    // This requires Google Maps script to be loaded
    const geocoder = new google.maps.Geocoder();
    const response = await geocoder.geocode({
      location: { lat, lng },
    });

    if (response.results && response.results.length) {
      return response.results[0].formatted_address;
    }

    return latLng;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return latLng;
  }
};

/**
 * Check if a string is in lat/lng format
 */
export const isLatLng = (address: string): boolean => {
  const latLngPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
  return latLngPattern.test(address.trim());
};
