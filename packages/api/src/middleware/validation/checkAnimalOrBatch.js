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

export function checkEditAnimalOrBatch(animalOrBatchKey) {
  return async (req, res, next) => {
    try {
      const { farm_id } = req.headers;

      if (!Array.isArray(req.body)) {
        return res.status(400).send('Request body should be an array');
      }

      // Check that all animals exist and belong to the farm
      // Done in its own loop to provide a list of all invalid ids
      const invalidIds = [];

      for (const animalOrBatch of req.body) {
        if (!animalOrBatch.id) {
          return res.status(400).send('Must send animal or batch id');
        }

        const animalOrBatchRecord = await AnimalOrBatchModel[animalOrBatchKey]
          .query()
          .findById(animalOrBatch.id)
          .where({ farm_id })
          .whereNotDeleted();

        if (!animalOrBatchRecord) {
          invalidIds.push(animalOrBatch.id);
        }
      }

      if (invalidIds.length) {
        return res.status(400).json({
          error: 'Invalid ids',
          invalidIds,
          message:
            'Some animals or batches do not exist or are not associated with the given farm.',
        });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error,
      });
    }
  };
}

export function checkRemoveAnimalOrBatch(animalOrBatchKey) {
  return async (req, res, next) => {
    try {
      if (!Array.isArray(req.body)) {
        return res.status(400).send('Request body should be an array');
      }

      for (const animalOrBatch of req.body) {
        const { animal_removal_reason_id, removal_date } = animalOrBatch;
        if (!animal_removal_reason_id || !removal_date) {
          return res.status(400).send('Must send reason and date of removal');
        }
      }
      checkEditAnimalOrBatch(animalOrBatchKey)(req, res, next);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error,
      });
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

      if (!ids || !ids.length) {
        await trx.rollback();
        return res.status(400).send('Must send ids');
      }

      const idsSet = new Set(ids.split(','));

      // Check that all animals/batches exist and belong to the farm
      const invalidIds = [];

      for (const id of idsSet) {
        // For query syntax like ids=,,, which will pass the above check
        if (!id || isNaN(Number(id))) {
          await trx.rollback();
          return res.status(400).send('Must send valid ids');
        }

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
        await trx.rollback();
        return res.status(400).json({
          error: 'Invalid ids',
          invalidIds,
          message:
            'Some entities do not exist, are already deleted, or are not associated with the given farm.',
        });
      }

      await trx.commit();
      next();
    } catch (error) {
      handleObjectionError(error, res, trx);
    }
  };
}

const hasOneValue = (values) => {
  const nonNullValues = values.filter(Boolean);
  return nonNullValues.length === 1;
};

const allFalsy = (values) => values.every((value) => !value);

export function checkCreateAnimalOrBatch(animalOrBatchKey) {
  return async (req, res, next) => {
    const trx = await transaction.start(Model.knex());

    try {
      const { farm_id } = req.headers;
      const newTypesSet = new Set();
      const newBreedsSet = new Set();

      for (const animalOrBatch of req.body) {
        const {
          default_type_id,
          custom_type_id,
          default_breed_id,
          custom_breed_id,
          type_name,
          breed_name,
        } = animalOrBatch;

        if (!hasOneValue([default_type_id, custom_type_id, type_name])) {
          await trx.rollback();
          return res
            .status(400)
            .send('Exactly one of default_type_id, custom_type_id, or type_name must be sent');
        }

        if (
          !hasOneValue([default_breed_id, custom_breed_id, breed_name]) &&
          !allFalsy([default_breed_id, custom_breed_id, breed_name])
        ) {
          await trx.rollback();
          return res
            .status(400)
            .send('Exactly one of default_breed_id, custom_breed_id and breed_name must be sent');
        }

        if (custom_type_id) {
          const customType = await CustomAnimalTypeModel.query().findById(custom_type_id);

          if (customType && customType.farm_id !== farm_id) {
            await trx.rollback();
            return res.status(403).send('Forbidden custom type does not belong to this farm');
          }
        }

        if (default_breed_id && default_type_id) {
          const defaultBreed = await DefaultAnimalBreedModel.query().findById(default_breed_id);

          if (defaultBreed && defaultBreed.default_type_id !== default_type_id) {
            await trx.rollback();
            return res.status(400).send('Breed does not match type');
          }
        }

        if (default_breed_id && custom_type_id) {
          await trx.rollback();
          return res.status(400).send('Default breed does not use custom type');
        }

        if (custom_breed_id) {
          const customBreed = await CustomAnimalBreedModel.query()
            .whereNotDeleted()
            .findById(custom_breed_id);

          if (customBreed && customBreed.farm_id !== farm_id) {
            await trx.rollback();
            return res.status(403).send('Forbidden custom breed does not belong to this farm');
          }

          if (customBreed.default_type_id && customBreed.default_type_id !== default_type_id) {
            await trx.rollback();
            return res.status(400).send('Breed does not match type');
          }

          if (customBreed.custom_type_id && customBreed.custom_type_id !== custom_type_id) {
            await trx.rollback();
            return res.status(400).send('Breed does not match type');
          }
        }

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
              await trx.rollback();
              return res
                .status(400)
                .send('Batch count must be greater than or equal to sex detail count');
            }
            if (sex_detail.length != sexIdSet.size) {
              await trx.rollback();
              return res.status(400).send('Duplicate sex ids in detail');
            }
          }
        }

        const relationshipsKey =
          animalOrBatchKey === 'batch'
            ? 'animal_batch_use_relationships'
            : 'animal_use_relationships';

        if (animalOrBatch[relationshipsKey]) {
          if (!Array.isArray(animalOrBatch[relationshipsKey])) {
            return res.status(400).send(`${relationshipsKey} must be an array`);
          }

          const otherUse = await AnimalUseModel.query().where({ key: 'OTHER' }).first();

          for (const relationship of animalOrBatch[relationshipsKey]) {
            if (relationship.use_id != otherUse.id && relationship.other_use) {
              return res.status(400).send('other_use notes is for other use type');
            }
          }
        }

        // Skip the process if type_name and breed_name are not passed
        if (!type_name && !breed_name) {
          continue;
        }

        if (type_name) {
          if (default_breed_id || custom_breed_id) {
            await trx.rollback();
            return res
              .status(400)
              .send('Cannot create a new type associated with an existing breed');
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
      }

      if (newTypesSet.size) {
        const record = await CustomAnimalTypeModel.getTypesByFarmAndTypes(
          farm_id,
          [...newTypesSet],
          trx,
        );

        if (record.length) {
          await trx.rollback();
          return res.status(409).send('Animal type already exists');
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
          await trx.rollback();
          return res.status(409).send('Animal breed already exists');
        }
      }

      await trx.commit();
      next();
    } catch (error) {
      handleObjectionError(error, res, trx);
    }
  };
}
