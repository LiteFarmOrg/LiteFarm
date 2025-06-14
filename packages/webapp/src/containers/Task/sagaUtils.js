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

export const getEndpoint = (isCustomTask, taskTranslationKey, isCreatingTask = false) => {
  if (isCustomTask) {
    return 'custom_task';
  }
  const endpoints = {
    HARVEST_TASK: isCreatingTask ? 'harvest_tasks' : 'harvest_task',
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
  const { movement_task, managementPlans, ...formattedData } = getPostTaskBody(data, endpoint);
  // Remove managementPlans from the data
  return { ...formattedData, ...formatMovementTask(movement_task) };
};

export const getCompleteMovementTaskBody = ({ taskData }) => {
  const { movement_task, ...restTaskData } = taskData;

  return {
    ...restTaskData, // completion properties, related_animal_ids, related_batch_ids
    ...formatMovementTask(movement_task),
  };
};

const formatSoilSampleTask = (soilSampleTask) => {
  if (!soilSampleTask) {
    return {};
  }
  const { sample_depths_unit, ...rest } = soilSampleTask;

  return { soil_sample_task: { ...rest, sample_depths_unit: sample_depths_unit.value } };
};

export const getSoilSampleTaskBody = (data, endpoint) => {
  const { soil_sample_task, managementPlans, ...formattedData } = getPostTaskBody(data, endpoint);
  // Remove managementPlans from the data
  return { ...formattedData, ...formatSoilSampleTask(soil_sample_task) };
};

const formatSoilSampleDocuments = (uploadedFiles) => {
  if (!uploadedFiles || !uploadedFiles.length) {
    return {};
  }

  return {
    documents: uploadedFiles.map((file) => ({
      files: [file],
      name: file.file_name,
      no_expiration: true,
      notes: '',
      thumbnail_url: file.thumbnail_url ?? null,
      type: 'SOIL_SAMPLE_RESULTS',
      valid_until: null,
    })),
  };
};

export const getCompleteSoilSampleTaskBody = ({ taskData, uploadedFiles }) => {
  const { soil_sample_task, managementPlans, ...formattedData } = taskData;

  // Remove managementPlans from the data
  return {
    ...formattedData,
    ...formatSoilSampleTask(soil_sample_task),
    ...formatSoilSampleDocuments(uploadedFiles),
  };
};
