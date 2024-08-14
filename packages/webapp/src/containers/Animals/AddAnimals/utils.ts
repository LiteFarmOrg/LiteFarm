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
  AnimalSummary,
  BatchSummary,
} from '../../../components/Animals/AddAnimalsSummaryCard/types';
import {
  Animal,
  AnimalBatch,
  AnimalSex,
  CustomAnimalBreed,
  CustomAnimalType,
  DefaultAnimalBreed,
  DefaultAnimalType,
} from '../../../store/api/types';
import { chooseAnimalBreedLabel, chooseAnimalTypeLabel } from '../Inventory/useAnimalInventory';

// TODO
export const formatAnimalDetailsToDBStructure = (data: any) => {
  return data;
};

export const formatBatchDetailsToDBStructure = (data: any) => {
  return data;
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

  data.forEach((animal) => {
    const typeBreedkey = getTypeBreedKey(animal);
    const sexMap = getSexMap(sexes, true);

    if (!animalsPerTypeAndBreed[typeBreedkey]) {
      const typeString = chooseAnimalTypeLabel(animal, defaultTypes, customTypes);
      const breedString = chooseAnimalBreedLabel(animal, defaultBreeds, customBreeds);
      animalsPerTypeAndBreed[typeBreedkey] = {
        type: typeString,
        breed: breedString,
        sexDetails: {},
        iconKey: typeString.toUpperCase(),
        count: 0,
      } as AnimalSummary;
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
