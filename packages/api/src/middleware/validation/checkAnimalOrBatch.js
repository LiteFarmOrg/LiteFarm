/*
 *  Copyright (c) 2024 LiteFarm.org
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

import { Model, transaction } from 'objection';
import { handleObjectionError } from '../../util/errorCodes.js';
import { someExists, someTruthy, setFalsyValuesToNull } from '../../util/middleware.js';
import {
  customError,
  checkIsArray,
  checkIdIsNumber,
  checkExactlyOneIsProvided,
  checkRecordBelongsToFarm,
} from '../../util/customErrors.js';

import AnimalModel from '../../models/animalModel.js';
import AnimalBatchModel from '../../models/animalBatchModel.js';
import CustomAnimalTypeModel from '../../models/customAnimalTypeModel.js';
import DefaultAnimalBreedModel from '../../models/defaultAnimalBreedModel.js';
import CustomAnimalBreedModel from '../../models/customAnimalBreedModel.js';
import AnimalUseModel from '../../models/animalUseModel.js';
import AnimalOriginModel from '../../models/animalOriginModel.js';
import AnimalIdentifierType from '../../models/animalIdentifierTypeModel.js';

const AnimalOrBatchModel = {
  animal: AnimalModel,
  batch: AnimalBatchModel,
};

const checkValidAnimalOrBatchIds = async (animalOrBatchKey, ids, farm_id, trx) => {
  if (!ids || !ids.length) {
    throw customError('Must send ids');
  }

  const idsSet = new Set(ids.split(','));

  // Check that all animals/batches exist and belong to the farm
  const invalidIds = [];

  for (const id of idsSet) {
    // For query syntax like ids=,,, which will pass the above check
    checkIdIsNumber(id);

    const existingRecord = await AnimalOrBatchModel[animalOrBatchKey]
      .query(trx)
      .findById(id)
      .where({ farm_id })
      .whereNotDeleted(); // prohibiting re-delete

    if (!existingRecord) {
      invalidIds.push(id);
    }
  }

  if (invalidIds.length) {
    throw customError(
      'Some entities do not exist, are already deleted, or are not associated with the given farm.',
      400,
      { error: 'Invalid ids', invalidIds },
    );
  }
};

// For edit mode set creating to false
const checkAnimalType = async (animalOrBatch, farm_id, creating = true) => {
  const { default_type_id, custom_type_id, type_name } = animalOrBatch;
  const typeKeyOptions = ['default_type_id', 'custom_type_id', 'type_name'];
  // Skip if all undefined or editing (!creating)
  if (creating || someTruthy([default_type_id, custom_type_id, type_name])) {
    checkExactlyOneIsProvided(
      [default_type_id, custom_type_id, type_name],
      'default_type_id, custom_type_id, or type_name',
    );
  }
  if (!creating && someExists(typeKeyOptions, animalOrBatch)) {
    // Overwrite with null in db if editing
    setFalsyValuesToNull(typeKeyOptions, animalOrBatch);
  }
  if (custom_type_id) {
    checkIdIsNumber(custom_type_id);
    const customType = await CustomAnimalTypeModel.query().findById(custom_type_id);
    if (!customType) {
      throw customError('Custom type does not exist');
    }
    await checkRecordBelongsToFarm(customType, farm_id, 'custom type');
  }
};

const checkDefaultBreedMatchesType = async (
  preexistingAnimalOrBatch,
  default_breed_id,
  default_type_id,
) => {
  // One of these two should exist at this point
  let defaultBreedId = default_breed_id;
  let defaultTypeId = default_type_id;

  // If breed or type is not changed get from record
  if (!defaultBreedId && preexistingAnimalOrBatch) {
    defaultBreedId = preexistingAnimalOrBatch.default_breed_id;
  }
  if (!defaultTypeId && preexistingAnimalOrBatch) {
    defaultTypeId = preexistingAnimalOrBatch.default_type_id;
  }

  if (defaultTypeId && defaultBreedId) {
    checkIdIsNumber(defaultBreedId);
    const defaultBreed = await DefaultAnimalBreedModel.query().findById(defaultBreedId);
    if (!defaultBreed) {
      throw customError('Default breed does not exist');
    }
    if (defaultBreed.default_type_id !== defaultTypeId) {
      throw customError('Breed does not match type');
    }
  } else if (!defaultTypeId) {
    throw customError('Default breed must use default type');
  }
};

const checkCustomBreedMatchesType = (
  animalOrBatch,
  preexistingAnimalOrBatch,
  customBreed,
  default_type_id,
  custom_type_id,
) => {
  // customBreed exists at this point
  let defaultTypeId = default_type_id;
  let customTypeId = custom_type_id;
  const typeKeyOptions = ['default_type_id', 'custom_type_id', 'type_name'];

  // If not editing type, check record type
  if (!someExists(typeKeyOptions, animalOrBatch) && preexistingAnimalOrBatch) {
    defaultTypeId = preexistingAnimalOrBatch.default_type_id;
    customTypeId = preexistingAnimalOrBatch.custom_type_id;
  }

  // Custom breed does not match type if defaultId OR customTypeId does not match
  if (
    (customBreed.default_type_id && customBreed.default_type_id !== defaultTypeId) ||
    (customBreed.custom_type_id && customBreed.custom_type_id !== customTypeId)
  ) {
    throw customError('Breed does not match type');
  }
};

const checkAnimalBreed = async (
  animalOrBatch,
  farm_id,
  preexistingAnimalOrBatch = undefined,
  creating = true,
) => {
  const {
    default_breed_id,
    custom_breed_id,
    breed_name,
    default_type_id,
    custom_type_id,
    type_name,
  } = animalOrBatch;
  const breedKeyOptions = ['default_breed_id', 'custom_breed_id', 'breed_name'];
  const typeKeyOptions = ['default_type_id', 'custom_type_id', 'type_name'];

  // Check if breed is present
  if (
    (creating && someExists(breedKeyOptions, animalOrBatch)) ||
    someTruthy([default_breed_id, custom_breed_id, breed_name])
  ) {
    checkExactlyOneIsProvided(
      [default_breed_id, custom_breed_id, breed_name],
      'default_breed_id, custom_breed_id, or breed_name',
    );
  }
  // Check if breed is present
  if (!creating && someExists(breedKeyOptions, animalOrBatch)) {
    // Overwrite with null in db if editing
    setFalsyValuesToNull(breedKeyOptions, animalOrBatch);
  }

  if (
    someExists(breedKeyOptions, animalOrBatch) &&
    !someTruthy([default_breed_id, custom_breed_id, breed_name])
  ) {
    // do nothing if nulling breed
  } else {
    // Check if default breed or default type is present
    if (
      (someExists(breedKeyOptions, animalOrBatch) && default_breed_id) ||
      (someExists(typeKeyOptions, animalOrBatch) && default_type_id)
    ) {
      await checkDefaultBreedMatchesType(
        preexistingAnimalOrBatch,
        default_breed_id,
        default_type_id,
      );
    }
    // Check if custom breed or custom type is present
    if (
      (someExists(breedKeyOptions, animalOrBatch) && custom_breed_id && !type_name) ||
      (someExists(typeKeyOptions, animalOrBatch) &&
        (default_type_id || custom_type_id) &&
        !breed_name)
    ) {
      let customBreed;
      // Find customBreed if exists
      if (someExists(breedKeyOptions, animalOrBatch) && custom_breed_id) {
        checkIdIsNumber(custom_breed_id);
        customBreed = await CustomAnimalBreedModel.query()
          .whereNotDeleted()
          .findById(custom_breed_id);
        if (!customBreed) {
          throw customError('Custom breed does not exist');
        }
      } else if (preexistingAnimalOrBatch?.custom_breed_id) {
        checkIdIsNumber(preexistingAnimalOrBatch?.custom_breed_id);
        customBreed = await CustomAnimalBreedModel.query()
          .whereNotDeleted()
          .findById(preexistingAnimalOrBatch.custom_breed_id);
        if (!customBreed) {
          // This should not be possible
          throw customError('Custom breed does not exist');
        }
      }
      // Check custom breed if exists
      if (customBreed) {
        await checkRecordBelongsToFarm(customBreed, farm_id, 'custom breed');
        checkCustomBreedMatchesType(
          animalOrBatch,
          preexistingAnimalOrBatch,
          customBreed,
          default_type_id,
          custom_type_id,
        );
      }
    }
  }
};

const checkAnimalSexDetail = async (
  animalOrBatch,
  animalOrBatchKey,
  preexistingAnimalOrBatch = undefined,
) => {
  if (animalOrBatchKey === 'batch') {
    const count = animalOrBatch.count ?? preexistingAnimalOrBatch?.count;
    const sexDetail = animalOrBatch.sex_detail ?? preexistingAnimalOrBatch?.sex_detail;
    if (sexDetail?.length) {
      const sexCount = sexDetail.reduce((sum, detail) => sum + detail.count, 0);
      const sexIdSet = new Set(sexDetail.map((detail) => detail.sex_id));
      if (sexCount > count) {
        throw customError('Batch count must be greater than or equal to sex detail count');
      }
      if (sexDetail.length != sexIdSet.size) {
        throw customError('Duplicate sex ids in detail');
      }
    }
  }
};

const checkOtherUseRelationshipNotes = async (relationships) => {
  const otherUse = await AnimalUseModel.query().where({ key: 'OTHER' }).first();

  for (const relationship of relationships) {
    if (relationship.use_id != otherUse.id && relationship.other_use) {
      throw customError('other_use notes is for other use type');
    }
  }
};

const checkAnimalUseRelationship = async (animalOrBatch, animalOrBatchKey) => {
  const relationshipsKey =
    animalOrBatchKey === 'batch' ? 'animal_batch_use_relationships' : 'animal_use_relationships';

  if (animalOrBatch[relationshipsKey]) {
    checkIsArray(animalOrBatch[relationshipsKey], relationshipsKey);
    await checkOtherUseRelationshipNotes(animalOrBatch[relationshipsKey]);
  }
};

const checkAnimalOrigin = async (animalOrBatch, creating = true) => {
  const { origin_id, brought_in_date } = animalOrBatch;
  if (someExists(['origin_id', 'brought_in_date'], animalOrBatch)) {
    const broughtInOrigin = await AnimalOriginModel.query().where({ key: 'BROUGHT_IN' }).first();
    // Overwrite date with null in db if editing origin_id
    if (!creating && origin_id != broughtInOrigin.id) {
      setFalsyValuesToNull(['brought_in_date'], animalOrBatch);
    }

    if (origin_id != broughtInOrigin.id && brought_in_date) {
      throw customError('Brought in date must be used with brought in origin');
    }
  }
};

const checkAnimalIdentifier = async (animalOrBatch, animalOrBatchKey, creating = true) => {
  if (animalOrBatchKey === 'animal') {
    const { identifier_type_id, identifier_type_other } = animalOrBatch;
    if (someExists(['identifier_type_id', 'identifier_type_other'], animalOrBatch)) {
      const otherIdentifier = await AnimalIdentifierType.query().where({ key: 'OTHER' }).first();
      // Overwrite date with null in db if editing origin_id
      if (!creating && identifier_type_id != otherIdentifier.id) {
        setFalsyValuesToNull(['identifier_type_other'], animalOrBatch);
      }

      if (identifier_type_id != otherIdentifier.id && identifier_type_other) {
        throw customError('Other identifier notes must be used with "other" identifier');
      }
    }
  }
};

const checkAndAddCustomTypesOrBreeds = (
  animalOrBatch,
  newTypesSet,
  newBreedsSet,
  preexistingAnimalOrBatch = undefined,
) => {
  const {
    type_name,
    breed_name,
    custom_type_id,
    default_type_id,
    default_breed_id,
    custom_breed_id,
  } = animalOrBatch;
  if (type_name) {
    let defaultBreedId = default_breed_id;
    let customBreedId = custom_breed_id;

    if (
      !someExists(['default_breed_id', 'custom_breed_id'], animalOrBatch) &&
      preexistingAnimalOrBatch
    ) {
      defaultBreedId = preexistingAnimalOrBatch.default_breed_id;
      customBreedId = preexistingAnimalOrBatch.custom_breed_id;
    }

    if (defaultBreedId || customBreedId) {
      throw customError('Cannot create a new type associated with an existing breed');
    }
    newTypesSet.add(type_name);
  }

  // newBreedsSet will be used to check if the combination of type + breed exists in DB.
  // skip the process if the type is new (= type_name is passed)
  if (!type_name && breed_name) {
    let defaultTypeId = default_type_id;
    let customTypeId = custom_type_id;

    if (
      !someExists(['default_type_id', 'custom_type_id'], animalOrBatch) &&
      preexistingAnimalOrBatch
    ) {
      defaultTypeId = preexistingAnimalOrBatch.default_type_id;
      customTypeId = preexistingAnimalOrBatch.custom_type_id;
    }

    const breedDetails = customTypeId
      ? `custom_type_id/${customTypeId}/${breed_name}`
      : `default_type_id/${defaultTypeId}/${breed_name}`;

    newBreedsSet.add(breedDetails);
  }
};

const checkRemovalDataProvided = (animalOrBatch) => {
  const { animal_removal_reason_id, removal_date } = animalOrBatch;
  if (!animal_removal_reason_id || !removal_date) {
    throw customError('Must send reason and date of removal');
  }
};

const getRecordIfExists = async (animalOrBatch, animalOrBatchKey, farm_id) => {
  const relations =
    animalOrBatchKey === 'batch'
      ? {
          group_ids: true,
          sex_detail: true,
          animal_batch_use_relationships: true,
        }
      : {
          group_ids: true,
          animal_use_relationships: true,
        };
  return await AnimalOrBatchModel[animalOrBatchKey]
    .query()
    .findById(animalOrBatch.id)
    .where({ farm_id, animal_removal_reason_id: null })
    .whereNotDeleted()
    .withGraphFetched(relations);
};

// Post loop checks
const checkCustomTypeAndBreedConflicts = async (newTypesSet, newBreedsSet, farm_id, trx) => {
  if (newTypesSet.size) {
    const record = await CustomAnimalTypeModel.getTypesByFarmAndTypes(
      farm_id,
      [...newTypesSet],
      trx,
    );

    if (record.length) {
      throw customError('Animal type already exists', 409);
    }
  }

  if (newBreedsSet.size) {
    const typeBreedPairs = [...newBreedsSet].map((breed) => breed.split('/'));
    const record = await CustomAnimalBreedModel.getBreedsByFarmAndTypeBreedPairs(
      farm_id,
      typeBreedPairs,
      trx,
    );

    if (record.length) {
      throw customError('Animal breed already exists', 409);
    }
  }
};

const checkInvalidIds = async (invalidIds) => {
  if (invalidIds.length) {
    throw customError(
      'Some animals or batches do not exist or are not associated with the given farm.',
      400,
      { error: 'Invalid ids', invalidIds },
    );
  }
};

export async function checkDateWithTaskDueDate(animalOrBatch, animalOrBatchKey) {
  const { id, birth_date, brought_in_date } = animalOrBatch;

  if (!birth_date && !brought_in_date) {
    return;
  }

  const oldestDueDateTask = await AnimalOrBatchModel[animalOrBatchKey]
    .relatedQuery('tasks')
    .select('due_date')
    .for(id)
    .whereNotDeleted()
    .orderBy('due_date', 'asc')
    .first();

  // return if no associated tasks
  if (!oldestDueDateTask?.due_date) {
    return;
  }

  const dueDate = new Date(oldestDueDateTask.due_date);
  const dueDateAtMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  for (const item of [birth_date, brought_in_date].filter(Boolean)) {
    const date = new Date(item);
    const dateAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (dueDateAtMidnight < dateAtMidnight) {
      throw customError(
        `Birth and brought-in dates must be on or before associated tasks' due dates`,
      );
    }
  }
}

export function checkCreateAnimalOrBatch(animalOrBatchKey) {
  return async (req, res, next) => {
    const trx = await transaction.start(Model.knex());

    try {
      const { farm_id } = req.headers;
      const newTypesSet = new Set();
      const newBreedsSet = new Set();

      checkIsArray(req.body, 'Request body');

      for (const animalOrBatch of req.body) {
        const { type_name, breed_name } = animalOrBatch;

        await checkAnimalType(animalOrBatch, farm_id);
        await checkAnimalBreed(animalOrBatch, farm_id);
        await checkAnimalSexDetail(animalOrBatch, animalOrBatchKey);
        await checkAnimalUseRelationship(animalOrBatch, animalOrBatchKey);
        await checkAnimalOrigin(animalOrBatch);
        await checkAnimalIdentifier(animalOrBatch, animalOrBatchKey);

        // Skip the process if type_name and breed_name are not passed
        if (!type_name && !breed_name) {
          continue;
        }
        checkAndAddCustomTypesOrBreeds(animalOrBatch, newTypesSet, newBreedsSet);
      }

      await checkCustomTypeAndBreedConflicts(newTypesSet, newBreedsSet, farm_id, trx);

      await trx.commit();
      next();
    } catch (error) {
      if (error.type === 'LiteFarmCustom') {
        console.error(error);
        await trx.rollback();
        return error.body
          ? res.status(error.code).json({ body: error.body })
          : res.status(error.code).send(error.message);
      } else {
        handleObjectionError(error, res, trx);
      }
    }
  };
}

export function checkEditAnimalOrBatch(animalOrBatchKey) {
  return async (req, res, next) => {
    const trx = await transaction.start(Model.knex());
    try {
      const { farm_id } = req.headers;
      const newTypesSet = new Set();
      const newBreedsSet = new Set();

      checkIsArray(req.body, 'Request body');
      // Check that all animals exist and belong to the farm
      // Done in its own loop to provide a list of all invalid ids
      const invalidIds = [];

      for (const animalOrBatch of req.body) {
        const { type_name, breed_name } = animalOrBatch;
        checkIdIsNumber(animalOrBatch.id);
        const preexistingAnimalOrBatch = await getRecordIfExists(
          animalOrBatch,
          animalOrBatchKey,
          farm_id,
        );
        if (!preexistingAnimalOrBatch) {
          invalidIds.push(animalOrBatch.id);
          continue;
        }

        await checkAnimalType(animalOrBatch, farm_id, false);
        await checkAnimalBreed(animalOrBatch, farm_id, preexistingAnimalOrBatch, false);
        await checkAnimalSexDetail(animalOrBatch, animalOrBatchKey, preexistingAnimalOrBatch);
        await checkAnimalUseRelationship(animalOrBatch, animalOrBatchKey);
        await checkAnimalOrigin(animalOrBatch, false);
        await checkAnimalIdentifier(animalOrBatch, animalOrBatchKey, false);
        await checkDateWithTaskDueDate(animalOrBatch, animalOrBatchKey);

        // Skip the process if type_name and breed_name are not passed
        if (!type_name && !breed_name) {
          continue;
        }
        checkAndAddCustomTypesOrBreeds(
          animalOrBatch,
          newTypesSet,
          newBreedsSet,
          preexistingAnimalOrBatch,
        );
      }

      await checkInvalidIds(invalidIds);

      await checkCustomTypeAndBreedConflicts(newTypesSet, newBreedsSet, farm_id, trx);

      await trx.commit();
      next();
    } catch (error) {
      if (error.type === 'LiteFarmCustom') {
        console.error(error);
        await trx.rollback();
        return error.body
          ? res.status(error.code).json({ ...error.body, message: error.message })
          : res.status(error.code).send(error.message);
      } else {
        handleObjectionError(error, res, trx);
      }
    }
  };
}

export function checkRemoveAnimalOrBatch(animalOrBatchKey) {
  return async (req, res, next) => {
    try {
      const { farm_id } = req.headers;

      checkIsArray(req.body, 'Request body');
      // Check that all animals exist and belong to the farm
      // Done in its own loop to provide a list of all invalid ids
      const invalidIds = [];
      const removalDatesSet = new Set();

      for (const animalOrBatch of req.body) {
        checkRemovalDataProvided(animalOrBatch);

        checkIdIsNumber(animalOrBatch.id);
        const preexistingAnimalOrBatch = await getRecordIfExists(
          animalOrBatch,
          animalOrBatchKey,
          farm_id,
        );
        if (!preexistingAnimalOrBatch) {
          invalidIds.push(animalOrBatch.id);
        }
        removalDatesSet.add(animalOrBatch.removal_date);
      }

      await checkInvalidIds(invalidIds);

      // Assumption: All removal_date values are identical.
      // This check ensures that if this assumption ever changes, it triggers an error.
      // If the error is triggered, re-implement handleIncompleteTasksForAnimalsAndBatches to handle multiple dates.
      if (removalDatesSet.size > 1) {
        throw customError('removal_date is expected to be the same in all animals/batches');
      }

      next();
    } catch (error) {
      if (error.type === 'LiteFarmCustom') {
        console.error(error);
        return error.body
          ? res.status(error.code).json({ ...error.body, message: error.message })
          : res.status(error.code).send(error.message);
      } else {
        console.error(error);
        return res.status(500).json({
          error,
        });
      }
    }
  };
}

// Check animals or batches with completed and abandoned tasks
const checkAnimalsOrBatchesWithFinalizedTasks = async (animalOrBatchKey, ids, trx) => {
  const getAnimalOrBatchIdsWithFinalizedTasks =
    animalOrBatchKey === 'animal'
      ? AnimalModel.getAnimalIdsWithFinalizedTasks
      : AnimalBatchModel.getBatchIdsWithFinalizedTasks;

  const animalsOrBatches = await getAnimalOrBatchIdsWithFinalizedTasks(trx, [
    ...new Set(ids.split(',').map((id) => +id)),
  ]);

  for (const { tasks } of animalsOrBatches) {
    if (tasks.length) {
      throw customError('Animals with completed or abandoned tasks cannot be deleted');
    }
  }
};

/**
 * Middleware function to check if the provided animal entities exist and belong to the farm. The IDs must be passed as a comma-separated query string.
 *
 * @param {String} animalOrBatchKey - The key to choose a database model for the correct animal entity
 * @returns {Function} - Express middleware function
 *
 * @example
 * router.delete(
 *   '/',
 *   checkScope(['delete:animals']),
 *   checkDeleteAnimalOrBatch('animal'),
 *   AnimalController.deleteAnimals(),
 * );
 *
 */
export function checkDeleteAnimalOrBatch(animalOrBatchKey) {
  return async (req, res, next) => {
    const trx = await transaction.start(Model.knex());

    try {
      const { farm_id } = req.headers;
      const { ids, date } = req.query;

      if (!date) {
        throw customError('Must send date');
      }
      await checkValidAnimalOrBatchIds(animalOrBatchKey, ids, farm_id, trx);
      await checkAnimalsOrBatchesWithFinalizedTasks(animalOrBatchKey, ids, trx);

      await trx.commit();
      next();
    } catch (error) {
      if (error.type === 'LiteFarmCustom') {
        console.error(error);
        await trx.rollback();
        return error.body
          ? res.status(error.code).json({ ...error.body, message: error.message })
          : res.status(error.code).send(error.message);
      } else {
        handleObjectionError(error, res, trx);
      }
    }
  };
}
