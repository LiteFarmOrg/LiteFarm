import { useMemo } from 'react';
import { useSelector } from 'react-redux';
AnimalsFilterKeys;
animalsFilterSelector;
import type { AnimalInventory } from './useAnimalInventory';
import { AnimalOrBatchKeys } from '../../Filter/Animals/types';
import { AnimalsFilterKeys } from '../../Filter/Animals/types';
import { animalMatchesFilter } from '../../Filter/Animals/utils';
import { animalsFilterSelector } from '../../filterSlice';
import { isInactive } from '../../Filter/utils';

export const useFilteredInventory = (inventory: AnimalInventory[]) => {
  const {
    [AnimalsFilterKeys.ANIMAL_OR_BATCH]: animalsOrBatchesFilter,
    [AnimalsFilterKeys.TYPE]: typesFilter,
    [AnimalsFilterKeys.BREED]: breedsFilter,
    [AnimalsFilterKeys.SEX]: sexFilter,
    [AnimalsFilterKeys.GROUPS]: groupsFilter,
    [AnimalsFilterKeys.LOCATION]: locationsFilter,
  } = useSelector(animalsFilterSelector);

  return useMemo(() => {
    return inventory.filter((entity) => {
      const animalOrBatchMatches =
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
};
