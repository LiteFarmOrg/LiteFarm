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

import React from 'react';
import PureAnimalInventory from '../../../components/Animals/Inventory';
import {
  useGetAnimalsQuery,
  useGetAnimalBatchesQuery,
  useGetAnimalGroupsQuery,
} from '../../../store/api/apiSlice';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import { AnimalData, AnimalBatchData, AnimalOrBatchData } from '../types';
import Cell from '../../../components/Table/Cell';
import { CellType } from '../../../components/Table/types';
import { ReactComponent as AnimalIcon } from '../../../assets/images/nav/animals.svg';

function AnimalInventory() {
  const { data: animals = [] } = useGetAnimalsQuery();
  const { data: animalBatches = [] } = useGetAnimalBatchesQuery();
  const { data: animalGroups } = useGetAnimalGroupsQuery();

  const { t } = useTranslation(['translation']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getColumns = () => [
    {
      id: 'name',
      label: t('ANIMAL.ANIMAL_IDENTIFICATION'),
      format: (d: AnimalOrBatchData) => (
        <Cell
          kind={CellType.ICON_TEXT}
          text={d.name || d.identifier || null}
          icon={AnimalIcon}
          subtext={
            isMobile
              ? `${d.default_type_id || d.custom_type_id} / ${
                  d.default_breed_id || d.custom_breed_id
                }`
              : null
          }
        />
      ),
    },
    {
      id: isMobile ? null : 'default_type_id',
      label: t('ANIMAL.ANIMAL_TYPE'),
      format: (d: AnimalOrBatchData) => <Cell text={d.default_type_id || d.custom_type_id} />,
    },
    {
      id: isMobile ? null : 'default_breed_id',
      label: t('ANIMAL.ANIMAL_BREED'),
      format: (d: AnimalOrBatchData) => <Cell text={d.default_breed_id || d.custom_breed_id} />,
    },
    {
      id: isMobile ? null : 'groups',
      label: t('ANIMAL.ANIMAL_GROUPS'),
      format: (d: AnimalOrBatchData) => (
        <Cell
          kind={CellType.HOVER_PILL_OVERFLOW}
          items={d.groups && d.groups.map((group) => group.name)}
        />
      ),
      sortable: false,
    },
    {
      id: 'farm_id',
      label: t('ANIMAL.ANIMAL_LOCATIONS'),
      format: (d: AnimalOrBatchData) => <Cell text={d.farm_id} />,
    },
    {
      id: 'Visit Record',
      label: '',
      format: (d: AnimalOrBatchData) => <Cell kind={CellType.RIGHT_CHEVRON_LINK} path="/" />,
      columnProps: {
        style: { width: '40px', padding: `0 ${isMobile ? 8 : 12}px` },
      },
      sortable: false,
    },
  ];

  let animalData: AnimalData[] = animals.map((animal) => {
    return { ...animal, groups: [] };
  });
  let batchData: AnimalBatchData[] = animalBatches.map((batch) => {
    return { ...batch, groups: [] };
  });

  // TODO: Load Group Relationship Data instead of this combined group data
  animalData.forEach((animal) => {
    //animal.groups = [];
    animalGroups?.forEach((group) => {
      const inGroup = group.related_animal_ids.includes(animal.id);
      if (inGroup) {
        animal.groups.push(group);
      }
    });
  });
  batchData.forEach((batch) => {
    batch.groups = [];
    animalGroups?.forEach((group) => {
      const inGroup = group.related_batch_ids.includes(batch.id);
      if (inGroup) {
        batch.groups?.push(group);
      }
    });
  });

  const tableData = [...animalData, ...batchData];

  return <PureAnimalInventory tableData={tableData} getColumns={getColumns} theme={theme} />;
}

export default AnimalInventory;
