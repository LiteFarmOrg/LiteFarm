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
import Table from '../../../components/Table';
import Layout from '../../../components/Layout';
import PureCollapsibleSearch from '../../../components/PopupFilter/PureCollapsibleSearch';

import NoSearchResults from '../../../components/Card/NoSearchResults';
import type { AnimalInventory } from '../../../containers/Animals/Inventory/useAnimalInventory';
import { TableV2Column, TableKind } from '../../Table/types';
import type { Dispatch, SetStateAction, MutableRefObject } from 'react';
import type { DefaultTheme } from '@mui/styles';
import styles from './styles.module.scss';
import clsx from 'clsx';

export type SearchProps = {
  searchString: string | null | undefined;
  setSearchString: Dispatch<SetStateAction<string[]>>;
  searchContainerRef: MutableRefObject<null>;
  placeHolderText: string;
  searchResultsText: string;
};

const PureAnimalInventory = ({
  filteredInventory,
  animalsColumns,
  theme,
  isMobile,
  isDesktop,
  searchProps,
}: {
  filteredInventory: AnimalInventory[];
  animalsColumns: TableV2Column[];
  theme: DefaultTheme;
  isMobile: boolean;
  isDesktop: boolean;
  searchProps: SearchProps;
}) => {
  const { searchString, setSearchString, searchContainerRef, placeHolderText, searchResultsText } =
    searchProps;
  const hasSearchResults = filteredInventory.length !== 0;

  return (
    <Layout
      classes={{
        container: {
          backgroundColor: theme.palette.background.paper,
          borderRadius: !isMobile && '8px',
          border: !isMobile && '1px solid var(--Colors-Primary-Primary-teal-50)',
          marginTop: !isMobile && '16px',
          padding: isMobile ? '0px' : '16px',
        },
      }}
      hasWhiteBackground
      footer={false}
    >
      <div
        className={clsx(
          isMobile ? styles.searchAndFilterContainer : styles.searchAndFilterContainerDesktop,
        )}
      >
        <div
          className={clsx(isMobile ? styles.searchBar : styles.searchBarDesktop)}
          ref={searchContainerRef}
        >
          <PureCollapsibleSearch
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            isSearchActive={!!searchString}
            containerRef={searchContainerRef}
            placeholderText={placeHolderText}
            collapse={false}
            isDesktop={isDesktop}
          />
        </div>
        <div className={clsx(isMobile ? styles.resultsCount : styles.resultsCountDesktop)}>
          {searchResultsText}
        </div>
      </div>
      {hasSearchResults ? (
        <Table
          kind={TableKind.V2}
          alternatingRowColor={true}
          columns={animalsColumns}
          data={filteredInventory}
          shouldFixTableLayout={!isMobile}
          minRows={filteredInventory.length}
          dense={false}
          showHeader={!isMobile}
        />
      ) : (
        <NoSearchResults
          className={styles.noResultsCard}
          searchTerm={searchString}
          includeFiltersInClearSuggestion
        />
      )}
    </Layout>
  );
};

export default PureAnimalInventory;
