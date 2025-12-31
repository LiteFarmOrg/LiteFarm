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

import { libraryApi } from './libraryApiSlice';
import { marketProductCategoryUrl } from '../../apiConfig';
import { MarketProductCategory } from './types';

export const MarketProductCategories = libraryApi.injectEndpoints({
  endpoints: (build) => ({
    getMarketProductCategories: build.query<MarketProductCategory[], void>({
      query: () => ({
        url: `${marketProductCategoryUrl}`,
        method: 'GET',
      }),
      providesTags: ['MarketProductCategories'],
    }),
  }),
});

export const { useGetMarketProductCategoriesQuery } = MarketProductCategories;
