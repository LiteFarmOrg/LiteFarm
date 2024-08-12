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

import {
  useGetDefaultAnimalTypesQuery,
  useGetCustomAnimalTypesQuery,
  useGetDefaultAnimalBreedsQuery,
  useGetCustomAnimalBreedsQuery,
  useGetAnimalSexesQuery,
} from '../../../store/api/apiSlice';
import { useTranslation } from 'react-i18next';
import { generateUniqueAnimalId } from '../../../util/animal';
import { ANIMAL_ID_PREFIX } from '../types';

type OptionType =
  | 'type'
  | 'breed'
  | 'sex'
  | 'sexDetails'
  | 'use'
  | 'tagType'
  | 'tagColor'
  | 'tagPlacement'
  | 'organicStatus'
  | 'origin';

export const useAnimalOptions = (...optionTypes: OptionType[]) => {
  const { t } = useTranslation(['animal', 'common', 'translation']);

  const { data: defaultTypes = [] } = useGetDefaultAnimalTypesQuery();
  const { data: customTypes = [] } = useGetCustomAnimalTypesQuery();
  const { data: defaultBreeds = [] } = useGetDefaultAnimalBreedsQuery();
  const { data: customBreeds = [] } = useGetCustomAnimalBreedsQuery();
  const { data: sexes = [] } = useGetAnimalSexesQuery();

  const options: any = {};

  if (optionTypes.includes('type')) {
    options.typeOptions = [
      ...defaultTypes.map((defaultType) => ({
        label: t(`animal:TYPE.${defaultType.key}`),
        value: generateUniqueAnimalId(defaultType),
      })),
      ...customTypes.map((customType) => ({
        label: customType.type,
        value: generateUniqueAnimalId(customType),
      })),
    ];
  }

  if (optionTypes.includes('breed')) {
    options.breedOptions = [
      ...defaultBreeds.map((defaultBreed) => ({
        label: t(`animal:BREED.${defaultBreed.key}`),
        value: generateUniqueAnimalId(defaultBreed),
        type: generateUniqueAnimalId(ANIMAL_ID_PREFIX.DEFAULT, defaultBreed.default_type_id),
      })),
      ...customBreeds.map((customBreed) => ({
        label: customBreed.breed,
        value: generateUniqueAnimalId(customBreed),
        type: customBreed.default_type_id
          ? generateUniqueAnimalId(ANIMAL_ID_PREFIX.DEFAULT, customBreed.default_type_id)
          : generateUniqueAnimalId(ANIMAL_ID_PREFIX.CUSTOM, customBreed.custom_type_id),
      })),
    ];
  }

  if (optionTypes.includes('sex')) {
    options.sexOptions = sexes.map(({ id, key }) => ({
      value: id,
      label: t(`animal:SEX.${key}`),
    }));
  }

  if (optionTypes.includes('sexDetails')) {
    options.sexDetailsOptions = sexes.map(({ id, key }) => ({
      id,
      label: t(`animal:SEX.${key}`),
      count: 0,
    }));
  }

  // TODO: Replace with actual enum table values once API is complete
  if (optionTypes.includes('use')) {
    options.useOptions = [
      { label: 'Companionship', value: 0 },
      { label: 'Food', value: 1 },
      { label: 'Fiber', value: 2 },
      { label: 'Milk', value: 3 },
      { label: 'Meat', value: 4 },
      { label: 'Breeding', value: 5 },
    ];
  }

  if (optionTypes.includes('tagType')) {
    options.tagTypeOptions = [
      { value: 1, label: 'Ear tags' },
      { value: 2, label: 'Leg bands' },
      { value: 3, label: 'Other' },
    ];
  }

  if (optionTypes.includes('tagColor')) {
    options.tagColorOptions = [
      { value: 1, label: 'Yellow' },
      { value: 2, label: 'White' },
      { value: 3, label: 'Orange' },
      { value: 4, label: 'Green' },
      { value: 5, label: 'Blue' },
      { value: 6, label: 'Red' },
    ];
  }

  if (optionTypes.includes('tagPlacement')) {
    options.tagPlacementOptions = [
      { value: 1, label: 'Left ear' },
      { value: 2, label: 'Right ear' },
      { value: 3, label: 'Left leg' },
      { value: 4, label: 'Right leg' },
      { value: 5, label: 'Other' },
    ];
  }

  if (optionTypes.includes('organicStatus')) {
    options.organicStatusOptions = [
      { value: 1, label: 'Non-Organic' },
      { value: 2, label: 'Organic' },
      { value: 3, label: 'Transitioning' },
    ];
  }

  if (optionTypes.includes('origin')) {
    options.originOptions = [
      { value: 1, label: 'Brought in' },
      { value: 2, label: 'Born at the farm' },
    ];
  }

  return options;
};
