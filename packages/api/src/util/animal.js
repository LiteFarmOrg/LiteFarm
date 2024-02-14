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

import AnimalModel from '../models/animalModel.js';
import AnimalBatchModel from '../models/animalBatchModel.js';

/**
 * Update the map with type counts.
 * @param {Object} typeIdCountMap - The map object with typeId as keys.
 * @param {Array<Object>} typeIdCountObjects - Array of objects containing type ids and counts.
 * @param {string} typeIdColumnName - The name of the type id column - 'default_type_id' or 'custom_type_id'.
 * @example
 * // Example usage:
 * const typeIdCountMap = { '1': 2 };
 * const typeIdCountObjects = [
 *   { default_type_id: 1, count: 5 },
 *   { default_type_id: 2, count: 3 },
 *   { default_type_id: 1, count: 2 }
 * ];
 * const typeIdColumnName = 'default_type_id';
 * await updateMapWithTypeCounts(map, typeIdCountObjects, typeIdColumnName);
 * console.log(typeIdCountMap);
 *
 * // Example output:
 * // { '1': 9, '2': 3 }
 */
export const updateMapWithTypeCounts = async (
  typeIdCountMap,
  typeIdCountObjects,
  typeIdColumnName,
) => {
  typeIdCountObjects.forEach((typeIdCountObj) => {
    const typeId = typeIdCountObj[typeIdColumnName];
    if (!typeIdCountMap[typeId]) {
      typeIdCountMap[typeId] = 0;
    }
    typeIdCountMap[typeId] += +typeIdCountObj.count;
  });
};

/**
 * Retrieves data from animal and animal_batch tables and returns a map with type ids as keys and their corresponding counts.
 * @param {string} farmId
 * @param {string} typeIdColumnName - The name of the type id column - 'default_type_id' or 'custom_type_id'.
 * @returns {Promise<Object>} A map with type ids as keys and their corresponding counts.
 */
export const getAnimalTypeIdCountMap = async (farmId, typeIdColumnName) => {
  const animals = await AnimalModel.query()
    .select(typeIdColumnName)
    .count()
    .groupBy(typeIdColumnName)
    .where('farm_id', farmId)
    .whereNotDeleted();
  const animalBatches = await AnimalBatchModel.query()
    .select(typeIdColumnName, 'count')
    .where('farm_id', farmId)
    .whereNotDeleted();

  const map = {};
  updateMapWithTypeCounts(map, animals, typeIdColumnName);
  updateMapWithTypeCounts(map, animalBatches, typeIdColumnName);

  return map;
};
