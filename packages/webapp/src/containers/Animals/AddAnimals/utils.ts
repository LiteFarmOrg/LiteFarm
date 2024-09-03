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

import i18n from '../../../locales/i18n';
import {
  Animal,
  AnimalBatch,
  AnimalSex,
  CustomAnimalBreed,
  CustomAnimalType,
  DefaultAnimalBreed,
  DefaultAnimalType,
} from '../../../store/api/types';
import { toLocalISOString } from '../../../util/moment';
import { DetailsFields, type AnimalDetailsFormFields } from './types';
import {
  AnimalSummary,
  BatchSummary,
} from '../../../components/Animals/AddAnimalsSummaryCard/types';
import { chooseAnimalBreedLabel, chooseAnimalTypeLabel } from '../Inventory/useAnimalInventory';

const formatFormTypeOrBreed = (
  typeOrBreed: 'type' | 'breed',
  data?: { label: string; value: string; __isNew__?: boolean },
) => {
  if (!data?.value) {
    return {};
  }
  if (data.__isNew__) {
    return { [`${typeOrBreed}_name`]: data.label };
  }
  const [defaultOrCustom, id] = data.value.split('_');

  return { [`${defaultOrCustom}_${typeOrBreed}_id`]: +id };
};

const formatFormSexDetailsAndCount = (data: AnimalDetailsFormFields): Partial<AnimalBatch> => {
  if (!data[DetailsFields.SEX_DETAILS] || !data[DetailsFields.SEX_DETAILS].length) {
    return { count: data[DetailsFields.COUNT]! };
  }

  return {
    count: data[DetailsFields.COUNT]!,
    sex_detail: data[DetailsFields.SEX_DETAILS].map(({ id, count }) => {
      return { sex_id: id, count };
    }),
  };
};

const formatFormUse = (
  isAnimal: boolean,
  use: AnimalDetailsFormFields[DetailsFields.USE],
  otherUse: AnimalDetailsFormFields[DetailsFields.OTHER_USE],
) => {
  if (!use || !use.length) {
    return {};
  }

  const key = `animal${isAnimal ? '' : '_batch'}_use_relationships`;

  const useRelations: { use_id: number; other_use?: string }[] = [];

  use.forEach(({ value: useId, key }, index: number) => {
    useRelations.push({ use_id: useId });
    if (key === 'OTHER' && otherUse) {
      useRelations[index].other_use = otherUse;
    }
  });

  return { [key]: useRelations };
};

const convertFormDate = (date?: string): string | undefined => {
  if (!date) {
    return undefined;
  }
  return toLocalISOString(date);
};

const formatOrigin = (
  data: AnimalDetailsFormFields,
  broughtInId?: number,
): Partial<Animal | AnimalBatch> => {
  if (!broughtInId && !data[DetailsFields.ORIGIN]) {
    return { birth_date: convertFormDate(data[DetailsFields.DATE_OF_BIRTH]) };
  }

  const isBroughtIn = broughtInId === data[DetailsFields.ORIGIN];

  return {
    birth_date: convertFormDate(data[DetailsFields.DATE_OF_BIRTH]),
    origin_id: data[DetailsFields.ORIGIN],
    ...(isBroughtIn
      ? {
          brought_in_date: convertFormDate(data[DetailsFields.BROUGHT_IN_DATE]),
          supplier: data[DetailsFields.SUPPLIER],
          price: data[DetailsFields.PRICE] ? +data[DetailsFields.PRICE] : undefined,
        }
      : {
          dam: data[DetailsFields.DAM],
          sire: data[DetailsFields.SIRE],
        }),
  };
};

const formatCommonDetails = (
  isAnimal: boolean,
  data: AnimalDetailsFormFields,
  broughtInId?: number,
): Partial<Animal | AnimalBatch> => {
  return {
    // General
    ...formatFormTypeOrBreed('type', data[DetailsFields.TYPE]),
    ...formatFormTypeOrBreed('breed', data[DetailsFields.BREED]),
    ...(isAnimal ? { sex_id: data[DetailsFields.SEX] } : formatFormSexDetailsAndCount(data)),
    ...formatFormUse(isAnimal, data[DetailsFields.USE], data[DetailsFields.OTHER_USE]),

    // Other
    organic_status: data[DetailsFields.ORGANIC_STATUS]?.value,
    notes: data[DetailsFields.OTHER_DETAILS],
    photo_url: data[DetailsFields.ANIMAL_IMAGE],

    // Origin
    ...formatOrigin(data, broughtInId),

    // Unique (animal) | General (batch)
    name: data[DetailsFields.NAME],
  };
};

