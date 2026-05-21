/*
 *  Copyright 2026 LiteFarm.org
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

import { createSelector } from 'reselect';
import { api } from './apiSlice';
import { AnimalOrBatchKeys } from '../../containers/Animals/types';
import { generateInventoryId } from '../../util/animal';
import { generateSelectOptionLabel } from '../../containers/Animals/utils';

const selectAnimalsResult = api.endpoints.getAnimals.select();
const selectAnimalBatchesResult = api.endpoints.getAnimalBatches.select();

export const animalOptionsSelector = createSelector(
  [selectAnimalsResult, selectAnimalBatchesResult],
  ({ data: animals = [] }, { data: animalBatches = [] }) => [
    ...animals.map((animal) => ({
      value: generateInventoryId(AnimalOrBatchKeys.ANIMAL, animal),
      label: generateSelectOptionLabel(animal),
    })),
    ...animalBatches.map((batch) => ({
      value: generateInventoryId(AnimalOrBatchKeys.BATCH, batch),
      label: generateSelectOptionLabel(batch),
    })),
  ],
);
