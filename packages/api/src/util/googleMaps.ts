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

import { Client } from '@googlemaps/google-maps-services-js';
const googleClient = new Client({});

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
