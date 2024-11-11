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

import knex from './knex.js';
import baseController from '../controllers/baseController.js';
import CustomAnimalBreedModel from '../models/customAnimalBreedModel.js';
import CustomAnimalTypeModel from '../models/customAnimalTypeModel.js';
import AnimalGroupModel from '../models/animalGroupModel.js';
import { checkAndTrimString } from './util.js';
import AnimalModel from '../models/animalModel.js';
import AnimalBatchModel from '../models/animalBatchModel.js';
import { checkIsArray, customError } from './customErrors.js';

export const ANIMAL_TASKS = ['animal_movement_task'];

/**
 * Assigns internal identifiers to records.
 * @param {Array<Object>} records - The array of animals or animal batches to which internal identifiers will be assigned.
 *                                  Each record is expected to contain an 'id' property.
 * @param {string} kind - The kind of records being processed ('animal' or 'batch').
 */
export const assignInternalIdentifiers = async (records, kind) => {
  await Promise.all(
    records.map(async (record) => {
      const [internalIdentifier] = await knex('animal_union_batch_id_view')
        .pluck('internal_identifier')
        .where('id', record.id)
        .andWhere({ batch: kind === 'batch' });

      record.internal_identifier = internalIdentifier;
    }),
  );
};

/**
 * Asynchronously checks if the given animal or batch has a type or breed already stored in the database.
 * If not, it adds the type and/or breed to the database, updates the corresponding IDs, and removes
 * the type_name or breed_name properties from the animal or batch object.
 *
 * @param {Object} req - The request object, containing the body with type and breed maps.
 * @param {Object} animalOrBatch - The animal or batch object that contains type_name or breed_name properties.
 * @param {number} farm_id - The ID of the farm to associate with the type or breed.
 * @param {Object} trx - A transaction object for performing the database operations within a transaction.
 *
 * @returns {Promise<void>} - A promise that resolves when the type and breed IDs have been added/updated and the object has been modified.
 *
 * @throws {Error} - If any database operation fails.
 */
export const checkAndAddCustomTypeAndBreed = async (
  req,
  typeIdsMap,
  typeBreedIdsMap,
  animalOrBatch,
  farm_id,
  trx,
) => {
  // Avoid attempts to add an already created type or breed to the DB
  // where multiple animals have the same type_name or breed_name

  if (animalOrBatch.type_name) {
    let typeId = typeIdsMap[animalOrBatch.type_name];

    if (!typeId) {
      const newType = await baseController.postWithResponse(
        CustomAnimalTypeModel,
        { type: animalOrBatch.type_name, farm_id },
        req,
        { trx },
      );
      typeId = newType.id;
      typeIdsMap[animalOrBatch.type_name] = typeId;
    }
    animalOrBatch.custom_type_id = typeId;
    delete animalOrBatch.type_name;
  }

  if (animalOrBatch.breed_name) {
    const typeColumn = animalOrBatch.default_type_id ? 'default_type_id' : 'custom_type_id';
    const typeId = animalOrBatch.type_name
      ? typeIdsMap[animalOrBatch.type_name]
      : animalOrBatch.default_type_id || animalOrBatch.custom_type_id;
    const typeBreedKey = `${typeColumn}_${typeId}_${animalOrBatch.breed_name}`;
    let breedId = typeBreedIdsMap[typeBreedKey];

    if (!breedId) {
      const newBreed = await baseController.postWithResponse(
        CustomAnimalBreedModel,
        { farm_id, [typeColumn]: typeId, breed: animalOrBatch.breed_name },
        req,
        { trx },
      );
      breedId = newBreed.id;
      typeBreedIdsMap[typeBreedKey] = breedId;
    }
    animalOrBatch.custom_breed_id = breedId;
    delete animalOrBatch.breed_name;
  }
};

