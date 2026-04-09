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

import { api } from './apiSlice';
import { farmNotesReadUrl } from '../../apiConfig';
import { FarmNotesRead } from './types';

export const farmNotesReadApi = api.injectEndpoints({
  endpoints: (build) => ({
    getFarmNotesRead: build.query<FarmNotesRead, void>({
      query: () => ({
        url: farmNotesReadUrl,
        method: 'GET',
      }),
      providesTags: ['FarmNotesRead'],
    }),
    markFarmNotesRead: build.mutation<void, void>({
      query: () => ({
        url: farmNotesReadUrl,
        method: 'PATCH',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        // Always optimistic: update cache immediately with current timestamp
        dispatch(
          farmNotesReadApi.util.updateQueryData('getFarmNotesRead', undefined, (draft) => {
            draft.read_through = new Date().toISOString();
          }),
        );

        try {
          await queryFulfilled;
        } catch (error) {
          // Even on network error, keep the optimistic update (marking as read is not critical)
          // SW will queue the PATCH and replay it
        }
      },
      invalidatesTags: ['FarmNotesRead'],
    }),
  }),
});

export const { useGetFarmNotesReadQuery, useMarkFarmNotesReadMutation } = farmNotesReadApi;
