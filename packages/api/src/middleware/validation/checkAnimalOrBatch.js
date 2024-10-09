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
import { oneExists, setFalsyValuesToNull } from '../../util/middleware.js';
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

// For edit mode set required to false
const checkAnimalType = async (animalOrBatch, farm_id, creating = true) => {
  const { default_type_id, custom_type_id, type_name } = animalOrBatch;
  const typeKeyOptions = ['default_type_id', 'custom_type_id', 'type_name'];
  // Skip if all undefined or !creating (editing)
  if (creating || oneExists(typeKeyOptions, animalOrBatch)) {
    checkExactlyOneIsProvided(
      [default_type_id, custom_type_id, type_name],
      'default_type_id, custom_type_id, or type_name',
    );
    if (!creating) {
      // Overwrite with null in db if editing
      setFalsyValuesToNull(typeKeyOptions, animalOrBatch);
    }
    if (custom_type_id) {
      const customType = await CustomAnimalTypeModel.query().findById(custom_type_id);
      if (!customType) {
        // TODO: new error add test
        throw customError('Custom type does not exist');
      }
      await checkRecordBelongsToFarm(customType, farm_id, 'custom type');
    }
    if (type_name) {
      // TODO: Check type_name does not already exist or replace custom type id?
    }
  }
};

const checkDefaultBreedMatchesType = async (
  animalOrBatchRecord,
  default_breed_id,
  default_type_id,
) => {
  // One of these two should exist at this point
  let defaultBreedId = default_breed_id;
  let defaultTypeId = default_type_id;

  // If breed or type is not changed get from record
  if (!defaultBreedId && animalOrBatchRecord) {
    defaultBreedId = animalOrBatchRecord.default_breed_id;
  }
  if (!defaultTypeId && animalOrBatchRecord) {
    defaultTypeId = animalOrBatchRecord.default_type_id;
  }

  if (defaultTypeId && defaultBreedId) {
    const defaultBreed = await DefaultAnimalBreedModel.query().findById(defaultBreedId);
    if (defaultBreed && defaultBreed.default_type_id !== defaultTypeId) {
      throw customError('Breed does not match type');
    }
  } else if (!defaultTypeId) {
    // TODO: new error untested should prevents need for pre-existing checkDefaultBreedDoesNotUseCustomType
    throw customError('Default breed must use default type');
  }
};

const checkCustomBreedMatchesType = async (
  animalOrBatch,
  animalOrBatchRecord,
  customBreed,
  default_type_id,
  custom_type_id,
) => {
  // customBreed exists at this point
  let defaultTypeId = default_type_id;
  let customTypeId = custom_type_id;
  const typeKeyOptions = ['default_type_id', 'custom_type_id', 'type_name'];

  // If not editing type, check record type
  if (!oneExists(typeKeyOptions, animalOrBatch) && animalOrBatchRecord) {
    defaultTypeId = animalOrBatchRecord.default_type_id;
    customTypeId = animalOrBatchRecord.custom_type_id;
  }

  if (customBreed.default_type_id && customBreed.default_type_id !== defaultTypeId) {
    throw customError('Breed does not match type');
  }

  if (customBreed.custom_type_id && customBreed.custom_type_id !== customTypeId) {
    throw customError('Breed does not match type');
  }
};

const checkAnimalBreed = async (
  animalOrBatch,
  farm_id,
  animalOrBatchRecord = undefined,
  creating = true,
) => {
  const {
    default_breed_id,
    custom_breed_id,
    breed_name,
    default_type_id,
    custom_type_id,
  } = animalOrBatch;
  const breedKeyOptions = ['default_breed_id', 'custom_breed_id', 'breed_name'];
  const typeKeyOptions = ['default_type_id', 'custom_type_id', 'type_name'];
  // Skip if all undefined
  if (oneExists(breedKeyOptions, animalOrBatch)) {
    checkExactlyOneIsProvided(
      [default_breed_id, custom_breed_id, breed_name],
      'default_breed_id, custom_breed_id, or breed_name',
    );
    if (!creating) {
      // Overwrite with null in db if editing
      setFalsyValuesToNull(breedKeyOptions, animalOrBatch);
    }
  }
  // Check if default breed or default type is present
  if (
    (oneExists(breedKeyOptions, animalOrBatch) && default_breed_id) ||
    (oneExists(typeKeyOptions, animalOrBatch) && default_type_id)
  ) {
    await checkDefaultBreedMatchesType(animalOrBatchRecord, default_breed_id, default_type_id);
  }
  // Check if custom breed or custom type is present
  if (
    (oneExists(breedKeyOptions, animalOrBatch) && custom_breed_id) ||
    (oneExists(typeKeyOptions, animalOrBatch) && (default_type_id || custom_type_id))
  ) {
    let customBreed;
    // Find customBreed if exists
    if (custom_breed_id) {
      customBreed = await CustomAnimalBreedModel.query()
        .whereNotDeleted()
        .findById(custom_breed_id);
      if (!customBreed) {
        // TODO : new error add test
        throw customError('Custom breed does not exist');
      }
    } else if (animalOrBatchRecord?.custom_breed_id) {
      customBreed = await CustomAnimalBreedModel.query()
        .whereNotDeleted()
        .findById(animalOrBatchRecord.custom_breed_id);
    }
    // Check custom breed if exists
    if (customBreed) {
      await checkRecordBelongsToFarm(customBreed, farm_id, 'custom breed');
      await checkCustomBreedMatchesType(
        animalOrBatch,
        animalOrBatchRecord,
        customBreed,
        default_type_id,
        custom_type_id,
      );
    }
  }
  if (breed_name) {
    // TODO: Check breed_name does not already exist or replace custom type id?
  }
};

