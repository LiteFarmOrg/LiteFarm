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

import AnimalModel from '../../models/animalModel.js';
import AnimalBatchModel from '../../models/animalBatchModel.js';
import CustomAnimalTypeModel from '../../models/customAnimalTypeModel.js';
import DefaultAnimalBreedModel from '../../models/defaultAnimalBreedModel.js';
import CustomAnimalBreedModel from '../../models/customAnimalBreedModel.js';
import AnimalUseModel from '../../models/animalUseModel.js';

const AnimalOrBatchModel = {
  animal: AnimalModel,
  batch: AnimalBatchModel,
};

// Utils
const hasMultipleValues = (values) => {
  const nonNullValues = values.filter(Boolean);
  return !(nonNullValues.length === 1);
};

const checkIdExistsAndIsNumber = (id) => {
  if (!id || isNaN(Number(id))) {
    throw newCustomError('Must send valid ids');
  }
};

const newCustomError = (message, code = 400, body = undefined) => {
  const error = new Error(message);
  error.code = code;
  error.body = body;
  error.type = 'LiteFarmCustom';
  return error;
};

// Body checks
const checkIsArray = (array, descriptiveErrorText = '') => {
  if (!Array.isArray(array)) {
    throw newCustomError(`${descriptiveErrorText} should be an array`);
  }
};

const checkValidAnimalOrBatchIds = async (animalOrBatchKey, ids, farm_id, trx) => {
  if (!ids || !ids.length) {
    throw newCustomError('Must send ids');
  }

  const idsSet = new Set(ids.split(','));

  // Check that all animals/batches exist and belong to the farm
  const invalidIds = [];

  for (const id of idsSet) {
    // For query syntax like ids=,,, which will pass the above check
    checkIdExistsAndIsNumber(id);

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
    throw newCustomError(
      'Some entities do not exist, are already deleted, or are not associated with the given farm.',
      400,
      { error: 'Invalid ids', invalidIds },
    );
  }
};

// AnimalOrBatch checks
const checkExactlyOneAnimalTypeProvided = (default_type_id, custom_type_id, type_name) => {
  if (hasMultipleValues([default_type_id, custom_type_id, type_name])) {
    throw newCustomError(
      'Exactly one of default_type_id, custom_type_id, or type_name must be sent',
    );
  }
};

const checkCustomTypeBelongsToFarm = async (custom_type_id, farm_id) => {
  const customType = await CustomAnimalTypeModel.query().findById(custom_type_id);
  if (customType && customType.farm_id !== farm_id) {
    throw newCustomError('Forbidden custom type does not belong to this farm', 403);
  }
};

const checksIfTypeProvided = async (animalOrBatch, farm_id, required = true) => {
  const { default_type_id, custom_type_id, type_name } = animalOrBatch;
  if (default_type_id || custom_type_id || type_name || required) {
    checkExactlyOneAnimalTypeProvided(default_type_id, custom_type_id, type_name);
  }
  if (custom_type_id) {
    await checkCustomTypeBelongsToFarm(custom_type_id, farm_id);
  }
  if (type_name) {
    // Check type_name does not already exist or replace custom type id?
  }
};

const checkExactlyOneAnimalBreedProvided = (default_breed_id, custom_breed_id, breed_name) => {
  if (hasMultipleValues([default_breed_id, custom_breed_id, breed_name])) {
    throw newCustomError(
      'Exactly one of default_breed_id, custom_breed_id and breed_name must be sent',
    );
  }
};

const checksIfBreedProvided = async (animalOrBatch, animalOrBatchKey, farm_id) => {
  const { default_breed_id, custom_breed_id, breed_name, id, default_type_id } = animalOrBatch;
  if (default_breed_id || custom_breed_id || breed_name) {
    checkExactlyOneAnimalBreedProvided(default_breed_id, custom_breed_id, breed_name);
  }
  if (default_breed_id) {
    await checkDefaultBreedMatchesType(
      animalOrBatchKey,
      farm_id,
      id,
      default_breed_id,
      default_type_id,
    );
  }
};

const checkDefaultBreedMatchesType = async (
  animalOrBatchKey,
  farm_id,
  id,
  default_breed_id,
  default_type_id,
) => {
  let defaultTypeId = default_type_id;
  // If editing
  if (!defaultTypeId && id) {
    defaultTypeId = await AnimalOrBatchModel[animalOrBatchKey]
      .query()
      .findById(id)
      .where({ farm_id })
      .whereNotDeleted();
  }
  if (defaultTypeId) {
    const defaultBreed = await DefaultAnimalBreedModel.query().findById(default_breed_id);
    if (defaultBreed && defaultBreed.default_type_id !== defaultTypeId) {
      throw newCustomError('Breed does not match type');
    }
  } else {
    throw newCustomError('Default breed must use default type');
  }
};

