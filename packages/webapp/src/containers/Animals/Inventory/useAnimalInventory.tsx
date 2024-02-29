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
import { FC, useMemo } from 'react';
import i18n from '../../../locales/i18n';
import {
  useGetAnimalsQuery,
  useGetAnimalBatchesQuery,
  useGetAnimalGroupsQuery,
  useGetCustomAnimalBreedsQuery,
  useGetCustomAnimalTypesQuery,
  useGetDefaultAnimalBreedsQuery,
  useGetDefaultAnimalTypesQuery,
} from '../../../store/api/apiSlice';
import {
  Animal,
  AnimalBatch,
  AnimalGroup,
  CustomAnimalBreed,
  CustomAnimalType,
  DefaultAnimalBreed,
  DefaultAnimalType,
} from '../../../store/api/types';
import { getComparator, orderEnum } from '../../../util/sort';
import { ReactComponent as CattleIcon } from '../../../assets/images/animals/table/cattle.svg';
import { ReactComponent as ChickenIcon } from '../../../assets/images/animals/table/chicken.svg';
import { ReactComponent as PigIcon } from '../../../assets/images/animals/table/pig.svg';
import { ReactComponent as BatchIcon } from '../../../assets/images/animals/table/batch.svg';
import { AnimalTranslationKey } from '../types';

export type AnimalInventory = {
  icon: FC;
  identification: string;
  type: string;
  breed: string;
  groups: string[];
  path: string;
  count: number;
};

const { t } = i18n;

const getDefaultAnimalIcon = (defaultAnimalTypes: DefaultAnimalType[], defaultTypeId: number) => {
  const key = defaultAnimalTypes[defaultTypeId].key;
  switch (key) {
    case AnimalTranslationKey.CATTLE:
      return CattleIcon;
    case AnimalTranslationKey.CHICKEN_BROILERS:
      return ChickenIcon;
    case AnimalTranslationKey.CHICKEN_LAYERS:
      return ChickenIcon;
    case AnimalTranslationKey.PIGS:
      return PigIcon;
    default:
      return CattleIcon;
  }
};

type hasId = {
  id: number;
  [key: string]: any;
};

const getProperty = (arr: hasId[] | undefined, id: number | null, key: string) => {
  return arr?.find((el) => el.id === id)?.[key] || null;
};

const getAnimalTypeLabel = (key: string) => {
  return t(`TYPE.${key}`, { ns: 'animal' });
};

const getAnimalBreedLabel = (key: string) => {
  return t(`BREED.${key}`, { ns: 'animal' });
};

const chooseAnimalIdentifier = (animal: Animal) => {
  if (animal.name && animal.identifier) {
    return `${animal.name} | ${animal.identifier}`;
  } else if (animal.name && !animal.identifier) {
    return animal.name;
  } else if (!animal.name && animal.identifier) {
    return animal.identifier;
  } else {
    return `${t('ANIMAL.ANIMAL')}#${animal.internal_identifier}`;
  }
};

const chooseAnimalTypeLabel = (
  animalOrBatch: Animal | AnimalBatch,
  defaultAnimalTypes: DefaultAnimalType[],
  customAnimalTypes: CustomAnimalType[],
) => {
  if (animalOrBatch.default_type_id) {
    return getAnimalTypeLabel(
      getProperty(defaultAnimalTypes, animalOrBatch.default_type_id, 'key'),
    );
  } else if (animalOrBatch.custom_type_id) {
    return getProperty(customAnimalTypes, animalOrBatch.custom_type_id, 'type');
  } else {
    return null;
  }
};

const chooseAnimalBreedLabel = (
  animalOrBatch: Animal | AnimalBatch,
  defaultAnimalBreeds: DefaultAnimalBreed[],
  customAnimalBreeds: CustomAnimalBreed[],
) => {
  if (animalOrBatch.default_breed_id) {
    return getAnimalBreedLabel(
      getProperty(defaultAnimalBreeds, animalOrBatch.default_breed_id, 'key'),
    );
  } else if (animalOrBatch.custom_breed_id) {
    return getProperty(customAnimalBreeds, animalOrBatch.custom_breed_id, 'type');
  } else {
    return null;
  }
};

