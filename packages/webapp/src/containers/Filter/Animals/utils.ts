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

import type { Animal, AnimalBatch } from '../../../store/api/types';
import type { ReduxFilterEntity, FilterState } from '../types';
import { AnimalsFilterKeys } from '.';
import { ANIMAL_TYPE_ID_PREFIX } from '../../Animals/types';

/**
 * Checks if the given entity matches the passed animal filter state based on the specified attribute.
 *
 * @param entity - The entity to check against the filter (animal or animal batch)
 * @param filter - The filter state object.
 * @param attribute - The attribute being queried ('type' or 'breed').
 * @returns A boolean indicating whether the entity matches the filter criteria.
 */
export const isInFilter = (
  entity: Animal | AnimalBatch,
  filter: FilterState,
  attribute: 'type' | 'breed',
): boolean => {
  let entityId;
  if (entity[`${ANIMAL_TYPE_ID_PREFIX.DEFAULT}_${attribute}_id`]) {
    entityId = `${ANIMAL_TYPE_ID_PREFIX.DEFAULT}_${
      entity[`${ANIMAL_TYPE_ID_PREFIX.DEFAULT}_${attribute}_id`]
    }`;
  } else if (entity[`${ANIMAL_TYPE_ID_PREFIX.CUSTOM}_${attribute}_id`]) {
    entityId = `${ANIMAL_TYPE_ID_PREFIX.CUSTOM}_${
      entity[`${ANIMAL_TYPE_ID_PREFIX.CUSTOM}_${attribute}_id`]
    }`;
  }
  return entityId ? filter[entityId]?.active : false;
};

/**
 * Retrieves the active type IDs based on the provided animals filter.
 * @param animalsFilter - The filter object containing the animals filter keys.
 * @returns An array of active type IDs.
 */
export const getActiveTypeIds = (animalsFilter: ReduxFilterEntity<AnimalsFilterKeys>) => {
  const activeTypeIds: string[] = [];
  if (animalsFilter && animalsFilter[AnimalsFilterKeys.TYPE]) {
    for (const [key, value] of Object.entries(animalsFilter[AnimalsFilterKeys.TYPE])) {
      if (value.active) {
        activeTypeIds.push(key);
      }
    }
  }
  return activeTypeIds;
};