/**
 * Asynchronously checks if the specified group exists in the database for the given farm.
 * If the group doesn't exist, it creates a new group and associates it with the animal or batch.
 * The function then adds the group ID to the `group_ids` property of the animal or batch object and removes the `group_name` property.
 *
 * @param {Object} req - The request object.
 * @param {Object} animalOrBatch - The animal or batch object that contains a group_name property.
 * @param {number} farm_id - The ID of the farm to associate with the group.
 * @param {Object} trx - A transaction object for performing the database operations within a transaction.
 *
 * @returns {Promise<void>} - A promise that resolves when the group has been added or found and the object has been modified.
 *
 * @throws {Error} - If any database operation fails.
 */
export const upsertGroup = async (req, animalOrBatch, farm_id, trx) => {
  const groupName = checkAndTrimString(animalOrBatch.group_name);
  delete animalOrBatch.group_name;

  if (groupName) {
    let group = await baseController.existsInTable(trx, AnimalGroupModel, {
      name: groupName,
      farm_id,
      deleted: false,
    });

    if (!group) {
      group = await baseController.postWithResponse(
        AnimalGroupModel,
        { name: groupName, farm_id },
        req,
        { trx },
      );
    }
    // Frontend only allows addition of one group at a time
    // TODO: handle multiple group additions
    animalOrBatch.group_ids = [{ animal_group_id: group.id }];
  }
};

const getInvalidAnimalOrBatchIds = async (idsSet, model, farmId) => {
  if (!idsSet.size) {
    return [];
  }

  const invalidIdsSet = new Set(idsSet); // create a copy
  const records = await model
    .query()
    .select('id')
    .where({ farm_id: farmId, removal_date: null })
    .whereIn('id', [...idsSet])
    .whereNotDeleted();

  records?.forEach(({ id }) => invalidIdsSet.delete(id));

  return [...invalidIdsSet];
};

export const checkAnimalAndBatchIds = async (animalIds, batchIds, farmId, isRequired) => {
  if (animalIds) {
    checkIsArray(animalIds, 'animalIds');
  }
  if (batchIds) {
    checkIsArray(batchIds, 'batchIds');
  }

  const animalIdsSet = new Set(animalIds);
  const batchIdsSet = new Set(batchIds);

  if (isRequired && !animalIdsSet.size && !batchIdsSet.size) {
    throw customError('At least one of the animal IDs or animal batch IDs is required');
  }

  const invalidAnimalIds = await getInvalidAnimalOrBatchIds(animalIdsSet, AnimalModel, farmId);
  const invalidBatchIds = await getInvalidAnimalOrBatchIds(batchIdsSet, AnimalBatchModel, farmId);

  if (invalidAnimalIds.length || invalidBatchIds.length) {
    throw customError(
      'Some animal IDs or animal batch IDs do not exist, are removed, or are not associated with the given farm.',
      400,
      { invalidAnimalIds, invalidBatchIds },
    );
  }
};

export async function isOnOrAfterBirthAndBroughtInDates(date, animalIds, batchIds) {
  const animalDates = await AnimalModel.query()
    .select('birth_date', 'brought_in_date')
    .whereIn('id', [...new Set(animalIds)]);
  const batchDates = await AnimalBatchModel.query()
    .select('birth_date', 'brought_in_date')
    .whereIn('id', [...new Set(batchIds)]);

  const birthAndBroughtInDatesSet = new Set();
  [...animalDates, ...batchDates].forEach(({ birth_date, brought_in_date }) => {
    birth_date && birthAndBroughtInDatesSet.add(birth_date);
    brought_in_date && birthAndBroughtInDatesSet.add(brought_in_date);
  });

  if (birthAndBroughtInDatesSet.size) {
    const [y, m, d] = date.split('-');
    const dateTimestamp = new Date(y, m - 1, d);

    for (const dateToCompre of birthAndBroughtInDatesSet) {
      const broughtInOrBirthdate = new Date(
        dateToCompre.getFullYear(),
        dateToCompre.getMonth(),
        dateToCompre.getDate(),
      );

      if (dateTimestamp < broughtInOrBirthdate) {
        return false;
      }
    }
  }

  return true;
}
