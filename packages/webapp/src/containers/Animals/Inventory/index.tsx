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
import { useMemo, useRef } from 'react';
import PureAnimalInventory from '../../../components/Animals/Inventory';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import Cell from '../../../components/Table/Cell';
import { Alignment, CellKind } from '../../../components/Table/types';
import useAnimalInventory from './useAnimalInventory';
import type { AnimalInventory } from './useAnimalInventory';
import ActionMenu from '../../../components/ActionMenu';
import styles from './styles.module.scss';

// TODO: LF-4087
const iconActions = [
  { label: 'a', icon: null, onClick: () => ({}) },
  { label: 'b', icon: null, onClick: () => ({}) },
  { label: 'c', icon: null, onClick: () => ({}) },
  { label: 'd', icon: null, onClick: () => ({}) },
];

interface AnimalInventoryProps {
  isCompactSideMenu: boolean;
}

function AnimalInventory({ isCompactSideMenu }: AnimalInventoryProps) {
  const { t } = useTranslation(['translation', 'animal']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const { inventory, isLoading } = useAnimalInventory();

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
            subtext={isMobile ? `${d.type} / ${d.breed}` : null}
            highlightedText={d.count > 1 ? d.count : null}
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
          <Cell kind={CellKind.HOVER_PILL_OVERFLOW} items={d.groups} />
        ),
        sortable: false,
      },
      {
        id: 'path',
        label: '',
        format: (d: AnimalInventory) => <Cell kind={CellKind.RIGHT_CHEVRON_LINK} path={d.path} />,
        columnProps: {
          style: { padding: `0 ${isMobile ? 8 : 12}px` },
        },
        sortable: false,
        width: '40px',
      },
    ],
    [t, isMobile],
  );

  return (
    !isLoading && (
      <>
        <PureAnimalInventory
          tableData={inventory}
          animalsColumns={animalsColumns}
          theme={theme}
          isMobile={isMobile}
          isDesktop={isDesktop}
        />
        <ActionMenu
          headerLeftText={''}
          textActions={[]}
          iconActions={iconActions}
          classes={{
            root: isCompactSideMenu ? styles.withCompactSideMenu : styles.withExpandedSideMenu,
          }}
        />
      </>
    )
  );
}

export default AnimalInventory;
