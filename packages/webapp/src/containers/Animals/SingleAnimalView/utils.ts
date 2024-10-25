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

import { getLocalDateInYYYYDDMM } from '../../../util/date';
import type { Animal, AnimalBatch } from '../../../store/api/types';

export const generateFormDate = (date?: string | null) => {
  return date ? getLocalDateInYYYYDDMM(new Date(date)) : '';
  // Right now the new date validation logic will fail if null is maintained; may want to revisit/change that but for now an empty string will pass (and matches 'add' mode)
};

const excludeKeys = [
  'id',
  'farm_id',
  'internal_identifier',
  'group_ids', // not editable in the current SingleAnimalView
];

type AnimalBatchKey = keyof (Animal | AnimalBatch);

export const findMissingKeys = (
  updatedAnimalOrBatch: Partial<Animal | AnimalBatch>,
  originalAnimalOrBatch: Partial<Animal | AnimalBatch>,
): AnimalBatchKey[] => {
  const updatedAnimalOrBatchKeys = Object.keys(updatedAnimalOrBatch);
  const originalAnimalOrBatchKeys = Object.keys(originalAnimalOrBatch);

  const missingKeys = originalAnimalOrBatchKeys.filter((key) => {
    const value = originalAnimalOrBatch[key as AnimalBatchKey];
    return (
      !updatedAnimalOrBatchKeys.includes(key) &&
      value &&
      (!Array.isArray(value) || value.length > 0) &&
      !excludeKeys.includes(key)
    );
  });

  return missingKeys as AnimalBatchKey[];
};

export const addNullstoMissingFields = (
  animalOrBatch: Partial<Animal | AnimalBatch>,
  missingFields: AnimalBatchKey[],
): Partial<Animal | AnimalBatch> => {
  const updatedObject = { ...animalOrBatch };

  missingFields.forEach((key: AnimalBatchKey) => {
    if (!(key in updatedObject) || updatedObject[key] === undefined) {
      (updatedObject as any)[key] = null;
    }
  });

  return updatedObject;
};
