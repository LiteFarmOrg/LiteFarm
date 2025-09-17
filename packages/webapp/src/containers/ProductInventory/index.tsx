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
import { useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import styles from '../Animals/Inventory/styles.module.scss';
import productTableStyles from './styles.module.scss';
import useSearchFilter from '../../containers/hooks/useSearchFilter';
import { isAdminSelector } from '../userFarmSlice';
import PureProductInventory from '../../components/ProductInventory';
import { getProducts } from '../Task/saga';
import { productsSelector } from '../productSlice';
import { Product } from '../../store/api/types';
import { SearchProps } from '../../components/Animals/Inventory';
import FixedHeaderContainer, { ContainerKind } from '../../components/Animals/FixedHeaderContainer';
import Cell from '../../components/Table/Cell';
import { CellKind } from '../../components/Table/types';

export type TableProduct = Product & { id: Product['product_id'] };

enum TASK_TYPES {
  CLEANING = 'cleaning_task',
  FIELD_WORK = 'field_work_task',
  PEST_CONTROL = 'pest_control_task',
  SOIL_AMENDMENT = 'soil_amendment_task',
  HARVEST = 'harvest_tasks',
  IRRIGATION = 'irrigation_task',
}

const taskTypeToTypeLabelMap: Partial<Record<TASK_TYPES, string>> = {
  [TASK_TYPES.SOIL_AMENDMENT]: 'INVENTORY.SOIL_AMENDMENT',
};

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

  const inventory = productInventory
    .filter((product) => product.type === TASK_TYPES.SOIL_AMENDMENT)
    .map((product) => ({
      ...product,
      id: product.product_id,
    }));

  // Complete placeholder for actual filter state
  const [filtersActive, setFiltersActive] = useState(true);

  const totalInventoryCount = inventory.length;

  const dispatch = useDispatch();

  const makeProductsSearchableString = (product: TableProduct) => {
    return [product.name, product.supplier].filter(Boolean).join(' ');
  };

  const [searchAndFilteredInventory, searchString, setSearchString] = useSearchFilter(
    inventory,
    makeProductsSearchableString,
  ) as [TableProduct[], SearchProps['searchString'], SearchProps['setSearchString']];

  const searchProps: SearchProps = {
    searchString,
    setSearchString,
    // These animal translations are appropriate for this view as well
    placeHolderText: t('ANIMAL.SEARCH_INVENTORY_PLACEHOLDER'),
    searchResultsText: t('ANIMAL.SHOWING_RESULTS_WITH_COUNT', {
      count: searchAndFilteredInventory?.length,
    }),
  };

  const productColumns = useMemo(
    () => [
      {
        id: 'name',
        label: t('INVENTORY.PRODUCT_NAME').toLocaleUpperCase(),
        format: (d: TableProduct) => (
          <Cell
            kind={CellKind.ICON_TEXT}
            text={d.name}
            subtext={isDesktop ? null : (d.supplier ?? '')}
            className={
              isDesktop ? productTableStyles.nameCellDesktop : productTableStyles.nameCellMobile
            }
            subtextClassName={productTableStyles.supplierMobile}
          />
        ),
      },
      {
        id: isDesktop ? 'supplier' : null,
        label: t('ADD_PRODUCT.SUPPLIER_LABEL'),
        align: 'center',
        format: (d: TableProduct) => <Cell kind={CellKind.PLAIN} text={d.supplier ?? ''} />,
      },
      {
        id: 'type',
        label: t('INVENTORY.PRODUCT_TYPE'),
        align: 'right',
        format: (d: TableProduct) => (
          <Cell
            kind={CellKind.PLAIN}
            /* @ts-expect-error todo: fix */
            text={t(taskTypeToTypeLabelMap[d.type])}
            className={isDesktop ? '' : productTableStyles.typeMobile}
          />
        ),
      },
    ],
    [t, isDesktop],
  );

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
        productColumns={productColumns}
      />
    </FixedHeaderContainer>
  );
}
