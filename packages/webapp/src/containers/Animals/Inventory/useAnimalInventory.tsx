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

export type AnimalInventory = {
  identification: string;
  type: string;
  breed: string;
  groups: string[];
  path: string;
};

type hasId = {
  id: number;
  [key: string]: any;
};

const { t } = i18n;

const getProperty = (arr: hasId[] | undefined, id: number | null, key: string) => {
  return arr?.find((el) => el.id === id)?.[key] || null;
};

const getAnimalTypeLabel = (key: string) => {
  return t(`TYPE.${key}`, { ns: 'animal' });
};

const getAnimalBreedLabel = (key: string) => {
  return t(`BREED.${key}`, { ns: 'animal' });
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
      identification: animal.name
        ? animal.identifier
          ? `${animal.name} | ` + (animal.identifier || null)
          : animal.name
        : animal.identifier || `${t('ANIMAL.ANIMAL')}#${animal.internal_identifier}`,
      type: animal.default_type_id
        ? getAnimalTypeLabel(getProperty(defaultAnimalTypes, animal.default_type_id, 'key'))
        : animal.custom_type_id
        ? getProperty(customAnimalTypes, animal.custom_type_id, 'type')
        : null,
      breed: animal.default_breed_id
        ? getAnimalBreedLabel(getProperty(defaultAnimalBreeds, animal.default_breed_id, 'key'))
        : animal.custom_breed_id
        ? getProperty(customAnimalBreeds, animal.custom_breed_id, 'breed')
        : null,
      groups: animal.group_ids
        ? animal.group_ids.map((id: number) => getProperty(animalGroups, id, 'name'))
        : ['none'],
      path: `/animal/${animal.internal_identifier}`,
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
      identification: batch.name
        ? batch.name
        : `${t('ANIMAL.ANIMAL')}#${batch.internal_identifier}`,
      type: batch.default_type_id
        ? getAnimalTypeLabel(getProperty(defaultAnimalTypes, batch.default_type_id, 'key'))
        : batch.custom_type_id
        ? getProperty(customAnimalTypes, batch.custom_type_id, 'type')
        : null,
      breed: batch.default_breed_id
        ? getAnimalBreedLabel(getProperty(defaultAnimalBreeds, batch.default_breed_id, 'key'))
        : batch.custom_breed_id
        ? getProperty(customAnimalBreeds, batch.custom_breed_id, 'breed')
        : null,
      groups: batch.group_ids
        ? batch.group_ids.map((id: number) => getProperty(animalGroups, id, 'name'))
        : ['none'],
      path: `/batch/${batch.internal_identifier}`,
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
  console.log(transactions);

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
