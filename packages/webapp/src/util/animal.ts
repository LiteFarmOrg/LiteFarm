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

import type {
  CustomAnimalType,
  DefaultAnimalType,
  CustomAnimalBreed,
  DefaultAnimalBreed,
  Animal,
  AnimalBatch,
} from '../store/api/types';
import { ANIMAL_ID_PREFIX, AnimalOrBatchKeys } from '../containers/Animals/types';

/**
 * Generates a unique ID based on the given type or breed entity.
 * @param entity - The entity for which to generate the unique ID (type or breed, either custom or default) -OR- the prefix indicating default or custom
 * @returns The prefixed unique ID.
 */

const generateIdFromString = (prefix: ANIMAL_ID_PREFIX, id: number): string => {
  return `${prefix}_${id}`;
};

const generateIdFromObject = (
  entity: DefaultAnimalType | CustomAnimalType | DefaultAnimalBreed | CustomAnimalBreed,
): string => {
  return `${ANIMAL_ID_PREFIX['key' in entity ? 'DEFAULT' : 'CUSTOM']}_${entity.id}`;
};

export const generateUniqueAnimalId = (
  entity:
    | DefaultAnimalType
    | CustomAnimalType
    | DefaultAnimalBreed
    | CustomAnimalBreed
    | ANIMAL_ID_PREFIX, // ('default' | 'custom'),
  id?: number,
): string => {
  if (typeof entity === 'string' && id !== undefined) {
    return generateIdFromString(entity, id);
  } else {
    return generateIdFromObject(
      entity as DefaultAnimalType | CustomAnimalType | DefaultAnimalBreed | CustomAnimalBreed,
    );
  }
};

export const parseUniqueDefaultId = (uniqueId: string): number | null => {
  if (
    uniqueId.startsWith(ANIMAL_ID_PREFIX.CUSTOM) ||
    !uniqueId.includes(ANIMAL_ID_PREFIX.DEFAULT)
  ) {
    return null;
  }
  return Number(uniqueId.split('_')[1]);
};

export const generateInventoryId = (
  key: AnimalOrBatchKeys,
  animalOrBatch: Animal | AnimalBatch,
): string => {
  return `${key}_${animalOrBatch.id}`;
};

export const parseInventoryId = (inventoryId: string): { kind: AnimalOrBatchKeys; id: number } => {
  const [kind, id] = inventoryId.split('_');
  return { kind: kind as AnimalOrBatchKeys, id: Number(id) };
};
