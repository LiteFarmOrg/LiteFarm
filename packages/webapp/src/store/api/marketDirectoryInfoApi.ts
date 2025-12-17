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
import { marketDirectoryInfoUrl } from '../../apiConfig';
import { MarketDirectoryInfo } from './types';

export const marketDirectoryInfo = api.injectEndpoints({
  endpoints: (build) => ({
    getMarketDirectoryInfo: build.query<MarketDirectoryInfo, void>({
      query: () => ({
        url: `${marketDirectoryInfoUrl}`,
        method: 'GET',
      }),
      providesTags: ['MarketDirectoryInfo'],
    }),
    addMarketDirectoryInfo: build.mutation<void, Omit<MarketDirectoryInfo, 'id'>>({
      query: (body) => ({
        url: `${marketDirectoryInfoUrl}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MarketDirectoryInfo'],
    }),
    updateMarketDirectoryInfo: build.mutation<void, Partial<MarketDirectoryInfo>>({
      query: ({ id, ...patch }) => {
        return {
          url: `${marketDirectoryInfoUrl}/${id}`,
          method: 'PATCH',
          body: patch,
        };
      },
      invalidatesTags: ['MarketDirectoryInfo'],
    }),
  }),
});

export const {
  useAddMarketDirectoryInfoMutation,
  useUpdateMarketDirectoryInfoMutation,
  useGetMarketDirectoryInfoQuery,
} = marketDirectoryInfo;
