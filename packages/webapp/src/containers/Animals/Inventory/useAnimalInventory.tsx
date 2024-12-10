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
  useGetCustomAnimalBreedsQuery,
  useGetCustomAnimalTypesQuery,
  useGetDefaultAnimalBreedsQuery,
  useGetDefaultAnimalTypesQuery,
  useGetAnimalSexesQuery,
} from '../../../store/api/apiSlice';
import useQueries from '../../../hooks/api/useQueries';
import {
  Animal,
  AnimalBatch,
  CustomAnimalBreed,
  CustomAnimalType,
  DefaultAnimalBreed,
  DefaultAnimalType,
} from '../../../store/api/types';
import { getComparator, orderEnum } from '../../../util/sort';
import { AnimalOrBatchKeys } from '../types';
import { generateInventoryId } from '../../../util/animal';
import { AnimalTypeIconKey, isAnimalTypeIconKey } from '../../../components/Icons/icons';
import { createSingleAnimalViewURL } from '../../../util/siteMapConstants';
import { useSelector } from 'react-redux';
import { locationsSelector } from '../../locationSlice';
import { Location } from '../../../types';

export type AnimalInventoryItem = {
  id: string;
  iconName: AnimalTypeIconKey;
  identification: string;
  internal_identifier: number;
  name: string | null;
  type: string;
  breed: string;
  path: string;
  count: number;
  batch: boolean;
  location: string;
  sex_id?: number;
  sex_detail?: { sex_id: number; count: number }[];
  custom_type_id: number | null;
  default_type_id: number | null;
  custom_breed_id: number | null;
  default_breed_id: number | null;
  location_id?: string | null;
  tasks: Animal['tasks'];
};

const { t } = i18n;