const sortAnimalsData = (
  animals: Animal[],
  animalGroups: AnimalGroup[],
  customAnimalBreeds: CustomAnimalBreed[],
  customAnimalTypes: CustomAnimalType[],
  defaultAnimalBreeds: DefaultAnimalBreed[],
  defaultAnimalTypes: DefaultAnimalType[],
) => {
  return animals.map((animal: Animal) => {
    return {
      icon: animal.default_type_id
        ? getDefaultAnimalIcon(defaultAnimalTypes, animal.default_type_id)
        : CattleIcon,
      identification: chooseAnimalIdentifier(animal),
      type: chooseAnimalTypeLabel(animal, defaultAnimalTypes, customAnimalTypes),
      breed: chooseAnimalBreedLabel(animal, defaultAnimalBreeds, customAnimalBreeds),
      groups: animal.group_ids
        ? animal.group_ids.map((id: number) => getProperty(animalGroups, id, 'name'))
        : ['none'],
      path: `/animal/${animal.internal_identifier}`,
      count: 1,
    };
  });
};

const sortAnimalBatchesData = (
  animalBatches: AnimalBatch[],
  animalGroups: AnimalGroup[],
  customAnimalBreeds: CustomAnimalBreed[],
  customAnimalTypes: CustomAnimalType[],
  defaultAnimalBreeds: DefaultAnimalBreed[],
  defaultAnimalTypes: DefaultAnimalType[],
) => {
  return animalBatches.map((batch: AnimalBatch) => {
    return {
      icon: BatchIcon,
      identification: batch.name
        ? batch.name
        : `${t('ANIMAL.ANIMAL')}#${batch.internal_identifier}`,
      type: chooseAnimalTypeLabel(batch, defaultAnimalTypes, customAnimalTypes),
      breed: chooseAnimalBreedLabel(batch, defaultAnimalBreeds, customAnimalBreeds),
      groups: batch.group_ids
        ? batch.group_ids.map((id: number) => getProperty(animalGroups, id, 'name'))
        : ['none'],
      path: `/batch/${batch.internal_identifier}`,
      count: batch.count,
    };
  });
};

export const buildInventory = ({
  animals,
  animalBatches,
  animalGroups,
  customAnimalBreeds,
  customAnimalTypes,
  defaultAnimalBreeds,
  defaultAnimalTypes,
}: {
  animals: Animal[];
  animalBatches: AnimalBatch[];
  animalGroups: AnimalGroup[];
  customAnimalBreeds: CustomAnimalBreed[];
  customAnimalTypes: CustomAnimalType[];
  defaultAnimalBreeds: DefaultAnimalBreed[];
  defaultAnimalTypes: DefaultAnimalType[];
}) => {
  const transactions = [
    ...sortAnimalsData(
      animals,
      animalGroups,
      customAnimalBreeds,
      customAnimalTypes,
      defaultAnimalBreeds,
      defaultAnimalTypes,
    ),
    ...sortAnimalBatchesData(
      animalBatches,
      animalGroups,
      customAnimalBreeds,
      customAnimalTypes,
      defaultAnimalBreeds,
      defaultAnimalTypes,
    ),
  ];

  const sortedTransactions = transactions.sort(getComparator(orderEnum.ASC, 'identification'));

  return sortedTransactions;
};

