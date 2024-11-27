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
import { useCallback, useMemo, useState, ChangeEvent, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PureAnimalInventory, {
  PureAnimalInventoryProps,
  SearchProps,
} from '../../../components/Animals/Inventory';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { Paper, useMediaQuery } from '@mui/material';
import { History } from 'history';
import Cell from '../../../components/Table/Cell';
import { CellKind } from '../../../components/Table/types';
import useAnimalInventory from './useAnimalInventory';
import type { AnimalInventory as AnimalInventoryType } from './useAnimalInventory';
import ActionMenu, { iconAction } from '../../../components/ActionMenu';
import FixedHeaderContainer, {
  ContainerKind,
} from '../../../components/Animals/FixedHeaderContainer';
import KPI from './KPI';
import useSearchFilter from '../../../containers/hooks/useSearchFilter';
import styles from './styles.module.scss';
import { useFilteredInventory } from './useFilteredInventory';
import RemoveAnimalsModal from '../../../components/Animals/RemoveAnimalsModal';
import useAnimalOrBatchRemoval from './useAnimalOrBatchRemoval';
import {
  isFilterCurrentlyActiveSelector,
  resetAnimalsFilter,
} from '../../../containers/filterSlice';
import { isAdminSelector } from '../../userFarmSlice';
import { useAnimalsFilterReduxState } from './KPI/useAnimalsFilterReduxState';
import FloatingContainer from '../../../components/FloatingContainer';
import ExpandableItem from '../../../components/Expandable/ExpandableItem';
import useExpandable from '../../../components/Expandable/useExpandableItem';
import clsx from 'clsx';
import AnimalsBetaSpotlight from './AnimalsBetaSpotlight';
import { sumObjectValues } from '../../../util';

const HEIGHTS = {
  filterAndSearch: 64,
  containerPadding: 32,
};
const usedHeight = sumObjectValues(HEIGHTS);

export enum View {
  DEFAULT = 'default',
  TASK = 'task',
  TASK_SUMMARY = 'task_summary',
}
interface AnimalInventoryProps {
  preSelectedIds?: string[];
  onSelect?: (newIds: string[]) => void;
  view?: View;
  isCompactSideMenu: boolean;
  setFeedbackSurveyOpen: () => void;
  containerHeight: number;
  history: History;
  showOnlySelected?: boolean;
  showLinks?: boolean;
}

const CoreAnimalInventory = ({
  filteredInventory,
  animalsColumns,
  searchProps,
  zIndexBase,
  isDesktop,
  onSelectInventory,
  handleSelectAllClick,
  selectedIds,
  totalInventoryCount,
  isFilterActive,
  clearFilters,
  isLoading,
  history,
  onRowClick,
  tableSpacerRowHeight,
  showInventorySelection,
  showSearchBarAndFilter,
  alternatingRowColor,
  showTableHeader,
  showActionFloaterButton,
  containerHeight,
  siblings,
}: PureAnimalInventoryProps & { siblings?: ReactNode }) => {
  return (
    <>
      <PureAnimalInventory
        filteredInventory={filteredInventory}
        animalsColumns={animalsColumns}
        searchProps={searchProps}
        zIndexBase={zIndexBase}
        isDesktop={isDesktop}
        onSelectInventory={onSelectInventory}
        handleSelectAllClick={handleSelectAllClick}
        selectedIds={selectedIds}
        totalInventoryCount={totalInventoryCount}
        isFilterActive={isFilterActive}
        clearFilters={clearFilters}
        isLoading={isLoading}
        history={history}
        onRowClick={onRowClick}
        tableMaxHeight={!isDesktop || !containerHeight ? undefined : containerHeight - usedHeight}
        tableSpacerRowHeight={tableSpacerRowHeight}
        showInventorySelection={showInventorySelection}
        showSearchBarAndFilter={showSearchBarAndFilter}
        alternatingRowColor={alternatingRowColor}
        showTableHeader={showTableHeader}
        showActionFloaterButton={showActionFloaterButton}
      />
      {siblings}
    </>
  );
};

const SelectedAnimalSummaryInventory = ({
  expandableTitle,
  animalCountString,
  ...coreProps
}: {
  expandableTitle: ReactNode;
  animalCountString: string | undefined;
} & PureAnimalInventoryProps) => {
  const { expandedIds, toggleExpanded } = useExpandable({ isSingleExpandable: true });
  const isExpanded = expandedIds.includes(1);
  return (
    <div className={clsx(styles.section)}>
      <ExpandableItem
        isExpanded={isExpanded}
        onClick={() => toggleExpanded(1)}
        mainContent={expandableTitle}
        pillBody={animalCountString}
        expandedContent={
          <div className={styles.expandedContentWrapper}>
            <CoreAnimalInventory {...coreProps} />
          </div>
        }
        iconClickOnly={false}
        classes={{
          mainContentWrapper: styles.mainContentWrapper,
          mainContentWithIcon: styles.mainContentWithIcon,
          icon: styles.blueColor,
          alwaysVisibleContent: styles.alwaysVisibleContent,
        }}
        itemKey={1}
        leftCollapseIcon
      />
    </div>
  );
};

const TaskAnimalInventory = ({ ...coreProps }: PureAnimalInventoryProps) => {
  return (
    <FixedHeaderContainer
      header={null}
      classes={{
        paper: styles.paper,
        divWrapper: styles.divWrapper,
        wrapper: styles.taskViewMaxHeight,
      }}
      kind={ContainerKind.PAPER}
    >
      <CoreAnimalInventory {...coreProps} />
    </FixedHeaderContainer>
  );
};

const MainAnimalInventory = ({
  setFeedbackSurveyOpen,
  history,
  onTypeClick,
  selectedTypeIds,
  actionMenuAndRemoveModal,
  ...coreProps
}: {
  setFeedbackSurveyOpen: () => void;
  history: History;
  onTypeClick: (typeId: string) => void;
  selectedTypeIds: string[];
  actionMenuAndRemoveModal: ReactNode;
} & PureAnimalInventoryProps) => {
  return (
    <AnimalsBetaSpotlight setFeedbackSurveyOpen={setFeedbackSurveyOpen}>
      <FixedHeaderContainer
        header={
          <KPI history={history} onTypeClick={onTypeClick} selectedTypeIds={selectedTypeIds} />
        }
        classes={{ paper: styles.paper, divWrapper: styles.divWrapper }}
        kind={ContainerKind.PAPER}
      >
        <CoreAnimalInventory history={history} siblings={actionMenuAndRemoveModal} {...coreProps} />
      </FixedHeaderContainer>
    </AnimalsBetaSpotlight>
  );
};

const getVisibleSelectedIds = (visibleRowData: AnimalInventoryType[], selectedIds: string[]) => {
  if (!visibleRowData.length || !selectedIds.length) {
    return [];
  }

  const visibleRowIdsSet = new Set(visibleRowData.map(({ id }) => id));
  return selectedIds.filter((id) => visibleRowIdsSet.has(id));
};

function AnimalInventory({
  preSelectedIds = [],
  onSelect,
  view = View.DEFAULT,
  isCompactSideMenu,
  setFeedbackSurveyOpen,
  history,
  showOnlySelected = false,
  showLinks = true,
}: AnimalInventoryProps) {
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>(preSelectedIds);

  const { selectedTypeIds, updateSelectedTypeIds } = useAnimalsFilterReduxState();

  const { t } = useTranslation(['translation', 'animal', 'common', 'message']);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const isAdmin = useSelector(isAdminSelector);

  const zIndexBase = theme.zIndex.drawer;

  const { inventory, isLoading } = useAnimalInventory();
  const totalInventoryCount = inventory.length;
  const animalCount = preSelectedIds.reduce((acc, cur) => {
    return acc + (inventory.find((animalOrBatch) => animalOrBatch.id === cur)?.count || 0);
  }, 0);
  const animalCountString = t('ANIMAL.ANIMAL_COUNT', { count: animalCount });

  const filteredInventory = useFilteredInventory(inventory, showOnlySelected, selectedInventoryIds);

  const isFilterActive = useSelector(isFilterCurrentlyActiveSelector('animals'));
  const dispatch = useDispatch();
  const clearFilters = () => dispatch(resetAnimalsFilter());

  const onTypeClick = useCallback(
    (typeId: string) => {
      updateSelectedTypeIds(typeId);
    },
    [updateSelectedTypeIds],
  );

  const { onConfirmRemoveAnimals, removalModalOpen, setRemovalModalOpen } = useAnimalOrBatchRemoval(
    selectedInventoryIds,
    setSelectedInventoryIds,
  );

  const animalsColumns = useMemo(
    () => [
      {
        id: 'identification',
        label: t('ANIMAL.ANIMAL_IDENTIFICATION').toLocaleUpperCase(),
        format: (d: AnimalInventoryType) => (
          <Cell
            kind={CellKind.ICON_TEXT}
            text={d.identification}
            iconName={d.iconName}
            iconBorder={!d.batch}
            subtext={isDesktop ? null : `${d.type} / ${d.breed}`}
            highlightedText={d.batch ? d.count : null}
          />
        ),
      },
      {
        id: isDesktop ? 'type' : null,
        label: t('ANIMAL.ANIMAL_TYPE').toLocaleUpperCase(),
        format: (d: AnimalInventoryType) => <Cell kind={CellKind.PLAIN} text={d.type} />,
      },
      {
        id: isDesktop ? 'breed' : null,
        label: t('ANIMAL.ANIMAL_BREED').toLocaleUpperCase(),
        format: (d: AnimalInventoryType) => <Cell kind={CellKind.PLAIN} text={d.breed} />,
      },
      {
        id: isDesktop ? 'groups' : null,
        label: t('ANIMAL.ANIMAL_GROUPS').toLocaleUpperCase(),
        format: (d: AnimalInventoryType) => (
          <Cell
            kind={CellKind.HOVER_PILL_OVERFLOW}
            items={d.groups}
            noneText={t('NONE', { ns: 'common' })}
          />
        ),
        sortable: false,
      },
      {
        id: showLinks ? 'path' : null,
        label: '',
        format: (d: AnimalInventoryType) => (
          <Cell kind={CellKind.RIGHT_CHEVRON_LINK} path={d.path} />
        ),
        columnProps: {
          style: { width: '40px', padding: `0 ${isDesktop ? 12 : 8}px` },
        },
        sortable: false,
      },
    ],
    [t, isDesktop, showLinks],
  );

  const makeAnimalsSearchableString = (animal: AnimalInventoryType) => {
    return [animal.identification, animal.type, animal.breed, ...animal.groups, animal.count]
      .filter(Boolean)
      .join(' ');
  };

  const [searchAndFilteredInventory, searchString, setSearchString] = useSearchFilter(
    filteredInventory,
    makeAnimalsSearchableString,
  ) as [AnimalInventoryType[], SearchProps['searchString'], SearchProps['setSearchString']];

  const searchProps: SearchProps = {
    searchString,
    setSearchString,
    placeHolderText: t('ANIMAL.SEARCH_INVENTORY_PLACEHOLDER'),
    searchResultsText: t('ANIMAL.SHOWING_RESULTS_WITH_COUNT', {
      count: searchAndFilteredInventory?.length,
    }),
  };

  const onSelectInventory = (e: ChangeEvent<HTMLInputElement>, row: AnimalInventoryType): void => {
    const selectedInventoryId = row.id;
    let newIds = selectedInventoryIds.slice();
    if (selectedInventoryIds.includes(selectedInventoryId)) {
      newIds = newIds.filter((id) => id !== selectedInventoryId);
    } else {
      newIds.push(selectedInventoryId);
    }
    setSelectedInventoryIds(newIds);
    onSelect?.(newIds);
  };

  const selectAllVisibleInventoryItems = () => {
    const visibleRowsIds = searchAndFilteredInventory.map(({ id }) => id);
    // Previously selected hidden rows + visible rows
    const newIdsSet = new Set([...selectedInventoryIds, ...visibleRowsIds]);
    setSelectedInventoryIds([...newIdsSet]);
    onSelect?.([...newIdsSet]);
  };

  const clearAllSelectedVisibleInventoryItems = () => {
    // Remove ids of visible rows from selectedInventoryIds and keep ids of hidden rows
    const selectedIdsSet = new Set(selectedInventoryIds);
    searchAndFilteredInventory.forEach(({ id }) => selectedIdsSet.delete(id));
    setSelectedInventoryIds([...selectedIdsSet]);
    onSelect?.([...selectedIdsSet]);
  };

  const clearSelectedInventoryItems = () => {
    setSelectedInventoryIds([]);
    onSelect?.([]);
  };

  const handleSelectAllClick = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      selectAllVisibleInventoryItems();
    } else {
      clearAllSelectedVisibleInventoryItems();
    }
  };

  const iconActions: iconAction[] = [
    { label: t(`common:ADD_TO_GROUP`), iconName: 'ADD_ANIMAL', onClick: () => ({}) },
    { label: t(`common:CREATE_A_TASK`), iconName: 'TASK_CREATION', onClick: () => ({}) },
    { label: t(`common:CLONE`), iconName: 'CLONE', onClick: () => ({}) },
    {
      label: t(`ANIMAL.REMOVE_ANIMAL`),
      iconName: 'REMOVE_ANIMAL',
      onClick: () => setRemovalModalOpen(true),
    },
  ];

  const textActions = [
    {
      label: t('common:SELECT_ALL'),
      onClick: selectAllVisibleInventoryItems,
    },
    {
      label: t('common:CLEAR_SELECTION'),
      onClick: clearSelectedInventoryItems,
    },
  ];

  const expandableTitle = (
    <div className={styles.blueColor}>{t('TASK.ANIMAL_MOVEMENT_EXPANDING_SUMMARY_TITLE')}</div>
  );

  const actionMenuAndRemoveModal = (
    <>
      {isAdmin && selectedInventoryIds.length ? (
        <FloatingContainer isCompactSideMenu={isCompactSideMenu}>
          <ActionMenu
            headerLeftText={t('common:SELECTED_COUNT', { count: selectedInventoryIds.length })}
            textActions={textActions}
            iconActions={iconActions}
          />
        </FloatingContainer>
      ) : null}
      <RemoveAnimalsModal
        isOpen={removalModalOpen}
        onClose={() => setRemovalModalOpen(false)}
        onConfirm={onConfirmRemoveAnimals}
        showSuccessMessage={false}
      />
    </>
  );

  if (view == View.TASK) {
    return (
      <TaskAnimalInventory
        //core props
        filteredInventory={searchAndFilteredInventory}
        animalsColumns={animalsColumns}
        searchProps={searchProps}
        zIndexBase={zIndexBase}
        isDesktop={isDesktop}
        onSelectInventory={onSelectInventory}
        handleSelectAllClick={handleSelectAllClick}
        selectedIds={getVisibleSelectedIds(searchAndFilteredInventory, selectedInventoryIds)}
        totalInventoryCount={totalInventoryCount}
        isFilterActive={isFilterActive}
        clearFilters={clearFilters}
        isLoading={isLoading}
        history={history}
        onRowClick={(event: ChangeEvent<HTMLInputElement>, row: AnimalInventoryType) => {
          onSelectInventory(event, row);
        }}
        tableSpacerRowHeight={0}
        showInventorySelection={isAdmin}
        showSearchBarAndFilter={true}
        alternatingRowColor={true}
        showTableHeader={isDesktop}
        showActionFloaterButton={false}
      />
    );
  }
  if (view == View.TASK_SUMMARY) {
    return (
      <SelectedAnimalSummaryInventory
        expandableTitle={expandableTitle}
        animalCountString={animalCountString}
        //core props
        filteredInventory={searchAndFilteredInventory}
        animalsColumns={animalsColumns}
        searchProps={searchProps}
        zIndexBase={zIndexBase}
        isDesktop={isDesktop}
        onSelectInventory={onSelectInventory}
        handleSelectAllClick={handleSelectAllClick}
        selectedIds={getVisibleSelectedIds(searchAndFilteredInventory, selectedInventoryIds)}
        totalInventoryCount={totalInventoryCount}
        isFilterActive={isFilterActive}
        clearFilters={clearFilters}
        isLoading={isLoading}
        history={history}
        onRowClick={undefined}
        tableSpacerRowHeight={0}
        showInventorySelection={false}
        showSearchBarAndFilter={false}
        alternatingRowColor={isDesktop ? false : true}
        showTableHeader={false}
        extraRowSpacing={isDesktop}
        showActionFloaterButton={false}
      />
    );
  }

  return (
    <MainAnimalInventory
      setFeedbackSurveyOpen={setFeedbackSurveyOpen}
      onTypeClick={onTypeClick}
      selectedTypeIds={selectedTypeIds}
      actionMenuAndRemoveModal={actionMenuAndRemoveModal}
      //core props
      filteredInventory={searchAndFilteredInventory}
      animalsColumns={animalsColumns}
      searchProps={searchProps}
      zIndexBase={zIndexBase}
      isDesktop={isDesktop}
      onSelectInventory={onSelectInventory}
      handleSelectAllClick={handleSelectAllClick}
      selectedIds={getVisibleSelectedIds(searchAndFilteredInventory, selectedInventoryIds)}
      totalInventoryCount={totalInventoryCount}
      isFilterActive={isFilterActive}
      clearFilters={clearFilters}
      isLoading={isLoading}
      history={history}
      onRowClick={(event: ChangeEvent<HTMLInputElement>, row: AnimalInventoryType) => {
        history.push(row.path);
      }}
      tableSpacerRowHeight={isDesktop ? 96 : 120}
      showInventorySelection={isAdmin}
      showSearchBarAndFilter={true}
      alternatingRowColor={true}
      showTableHeader={isDesktop}
      showActionFloaterButton={isAdmin}
    />
  );
}

export default AnimalInventory;
