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
  useGetAnimalIdentifierTypesQuery,
  useGetAnimalIdentifierColorsQuery,
  useGetAnimalOriginsQuery,
  useGetAnimalUsesQuery,
  useGetAnimalTypeUseRelationshipsQuery,
} from '../../../store/api/apiSlice';
import { useTranslation } from 'react-i18next';
import { generateUniqueAnimalId } from '../../../util/animal';
import { ANIMAL_ID_PREFIX } from '../types';
import { AnimalUse, AnimalTypeUseRelationship, DefaultAnimalType } from '../../../store/api/types';

type OptionType =
  | 'default_types'
  | 'type'
  | 'breed'
  | 'sex'
  | 'sexDetails'
  | 'use'
  | 'tagType'
  | 'tagColor'
  | 'organicStatus'
  | 'origin';

export const useAnimalOptions = (...optionTypes: OptionType[]) => {
  const { t } = useTranslation(['animal', 'common', 'translation']);

  const { data: defaultTypes = [] } = useGetDefaultAnimalTypesQuery();
  const { data: customTypes = [] } = useGetCustomAnimalTypesQuery();
  const { data: defaultBreeds = [] } = useGetDefaultAnimalBreedsQuery();
  const { data: customBreeds = [] } = useGetCustomAnimalBreedsQuery();
  const { data: sexes = [] } = useGetAnimalSexesQuery();
  const { data: identifierTypes = [] } = useGetAnimalIdentifierTypesQuery();
  const { data: identifierColors = [] } = useGetAnimalIdentifierColorsQuery();
  const { data: orgins = [] } = useGetAnimalOriginsQuery();
  const { data: uses = [] } = useGetAnimalUsesQuery();
  const { data: typeUseRelationships = [] } = useGetAnimalTypeUseRelationshipsQuery();

  const options: any = {};

  // For icons
  if (optionTypes.includes('default_types')) {
    options.defaultTypes = defaultTypes;
  }

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

  if (optionTypes.includes('use')) {
    options.useOptions = defaultTypes.map((animalType: DefaultAnimalType) => {
      return {
        default_type_id: animalType.id,
        uses: typeUseRelationships
          .filter((typeUse: AnimalTypeUseRelationship) => typeUse.default_type_id === animalType.id)
          .map((animalUse: AnimalTypeUseRelationship) => {
            const useKey = uses.find((use: AnimalUse) => use.id === animalUse.animal_use_id);
            return {
              value: animalUse.animal_use_id,
              label: t(`animal:USE.${useKey?.key}`),
              key: useKey?.key,
            };
          }),
      };
    });
    // Add all uses to custom type
    options.useOptions.push({
      default_type_id: null,
      uses: uses.map((use: AnimalUse) => {
        return {
          value: use.id,
          label: t(`animal:USE.${use.key}`),
          key: use.key,
        };
      }),
    });
  }

  if (optionTypes.includes('tagType')) {
    options.tagTypeOptions = identifierTypes.map(({ id, key }) =>
      key === 'OTHER'
        ? {
            value: id,
            label: t(`common:OTHER`),
            key: key,
          }
        : {
            value: id,
            label: t(`animal:TAG_TYPE.${key}`),
          },
    );
  }

  if (optionTypes.includes('tagColor')) {
    options.tagColorOptions = identifierColors.map(({ id, key }) => ({
      value: id,
      label: t(`animal:TAG_COLOR.${key}`),
    }));
  }

  // A string enum on the animal + animal_batch tables
  if (optionTypes.includes('organicStatus')) {
    options.organicStatusOptions = [
      { value: 'Non-Organic', label: t('common:NON_ORGANIC') },
      { value: 'Organic', label: t('common:ORGANIC') },
      { value: 'Transitional', label: t('common:TRANSITIONING') },
    ];
  }

  if (optionTypes.includes('origin')) {
    options.originOptions = orgins.map(({ id, key }) => ({
      value: id,
      label: t(`animal:ORIGIN.${key}`),
      key: key,
    }));
  }

  return options;
};