export const formatAnimalDetailsToDBStructure = (
  data: AnimalDetailsFormFields,
  broughtInId?: number,
): Partial<Animal> => {
  return {
    ...formatCommonDetails(true, data, broughtInId),

    // Other
    weaning_date: convertFormDate(data[DetailsFields.WEANING_DATE]),

    // Unique
    identifier: data[DetailsFields.TAG_NUMBER],
    identifier_type_id: data[DetailsFields.TAG_TYPE]?.value,
    identifier_color_id: data[DetailsFields.TAG_COLOR]?.value,
    identifier_type_other: data[DetailsFields.TAG_TYPE_INFO],
  };
};

export const formatBatchDetailsToDBStructure = (
  data: AnimalDetailsFormFields,
  broughtInId?: number,
): Partial<AnimalBatch> => {
  return formatCommonDetails(false, data, broughtInId);
};

export const getSexMap = (
  sexConfig: AnimalSex[],
  translateKey?: boolean,
): { [key: number]: string } => {
  return sexConfig.reduce(
    (acc, { id, key }) => ({ ...acc, [id]: translateKey ? i18n.t(`animal:SEX.${key}`) : key }),
    {},
  );
};

export const getSexLabelById = (sexId: number, sexMap: { [key: number]: string }): string => {
  return sexMap[sexId];
};

const getTypeBreedKey = (animalOrBatch: Animal | AnimalBatch): string => {
  const { default_type_id, custom_type_id, default_breed_id, custom_breed_id } = animalOrBatch;
  const typeKey = `${default_type_id ? 'D' : 'C'}-${default_type_id || custom_type_id}`;
  let breedKey = '';
  if (default_breed_id || custom_breed_id) {
    breedKey = `_${default_breed_id ? 'D' : 'C'}-${default_breed_id || custom_breed_id}`;
  }

  return `${typeKey}_${breedKey}`;
};

interface Config {
  defaultTypes: DefaultAnimalType[];
  customTypes: CustomAnimalType[];
  defaultBreeds: DefaultAnimalBreed[];
  customBreeds: CustomAnimalBreed[];
  sexes: AnimalSex[];
}

export const formatDBAnimalsToSummary = (data: Animal[], config: Config): AnimalSummary[] => {
  const animalsPerTypeAndBreed = {} as { [key: string]: AnimalSummary };
  const { defaultTypes, customTypes, defaultBreeds, customBreeds, sexes } = config;
  const sexMap = getSexMap(sexes, true);

  data.forEach((animal) => {
    const typeBreedkey = getTypeBreedKey(animal);

    if (!animalsPerTypeAndBreed[typeBreedkey]) {
      const typeString = chooseAnimalTypeLabel(animal, defaultTypes, customTypes);
      const breedString = chooseAnimalBreedLabel(animal, defaultBreeds, customBreeds);
      animalsPerTypeAndBreed[typeBreedkey] = {
        type: typeString,
        breed: breedString,
        sexDetails: {},
        iconKey: typeString.toUpperCase(),
        count: 0,
      };
    }

    const typeBreedSummary = animalsPerTypeAndBreed[typeBreedkey];

    typeBreedSummary.count += 1;

    const sexLabel = sexMap[animal.sex_id];

    if (sexLabel) {
      if (!typeBreedSummary.sexDetails[sexLabel]) {
        typeBreedSummary.sexDetails[sexLabel] = 0;
      }

      typeBreedSummary.sexDetails[sexLabel]! += 1;
    }
  });

  return Object.values(animalsPerTypeAndBreed);
};

export const formatDBBatchesToSummary = (data: AnimalBatch[], config: Config): BatchSummary[] => {
  const batchesPerTypeAndBreed = {} as { [key: string]: BatchSummary };
  const { defaultTypes, customTypes, defaultBreeds, customBreeds } = config;

  data.forEach((batch) => {
    const typeBreedkey = getTypeBreedKey(batch);

    if (!batchesPerTypeAndBreed[typeBreedkey]) {
      batchesPerTypeAndBreed[typeBreedkey] = {
        type: chooseAnimalTypeLabel(batch, defaultTypes, customTypes),
        breed: chooseAnimalBreedLabel(batch, defaultBreeds, customBreeds),
        count: 0,
      };
    }

    batchesPerTypeAndBreed[typeBreedkey].count += batch.count;
  });

  return Object.values(batchesPerTypeAndBreed);
};
