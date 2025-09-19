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
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import styles from '../Animals/Inventory/styles.module.scss';
import useSearchFilter from '../../containers/hooks/useSearchFilter';
import { isAdminSelector } from '../userFarmSlice';
import PureProductInventory from '../../components/ProductInventory';
import { getProducts } from '../Task/saga';
import { productsSelector } from '../productSlice';
import { TASK_TYPES } from '../Task/constants';
import { Product } from '../../store/api/types';
import { SearchProps } from '../../components/Animals/Inventory';
import FixedHeaderContainer, { ContainerKind } from '../../components/Animals/FixedHeaderContainer';

export default function ProductInventory() {
  const history = useHistory();
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const isAdmin = useSelector(isAdminSelector);

  const zIndexBase = theme.zIndex.drawer;

  useEffect(() => {
    dispatch(getProducts());
  }, []);

  const productInventory = useSelector(productsSelector);

  const inventory: Product[] = productInventory.filter(
    (product) => product.type === TASK_TYPES.SOIL_AMENDMENT,
  );

  // Complete placeholder for actual filter state
  const [filtersActive, setFiltersActive] = useState(true);

  const totalInventoryCount = inventory.length;

  const dispatch = useDispatch();

  const makeProductsSearchableString = (product: Product) => {
    return [product.name, product.supplier].filter(Boolean).join(' ');
  };

  const [searchAndFilteredInventory, searchString, setSearchString] = useSearchFilter(
    inventory,
    makeProductsSearchableString,
  ) as [Product[], SearchProps['searchString'], SearchProps['setSearchString']];

  const searchProps: SearchProps = {
    searchString,
    setSearchString,
    // These animal translations are appropriate for this view as well
    placeHolderText: t('ANIMAL.SEARCH_INVENTORY_PLACEHOLDER'),
    searchResultsText: t('ANIMAL.SHOWING_RESULTS_WITH_COUNT', {
      count: searchAndFilteredInventory?.length,
    }),
  };

  return (
    <FixedHeaderContainer
      header={null}
      classes={{ paper: styles.paper, divWrapper: styles.divWrapper }}
      kind={ContainerKind.PAPER}
    >
      <PureProductInventory
        filteredInventory={searchAndFilteredInventory}
        searchProps={searchProps}
        zIndexBase={zIndexBase}
        isDesktop={isDesktop}
        totalInventoryCount={totalInventoryCount}
        isFilterActive={filtersActive}
        clearFilters={() => setFiltersActive(false)}
        history={history}
        showSearchBarAndFilter={true}
        showActionFloaterButton={isAdmin}
      />
    </FixedHeaderContainer>
  );
}