const checkDefaultBreedDoesNotUseCustomType = (animalOrBatch) => {
  const { default_breed_id, custom_type_id } = animalOrBatch;
  if (default_breed_id && custom_type_id) {
    throw newCustomError('Default breed does not use custom type');
  }
};

const checkCustomBreed = async (animalOrBatch, farm_id) => {
  const { custom_breed_id, default_type_id, custom_type_id } = animalOrBatch;
  if (custom_breed_id) {
    const customBreed = await CustomAnimalBreedModel.query()
      .whereNotDeleted()
      .findById(custom_breed_id);

    if (customBreed && customBreed.farm_id !== farm_id) {
      throw newCustomError('Forbidden custom breed does not belong to this farm', 403);
    }

    if (customBreed.default_type_id && customBreed.default_type_id !== default_type_id) {
      throw newCustomError('Breed does not match type');
    }

    if (customBreed.custom_type_id && customBreed.custom_type_id !== custom_type_id) {
      throw newCustomError('Breed does not match type');
    }
  }
};

const checkBatchSexDetail = async (animalOrBatch, animalOrBatchKey) => {
  if (animalOrBatchKey === 'batch') {
    const { count, sex_detail } = animalOrBatch;

    if (sex_detail?.length) {
      let sexCount = 0;
      const sexIdSet = new Set();
      sex_detail.forEach((detail) => {
        sexCount += detail.count;
        sexIdSet.add(detail.sex_id);
      });
      if (sexCount > count) {
        throw newCustomError('Batch count must be greater than or equal to sex detail count');
      }
      if (sex_detail.length != sexIdSet.size) {
        throw newCustomError('Duplicate sex ids in detail');
      }
    }
  }
};

const checkAnimalUseRelationship = async (animalOrBatch, animalOrBatchKey) => {
  const relationshipsKey =
    animalOrBatchKey === 'batch' ? 'animal_batch_use_relationships' : 'animal_use_relationships';

  if (animalOrBatch[relationshipsKey]) {
    checkIsArray(animalOrBatch[relationshipsKey], relationshipsKey);

    const otherUse = await AnimalUseModel.query().where({ key: 'OTHER' }).first();

    for (const relationship of animalOrBatch[relationshipsKey]) {
      if (relationship.use_id != otherUse.id && relationship.other_use) {
        throw newCustomError('other_use notes is for other use type');
      }
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
      throw newCustomError('Cannot create a new type associated with an existing breed');
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
    throw newCustomError('Must send reason and date of removal');
  }
};

const checkIfRecordExists = async (animalOrBatch, animalOrBatchKey, invalidIds, farm_id) => {
  const animalOrBatchRecord = await AnimalOrBatchModel[animalOrBatchKey]
    .query()
    .findById(animalOrBatch.id)
    .where({ farm_id })
    .whereNotDeleted();

  if (!animalOrBatchRecord) {
    invalidIds.push(animalOrBatch.id);
  }
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
      throw newCustomError('Animal type already exists', 409);
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
      throw newCustomError('Animal breed already exists', 409);
    }
  }
};

const checkInvalidIds = async (invalidIds) => {
  if (invalidIds.length) {
    throw newCustomError(
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

        // also edit
        await checksIfTypeProvided(animalOrBatch, farm_id);
        await checksIfBreedProvided(animalOrBatch, animalOrBatchKey);

        checkDefaultBreedDoesNotUseCustomType(animalOrBatch);
        await checkCustomBreed(animalOrBatch, farm_id);
        await checkBatchSexDetail(animalOrBatch, animalOrBatchKey);
        await checkAnimalUseRelationship(animalOrBatch, animalOrBatchKey);

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
        checkIdExistsAndIsNumber(animalOrBatch.id);
        await checkIfRecordExists(animalOrBatch, animalOrBatchKey, invalidIds, farm_id);

        await checksIfTypeProvided(animalOrBatch, farm_id, false);
        // nullTypesExistingOnRecord();
        await checksIfBreedProvided(animalOrBatch, animalOrBatchKey, farm_id);
        // nullBreedsExistingOnRecord();
      }

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
        checkIdExistsAndIsNumber(animalOrBatch.id);
        await checkIfRecordExists(animalOrBatch, animalOrBatchKey, invalidIds, farm_id);
      }

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
