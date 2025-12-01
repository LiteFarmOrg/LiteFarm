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
import { marketDirectoryPartnersUrl } from '../../apiConfig';
import { MarketDirectoryPartner } from './types';
import { PARTNERS_INFO } from '../../containers/Profile/FarmSettings/MarketDirectory/Consent/partners';

export const marketDirectoryPartners = api.injectEndpoints({
  endpoints: (build) => ({
    getMarketDirectoryPartners: build.query<MarketDirectoryPartner[], string | void>({
      query: (param = '') => ({
        url: `${marketDirectoryPartnersUrl}${param}`,
        method: 'GET',
      }),
      transformResponse: (response: MarketDirectoryPartner[]) => {
        return response.filter((partner) => partner.key in PARTNERS_INFO);
      },
      providesTags: ['MarketDirectoryPartners'],
    }),
  }),
});

export const { useGetMarketDirectoryPartnersQuery } = marketDirectoryPartners;
