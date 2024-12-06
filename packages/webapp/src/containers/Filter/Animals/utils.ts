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

import { ANIMAL_ID_PREFIX } from '../../Animals/types';
import type { AnimalInventoryItem } from '../../Animals/Inventory/useAnimalInventory';
import type { FilterState } from '../types';

/**
 * Checks if the given animal or animal batch matches the passed type or breed filter state.
 *
 * @param entity - The entity to check against the filter (animal or animal batch)
 * @param filter - The filter state object. The keys of this object are strings in the format 'custom_<number>' or 'default_<number>' as were created with generateUniqueAnimalId()
 * @param attribute - The attribute being checked: 'type' or 'breed'
 * @returns A boolean indicating whether the entity matches the filter criteria.
 */

export const animalMatchesFilter = (
  entity: AnimalInventoryItem,
  filter: FilterState,
  attribute: 'type' | 'breed',
): boolean => {
  let filterKey;
  if (entity[`default_${attribute}_id`]) {
    filterKey = `${ANIMAL_ID_PREFIX.DEFAULT}_${entity[`default_${attribute}_id`]}`;
  } else if (entity[`custom_${attribute}_id`]) {
    filterKey = `${ANIMAL_ID_PREFIX.CUSTOM}_${entity[`custom_${attribute}_id`]}`;
  }
  return filterKey && filter[filterKey] ? !!filter[filterKey].active : false;
};

/**
 * Retrieves the active type IDs based on the provided animal types filter.
 * @param animalTypesFilter - The filter state for animal types.
 * @returns An array of active type IDs.
 */
export const getActiveTypeIds = (animalTypesFilter: FilterState) => {
  const activeTypeIds: string[] = [];
  if (animalTypesFilter) {
    for (const [key, value] of Object.entries(animalTypesFilter)) {
      if (value.active) {
        activeTypeIds.push(key);
      }
    }
  }
  return activeTypeIds;
};
