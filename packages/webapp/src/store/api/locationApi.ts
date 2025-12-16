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

import { api } from './apiSlice';
import { getLocationsByFarmIdUrl } from '../../apiConfig';
import { InternalMapLocation } from './types';

export const locations = api.injectEndpoints({
  endpoints: (build) => ({
    getLocations: build.query<InternalMapLocation[], { farm_id: string }>({
      query: ({ farm_id }) => ({
        url: `${getLocationsByFarmIdUrl(farm_id)}`,
        method: 'GET',
      }),
      providesTags: ['Locations'],
    }),
  }),
});

export const { useGetLocationsQuery } = locations;
