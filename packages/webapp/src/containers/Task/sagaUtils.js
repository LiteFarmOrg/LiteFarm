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

import { parseInventoryId } from '../../util/animal';
import { getPostTaskBody } from './saga';

export const getEndpoint = (isCustomTask, taskTranslationKey) => {
  if (isCustomTask) {
    return 'custom_task';
  }
  const endpoints = {
    HARVEST_TASK: 'harvest_tasks',
    MOVEMENT_TASK: 'animal_movement_task',
  };
  return endpoints[taskTranslationKey] || taskTranslationKey.toLowerCase();
};

export const formatAnimalIdsForReqBody = (ids) => {
  if (!ids) {
    return {};
  }

  const animalIds = [];
  const batchIds = [];

  ids.forEach((inventoryId) => {
    const { kind, id } = parseInventoryId(inventoryId);
    (kind === 'ANIMAL' ? animalIds : batchIds).push(id);
  });

  return { related_animal_ids: animalIds, related_batch_ids: batchIds };
};

export const formatAnimalTask = (data, endpoint) => {
  const { animalIds, managementPlans, ...formattedData } = getPostTaskBody(data, endpoint);

  // Remove managementPlans from the data and format animalIds for the request body
  return { ...formattedData, ...formatAnimalIdsForReqBody(animalIds) };
};

export const formatMovementTask = (movementTask) => {
  if (!movementTask || !('purpose' in movementTask)) {
    return { animal_movement_task: {} };
  }

  const { purpose, other_purpose_explanation } = movementTask;
  const purposeIds = purpose.map(({ value }) => value);

  return {
    animal_movement_task: { purpose_ids: purposeIds, other_purpose: other_purpose_explanation },
  };
};

export const getMovementTaskBody = (data, endpoint) => {
  const { movement_task, ...formattedData } = formatAnimalTask(data, endpoint);
  return { ...formattedData, ...formatMovementTask(movement_task) };
};
