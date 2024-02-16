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
import Table from '../../../components/Table/Table';
import Layout from '../../../components/Layout';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';

function AnimalInventory() {
  const { t } = useTranslation(['translation']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const animal_batches = [
    {
      id: 1,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 1,
      custom_breed_id: null,
      name: 'Invoice 1',
      notes: null,
      count: 20,
      sex_detail: [
        {
          id: 1,
          animal_batch_id: 1,
          sex_id: 2,
          count: 10,
        },
        {
          id: 2,
          animal_batch_id: 1,
          sex_id: 1,
          count: 10,
        },
      ],
    },
    {
      id: 3,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 1,
      custom_breed_id: null,
      name: 'Batch 1',
      notes: null,
      count: 2,
      sex_detail: [],
    },
    {
      id: 4,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 2,
      custom_breed_id: null,
      name: 'Batch 2',
      notes: null,
      count: 5,
      sex_detail: [],
    },
    {
      id: 5,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 3,
      custom_breed_id: null,
      name: 'Batch 3',
      notes: null,
      count: 5,
      sex_detail: [],
    },
    {
      id: 6,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 1,
      custom_breed_id: null,
      name: 'Batch 4',
      notes: null,
      count: 2,
      sex_detail: [],
    },
    {
      id: 7,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 2,
      custom_breed_id: null,
      name: 'Batch 5',
      notes: null,
      count: 5,
      sex_detail: [
        {
          id: 4,
          animal_batch_id: 7,
          sex_id: 1,
          count: 3,
        },
        {
          id: 5,
          animal_batch_id: 7,
          sex_id: 2,
          count: 2,
        },
      ],
    },
    {
      id: 8,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 3,
      custom_breed_id: null,
      name: 'Batch 6',
      notes: null,
      count: 5,
      sex_detail: [],
    },
    {
      id: 9,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 1,
      custom_breed_id: null,
      name: 'Batch 6',
      notes: null,
      count: 1,
      sex_detail: [],
    },
    {
      id: 10,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 2,
      custom_breed_id: null,
      name: 'Batch 7',
      notes: null,
      count: 5,
      sex_detail: [
        {
          id: 6,
          animal_batch_id: 10,
          sex_id: 1,
          count: 3,
        },
        {
          id: 7,
          animal_batch_id: 10,
          sex_id: 2,
          count: 2,
        },
      ],
    },
    {
      id: 11,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 3,
      custom_breed_id: null,
      name: 'Batch 8',
      notes: null,
      count: 5,
      sex_detail: [],
    },
    {
      id: 14,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 1,
      custom_breed_id: null,
      name: 'Batch 9',
      notes: null,
      count: 2,
      sex_detail: [],
    },
    {
      id: 15,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 2,
      custom_breed_id: null,
      name: 'Batch 10',
      notes: null,
      count: 5,
      sex_detail: [
        {
          id: 8,
          animal_batch_id: 15,
          sex_id: 1,
          count: 3,
        },
        {
          id: 9,
          animal_batch_id: 15,
          sex_id: 2,
          count: 2,
        },
      ],
    },
    {
      id: 16,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 3,
      custom_breed_id: null,
      name: 'Batch 11',
      notes: null,
      count: 5,
      sex_detail: [],
    },
    {
      id: 17,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 1,
      custom_breed_id: null,
      name: 'Batch 9',
      notes: null,
      count: 2,
      sex_detail: [],
    },
    {
      id: 18,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 2,
      custom_breed_id: null,
      name: 'Batch 10',
      notes: null,
      count: 5,
      sex_detail: [],
    },
    {
      id: 19,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 3,
      custom_breed_id: null,
      name: 'Batch 11',
      notes: null,
      count: 5,
      sex_detail: [],
    },
    {
      id: 20,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 1,
      custom_breed_id: null,
      name: 'Batch 13',
      notes: null,
      count: 2,
      sex_detail: [],
    },
    {
      id: 21,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 2,
      custom_breed_id: null,
      name: 'Batch 15',
      notes: null,
      count: 5,
      sex_detail: [
        {
          id: 10,
          animal_batch_id: 21,
          sex_id: 1,
          count: 3,
        },
        {
          id: 11,
          animal_batch_id: 21,
          sex_id: 2,
          count: 2,
        },
      ],
    },
    {
      id: 22,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 3,
      custom_breed_id: null,
      name: 'Batch 14',
      notes: null,
      count: 5,
      sex_detail: [],
    },
    {
      id: 23,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 1,
      custom_breed_id: null,
      name: 'Batch 16',
      notes: null,
      count: 2,
      sex_detail: [],
    },
    {
      id: 24,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 2,
      custom_breed_id: null,
      name: 'Batch 17',
      notes: null,
      count: 5,
      sex_detail: [],
    },
    {
      id: 25,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 3,
      custom_breed_id: null,
      name: 'Batch 18',
      notes: null,
      count: 5,
      sex_detail: [],
    },
    {
      id: 26,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 1,
      custom_breed_id: null,
      name: 'Batch 19',
      notes: null,
      count: 2,
      sex_detail: [],
    },
    {
      id: 27,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 2,
      custom_breed_id: null,
      name: 'Batch 20',
      notes: null,
      count: 5,
      sex_detail: [
        {
          id: 12,
          animal_batch_id: 27,
          sex_id: 1,
          count: 3,
        },
        {
          id: 13,
          animal_batch_id: 27,
          sex_id: 2,
          count: 2,
        },
      ],
    },
    {
      id: 28,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 3,
      custom_breed_id: null,
      name: 'Batch 21',
      notes: null,
      count: 5,
      sex_detail: [],
    },
    {
      id: 37,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: null,
      custom_type_id: 1,
      default_breed_id: 1,
      custom_breed_id: null,
      name: 'name',
      notes: null,
      count: 2,
      sex_detail: [],
    },
    {
      id: 39,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 1,
      custom_breed_id: null,
      name: 'name 2',
      notes: null,
      count: 4,
      sex_detail: [
        {
          id: 14,
          animal_batch_id: 39,
          sex_id: 2,
          count: 2,
        },
        {
          id: 15,
          animal_batch_id: 39,
          sex_id: 1,
          count: 2,
        },
      ],
    },
    {
      id: 40,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 1,
      custom_breed_id: null,
      name: 'test error',
      notes: null,
      count: 4,
      sex_detail: [
        {
          id: 16,
          animal_batch_id: 40,
          sex_id: 1,
          count: 2,
        },
        {
          id: 17,
          animal_batch_id: 40,
          sex_id: 2,
          count: 2,
        },
      ],
    },
  ];

  const animals = [
    {
      id: 1,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 1,
      custom_breed_id: null,
      sex_id: null,
      name: 'Goat 1',
      birth_date: null,
      identifier: null,
      identifier_color_id: null,
      identifier_placement_id: null,
      origin_id: null,
      dam: null,
      sire: null,
      brought_in_date: null,
      weaning_date: null,
      notes: null,
    },
    {
      id: 2,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 1,
      custom_breed_id: null,
      sex_id: null,
      name: 'Goat 2',
      birth_date: null,
      identifier: null,
      identifier_color_id: null,
      identifier_placement_id: null,
      origin_id: null,
      dam: null,
      sire: null,
      brought_in_date: null,
      weaning_date: null,
      notes: null,
    },
    {
      id: 3,
      farm_id: 'f65a5094-bbc3-11ee-ba48-ce0b8496eaa9',
      default_type_id: 1,
      custom_type_id: null,
      default_breed_id: 1,
      custom_breed_id: null,
      sex_id: null,
      name: 'Goat 3',
      birth_date: null,
      identifier: null,
      identifier_color_id: null,
      identifier_placement_id: null,
      origin_id: null,
      dam: null,
      sire: null,
      brought_in_date: null,
      weaning_date: null,
      notes: null,
    },
  ];

  const getColumns = () => [
    {
      id: 'Animal Identification',
      label: t('ANIMAL.ANIMAL_IDENTIFICATION'),
      format: (d) => d.name || d.identifier,
      columnProps: {
        style: { padding: `0 ${isMobile ? 8 : 12}px` },
      },
    },
    {
      id: 'type',
      label: t('ANIMAL.ANIMAL_TYPE'),
      format: (d) => d.default_type_id || d.custom_type_id,
      columnProps: {
        style: { padding: `0 ${isMobile ? 8 : 12}px` },
      },
    },
    {
      id: 'Breed',
      label: t('ANIMAL.ANIMAL_BREED'),
      format: (d) => d.default_breed_id || d.custom_breed_id,
      columnProps: {
        style: { padding: `0 ${isMobile ? 8 : 12}px` },
      },
    },
    {
      id: 'Groups',
      label: t('ANIMAL.ANIMAL_GROUPS'),
      format: (d) => d.farm_id,
      columnProps: {
        style: { padding: `0 ${isMobile ? 8 : 12}px` },
      },
    },
    {
      id: 'Locations',
      label: t('ANIMAL.ANIMAL_LOCATIONS'),
      format: (d) => d.farm_id,
      columnProps: {
        style: { padding: `0 ${isMobile ? 8 : 12}px` },
      },
    },
  ];

  const tableData = [...animals, ...animal_batches];

  return (
    <Layout
      classes={{
        container: { backgroundColor: theme.palette.background.paper },
      }}
      hasWhiteBackground
    >
      <Table
        kind="v2"
        columns={getColumns()}
        data={tableData}
        shouldFixTableLayout={true}
        minRows={tableData.length}
      />
    </Layout>
  );
}

export default AnimalInventory;
