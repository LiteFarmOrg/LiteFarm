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

import { useMemo } from 'react';
import { MarketDirectoryInfo, MarketProductCategory } from '../../../../../store/api/types';
import { mapReactSelectOptionsForEnum } from '../../../../../components/Form/ReactSelect/util';
import { DIRECTORY_INFO_FIELDS } from './types';
import { useGetMarketProductCategoriesQuery } from '../../../../../store/api/marketProductCategoryApi';

const useMarketDirectoryData = (
  marketDirectoryInfo?: MarketDirectoryInfo,
  marketProductCategories?: MarketProductCategory[],
) => {
  return useMemo(() => {
    const marketProductCategoryOptions = marketProductCategories
      ? mapReactSelectOptionsForEnum(
          marketProductCategories,
          'market_directory_info:MARKET_PRODUCT_CATEGORY',
        )
      : [];

    if (!marketDirectoryInfo) {
      return {
        marketDirectoryData: null,
        marketProductCategoryOptions,
      };
    }

    const transformedMarketDirectoryProducts = marketDirectoryInfo?.market_product_categories?.map(
      (category) => {
        return marketProductCategoryOptions?.find(
          (option) => option.value === category.market_product_category_id,
        );
      },
    );
    return {
      marketDirectoryData: {
        ...marketDirectoryInfo,
        [DIRECTORY_INFO_FIELDS.MARKET_PRODUCT_CATEGORIES]: transformedMarketDirectoryProducts || [],
      },
      marketProductCategoryOptions,
    };
  }, [marketDirectoryInfo, marketProductCategories]);
};

export default useMarketDirectoryData;
