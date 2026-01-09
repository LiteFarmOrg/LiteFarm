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
import { checkDeleteLocationUrl, getLocationsByFarmIdUrl, locationURL } from '../../apiConfig';
import { InternalMapLocation, InternalMapLocationType, WithLocationId } from './types';
import { RootState } from '../store';

export const locations = api.injectEndpoints({
  endpoints: (build) => ({
    getLocations: build.query<InternalMapLocation[], void>({
      queryFn: async (_arg, { getState }, _extraOptions, baseQuery) => {
        const state = getState() as RootState;
        const farm_id = state.entitiesReducer.userFarmReducer.farm_id;
        const result = await baseQuery({
          url: `${getLocationsByFarmIdUrl(farm_id)}`,
          method: 'GET',
        });
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data as InternalMapLocation[] };
      },
      providesTags: ['Locations'],
    }),
    checkDeleteLocation: build.mutation<void, WithLocationId>({
      query: ({ location_id }) => ({
        url: `${checkDeleteLocationUrl}/${location_id}`,
        method: 'GET', // Mutations are not the normal pattern for GET, but the result should never be cached
      }),
    }),
    deleteLocation: build.mutation<void, WithLocationId>({
      query: ({ location_id }) => ({
        url: `${locationURL}/${location_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Locations'],
    }),
    addLocationByType: build.mutation<
      void,
      { data: InternalMapLocation; type: InternalMapLocationType }
    >({
      query: ({ data, type }) => ({
        url: `${locationURL}/${type}`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Locations'],
    }),
    updateLocationByType: build.mutation<
      void,
      WithLocationId<{
        data: InternalMapLocation;
        type: InternalMapLocationType;
      }>
    >({
      query: ({ data, type, location_id }) => ({
        url: `${locationURL}/${type}/${location_id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Locations'],
    }),
  }),
});

export const {
  useGetLocationsQuery,
  useCheckDeleteLocationMutation,
  useDeleteLocationMutation,
  useAddLocationByTypeMutation,
  useUpdateLocationByTypeMutation,
} = locations;
