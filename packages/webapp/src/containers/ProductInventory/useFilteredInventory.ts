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
import { useSelector } from 'react-redux';
import type { TableProduct } from '.';
import { ProductCategory, InventoryFilterKeys } from '../Filter/ProductInventory/types';
import { inventoryFilterSelector } from '../filterSlice';
import { isInactive } from '../Filter/utils';

export const useFilteredInventory = (inventory: TableProduct[]) => {
  const {
    [InventoryFilterKeys.CUSTOM_OR_LIBRARY]: customOrLibraryFilter,
    [InventoryFilterKeys.FERTILISER_TYPE]: fertiliserTypeFilter,
  } = useSelector(inventoryFilterSelector);

  const filterMatches = useMemo(() => {
    return inventory.filter((product) => {
      const key = product.isLibraryProduct ? ProductCategory.LIBRARY : ProductCategory.CUSTOM;
      const customOrLibraryMatches =
        isInactive(customOrLibraryFilter) || customOrLibraryFilter[key]?.active;

      const fertilizerTypeId = product.soil_amendment_product?.soil_amendment_fertiliser_type_id;
      const fertiliserTypeMatches =
        isInactive(fertiliserTypeFilter) ||
        (fertilizerTypeId && fertiliserTypeFilter[fertilizerTypeId]?.active);

      return customOrLibraryMatches && fertiliserTypeMatches;
    });
  }, [inventory, customOrLibraryFilter, fertiliserTypeFilter]);

  return filterMatches;
};
