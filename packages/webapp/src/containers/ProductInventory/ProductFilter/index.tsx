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

import { useTranslation } from 'react-i18next';
import {
  setInventoryFilter,
  inventoryFilterSelector,
  initialInventoryFilter,
} from '../../filterSlice';
import FilterDrawerContainer from '../../Filter/FilterDrawerContainer';
import ProductInventoryFilterContent from '../../Filter/ProductInventory/';
import type { InventoryFilterKeys } from '../../Filter/ProductInventory/types';

const ProductInventoryFilter = ({ isFilterActive }: { isFilterActive: boolean }) => {
  const { t } = useTranslation(['filter']);

  return (
    <FilterDrawerContainer<InventoryFilterKeys>
      isFilterActive={isFilterActive}
      filterSelector={inventoryFilterSelector}
      setFilterAction={setInventoryFilter}
      initialFilter={initialInventoryFilter}
      drawerTitle={t('filter:INVENTORY.TITLE')}
    >
      {({ filter, onChange }) => (
        <ProductInventoryFilterContent inventoryFilter={filter} onChange={onChange} />
      )}
    </FilterDrawerContainer>
  );
};

export default ProductInventoryFilter;
