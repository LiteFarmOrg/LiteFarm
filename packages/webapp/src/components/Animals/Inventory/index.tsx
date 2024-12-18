/*
 *  Copyright 2024 LiteFarm.org
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
import { ChangeEvent } from 'react';
import Table from '../../../components/Table';
import PureSearchBarWithBackdrop from '../../PopupFilter/PureSearchWithBackdrop';
import NoSearchResults from '../../../components/Card/NoSearchResults';
import ClearFiltersButton, {
  ClearFiltersButtonType,
} from '../../../components/Button/ClearFiltersButton';
import type { AnimalInventoryItem } from '../../../containers/Animals/Inventory/useAnimalInventory';
import AnimalsFilter from '../../../containers/Animals/AnimalsFilter';
import FloatingActionButton from '../../Button/FloatingActionButton';
import { TableV2Column, TableKind } from '../../Table/types';
import type { Dispatch, SetStateAction } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { ADD_ANIMALS_URL } from '../../../util/siteMapConstants';
import { animalDescendingComparator } from '../../../util/sort';
import { useNavigate } from 'react-router-dom';

export type SearchProps = {
  searchString: string | null | undefined;
  setSearchString: Dispatch<SetStateAction<string[]>>;
  placeHolderText: string;
  searchResultsText: string;
};

export type PureAnimalInventoryProps = {
  filteredInventory: AnimalInventoryItem[];
  animalsColumns: TableV2Column[];
  zIndexBase: number;
  isDesktop: boolean;
  searchProps: SearchProps;
  onSelectInventory: (event: ChangeEvent<HTMLInputElement>, row: AnimalInventoryItem) => void;
  handleSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void;
  onRowClick?: (event: ChangeEvent<HTMLInputElement>, row: AnimalInventoryItem) => void;
  selectedIds: string[];
  totalInventoryCount: number;
  isFilterActive: boolean;
  clearFilters: () => void;
  isLoading: boolean;
  containerHeight?: number;
  tableMaxHeight?: number;
  tableSpacerRowHeight: number;
  showInventorySelection?: boolean;
  showSearchBarAndFilter?: boolean;
  alternatingRowColor?: boolean;
  showTableHeader: boolean;
  showActionFloaterButton: boolean;
  extraRowSpacing?: boolean;
  hideNoResultsBlock?: boolean;
};

const PureAnimalInventory = ({
  filteredInventory,
  animalsColumns,
  zIndexBase,
  isDesktop,
  searchProps,
  onSelectInventory,
  handleSelectAllClick,
  selectedIds,
  onRowClick,
  totalInventoryCount,
  isFilterActive,
  clearFilters,
  isLoading,
  tableMaxHeight,
  tableSpacerRowHeight,
  showInventorySelection = true,
  showSearchBarAndFilter = true,
  alternatingRowColor = true,
  showTableHeader,
  showActionFloaterButton,
  extraRowSpacing,
  hideNoResultsBlock,
}: PureAnimalInventoryProps) => {
  let navigate = useNavigate();
  const { t } = useTranslation();

  const { searchString, setSearchString, placeHolderText, searchResultsText } = searchProps;
  const hasSearchResults = filteredInventory.length !== 0;

  return isLoading ? null : (
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
            isSearchActive={!!searchString}
            placeholderText={placeHolderText}
            zIndexBase={zIndexBase}
            isDesktop={isDesktop}
            className={clsx(isDesktop ? styles.searchBarDesktop : styles.searchBar)}
          />
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
        </div>
      )}
      <div className={clsx(isDesktop ? '' : styles.tableWrapper, styles.tableWrapperCommon)}>
        {!totalInventoryCount || hasSearchResults || hideNoResultsBlock ? (
          <Table
            kind={TableKind.V2}
            alternatingRowColor={alternatingRowColor}
            columns={animalsColumns}
            data={filteredInventory}
            shouldFixTableLayout={isDesktop}
            minRows={totalInventoryCount}
            dense={false}
            showHeader={showTableHeader}
            onCheck={showInventorySelection ? onSelectInventory : undefined}
            handleSelectAllClick={showInventorySelection ? handleSelectAllClick : undefined}
            selectedIds={showInventorySelection ? selectedIds : undefined}
            stickyHeader={isDesktop}
            maxHeight={tableMaxHeight}
            spacerRowHeight={tableSpacerRowHeight}
            headerClass={styles.headerClass}
            onRowClick={onRowClick}
            extraRowSpacing={extraRowSpacing}
            comparator={animalDescendingComparator}
          />
        ) : (
          <NoSearchResults
            className={clsx(isDesktop ? styles.noSearchResultsDesktop : styles.noSearchResults)}
            searchTerm={searchString}
            includeFiltersInClearSuggestion
          />
        )}
      </div>
      {showActionFloaterButton && (
        <div className={styles.ctaButtonWrapper}>
          <FloatingActionButton
            // @ts-ignore
            type={'add'}
            onClick={() => navigate(ADD_ANIMALS_URL)}
            aria-label={t('ADD_ANIMAL.ADD_ANIMALS')}
          />
        </div>
      )}
    </>
  );
};

export default PureAnimalInventory;