const useAnimalInventory = () => {
  const {
    data: animals,
    isLoading: isLoadingAnimals,
    isFetching: isFetchingAnimals,
    isSuccess: isSuccessAnimals,
    isError: isErrorAnimals,
  } = useGetAnimalsQuery();
  const {
    data: animalBatches,
    isLoading: isLoadingAnimalBatches,
    isFetching: isFetchingAnimalBatches,
    isSuccess: isSuccessAnimalBatches,
    isError: isErrorAnimalBatches,
  } = useGetAnimalBatchesQuery();
  const {
    data: animalGroups,
    isLoading: isLoadingAnimalGroups,
    isFetching: isFetchingAnimalGroups,
    isSuccess: isSuccessAnimalGroups,
    isError: isErrorAnimalGroups,
  } = useGetAnimalGroupsQuery();
  const {
    data: customAnimalBreeds,
    isLoading: isLoadingCustomAnimalBreeds,
    isFetching: isFetchingCustomAnimalBreeds,
    isSuccess: isSuccessCustomAnimalBreeds,
    isError: isErrorCustomAnimalBreeds,
  } = useGetCustomAnimalBreedsQuery();
  const {
    data: customAnimalTypes,
    isLoading: isLoadingCustomAnimalTypes,
    isFetching: isFetchingCustomAnimalTypes,
    isSuccess: isSuccessCustomAnimalTypes,
    isError: isErrorCustomAnimalTypes,
  } = useGetCustomAnimalTypesQuery();
  const {
    data: defaultAnimalBreeds,
    isLoading: isLoadingDefaultAnimalBreeds,
    isFetching: isFetchingDefaultAnimalBreeds,
    isSuccess: isSuccessDefaultAnimalBreeds,
    isError: isErrorDefaultAnimalBreeds,
  } = useGetDefaultAnimalBreedsQuery();
  const {
    data: defaultAnimalTypes,
    isLoading: isLoadingDefaultAnimalTypes,
    isFetching: isFetchingDefaultAnimalTypes,
    isSuccess: isSuccessDefaultAnimalTypes,
    isError: isErrorDefaultAnimalTypes,
  } = useGetDefaultAnimalTypesQuery();

  const isLoading =
    isLoadingAnimals ||
    isLoadingAnimalBatches ||
    isLoadingAnimalGroups ||
    isLoadingCustomAnimalBreeds ||
    isLoadingCustomAnimalTypes ||
    isLoadingDefaultAnimalBreeds ||
    isLoadingDefaultAnimalTypes;
  const isFetching =
    isFetchingAnimals ||
    isFetchingAnimalBatches ||
    isFetchingAnimalGroups ||
    isFetchingCustomAnimalBreeds ||
    isFetchingCustomAnimalTypes ||
    isFetchingDefaultAnimalBreeds ||
    isFetchingDefaultAnimalTypes;
  const isSuccess =
    isSuccessAnimals &&
    isSuccessAnimalBatches &&
    isSuccessAnimalGroups &&
    isSuccessCustomAnimalBreeds &&
    isSuccessCustomAnimalTypes &&
    isSuccessDefaultAnimalBreeds &&
    isSuccessDefaultAnimalTypes;
  const isError =
    isErrorAnimals ||
    isErrorAnimalBatches ||
    isErrorAnimalGroups ||
    isErrorCustomAnimalBreeds ||
    isErrorCustomAnimalTypes ||
    isErrorDefaultAnimalBreeds ||
    isErrorDefaultAnimalTypes;

  const inventory = useMemo(() => {
    if (isLoading) {
      return [];
    }
    if (
      animals &&
      animalBatches &&
      animalGroups &&
      customAnimalBreeds &&
      customAnimalTypes &&
      defaultAnimalBreeds &&
      defaultAnimalTypes
    ) {
      return buildInventory({
        animals,
        animalBatches,
        animalGroups,
        customAnimalBreeds,
        customAnimalTypes,
        defaultAnimalBreeds,
        defaultAnimalTypes,
      });
    }
    return [];
  }, [
    animals,
    animalBatches,
    animalGroups,
    customAnimalBreeds,
    customAnimalTypes,
    defaultAnimalBreeds,
    defaultAnimalTypes,
  ]);

  return { inventory, isLoading, isFetching, isSuccess, isError };
};

export default useAnimalInventory;
