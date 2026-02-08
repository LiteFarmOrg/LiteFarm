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
import { MarketDirectoryInfo, WithFarmId, WithFarmIdPayload } from './types';
import { getFarmTagsFn, getMutationWithFarmId, getUseQueryWithFarmId } from './util';

export const marketDirectoryInfo = api.injectEndpoints({
  endpoints: (build) => ({
    getMarketDirectoryInfo: build.query<MarketDirectoryInfo, WithFarmId>({
      query: (_args) => ({
        url: `${marketDirectoryInfoUrl}`,
        method: 'GET',
      }),
      providesTags: getFarmTagsFn<MarketDirectoryInfo, WithFarmId>(['MarketDirectoryInfo']),
    }),
    addMarketDirectoryInfo: build.mutation<
      void,
      WithFarmIdPayload<Omit<MarketDirectoryInfo, 'id'>>
    >({
      query: ({ farm_id: _farm_id, payload: body }) => ({
        url: `${marketDirectoryInfoUrl}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: getFarmTagsFn<void, WithFarmIdPayload<Omit<MarketDirectoryInfo, 'id'>>>([
        'MarketDirectoryInfo',
      ]),
    }),
    updateMarketDirectoryInfo: build.mutation<
      void,
      WithFarmIdPayload<Partial<MarketDirectoryInfo>>
    >({
      query: ({ farm_id: _farm_id, payload: { id, ...patch } }) => {
        return {
          url: `${marketDirectoryInfoUrl}/${id}`,
          method: 'PATCH',
          body: patch,
        };
      },
      invalidatesTags: getFarmTagsFn<void, WithFarmIdPayload<Partial<MarketDirectoryInfo>>>([
        'MarketDirectoryInfo',
      ]),
    }),
  }),
});

export const useGetMarketDirectoryInfoQuery = getUseQueryWithFarmId<
  MarketDirectoryInfo,
  WithFarmId
>(marketDirectoryInfo.useGetMarketDirectoryInfoQuery);

export const useAddMarketDirectoryInfoMutation = getMutationWithFarmId<
  void,
  WithFarmIdPayload<Omit<MarketDirectoryInfo, 'id'>>
>(marketDirectoryInfo.useAddMarketDirectoryInfoMutation);

export const useUpdateMarketDirectoryInfoMutation = getMutationWithFarmId<
  void,
  WithFarmIdPayload<Partial<MarketDirectoryInfo>>
>(marketDirectoryInfo.useUpdateMarketDirectoryInfoMutation);
