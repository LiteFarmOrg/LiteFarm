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
import type { FilterState } from '../types';
import { AnimalsFilterKeys } from './types';
import type { DefaultAnimalBreed, CustomAnimalBreed } from '../../../store/api/types';
import { getActiveTypeIds } from './utils';
import { ANIMAL_ID_PREFIX } from '../../Animals/types';
import { useSelector } from 'react-redux';
import { animalsFilterSelector } from '../../filterSlice';

/**
 * Custom hook to manage visible breeds based on the selected animal types
 *
 * @param {DefaultAnimalBreed[]} defaultBreeds - Array of all default animal breeds.
 * @param {CustomAnimalBreed[]} customBreeds - Array of all custom animal breeds.
 *
 * @returns {Object} Object containing the following properties:
 * - handleChange: Enriched function to be called when the filter changes.
 * - filteredDefaultBreeds: Array of filtered default animal breeds.
 * - filteredCustomBreeds: Array of filtered custom animal breeds.
 */
export const useVisibleBreeds = (
  defaultBreeds: DefaultAnimalBreed[],
  customBreeds: CustomAnimalBreed[],
) => {
  const [filteredDefaultBreeds, setFilteredDefaultBreeds] =
    useState<DefaultAnimalBreed[]>(defaultBreeds);
  const [filteredCustomBreeds, setFilteredCustomBreeds] =
    useState<CustomAnimalBreed[]>(customBreeds);

  const animalsFilter = useSelector(animalsFilterSelector);

  const handleBreedsChange = (filterKey: string | undefined, filterState: FilterState) => {
    if (filterKey === AnimalsFilterKeys.TYPE) {
      updateVisibleBreeds(filterState);
    }
  };

  useEffect(() => {
    updateVisibleBreeds(animalsFilter[AnimalsFilterKeys.TYPE]);
  }, [animalsFilter]);

  const updateVisibleBreeds = (currentTypeFilterSelection: FilterState) => {
    const activeTypeValues = getActiveTypeIds(currentTypeFilterSelection);

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

  return { handleBreedsChange, filteredDefaultBreeds, filteredCustomBreeds };
};
