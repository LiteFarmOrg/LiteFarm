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
import { forwardRef, ChangeEvent } from 'react';
import { History } from 'history';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import styles from '../Animals/Inventory/styles.module.scss';
import { usedHeight } from '../../containers/Animals/Inventory';
import productInventoryStyles from './styles.module.scss';
import PureSearchBarWithBackdrop from '../PopupFilter/PureSearchWithBackdrop';
import NoSearchResults from '../../components/Card/NoSearchResults';
import ClearFiltersButton, {
  ClearFiltersButtonType,
} from '../../components/Button/ClearFiltersButton';
// Placeholder
import AnimalsFilter from '../../containers/Animals/AnimalsFilter';
// ------
import FloatingButtonMenu from '../Menu/FloatingButtonMenu';
import FloatingMenu from '../Menu/FloatingButtonMenu/FloatingMenu';
import type { SearchProps } from '../Animals/Inventory';
import Table from '../Table';
import { TableKind } from '../Table/types';
import { TableProduct } from '../../containers/ProductInventory';

export type PureProductInventory = {
  filteredInventory: TableProduct[];
  zIndexBase: number;
  isDesktop: boolean;
  containerHeight?: number;
  searchProps: SearchProps;
  totalInventoryCount: number;
  isFilterActive: boolean;
  clearFilters: () => void;
  history: History;
  showActionFloaterButton: boolean;
  productColumns?: any;
  selectedIds: number[];
  onRowClick?: (event: ChangeEvent<HTMLInputElement>, row: TableProduct) => void;
};

const PureProductInventory = ({
  filteredInventory,
  zIndexBase,
  isDesktop,
  containerHeight,
  searchProps,
  totalInventoryCount,
  isFilterActive,
  clearFilters,
  showActionFloaterButton,
  productColumns,
  selectedIds,
  onRowClick,
}: PureProductInventory) => {
  const { searchString, setSearchString, placeHolderText, searchResultsText } = searchProps;
  const hasSearchResults = filteredInventory.length !== 0;

  return (
    <>
      <div
        className={clsx(
          isDesktop ? styles.searchAndFilterDesktop : styles.searchAndFilter,
          styles.searchAndFilterCommon,
        )}
      >
        <PureSearchBarWithBackdrop
          value={searchString}
          onChange={(e: any) => setSearchString(e.target.value)}
          placeholderText={placeHolderText}
          zIndexBase={zIndexBase}
          isDesktop={isDesktop}
          className={clsx(isDesktop ? styles.searchBarDesktop : styles.searchBar)}
        />
        {/* placeholder filter! */}
        <AnimalsFilter isFilterActive={isFilterActive} />
        <div
          className={clsx(
            isDesktop ? styles.searchResultsDesktop : styles.searchResults,
            styles.searchResultsText,
            isFilterActive ? styles.filterActive : '',
          )}
        >
          {searchResultsText}
        </div>
        <div className={isDesktop ? styles.clearButtonWrapperDesktop : ''}>
          <ClearFiltersButton
            type={isDesktop ? ClearFiltersButtonType.TEXT : ClearFiltersButtonType.ICON}
            isFilterActive={isFilterActive}
            onClick={clearFilters}
          />
        </div>
        {showActionFloaterButton && <FloatingButtonMenu type={'add'} Menu={AddProductMenuItems} />}
      </div>
      <div
        className={clsx(isDesktop ? '' : styles.tableWrapper, productInventoryStyles.tableWrapper)}
      >
        {!totalInventoryCount || hasSearchResults ? (
          <Table
            kind={TableKind.V2}
            columns={productColumns}
            data={filteredInventory}
            shouldFixTableLayout={isDesktop}
            minRows={totalInventoryCount}
            dense={true}
            showHeader={isDesktop}
            selectedIds={selectedIds}
            stickyHeader={isDesktop}
            headerClass={styles.headerClass}
            rowClass={productInventoryStyles.row}
            onRowClick={onRowClick}
            defaultOrderBy={'name'}
            maxHeight={!isDesktop || !containerHeight ? undefined : containerHeight - usedHeight}
          />
        ) : (
          <NoSearchResults
            className={clsx(isDesktop ? styles.noSearchResultsDesktop : styles.noSearchResults)}
            searchTerm={searchString || ''}
            includeFiltersInClearSuggestion
          />
        )}
      </div>
    </>
  );
};

export default PureProductInventory;

const AddProductMenuItems = forwardRef((props: any, ref) => {
  const { t } = useTranslation();

  const handleAddSoilAmendmentProduct = () => {};

  return (
    <FloatingMenu
      ref={ref}
      options={[
        {
          label: t('INVENTORY.SOIL_AMENDMENT'),
          onClick: handleAddSoilAmendmentProduct,
        },
      ]}
      {...props}
    />
  );
});
