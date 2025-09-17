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
import { History } from 'history';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import styles from '../Animals/Inventory/styles.module.scss';
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
import { Product } from '../../store/api/types';
import type { SearchProps } from '../Animals/Inventory';

export type PureProductInventory = {
  filteredInventory: Product[];
  zIndexBase: number;
  isDesktop: boolean;
  searchProps: SearchProps;
  totalInventoryCount: number;
  isFilterActive: boolean;
  clearFilters: () => void;
  history: History;
  showSearchBarAndFilter?: boolean;
  showActionFloaterButton: boolean;
  hideNoResultsBlock?: boolean;
};

const PureProductInventory = ({
  filteredInventory,
  zIndexBase,
  isDesktop,
  searchProps,
  totalInventoryCount,
  isFilterActive,
  clearFilters,
  showSearchBarAndFilter = true,
  showActionFloaterButton,
  hideNoResultsBlock,
}: PureProductInventory) => {
  const { searchString, setSearchString, placeHolderText, searchResultsText } = searchProps;
  const hasSearchResults = filteredInventory.length !== 0;

  return (
    <>
      {showSearchBarAndFilter && (
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
          {showActionFloaterButton && (
            <FloatingButtonMenu type={'add'} Menu={AddProductMenuItems} />
          )}
        </div>
      )}
      <div
        className={clsx(
          isDesktop ? '' : styles.tableWrapper,
          productInventoryStyles.placeholderTableWrapperCommon,
        )}
      >
        {/* placeholder inventory */}
        <pre className={productInventoryStyles.placeholderTable}>
          {JSON.stringify(filteredInventory, null, 2)}
        </pre>
        {!totalInventoryCount || hasSearchResults || hideNoResultsBlock ? null : (
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

const AddProductMenuItems = (props: any) => {
  const { t } = useTranslation();

  const handleAddSoilAmendmentProduct = () => {};

  return (
    <FloatingMenu
      options={[
        {
          label: t('INVENTORY.SOIL_AMENDMENT'),
          onClick: handleAddSoilAmendmentProduct,
        },
      ]}
      {...props}
    />
  );
};
