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
import Layout from '../../../components/Layout';
import PureSearchBarWithBackdrop from '../../PopupFilter/PureSearchWithBackdrop';
import NoSearchResults from '../../../components/Card/NoSearchResults';
import type { AnimalInventory } from '../../../containers/Animals/Inventory/useAnimalInventory';
import { TableV2Column, TableKind } from '../../Table/types';
import type { Dispatch, SetStateAction } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';

export type SearchProps = {
  searchString: string | null | undefined;
  setSearchString: Dispatch<SetStateAction<string[]>>;
  placeHolderText: string;
  searchResultsText: string;
};

const PureAnimalInventory = ({
  filteredInventory,
  animalsColumns,
  zIndexBase,
  backgroundColor,
  isDesktop,
  searchProps,
  onSelectInventory,
  handleSelectAllClick,
  selectedIds,
  totalInventoryCount,
}: {
  filteredInventory: AnimalInventory[];
  animalsColumns: TableV2Column[];
  zIndexBase: number;
  backgroundColor: string;
  isDesktop: boolean;
  searchProps: SearchProps;
  onSelectInventory: (event: ChangeEvent<HTMLInputElement>, row: AnimalInventory) => void;
  handleSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void;
  selectedIds: string[];
  totalInventoryCount: number;
}) => {
  const { searchString, setSearchString, placeHolderText, searchResultsText } = searchProps;
  const hasSearchResults = filteredInventory.length !== 0;

  return (
    <Layout
      classes={{
        container: {
          backgroundColor: backgroundColor,
          borderRadius: isDesktop && '8px',
          border: isDesktop && '1px solid var(--Colors-Primary-Primary-teal-50)',
          marginTop: isDesktop && '16px',
          padding: !isDesktop ? '0px' : '16px',
        },
      }}
      hasWhiteBackground
      footer={false}
    >
      <div className={clsx(isDesktop ? styles.searchAndFilterDesktop : styles.searchAndFilter)}>
        <PureSearchBarWithBackdrop
          value={searchString}
          onChange={(e: any) => setSearchString(e.target.value)}
          isSearchActive={!!searchString}
          placeholderText={placeHolderText}
          zIndexBase={zIndexBase}
          isDesktop={isDesktop}
          className={clsx(isDesktop ? styles.searchBarDesktop : styles.searchBar)}
        />
        <div className={clsx(isDesktop ? styles.searchResultsDesktop : styles.searchResults)}>
          {searchResultsText}
        </div>
      </div>
      {hasSearchResults ? (
        <Table
          kind={TableKind.V2}
          alternatingRowColor={true}
          columns={animalsColumns}
          data={filteredInventory}
          shouldFixTableLayout={isDesktop}
          minRows={totalInventoryCount}
          dense={false}
          showHeader={isDesktop}
          onCheck={onSelectInventory}
          handleSelectAllClick={handleSelectAllClick}
          selectedIds={selectedIds}
        />
      ) : (
        <NoSearchResults
          className={clsx(isDesktop ? styles.noSearchResultsDesktop : styles.noSearchResults)}
          searchTerm={searchString}
          includeFiltersInClearSuggestion
        />
      )}
    </Layout>
  );
};

export default PureAnimalInventory;
