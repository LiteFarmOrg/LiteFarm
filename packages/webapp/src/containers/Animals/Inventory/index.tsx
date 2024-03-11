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
import PureAnimalInventory from '../../../components/Animals/Inventory';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import Cell from '../../../components/Table/Cell';
import { CellKind } from '../../../components/Table/types';
import useAnimalInventory from './useAnimalInventory';
import type { AnimalInventory } from './useAnimalInventory';
import ActionMenu from '../../../components/ActionMenu';
import KPI from './KPI';
import { ReactComponent as AddAnimalIcon } from '../../../assets/images/animals/add-animal.svg';
import { ReactComponent as TaskCreationIcon } from '../../../assets/images/create-task.svg';
import { ReactComponent as CloneIcon } from '../../../assets/images/clone.svg';
import { ReactComponent as RemoveAnimalIcon } from '../../../assets/images/animals/remove-animal.svg';
import styles from './styles.module.scss';
import AnimalsFilter from '../AnimalsFilter';
import { useFilteredInventory } from './useFilteredInventory';

interface AnimalInventoryProps {
  isCompactSideMenu: boolean;
}

function AnimalInventory({ isCompactSideMenu }: AnimalInventoryProps) {
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);

  const { t } = useTranslation(['translation', 'animal', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { inventory, isLoading } = useAnimalInventory();

  const filteredInventory = useFilteredInventory(inventory);

  const onTypeClick = useCallback(
    (typeId: string) => {
      setSelectedTypeIds((prevSelectedTypeIds) => {
        const isSelected = prevSelectedTypeIds.includes(typeId);
        const newSelectedTypeIds = isSelected
          ? prevSelectedTypeIds.filter((id) => typeId !== id)
          : [...prevSelectedTypeIds, typeId];

        return newSelectedTypeIds;
      });
    },
    [setSelectedTypeIds],
  );

  const animalsColumns = useMemo(
    () => [
      {
        id: 'identification',
        label: t('ANIMAL.ANIMAL_IDENTIFICATION').toLocaleUpperCase(),
        format: (d: AnimalInventory) => (
          <Cell
            kind={CellKind.ICON_TEXT}
            text={d.identification}
            icon={d.icon}
            iconBorder={!d.batch}
            subtext={isMobile ? `${d.type} / ${d.breed}` : null}
            highlightedText={d.batch ? d.count : null}
          />
        ),
      },
      {
        id: isMobile ? null : 'type',
        label: t('ANIMAL.ANIMAL_TYPE').toLocaleUpperCase(),
        format: (d: AnimalInventory) => <Cell kind={CellKind.PLAIN} text={d.type} />,
      },
      {
        id: isMobile ? null : 'breed',
        label: t('ANIMAL.ANIMAL_BREED').toLocaleUpperCase(),
        format: (d: AnimalInventory) => <Cell kind={CellKind.PLAIN} text={d.breed} />,
      },
      {
        id: isMobile ? null : 'groups',
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
        id: 'path',
        label: '',
        format: (d: AnimalInventory) => <Cell kind={CellKind.RIGHT_CHEVRON_LINK} path={d.path} />,
        columnProps: {
          style: { width: '40px', padding: `0 ${isMobile ? 8 : 12}px` },
        },
        sortable: false,
      },
    ],
    [t, isMobile],
  );

  // TODO: Adjust once LF-4093 & 4094 are merged
  const filteredInventory = inventory.slice();

  const onSelectInventory = (e: ChangeEvent<HTMLInputElement>, row: AnimalInventory): void => {
    const selectedInventoryId = row.id;
    let newIds = selectedInventoryIds.slice();
    if (selectedInventoryIds.includes(selectedInventoryId)) {
      newIds = newIds.filter((id) => id !== selectedInventoryId);
    } else {
      newIds.push(selectedInventoryId);
    }
    setSelectedInventoryIds(newIds);
  };

  const selectAllVisibleInventoryItems = () => {
    const visibleRowsIds = filteredInventory.map(({ id }) => id);
    // Previously selected hidden rows + visible rows
    const newIdsSet = new Set([...selectedInventoryIds, ...visibleRowsIds]);
    setSelectedInventoryIds([...newIdsSet]);
  };

  const clearAllSelectedVisibleInventoryItems = () => {
    // Remove ids of visible rows from selectedInventoryIds and keep ids of hidden rows
    const selectedIdsSet = new Set(selectedInventoryIds);
    filteredInventory.forEach(({ id }) => selectedIdsSet.delete(id));
    setSelectedInventoryIds([...selectedIdsSet]);
  };

  const clearSelectedInventoryItems = () => {
    setSelectedInventoryIds([]);
  };

  const handleSelectAllClick = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      selectAllVisibleInventoryItems();
    } else {
      clearAllSelectedVisibleInventoryItems();
    }
  };

  const iconActions = [
    { label: t(`common:ADD_TO_GROUP`), icon: <AddAnimalIcon />, onClick: () => ({}) },
    { label: t(`common:CREATE_A_TASK`), icon: <TaskCreationIcon />, onClick: () => ({}) },
    { label: t(`common:CLONE`), icon: <CloneIcon />, onClick: () => ({}) },
    { label: t(`ANIMAL.REMOVE_ANIMAL`), icon: <RemoveAnimalIcon />, onClick: () => ({}) },
  ];

  const textActions = [
    {
      label: t('common:SELECT_ALL_COUNT', { count: filteredInventory.length }),
      onClick: selectAllVisibleInventoryItems,
    },
    {
      label: t('common:CLEAR_SELECTION'),
      onClick: clearSelectedInventoryItems,
    },
  ];

  return (
    <>
      <KPI
        isCompactSideMenu={isCompactSideMenu}
        onTypeClick={onTypeClick}
        selectedTypeIds={selectedTypeIds}
      />
      {!isLoading && (
        <div className={styles.mainContent}>
          <AnimalsFilter />
          <PureAnimalInventory
            tableData={filteredInventory}
            animalsColumns={animalsColumns}
            theme={theme}
            isMobile={isMobile}
            onSelectInventory={onSelectInventory}
            handleSelectAllClick={handleSelectAllClick}
            selectedIds={selectedInventoryIds}
          />
          {selectedInventoryIds.length ? (
            <ActionMenu
              headerLeftText={t('common:SELECTED_COUNT', { count: selectedInventoryIds.length })}
              textActions={textActions}
              iconActions={iconActions}
              classes={{
                root: isCompactSideMenu ? styles.withCompactSideMenu : styles.withExpandedSideMenu,
              }}
            />
          ) : null}
        </div>
      )}
    </>
  );
}

export default AnimalInventory;
