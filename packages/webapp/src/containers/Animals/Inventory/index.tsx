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
import { useMemo } from 'react';
import PureAnimalInventory from '../../../components/Animals/Inventory';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import Cell from '../../../components/Table/Cell';
import { CellKind } from '../../../components/Table/types';
import { ReactComponent as AnimalIcon } from '../../../assets/images/nav/animals.svg';
import useAnimalInventory from './useAnimalInventory';
import type { AnimalInventory } from './useAnimalInventory';

function AnimalInventory() {
  const { t } = useTranslation(['translation', 'animal']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { inventory, isLoading } = useAnimalInventory();

  const animalsColumns = useMemo(
    () => [
      {
        id: 'name',
        label: t('ANIMAL.ANIMAL_IDENTIFICATION').toLocaleUpperCase(),
        format: (d: AnimalInventory) => (
          <Cell
            kind={CellKind.ICON_TEXT}
            text={d.identification}
            icon={AnimalIcon}
            subtext={isMobile ? `${d.type} / ${d.breed}` : null}
          />
        ),
      },
      {
        id: isMobile ? null : 'default_type_id',
        label: t('ANIMAL.ANIMAL_TYPE').toLocaleUpperCase(),
        format: (d: AnimalInventory) => <Cell kind={CellKind.PLAIN} text={d.type} />,
      },
      {
        id: isMobile ? null : 'default_breed_id',
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
        id: 'Record Link',
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

  return (
    !isLoading && (
      <PureAnimalInventory tableData={inventory} animalsColumns={animalsColumns} theme={theme} />
    )
  );
}

export default AnimalInventory;
