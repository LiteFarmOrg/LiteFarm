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
import { useCallback, useMemo } from 'react';
import PureAnimalInventory from '../../../components/Animals/Inventory';
import {
  useGetAnimalsQuery,
  useGetAnimalBatchesQuery,
  useGetAnimalGroupsQuery,
  useGetCustomAnimalBreedsQuery,
  useGetCustomAnimalTypesQuery,
  useGetDefaultAnimalBreedsQuery,
  useGetDefaultAnimalTypesQuery,
} from '../../../store/api/apiSlice';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import type { Animal, AnimalBatch } from '../../../store/api/types';
import Cell from '../../../components/Table/Cell';
import { CellKind } from '../../../components/Table/types';
import { ReactComponent as AnimalIcon } from '../../../assets/images/nav/animals.svg';

function AnimalInventory() {
  const { data: animals = [] } = useGetAnimalsQuery();
  const { data: animalBatches = [] } = useGetAnimalBatchesQuery();
  const { data: animalGroups = [] } = useGetAnimalGroupsQuery();
  const { data: customAnimalBreeds } = useGetCustomAnimalBreedsQuery();
  const { data: customAnimalTypes } = useGetCustomAnimalTypesQuery();
  const { data: defaultAnimalBreeds } = useGetDefaultAnimalBreedsQuery();
  const { data: defaultAnimalTypes } = useGetDefaultAnimalTypesQuery();

  const { t } = useTranslation(['translation', 'animal']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  type hasId = {
    id: number;
    [key: string]: any;
  };

  const getProperty = (arr: hasId[] | undefined, id: number | null, key: string) => {
    return arr?.find((el) => el.id === id)?.[key] || null;
  };

  const getAnimalTypeLabel = (key: string) => {
    return t(`animal:TYPE.${key}`);
  };

  const getAnimalBreedLabel = (key: string) => {
    return t(`animal:BREED.${key}`);
  };

  interface AnimalOrBatch extends Animal, AnimalBatch {}
  const tableData = [...animals, ...animalBatches];

  const animalsColumns = useMemo(
    () => [
      {
        id: 'name',
        label: t('ANIMAL.ANIMAL_IDENTIFICATION').toLocaleUpperCase(),
        format: (d: AnimalOrBatch) => (
          <Cell
            kind={CellKind.ICON_TEXT}
            text={
              d.name
                ? d.identifier
                  ? `${d.name} | ` + (d.identifier || null)
                  : d.name
                : d.identifier || `${t('ANIMAL.ANIMAL')}#${d.internal_identifier}`
            }
            icon={AnimalIcon}
            subtext={
              isMobile
                ? `${
                    d.default_type_id
                      ? getAnimalTypeLabel(
                          getProperty(defaultAnimalTypes, d.default_type_id, 'key'),
                        )
                      : d.custom_type_id
                      ? getProperty(customAnimalTypes, d.custom_type_id, 'type')
                      : null
                  } / ${
                    d.default_breed_id
                      ? getAnimalBreedLabel(
                          getProperty(defaultAnimalBreeds, d.default_breed_id, 'key'),
                        )
                      : d.custom_breed_id
                      ? getProperty(customAnimalBreeds, d.custom_breed_id, 'breed')
                      : null
                  }`
                : null
            }
          />
        ),
      },
      {
        id: isMobile ? null : 'default_type_id',
        label: t('ANIMAL.ANIMAL_TYPE').toLocaleUpperCase(),
        format: (d: AnimalOrBatch) => (
          <Cell
            kind={CellKind.PLAIN}
            text={
              d.default_type_id
                ? getAnimalTypeLabel(getProperty(defaultAnimalTypes, d.default_type_id, 'key'))
                : d.custom_type_id
                ? getProperty(customAnimalTypes, d.custom_type_id, 'type')
                : null
            }
          />
        ),
      },
      {
        id: isMobile ? null : 'default_breed_id',
        label: t('ANIMAL.ANIMAL_BREED').toLocaleUpperCase(),
        format: (d: AnimalOrBatch) => (
          <Cell
            kind={CellKind.PLAIN}
            text={
              d.default_breed_id
                ? getAnimalBreedLabel(getProperty(defaultAnimalBreeds, d.default_breed_id, 'key'))
                : d.custom_breed_id
                ? getProperty(customAnimalBreeds, d.custom_breed_id, 'breed')
                : null
            }
          />
        ),
      },
      {
        id: isMobile ? null : 'groups',
        label: t('ANIMAL.ANIMAL_GROUPS').toLocaleUpperCase(),
        format: (d: AnimalOrBatch) => (
          <Cell
            kind={CellKind.HOVER_PILL_OVERFLOW}
            items={
              d.group_ids
                ? d.group_ids.map((id) => getProperty(animalGroups, id, 'name'))
                : ['none']
            }
          />
        ),
        sortable: false,
      },
      {
        id: 'Record Link',
        label: '',
        format: (d: AnimalOrBatch) => (
          <Cell kind={CellKind.RIGHT_CHEVRON_LINK} path={`/animal/${d.internal_identifier}`} />
        ),
        columnProps: {
          style: { width: '40px', padding: `0 ${isMobile ? 8 : 12}px` },
        },
        sortable: false,
      },
    ],
    [
      t,
      isMobile,
      animalGroups,
      defaultAnimalBreeds,
      customAnimalBreeds,
      defaultAnimalTypes,
      customAnimalTypes,
    ],
  );

  return (
    <PureAnimalInventory tableData={tableData} animalsColumns={animalsColumns} theme={theme} />
  );
}

export default AnimalInventory;
