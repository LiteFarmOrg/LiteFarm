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

import { useEffect, useState } from 'react';
import type { ReduxFilterEntity, FilterState } from '../types';
import { AnimalsFilterKeys } from './types';
import type { DefaultAnimalBreed, CustomAnimalBreed } from '../../../store/api/types';
import { getActiveTypeIds } from './utils';
import { ANIMAL_ID_PREFIX } from '../../Animals/types';

/**
 * Custom hook to manage visible breeds based on the selected animal types
 *
 * @param {DefaultAnimalBreed[]} defaultBreeds - Array of all default animal breeds.
 * @param {CustomAnimalBreed[]} customBreeds - Array of all custom animal breeds.
 * @param {() => void} onChange - Callback function passed by the parent container to be called when the filter component state changes
 * @param {React.RefObject<ReduxFilterEntity<AnimalsFilterKeys>>} filterRef - Ref object of the filter entity.
 *
 * @returns {Object} Object containing the following properties:
 * - handleChange: Enriched function to be called when the filter changes.
 * - filteredDefaultBreeds: Array of filtered default animal breeds.
 * - filteredCustomBreeds: Array of filtered custom animal breeds.
 */
export const useVisibleBreeds = (
  defaultBreeds: DefaultAnimalBreed[],
  customBreeds: CustomAnimalBreed[],
  onChange: () => void,
  filterRef: React.RefObject<ReduxFilterEntity<AnimalsFilterKeys>>,
) => {
  const [filteredDefaultBreeds, setFilteredDefaultBreeds] =
    useState<DefaultAnimalBreed[]>(defaultBreeds);
  const [filteredCustomBreeds, setFilteredCustomBreeds] =
    useState<CustomAnimalBreed[]>(customBreeds);

  const handleChange = (filterKey: string | undefined) => {
    onChange();

    if (filterKey === AnimalsFilterKeys.TYPE) {
      updateVisibleBreeds(filterRef.current!);
    }
  };

  useEffect(() => {
    updateVisibleBreeds(filterRef.current!);
  }, []);

  const updateVisibleBreeds = (currentFilterSelection: ReduxFilterEntity<AnimalsFilterKeys>) => {
    const activeTypeValues = getActiveTypeIds(currentFilterSelection);

    if (activeTypeValues.length === 0) {
      setFilteredDefaultBreeds(defaultBreeds);
      setFilteredCustomBreeds(customBreeds);
      return;
    }

    const updatedDefaultBreeds = defaultBreeds.filter((breed: DefaultAnimalBreed) =>
      activeTypeValues.includes(`${ANIMAL_ID_PREFIX.DEFAULT}_${breed.default_type_id}`),
    );
    const updatedCustomBreeds = customBreeds.filter(
      (breed: CustomAnimalBreed) =>
        activeTypeValues.includes(`${ANIMAL_ID_PREFIX.DEFAULT}_${breed.default_type_id}`) ||
        activeTypeValues.includes(`${ANIMAL_ID_PREFIX.CUSTOM}_${breed.custom_type_id}`),
    );

    setFilteredDefaultBreeds(updatedDefaultBreeds);
    setFilteredCustomBreeds(updatedCustomBreeds);
  };

  return { handleChange, filteredDefaultBreeds, filteredCustomBreeds };
};
