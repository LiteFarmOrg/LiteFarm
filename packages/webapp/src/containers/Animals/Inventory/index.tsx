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
import { useCallback, useMemo, useState, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PureAnimalInventory, { SearchProps } from '../../../components/Animals/Inventory';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import { History } from 'history';
import Cell from '../../../components/Table/Cell';
import { CellKind } from '../../../components/Table/types';
import useAnimalInventory from './useAnimalInventory';
import type { AnimalInventory } from './useAnimalInventory';
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
import AnimalsBetaSpotlight from './AnimalsBetaSpotlight';

export enum View {
  DEFAULT = 'default',
  TASK = 'task',
}
interface AnimalInventoryProps {
  preSelectedIds?: string[];
  onSelect?: (newIds: string[]) => void;
  view?: View;
  isCompactSideMenu: boolean;
  setFeedbackSurveyOpen: () => void;
  containerHeight: number;
  history: History;
}

const getVisibleSelectedIds = (visibleRowData: AnimalInventory[], selectedIds: string[]) => {
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
}: AnimalInventoryProps) {
  const isTaskView = view === View.TASK;

  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>(preSelectedIds);

  const { selectedTypeIds, updateSelectedTypeIds } = useAnimalsFilterReduxState();

  const { t } = useTranslation(['translation', 'animal', 'common', 'message']);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const isAdmin = useSelector(isAdminSelector);

  const zIndexBase = theme.zIndex.drawer;

  const { inventory, isLoading } = useAnimalInventory();

  const filteredInventory = useFilteredInventory(inventory);

  const isFilterActive = useSelector(isFilterCurrentlyActiveSelector('animals'));
  const dispatch = useDispatch();
  const clearFilters = () => dispatch(resetAnimalsFilter());

  const onTypeClick = useCallback(
    (typeId: string) => {
      updateSelectedTypeIds(typeId);
    },
    [updateSelectedTypeIds],
  );

  const { onConfirmRemoveAnimals, removalModalOpen, setRemovalModalOpen, hasFinalizedTasks } =
    useAnimalOrBatchRemoval(selectedInventoryIds, setSelectedInventoryIds, inventory);

  const animalsColumns = useMemo(
    () => [
      {
        id: 'identification',
        label: t('ANIMAL.ANIMAL_IDENTIFICATION').toLocaleUpperCase(),
        format: (d: AnimalInventory) => (
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
        format: (d: AnimalInventory) => <Cell kind={CellKind.PLAIN} text={d.type} />,
      },
      {
        id: isDesktop ? 'breed' : null,
        label: t('ANIMAL.ANIMAL_BREED').toLocaleUpperCase(),
        format: (d: AnimalInventory) => <Cell kind={CellKind.PLAIN} text={d.breed} />,
      },
      {
        id: isDesktop ? 'groups' : null,
        label: t('ANIMAL.ANIMAL_GROUPS').toLocaleUpperCase(),
        format: (d: AnimalInventory) => (
          <Cell
            kind={CellKind.HOVER_PILL_OVERFLOW}
            items={d.groups}
            noneText={t('NONE', { ns: 'common' })}
          />
        ),
        sortable: false,
      },
      {
        id: !isTaskView ? 'path' : null,
        label: '',
        format: (d: AnimalInventory) => <Cell kind={CellKind.RIGHT_CHEVRON_LINK} path={d.path} />,
        columnProps: {
          style: { width: '40px', padding: `0 ${isDesktop ? 12 : 8}px` },
        },
        sortable: false,
      },
    ],
    [t, isDesktop],
  );

  const makeAnimalsSearchableString = (animal: AnimalInventory) => {
    return [animal.identification, animal.type, animal.breed, ...animal.groups, animal.count]
      .filter(Boolean)
      .join(' ');
  };

  const [searchAndFilteredInventory, searchString, setSearchString] = useSearchFilter(
    filteredInventory,
    makeAnimalsSearchableString,
  ) as [AnimalInventory[], SearchProps['searchString'], SearchProps['setSearchString']];

  const searchProps: SearchProps = {
    searchString,
    setSearchString,
    placeHolderText: t('ANIMAL.SEARCH_INVENTORY_PLACEHOLDER'),
    searchResultsText: t('ANIMAL.SHOWING_RESULTS_WITH_COUNT', {
      count: searchAndFilteredInventory?.length,
    }),
  };

  const onSelectInventory = (e: ChangeEvent<HTMLInputElement>, row: AnimalInventory): void => {
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

  const onRowClick = (event: ChangeEvent<HTMLInputElement>, row: AnimalInventory) => {
    !isTaskView ? history.push(row.path) : onSelectInventory(event, row);
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

  return (
    <AnimalsBetaSpotlight setFeedbackSurveyOpen={setFeedbackSurveyOpen}>
      <FixedHeaderContainer
        header={
          !isTaskView ? (
            <KPI history={history} onTypeClick={onTypeClick} selectedTypeIds={selectedTypeIds} />
          ) : null
        }
        classes={{ paper: styles.paper }}
        kind={ContainerKind.PAPER}
        wrapperClassName={isTaskView ? styles.taskViewHeight : undefined}
      >
        <PureAnimalInventory
          filteredInventory={searchAndFilteredInventory}
          animalsColumns={animalsColumns}
          searchProps={searchProps}
          zIndexBase={zIndexBase}
          isDesktop={isDesktop}
          onSelectInventory={onSelectInventory}
          handleSelectAllClick={handleSelectAllClick}
          selectedIds={getVisibleSelectedIds(searchAndFilteredInventory, selectedInventoryIds)}
          totalInventoryCount={inventory.length}
          isFilterActive={isFilterActive}
          clearFilters={clearFilters}
          isLoading={isLoading}
          isAdmin={isAdmin}
          history={history}
          onRowClick={onRowClick}
          view={view}
        />
        {isAdmin && selectedInventoryIds.length && !isTaskView ? (
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
          hideDeleteOption={hasFinalizedTasks}
        />
      </FixedHeaderContainer>
    </AnimalsBetaSpotlight>
  );
}

export default AnimalInventory;