const checkBatchSexDetail = async (
  animalOrBatch,
  animalOrBatchKey,
  animalOrBatchRecord = undefined,
) => {
  if (animalOrBatchKey === 'batch') {
    let count = animalOrBatch.count;
    let sexDetail = animalOrBatch.sex_detail;
    if (!count) {
      count = animalOrBatchRecord.count;
    }
    if (!sexDetail) {
      sexDetail = animalOrBatchRecord.sex_detail;
    }
    if (sexDetail?.length) {
      let sexCount = 0;
      const sexIdSet = new Set();
      sexDetail.forEach((detail) => {
        sexCount += detail.count;
        sexIdSet.add(detail.sex_id);
      });
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
    // TODO: Add test what happens when editing use (must all pre-existing be provided?)
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
    checkOtherUseRelationshipNotes(animalOrBatch[relationshipsKey]);
  }
};

const checkAnimalOrigin = async (animalOrBatch, creating = true) => {
  const { origin_id, brought_in_date } = animalOrBatch;
  if (oneExists(['origin_id', 'brought_in_date'], animalOrBatch)) {
    if (!creating) {
      // Overwrite with null in db if editing
      setFalsyValuesToNull(['origin_id', 'brought_in_date'], animalOrBatch);
    }
    const broughtInOrigin = await AnimalOriginModel.query().where({ key: 'BROUGHT_IN' }).first();
    if (origin_id != broughtInOrigin.id && brought_in_date) {
      // TODO: Add new test supplying either origin or brought in date
      throw customError('Brought in date must be used with brought in origin');
    }
  }
};

const checkAndAddCustomTypesOrBreeds = (animalOrBatch, newTypesSet, newBreedsSet) => {
  const {
    type_name,
    breed_name,
    custom_type_id,
    default_type_id,
    default_breed_id,
    custom_breed_id,
  } = animalOrBatch;
  if (type_name) {
    if (default_breed_id || custom_breed_id) {
      throw customError('Cannot create a new type associated with an existing breed');
    }
    newTypesSet.add(type_name);
  }

  // newBreedsSet will be used to check if the combination of type + breed exists in DB.
  // skip the process if the type is new (= type_name is passed)
  if (!type_name && breed_name) {
    const breedDetails = custom_type_id
      ? `custom_type_id/${custom_type_id}/${breed_name}`
      : `default_type_id/${default_type_id}/${breed_name}`;

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
  return await AnimalOrBatchModel[animalOrBatchKey]
    .query()
    .findById(animalOrBatch.id)
    .where({ farm_id })
    .whereNotDeleted();
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

export function checkCreateAnimalOrBatch(animalOrBatchKey) {
  return async (req, res, next) => {
    const trx = await transaction.start(Model.knex());

    try {
      const { farm_id } = req.headers;
      const newTypesSet = new Set();
      const newBreedsSet = new Set();

      for (const animalOrBatch of req.body) {
        const { type_name, breed_name } = animalOrBatch;

        await checkAnimalType(animalOrBatch, farm_id);
        await checkAnimalBreed(animalOrBatch, farm_id);
        await checkBatchSexDetail(animalOrBatch, animalOrBatchKey);
        await checkAnimalUseRelationship(animalOrBatch, animalOrBatchKey);
        await checkAnimalOrigin(animalOrBatch);

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
    try {
      const { farm_id } = req.headers;

      checkIsArray(req.body, 'Request body');
      // Check that all animals exist and belong to the farm
      // Done in its own loop to provide a list of all invalid ids
      const invalidIds = [];

      for (const animalOrBatch of req.body) {
        checkIdIsNumber(animalOrBatch.id);
        const animalOrBatchRecord = await getRecordIfExists(
          animalOrBatch,
          animalOrBatchKey,
          farm_id,
        );
        if (!animalOrBatchRecord) {
          invalidIds.push(animalOrBatch.id);
          continue;
        }

        await checkAnimalType(animalOrBatch, farm_id, false);
        await checkAnimalBreed(animalOrBatch, farm_id, animalOrBatchRecord, false);
        await checkBatchSexDetail(animalOrBatch, animalOrBatchKey, animalOrBatchRecord);
        await checkAnimalUseRelationship(animalOrBatch, animalOrBatchKey);
        await checkAnimalOrigin(animalOrBatch, false);
      }

      //TODO: should this error be actually in loop and not outside?
      await checkInvalidIds(invalidIds);

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

export function checkRemoveAnimalOrBatch(animalOrBatchKey) {
  return async (req, res, next) => {
    try {
      const { farm_id } = req.headers;

      checkIsArray(req.body, 'Request body');
      // Check that all animals exist and belong to the farm
      // Done in its own loop to provide a list of all invalid ids
      const invalidIds = [];

      for (const animalOrBatch of req.body) {
        // Removal specific
        checkRemovalDataProvided(animalOrBatch);

        // From Edit
        checkIdIsNumber(animalOrBatch.id);
        const animalOrBatchRecord = await getRecordIfExists(
          animalOrBatch,
          animalOrBatchKey,
          farm_id,
        );
        if (!animalOrBatchRecord) {
          invalidIds.push(animalOrBatch.id);
          continue;
        }
        // No record should skip this loop
      }

      //TODO: should this error be actually in loop and not outside?
      await checkInvalidIds(invalidIds);
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
      const { ids } = req.query;

      await checkValidAnimalOrBatchIds(animalOrBatchKey, ids, farm_id, trx);

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
