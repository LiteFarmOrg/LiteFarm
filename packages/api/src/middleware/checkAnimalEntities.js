import { Model, transaction } from 'objection';
import { handleObjectionError } from '../util/errorCodes.js';

import CustomAnimalTypeModel from '../models/customAnimalTypeModel.js';
import DefaultAnimalBreedModel from '../models/defaultAnimalBreedModel.js';
import CustomAnimalBreedModel from '../models/customAnimalBreedModel.js';

/**
 * Middleware function to check if the provided animal entities exist and belong to the farm. The IDs must be passed as a comma-separated query string.
 *
 * @param {Object} model - The database model for the correct animal entity
 * @returns {Function} - Express middleware function
 *
 * @example
 * router.delete(
 *   '/',
 *   checkScope(['delete:animals']),
 *   checkAnimalEntities(AnimalModel),
 *   AnimalController.deleteAnimals(),
 * );
 *
 */
export function checkAnimalEntities(model) {
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

        const existingRecord = await model
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

export function validateAnimalBatchCreationBody() {
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
          let breedDetails = '';

          if (custom_type_id) {
            breedDetails = `custom_type_id/${custom_type_id}/${breed_name}`;
          }
          if (default_type_id) {
            breedDetails = `default_type_id/${default_type_id}/${breed_name}`;
          }

          newBreedsSet.add(breedDetails);
        }
      }

      if (newTypesSet.size) {
        const record = await CustomAnimalTypeModel.getTypesByFarmAndTypes(farm_id, [
          ...newTypesSet,
        ]);

        if (record.length) {
          await trx.rollback();
          return res.status(409).send('Animal type already exists');
        }
      }

      if (newBreedsSet.size) {
        const typeBreedPairs = [...newBreedsSet].map((breed) => breed.split('/'));
        for (const [typeColumn, typeId] of typeBreedPairs) {
          const record = await CustomAnimalBreedModel.query()
            .where('id', typeId)
            .andWhere(typeColumn, typeId)
            .andWhere('farm_id', farm_id);
          if (record.length) {
            await trx.rollback();
            return res.status(409).send('Animal breed already exists');
          }
        }

        const record = await CustomAnimalBreedModel.getBreedsByFarmAndTypeBreedPairs(
          farm_id,
          typeBreedPairs,
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
