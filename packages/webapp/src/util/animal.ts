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
import { ANIMAL_ID_PREFIX, ANIMAL_ID_ENTITY, AnimalOrBatchKeys } from '../containers/Animals/types';

/**
 * Generates a unique ID based on the given type or breed entity.
 * @param entity - The entity for which to generate the unique ID (type or breed, either custom or default).
 * @returns The prefixed unique ID.
 */
export const generateUniqueAnimalId = (
  entity: DefaultAnimalType | CustomAnimalType | DefaultAnimalBreed | CustomAnimalBreed,
): string => {
  return `${ANIMAL_ID_PREFIX['key' in entity ? 'DEFAULT' : 'CUSTOM']}_${entity.id}`;
};

export const parseUniqueAnimalId = (
  uniqueId: string,
  type: ANIMAL_ID_ENTITY,
): Partial<Record<string, number>> => {
  const [prefix, id] = uniqueId.split('_');
  return { [`${prefix}_${type}_id`]: Number(id) };
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
