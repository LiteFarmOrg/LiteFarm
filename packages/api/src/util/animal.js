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
 * @param {Object} map - The map object with typeId as keys.
 * @param {Array<Object>} typeCountObjects - Array of objects containing type counts.
 * @param {string} typeIdColumnName - The name of the type id column - 'default_type_id' or 'custom_type_id'.
 * @returns {Promise<Object>} The updated map with type counts.
 * @example
 * // Example usage:
 * const map = { '1': 2 };
 * const typeCountObjects = [
 *   { default_type_id: 1, count: 5 },
 *   { default_type_id: 2, count: 3 },
 *   { default_type_id: 1, count: 2 }
 * ];
 * const typeIdColumnName = 'default_type_id';
 * const updatedMap = await updateMapWithTypeCounts(map, typeCountObjects, typeIdColumnName);
 * console.log(updatedMap);
 *
 * // Example output:
 * // { '1': 9, '2': 3 }
 */
export const updateMapWithTypeCounts = async (map, typeCountObjects, typeIdColumnName) => {
  typeCountObjects.forEach((item) => {
    if (!map[item[typeIdColumnName]]) {
      map[item[typeIdColumnName]] = 0;
    }
    map[item[typeIdColumnName]] += +item.count;
  });

  return map;
};

/**
 * Retrieves data from animal and animal_batch tables and returns a map with type ids as keys and their corresponding counts.
 * @param {string} farmId
 * @param {string} typeIdColumnName - The name of the type id column - 'default_type_id' or 'custom_type_id'.
 * @returns {Promise<Object>} A map with type ids as keys and their corresponding counts.
 */
export const getAnimalTypeCountMap = async (farmId, typeIdColumnName) => {
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
