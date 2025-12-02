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
import { MarketDirectoryInfo } from '../../../../../store/api/types';
import { mapReactSelectOptionsForEnum } from '../../../../../components/Form/ReactSelect/util';
import { DIRECTORY_INFO_FIELDS } from './types';
import { useGetMarketProductCategoriesQuery } from '../../../../../store/api/marketProductCategoryApi';

const useMarketDirectoryData = (marketDirectoryInfo?: MarketDirectoryInfo) => {
  const { data: marketProductCategories, isLoading: isMarketProductCategoriesLoading } =
    useGetMarketProductCategoriesQuery();

  const marketProductCategoryOptions = marketProductCategories
    ? mapReactSelectOptionsForEnum(
        marketProductCategories,
        'market_directory_info:MARKET_PRODUCT_CATEGORY',
      )
    : [];

  const transformedMarketDirectoryProducts = marketDirectoryInfo?.market_product_categories?.map(
    (category) => {
      return marketProductCategoryOptions.find(
        (option) => option.value === category.market_product_category_id,
      );
    },
  );

  return useMemo(() => {
    if (isMarketProductCategoriesLoading || !marketDirectoryInfo) {
      return null;
    }
    return {
      ...marketDirectoryInfo,
      [DIRECTORY_INFO_FIELDS.MARKET_PRODUCT_CATEGORIES]: transformedMarketDirectoryProducts || [],
    };
  }, [isMarketProductCategoriesLoading, marketDirectoryInfo, transformedMarketDirectoryProducts]);
};

export default useMarketDirectoryData;
