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

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles.module.scss';
import Drawer from '../../../components/Drawer';
import FilterButton from '../../../components/Filter/FilterButton';
import Button from '../../../components/Form/Button';
import {
  setInventoryFilter,
  inventoryFilterSelector,
  initialInventoryFilter,
} from '../../filterSlice';
import ProductInventoryFilterContent from '../../Filter/ProductInventory/';
import type { InventoryFilterKeys } from '../../Filter/ProductInventory/types';
import type { ReduxFilterEntity } from '../../Filter/types';

const ProductInventoryFilter = ({ isFilterActive }: { isFilterActive: boolean }) => {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [tempProductInventoryFilter, setTempProductInventoryFilter] =
    useState<ReduxFilterEntity<InventoryFilterKeys>>(initialInventoryFilter);

  const productInventoryFilter = useSelector(inventoryFilterSelector);
  const dispatch = useDispatch();

  const handleApply = () => {
    dispatch(setInventoryFilter(tempProductInventoryFilter));
    setIsFilterOpen(false);
    setIsDirty(false);
  };

  useEffect(() => {
    setTempProductInventoryFilter(productInventoryFilter);
  }, [productInventoryFilter]);

  return (
    <div className={styles.filterButton}>
      <FilterButton onClick={() => setIsFilterOpen(true)} isFilterActive={isFilterActive} />
      <Drawer
        isOpen={isFilterOpen}
        title={t('filter:INVENTORY.TITLE')}
        onClose={() => setIsFilterOpen(false)}
        buttonGroup={
          <Button fullLength onClick={handleApply} color={'primary'} disabled={!isDirty}>
            {t('common:APPLY')}
          </Button>
        }
        classes={{
          drawerBackdrop: styles.drawerBackdrop,
        }}
      >
        <ProductInventoryFilterContent
          inventoryFilter={productInventoryFilter}
          onChange={(filterKey, filterState) => {
            !isDirty && setIsDirty(true);
            setTempProductInventoryFilter({
              ...tempProductInventoryFilter,
              [filterKey as string]: filterState,
            });
          }}
        />
      </Drawer>
    </div>
  );
};

export default ProductInventoryFilter;
