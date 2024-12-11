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
import { useCallback, useMemo, useState, ChangeEvent, ReactNode, useEffect } from 'react';
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
import type { AnimalInventoryItem } from './useAnimalInventory';
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
import Icon from '../../../components/Icons';
import { onAddTask } from '../../Task/onAddTask';

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

type CommonPureAnimalInventoryProps = Pick<
  PureAnimalInventoryProps,
  | 'filteredInventory'
  | 'animalsColumns'
  | 'zIndexBase'
  | 'isDesktop'
  | 'searchProps'
  | 'onSelectInventory'
  | 'handleSelectAllClick'
  | 'selectedIds'
  | 'totalInventoryCount'
  | 'isFilterActive'
  | 'clearFilters'
  | 'isLoading'
  | 'history'
>;
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
  isCompleteView?: boolean;
  hideNoResultsBlock?: boolean;
  showRemoved?: boolean;
}

const BaseAnimalInventory = ({
  isDesktop,
  // containerHeight provided by FixedHeaderContainer if exists
  containerHeight,
  children,
  ...props
}: PureAnimalInventoryProps & { children?: ReactNode }) => {
  return (
    <>
      <PureAnimalInventory
        isDesktop={isDesktop}
        tableMaxHeight={!isDesktop || !containerHeight ? undefined : containerHeight - usedHeight}
        {...props}
      />
      {children}
    </>
  );
};

const SelectedAnimalsSummaryInventory = ({
  expandableTitle,
  animalCountString,
  ...commonProps
}: {
  expandableTitle: ReactNode;
  animalCountString: string | undefined;
} & CommonPureAnimalInventoryProps) => {
  // @ts-ignore
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
            <BaseAnimalInventory
              onRowClick={undefined}
              tableSpacerRowHeight={0}
              showInventorySelection={false}
              showSearchBarAndFilter={false}
              alternatingRowColor={commonProps.isDesktop ? false : true}
              showTableHeader={false}
              extraRowSpacing={commonProps.isDesktop}
              showActionFloaterButton={false}
              {...commonProps}
            />
          </div>
        }
        iconClickOnly={false}
        classes={{
          icon: styles.blueColor,
        }}
        itemKey={1}
        leftCollapseIcon
      />
    </div>
  );
};

const TaskAnimalInventory = ({
  isCompleteView,
  ...commonProps
}: { isCompleteView?: boolean } & CommonPureAnimalInventoryProps) => {
  return (
    <FixedHeaderContainer
      header={null}
      classes={{
        paper: styles.paper,
        divWrapper: styles.divWrapper,
        wrapper: isCompleteView ? styles.completeViewMaxHeight : styles.taskViewMaxHeight,
      }}
      kind={ContainerKind.PAPER}
    >
      <BaseAnimalInventory
        onRowClick={(event: ChangeEvent<HTMLInputElement>, row: AnimalInventoryItem) => {
          commonProps.onSelectInventory(event, row);
        }}
        tableSpacerRowHeight={0}
        showSearchBarAndFilter={true}
        alternatingRowColor={true}
        showTableHeader={commonProps.isDesktop}
        showActionFloaterButton={false}
        {...commonProps}
      />
    </FixedHeaderContainer>
  );
};

const MainAnimalInventory = ({
  setFeedbackSurveyOpen,
  history,
  onTypeClick,
  selectedTypeIds,
  actionMenuAndRemoveModal,
  isAdmin,
  ...commonProps
}: {
  setFeedbackSurveyOpen: () => void;
  history: History;
  onTypeClick: (typeId: string) => void;
  selectedTypeIds: string[];
  actionMenuAndRemoveModal: ReactNode;
  isAdmin: boolean;
} & CommonPureAnimalInventoryProps) => {
  return (
    <AnimalsBetaSpotlight setFeedbackSurveyOpen={setFeedbackSurveyOpen}>
      <FixedHeaderContainer
        header={
          <KPI history={history} onTypeClick={onTypeClick} selectedTypeIds={selectedTypeIds} />
        }
        classes={{ paper: styles.paper, divWrapper: styles.divWrapper }}
        kind={ContainerKind.PAPER}
      >
        <BaseAnimalInventory
          history={history}
          {...commonProps}
          onRowClick={(event: ChangeEvent<HTMLInputElement>, row: AnimalInventoryItem) => {
            history.push(row.path);
          }}
          tableSpacerRowHeight={commonProps.isDesktop ? 96 : 120}
          showSearchBarAndFilter={true}
          alternatingRowColor={true}
          showTableHeader={commonProps.isDesktop}
          showActionFloaterButton={isAdmin}
        >
          {actionMenuAndRemoveModal}
        </BaseAnimalInventory>
      </FixedHeaderContainer>
    </AnimalsBetaSpotlight>
  );
};

const getVisibleSelectedIds = (visibleRowData: AnimalInventoryItem[], selectedIds: string[]) => {
  if (!visibleRowData.length || !selectedIds.length) {
    return [];
  }

  const visibleRowIdsSet = new Set(visibleRowData.map(({ id }) => id));
  return selectedIds.filter((id) => visibleRowIdsSet.has(id));
};

