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

export const addNullstoMissingFields = (
  updatedAnimalOrBatch: Partial<Animal | AnimalBatch>,
  originalAnimalOrBatch: Partial<Animal | AnimalBatch>,
): Partial<Animal | AnimalBatch> => {
  const formattedObject = { ...updatedAnimalOrBatch };

  const updatedKeys = Object.keys(updatedAnimalOrBatch) as AnimalBatchKey[];
  const originalKeys = Object.keys(originalAnimalOrBatch) as AnimalBatchKey[];

  const isMissing = (key: AnimalBatchKey): boolean => {
    const originalValue = originalAnimalOrBatch[key];

    const isKeyMissing = !updatedKeys.includes(key) || updatedAnimalOrBatch[key] === undefined;

    const wasValidValue =
      originalValue !== null &&
      originalValue !== undefined &&
      (!Array.isArray(originalValue) || originalValue.length > 0);

    const isNotExcluded = !excludeKeys.includes(key);

    return isKeyMissing && wasValidValue && isNotExcluded;
  };

  originalKeys.forEach((key) => {
    if (isMissing(key)) {
      (formattedObject as any)[key] = null;
    }
  });

  return formattedObject;
};