export const getDefaultAnimalIconName = (
  defaultAnimalTypes: DefaultAnimalType[],
  defaultTypeId: number | null,
) => {
  const typeKey = defaultAnimalTypes.find(({ id }) => id === defaultTypeId)?.key || 'CUSTOM_ANIMAL';
  return isAnimalTypeIconKey(typeKey) ? typeKey : 'CUSTOM_ANIMAL';
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

const chooseIdentification = (animalOrBatch: Animal | AnimalBatch) => {
  if ('identifier' in animalOrBatch && animalOrBatch.identifier) {
    if (animalOrBatch.name && animalOrBatch.identifier) {
      return `${animalOrBatch.name} | ${animalOrBatch.identifier}`;
    } else if (!animalOrBatch.name && animalOrBatch.identifier) {
      return animalOrBatch.identifier;
    }
  }
  if (animalOrBatch.name) {
    return animalOrBatch.name;
  }
  return `${t('ANIMAL.ANIMAL_ID')}${animalOrBatch.internal_identifier}`;
};

export const chooseAnimalTypeLabel = (
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

export const chooseAnimalBreedLabel = (
  animalOrBatch: Animal | AnimalBatch,
  defaultAnimalBreeds: DefaultAnimalBreed[],
  customAnimalBreeds: CustomAnimalBreed[],
) => {
  if (animalOrBatch.default_breed_id) {
    return getAnimalBreedLabel(
      getProperty(defaultAnimalBreeds, animalOrBatch.default_breed_id, 'key'),
    );
  } else if (animalOrBatch.custom_breed_id) {
    return getProperty(customAnimalBreeds, animalOrBatch.custom_breed_id, 'breed');
  } else {
    return null;
  }
};

const formatAnimalsData = (
  animals: Animal[],
  customAnimalBreeds: CustomAnimalBreed[],
  customAnimalTypes: CustomAnimalType[],
  defaultAnimalBreeds: DefaultAnimalBreed[],
  defaultAnimalTypes: DefaultAnimalType[],
  locationsMap: { [key: string]: string },
): AnimalInventoryItem[] => {
  return animals
    .filter(
      (animal: Animal) =>
        // filter out removed animals
        !animal.animal_removal_reason_id,
    )
    .map((animal: Animal) => {
      return {
        id: generateInventoryId(AnimalOrBatchKeys.ANIMAL, animal),
        iconName: getDefaultAnimalIconName(defaultAnimalTypes, animal.default_type_id),
        identification: chooseIdentification(animal),
        internal_identifier: animal.internal_identifier,
        type: chooseAnimalTypeLabel(animal, defaultAnimalTypes, customAnimalTypes),
        breed: chooseAnimalBreedLabel(animal, defaultAnimalBreeds, customAnimalBreeds),
        path: createSingleAnimalViewURL(animal.internal_identifier),
        count: 1,
        batch: false,
        name: animal.name,
        location: animal.location_id ? locationsMap[animal.location_id] : '',
        // preserve some untransformed data for filtering
        sex_id: animal.sex_id,
        custom_type_id: animal.custom_type_id,
        default_type_id: animal.default_type_id,
        custom_breed_id: animal.custom_breed_id,
        default_breed_id: animal.default_breed_id,
        location_id: animal.location_id,
        tasks: animal.tasks,
      };
    });
};

const formatAnimalBatchesData = (
  animalBatches: AnimalBatch[],
  customAnimalBreeds: CustomAnimalBreed[],
  customAnimalTypes: CustomAnimalType[],
  defaultAnimalBreeds: DefaultAnimalBreed[],
  defaultAnimalTypes: DefaultAnimalType[],
  locationsMap: { [key: string]: string },
): AnimalInventoryItem[] => {
  return animalBatches
    .filter(
      (batch: AnimalBatch) =>
        // filter out removed animals
        !batch.animal_removal_reason_id,
    )
    .map((batch: AnimalBatch) => {
      return {
        id: generateInventoryId(AnimalOrBatchKeys.BATCH, batch),
        iconName: 'BATCH',
        identification: chooseIdentification(batch),
        internal_identifier: batch.internal_identifier,
        type: chooseAnimalTypeLabel(batch, defaultAnimalTypes, customAnimalTypes),
        breed: chooseAnimalBreedLabel(batch, defaultAnimalBreeds, customAnimalBreeds),
        path: createSingleAnimalViewURL(batch.internal_identifier),
        count: batch.count,
        name: batch.name,
        batch: true,
        location: batch.location_id ? locationsMap[batch.location_id] : '',
        // preserve some untransformed data for filtering
        sex_detail: batch.sex_detail,
        custom_type_id: batch.custom_type_id,
        default_type_id: batch.default_type_id,
        custom_breed_id: batch.custom_breed_id,
        default_breed_id: batch.default_breed_id,
        location_id: batch.location_id,
        tasks: batch.tasks,
      };
    });
};

interface BuildInventoryArgs {
  animals: Animal[];
  animalBatches: AnimalBatch[];
  customAnimalBreeds: CustomAnimalBreed[];
  customAnimalTypes: CustomAnimalType[];
  defaultAnimalBreeds: DefaultAnimalBreed[];
  defaultAnimalTypes: DefaultAnimalType[];
  locationsMap: { [key: string]: string };
}

export const animalIDComparator = (a: AnimalInventoryItem, b: AnimalInventoryItem) => {
  if (a.name && !b.name) {
    return -1;
  }
  if (b.name && !a.name) {
    return 1;
  }
  if (a.identification && !b.identification) {
    return -1;
  }
  if (b.identification && !a.identification) {
    return 1;
  }

  return (
    (a.name && b.name && (a.name.length - b.name.length || a.name.localeCompare(b.name))) ||
    (a.identification &&
      b.identification &&
      (a.identification.length - b.identification.length ||
        a.identification.localeCompare(b.identification))) ||
    a.internal_identifier - b.internal_identifier
  );
};

const sortAnimalsIDs = (inventory: AnimalInventoryItem[]) => {
  return inventory.sort(animalIDComparator);
};

export const buildInventory = ({
  animals,
  animalBatches,
  customAnimalBreeds,
  customAnimalTypes,
  defaultAnimalBreeds,
  defaultAnimalTypes,
  locationsMap,
}: BuildInventoryArgs) => {
  const inventory = [
    ...formatAnimalsData(
      animals,
      customAnimalBreeds,
      customAnimalTypes,
      defaultAnimalBreeds,
      defaultAnimalTypes,
      locationsMap,
    ),
    ...formatAnimalBatchesData(
      animalBatches,
      customAnimalBreeds,
      customAnimalTypes,
      defaultAnimalBreeds,
      defaultAnimalTypes,
      locationsMap,
    ),
  ];

  const sortedInventory = sortAnimalsIDs(inventory);

  return sortedInventory;
};

const useAnimalInventory = () => {
  const { data, isLoading } = useQueries([
    { label: 'animals', hook: useGetAnimalsQuery },
    { label: 'animalBatches', hook: useGetAnimalBatchesQuery },
    { label: 'customAnimalBreeds', hook: useGetCustomAnimalBreedsQuery },
    { label: 'customAnimalTypes', hook: useGetCustomAnimalTypesQuery },
    { label: 'defaultAnimalBreeds', hook: useGetDefaultAnimalBreedsQuery },
    { label: 'defaultAnimalTypes', hook: useGetDefaultAnimalTypesQuery },
    { label: 'animalSexes', hook: useGetAnimalSexesQuery },
  ]);

  const {
    animals,
    animalBatches,
    customAnimalBreeds,
    customAnimalTypes,
    defaultAnimalBreeds,
    defaultAnimalTypes,
  } = data;

  const locations: Location[] = useSelector(locationsSelector);
  const locationsMap = locations?.reduce(
    (map, { location_id, name }) => ({ ...map, [location_id]: name }),
    {},
  );

  const inventory = useMemo(() => {
    if (isLoading) {
      return [];
    }
    if (
      animals &&
      animalBatches &&
      customAnimalBreeds &&
      customAnimalTypes &&
      defaultAnimalBreeds &&
      defaultAnimalTypes &&
      locationsMap
    ) {
      return buildInventory({
        animals,
        animalBatches,
        customAnimalBreeds,
        customAnimalTypes,
        defaultAnimalBreeds,
        defaultAnimalTypes,
        locationsMap,
      });
    }
    return [];
  }, [
    isLoading,
    animals,
    animalBatches,
    customAnimalBreeds,
    customAnimalTypes,
    defaultAnimalBreeds,
    defaultAnimalTypes,
  ]);

  return { inventory, isLoading };
};

export default useAnimalInventory;