export default function AnimalInventory({
  preSelectedIds = [],
  onSelect,
  view = View.DEFAULT,
  isCompactSideMenu,
  setFeedbackSurveyOpen,
  history,
  showOnlySelected = false,
  showLinks = true,
  isCompleteView,
  hideNoResultsBlock,
  showRemoved = false,
}: AnimalInventoryProps) {
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>(preSelectedIds);

  useEffect(() => {
    if (isCompleteView) {
      setSelectedInventoryIds(preSelectedIds);
    }
  }, [preSelectedIds, isCompleteView]);

  const { selectedTypeIds, updateSelectedTypeIds } = useAnimalsFilterReduxState();

  const { t } = useTranslation(['translation', 'animal', 'common', 'message']);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const isAdmin = useSelector(isAdminSelector);

  const zIndexBase = theme.zIndex.drawer;

  const { inventory, isLoading } = useAnimalInventory(showRemoved);
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

  const { onConfirmRemoveAnimals, removalModalOpen, setRemovalModalOpen, hasFinalizedTasks } =
    useAnimalOrBatchRemoval(selectedInventoryIds, inventory, setSelectedInventoryIds);

  const animalsColumns = useMemo(
    () => [
      {
        id: 'identification',
        label: t('ANIMAL.ANIMAL_IDENTIFICATION').toLocaleUpperCase(),
        format: (d: AnimalInventoryItem) => (
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
        format: (d: AnimalInventoryItem) => <Cell kind={CellKind.PLAIN} text={d.type} />,
      },
      {
        id: isDesktop ? 'breed' : null,
        label: t('ANIMAL.ANIMAL_BREED').toLocaleUpperCase(),
        format: (d: AnimalInventoryItem) => <Cell kind={CellKind.PLAIN} text={d.breed} />,
      },
      {
        id: isDesktop ? 'location' : null,
        label: t('ANIMAL.ANIMAL_LOCATIONS').toLocaleUpperCase(),
        format: (d: AnimalInventoryItem) => (
          <div className={clsx(styles.location, !d.location && styles.unknown)}>
            {d.location ? (
              <>
                <Icon iconName="LOCATION" className={styles.locationIcon} />
                <span className={styles.locationText}>{d.location}</span>
              </>
            ) : (
              t('common:UNKNOWN')
            )}
          </div>
        ),
      },
      {
        id: showLinks ? 'path' : null,
        label: '',
        format: (d: AnimalInventoryItem) => (
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

  const makeAnimalsSearchableString = (animal: AnimalInventoryItem) => {
    return [animal.identification, animal.type, animal.breed, animal.count, animal.location]
      .filter(Boolean)
      .join(' ');
  };

  const [searchAndFilteredInventory, searchString, setSearchString] = useSearchFilter(
    filteredInventory,
    makeAnimalsSearchableString,
  ) as [AnimalInventoryItem[], SearchProps['searchString'], SearchProps['setSearchString']];

  const searchProps: SearchProps = {
    searchString,
    setSearchString,
    placeHolderText: t('ANIMAL.SEARCH_INVENTORY_PLACEHOLDER'),
    searchResultsText: t('ANIMAL.SHOWING_RESULTS_WITH_COUNT', {
      count: searchAndFilteredInventory?.length,
    }),
  };

  const onSelectInventory = (e: ChangeEvent<HTMLInputElement>, row: AnimalInventoryItem): void => {
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
    {
      label: t(`common:CREATE_A_TASK`),
      iconName: 'TASK_CREATION',
      onClick: () => onAddTask(dispatch, history, { animal_ids: selectedInventoryIds })(),
      visible: true,
    },
    {
      label: t(`ANIMAL.REMOVE_ANIMAL`),
      iconName: 'REMOVE_ANIMAL',
      onClick: () => setRemovalModalOpen(true),
      visible: isAdmin,
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
      {selectedInventoryIds.length ? (
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
    </>
  );

  const commonProps = {
    filteredInventory: searchAndFilteredInventory,
    animalsColumns: animalsColumns,
    searchProps: searchProps,
    zIndexBase: zIndexBase,
    isDesktop: isDesktop,
    onSelectInventory: onSelectInventory,
    handleSelectAllClick: handleSelectAllClick,
    selectedIds: getVisibleSelectedIds(searchAndFilteredInventory, selectedInventoryIds),
    totalInventoryCount: totalInventoryCount,
    isFilterActive: isFilterActive,
    clearFilters: clearFilters,
    isLoading: isLoading,
    history: history,
    hideNoResultsBlock,
  };

  if (view == View.TASK) {
    return <TaskAnimalInventory isCompleteView={isCompleteView} {...commonProps} />;
  }
  if (view == View.TASK_SUMMARY) {
    return (
      <SelectedAnimalsSummaryInventory
        expandableTitle={expandableTitle}
        animalCountString={animalCountString}
        {...commonProps}
      />
    );
  }

  return (
    <MainAnimalInventory
      setFeedbackSurveyOpen={setFeedbackSurveyOpen}
      onTypeClick={onTypeClick}
      selectedTypeIds={selectedTypeIds}
      actionMenuAndRemoveModal={actionMenuAndRemoveModal}
      isAdmin={isAdmin}
      {...commonProps}
    />
  );
}
