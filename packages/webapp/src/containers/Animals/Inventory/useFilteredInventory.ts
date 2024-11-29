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
import { useSelector } from 'react-redux';
import type { AnimalInventory } from './useAnimalInventory';
import { AnimalOrBatchKeys } from '../types';
import { AnimalsFilterKeys } from '../../Filter/Animals/types';
import { animalMatchesFilter } from '../../Filter/Animals/utils';
import { animalsFilterSelector } from '../../filterSlice';
import { isInactive } from '../../Filter/utils';

export const useFilteredInventory = (
  inventory: AnimalInventory[],
  showOnlySelected: boolean,
  selectedInventoryIds: string[],
) => {
  const idMatches = useMemo(() => {
    return inventory.filter((entity) => {
      return selectedInventoryIds.includes(entity.id);
    });
  }, [inventory, selectedInventoryIds]);

  if (showOnlySelected) {
    return idMatches;
  }

  const {
    [AnimalsFilterKeys.ANIMAL_OR_BATCH]: animalsOrBatchesFilter,
    [AnimalsFilterKeys.TYPE]: typesFilter,
    [AnimalsFilterKeys.BREED]: breedsFilter,
    [AnimalsFilterKeys.SEX]: sexFilter,
    [AnimalsFilterKeys.GROUPS]: groupsFilter,
    [AnimalsFilterKeys.LOCATION]: locationsFilter,
  } = useSelector(animalsFilterSelector);

  const filterMatches = useMemo(() => {
    return inventory.filter((entity) => {
      const animalOrBatchMatches =
        (showOnlySelected && selectedInventoryIds.includes(entity.id)) ||
        isInactive(animalsOrBatchesFilter) ||
        (entity.batch
          ? animalsOrBatchesFilter[AnimalOrBatchKeys.BATCH]?.active
          : animalsOrBatchesFilter[AnimalOrBatchKeys.ANIMAL]?.active);

      const typeMatches =
        isInactive(typesFilter) || animalMatchesFilter(entity, typesFilter, 'type');

      const breedMatches =
        isInactive(breedsFilter) || animalMatchesFilter(entity, breedsFilter, 'breed');

      const sexMatches =
        isInactive(sexFilter) ||
        (entity.batch
          ? entity.sex_detail!.some(({ sex_id }) => sexFilter[sex_id]?.active)
          : sexFilter[entity.sex_id!]?.active);

      const groupMatches =
        isInactive(groupsFilter) ||
        entity.group_ids.some((groupId) => groupsFilter[groupId]?.active);

      // *** Location is not yet implemented as a property on animal or batch  ***
      const locationMatches = isInactive(locationsFilter);
      // const locationMatches =
      //   isInactive(locationsFilter) || locationsFilter[entity.location]?.active;

      return (
        animalOrBatchMatches &&
        typeMatches &&
        breedMatches &&
        sexMatches &&
        groupMatches &&
        locationMatches
      );
    });
  }, [
    inventory,
    animalsOrBatchesFilter,
    typesFilter,
    breedsFilter,
    sexFilter,
    groupsFilter,
    locationsFilter,
  ]);

  return filterMatches;
};
