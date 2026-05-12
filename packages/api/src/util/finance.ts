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

import AnimalModel from '../models/animalModel.js';
import AnimalBatchModel from '../models/animalBatchModel.js';

interface AnimalItem {
  animal_id?: number | null;
  animal_batch_id?: number | null;
}

export const getUniqueAnimalAndBatchIds = (items: AnimalItem[], entityName: string) => {
  const animalIdsSet = new Set<number>();
  const batchIdsSet = new Set<number>();

  for (const { animal_id, animal_batch_id } of items) {
    if (!animal_id && !animal_batch_id) {
      throw new Error(`${entityName} item must have either animal_id or animal_batch_id`);
    }
    if (animal_id && animal_batch_id) {
      throw new Error(`cannot have both animal_id and animal_batch_id in same ${entityName} item`);
    }
    if (animal_id) {
      animalIdsSet.add(animal_id);
    }
    if (animal_batch_id) {
      batchIdsSet.add(animal_batch_id);
    }
  }

  return { animalIds: [...animalIdsSet], batchIds: [...batchIdsSet] };
};

export const hasInvalidAnimalIds = async (animalIds: number[], farmId: string) => {
  if (!animalIds.length) {
    return false;
  }
  return !(await AnimalModel.animalsBelongToFarm({ animalIds, farmId, includeRemoved: true }));
};

export const hasInvalidBatchIds = async (batchIds: number[], farmId: string) => {
  if (!batchIds.length) {
    return false;
  }
  return !(await AnimalBatchModel.batchesBelongToFarm({ batchIds, farmId, includeRemoved: true }));
};
