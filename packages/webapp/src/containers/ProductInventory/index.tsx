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
import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import animalInventoryStyles from '../Animals/Inventory/styles.module.scss';
import styles from './styles.module.scss';
import { ReactComponent as BookIcon } from '../../assets/images/book-closed.svg';
import useSearchFilter from '../../containers/hooks/useSearchFilter';
import PureProductInventory from '../../components/ProductInventory';
import { getProducts } from '../Task/saga';
import { productsSelector } from '../productSlice';
import { Product, SoilAmendmentProduct } from '../../store/api/types';
import { TASK_TYPES } from '../Task/constants';
import { SearchProps } from '../../components/Animals/Inventory';
import FixedHeaderContainer, { ContainerKind } from '../../components/Animals/FixedHeaderContainer';
import Cell from '../../components/Table/Cell';
import { CellKind } from '../../components/Table/types';
import ProductForm from './ProductForm';
import { isFilterCurrentlyActiveSelector, resetInventoryFilter } from '../filterSlice';
import { useFilteredInventory } from './useFilteredInventory';

export type TableProduct = SoilAmendmentProduct & {
  id: Extract<Product['product_id'], number>;
  isLibraryProduct: boolean;
};

const PRODUCT_TYPE_LABELS: Partial<Record<Product['type'], string>> = {
  [TASK_TYPES.SOIL_AMENDMENT]: 'INVENTORY.SOIL_AMENDMENT',
};

export enum FormMode {
  CREATE = 'create', // new product
  ADD = 'add', // library product
  EDIT = 'edit',
  DUPLICATE = 'duplicate',
  DELETE = 'delete',
  READ_ONLY = 'read_only',
}

export default function ProductInventory() {
  const history = useHistory();
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const zIndexBase = theme.zIndex.drawer;

  useEffect(() => {
    dispatch(getProducts());
  }, []);

  const productInventory = useSelector(productsSelector);

  const inventory = productInventory
    .filter((product) => product.type === TASK_TYPES.SOIL_AMENDMENT)
    /* Table requires each array object to have an "id" key */
    .map((product) => ({
      ...product,
      id: product.product_id,
      /* Placeholder until library products are defined */
      isLibraryProduct: product.product_id % 2 === 0,
    }));

  const filteredInventory = useFilteredInventory(inventory);
  const isFilterActive = useSelector(isFilterCurrentlyActiveSelector('inventory'));
  const clearFilters = () => dispatch(resetInventoryFilter());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [productFormType, setProductFormType] = useState<Product['type'] | null>(null);

  const totalInventoryCount = inventory.length;

  const dispatch = useDispatch();

  const makeProductsSearchableString = (product: TableProduct) => {
    return [product.name, product.supplier].filter(Boolean).join(' ');
  };

  const [searchAndFilteredInventory, searchString, setSearchString] = useSearchFilter(
    filteredInventory,
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

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleRowClick = (_event: ChangeEvent<HTMLInputElement>, row: TableProduct) => {
    // Prevent switching products while an operation is in progress
    if (isFormOpen && formMode !== FormMode.READ_ONLY) {
      return;
    }

    setSelectedIds([row.id]);
    setFormMode(FormMode.READ_ONLY);
    setProductFormType(row.type);
    setIsFormOpen(true);
  };

  const productColumns = useMemo(
    () => [
      {
        id: 'name',
        label: t('INVENTORY.PRODUCT_NAME'),
        format: (d: TableProduct) => {
          return (
            // Custom JSX used over <IconCell /> to reduce style override complexity
            <div className={styles.nameContainer}>
              <div className={styles.nameAndIcon}>
                {d.isLibraryProduct && <BookIcon />}
                <span className={styles.name}>{d.name}</span>
              </div>
              <span className={styles.supplierMobile}>{d.supplier}</span>
            </div>
          );
        },
      },
      {
        id: isDesktop ? 'supplier' : null,
        label: t('ADD_PRODUCT.SUPPLIER_LABEL'),
        align: 'left',
        format: (d: TableProduct) => (
          <Cell kind={CellKind.PLAIN} text={d.supplier ?? ''} className={styles.supplier} />
        ),
      },
      {
        id: 'type',
        label: t('INVENTORY.PRODUCT_TYPE'),
        align: 'right',
        format: (d: TableProduct) => (
          <Cell
            kind={CellKind.PLAIN}
            text={t(PRODUCT_TYPE_LABELS[d.type] ?? '')}
            className={styles.type}
          />
        ),
      },
    ],
    [t, isDesktop],
  );

  const onFormActionButtonClick = (action: Partial<FormMode>) => {
    setFormMode(action);
  };

  const onAddMenuItemClick = (type: Product['type']) => {
    setFormMode(FormMode.CREATE);
    setProductFormType(type);
    setIsFormOpen(true);
  };

  const onCancel = () => {
    setSelectedIds([]);
    setFormMode(null);
    setProductFormType(null);
    setIsFormOpen(false);
  };

  return (
    <FixedHeaderContainer
      header={null}
      classes={{ paper: animalInventoryStyles.paper, divWrapper: animalInventoryStyles.divWrapper }}
      kind={ContainerKind.PAPER}
    >
      <PureProductInventory
        filteredInventory={searchAndFilteredInventory}
        searchProps={searchProps}
        zIndexBase={zIndexBase}
        isDesktop={isDesktop}
        totalInventoryCount={totalInventoryCount}
        isFilterActive={isFilterActive}
        clearFilters={clearFilters}
        history={history}
        showActionFloaterButton={
          /* placeholder. Eventually button should be hid when form is open */
          true
        }
        productColumns={productColumns}
        selectedIds={selectedIds}
        onRowClick={handleRowClick}
        onAddMenuItemClick={onAddMenuItemClick}
      />
      <ProductForm
        isFormOpen={isFormOpen}
        productFormType={productFormType}
        mode={formMode}
        productId={selectedIds?.[0] || undefined}
        onActionButtonClick={onFormActionButtonClick}
        onCancel={onCancel}
      />
    </FixedHeaderContainer>
  );
}
