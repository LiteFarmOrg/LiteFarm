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
import { AnimalOrBatch } from '../types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';

function AnimalInventory() {
  const { data: animals = [] } = useGetAnimalsQuery();
  const { data: animalBatches = [] } = useGetAnimalBatchesQuery();
  const { data: animalGroups } = useGetAnimalGroupsQuery();

  const { t } = useTranslation(['translation']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getColumns = () => [
    {
      id: 'Animal Identification',
      label: t('ANIMAL.ANIMAL_IDENTIFICATION'),
      format: (d: AnimalOrBatch) => d.name || d.identifier,
      columnProps: {
        style: { padding: `0 ${isMobile ? 8 : 12}px` },
      },
    },
    {
      id: 'type',
      label: t('ANIMAL.ANIMAL_TYPE'),
      format: (d: AnimalOrBatch) => d.default_type_id || d.custom_type_id,
      columnProps: {
        style: { padding: `0 ${isMobile ? 8 : 12}px` },
      },
    },
    {
      id: 'Breed',
      label: t('ANIMAL.ANIMAL_BREED'),
      format: (d: AnimalOrBatch) => d.default_breed_id || d.custom_breed_id,
      columnProps: {
        style: { padding: `0 ${isMobile ? 8 : 12}px` },
      },
    },
    {
      id: 'Groups',
      label: t('ANIMAL.ANIMAL_GROUPS'),
      format: (d: AnimalOrBatch) => d.farm_id,
      columnProps: {
        style: { padding: `0 ${isMobile ? 8 : 12}px` },
      },
      disabled: true,
    },
    {
      id: 'Locations',
      label: t('ANIMAL.ANIMAL_LOCATIONS'),
      format: (d: AnimalOrBatch) => d.farm_id,
      columnProps: {
        style: { padding: `0 ${isMobile ? 8 : 12}px` },
      },
      align: 'right',
    },
  ];

  const tableData = [...animals, ...animalBatches];

  return <PureAnimalInventory tableData={tableData} getColumns={getColumns} theme={theme} />;
}

export default AnimalInventory;
