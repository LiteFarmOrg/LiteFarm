import { Model, transaction } from 'objection';
import { handleObjectionError } from '../util/errorCodes.js';
import { TypedRequestHandler } from '../types.js';
import { type AddAnimalsReqBody } from '../schemas/animalSchemas.js';
import { type AddBatchAnimalsReqBody } from '../schemas/animalBatchSchemas.js';
import animalQueries from '../queries/animalQueries.js';
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

// @ts-expect-error To-fix
export function checkAnimalEntities(model) {
  // @ts-expect-error To-fix
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
      // @ts-expect-error
      handleObjectionError(error, res, trx);
    }
  };
}

const hasOneValue = (values: Array<unknown>) => {
  const nonNullValues = values.filter(Boolean);
  return nonNullValues.length === 1;
};

const allFalsy = (values: Array<unknown>) => values.every((value) => !value);

export function validateAnimalBatchCreationBody(
  animalBatchKey?: 'batch',
): TypedRequestHandler<AddAnimalsReqBody & AddBatchAnimalsReqBody> {
  return async (req, res, next) => {
    const farmId = req.headers.farm_id!;
    const newTypesSet = new Set<string>();
    const newBreedsSet = new Set<string>();

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
        return res
          .status(400)
          .send('Exactly one of default_type_id, custom_type_id, or type_name must be sent');
      }

      if (
        !hasOneValue([default_breed_id, custom_breed_id, breed_name]) &&
        !allFalsy([default_breed_id, custom_breed_id, breed_name])
      ) {
        return res
          .status(400)
          .send('Exactly one of default_breed_id, custom_breed_id and breed_name must be sent');
      }

      if (custom_type_id) {
        const customType = await animalQueries.getCustomAnimalTypeById(custom_type_id);

        if (customType && customType.farm_id !== farmId) {
          return res.status(403).send('Forbidden custom type does not belong to this farm');
        }
      }

      if (default_breed_id && default_type_id) {
        const defaultBreed = await animalQueries.getDefaultAnimalBreedById(default_breed_id);

        if (defaultBreed && defaultBreed.default_type_id !== default_type_id) {
          return res.status(400).send('Breed does not match type');
        }
      }

      if (default_breed_id && custom_type_id) {
        return res.status(400).send('Default breed does not use custom type');
      }

      if (custom_breed_id) {
        const customBreed = await animalQueries.getCustomAnimalBreedById(custom_breed_id);

        if (customBreed && customBreed.farm_id !== farmId) {
          return res.status(403).send('Forbidden custom breed does not belong to this farm');
        }

        if (customBreed.default_type_id && customBreed.default_type_id !== default_type_id) {
          return res.status(400).send('Breed does not match type');
        }

        if (customBreed.custom_type_id && customBreed.custom_type_id !== custom_type_id) {
          return res.status(400).send('Breed does not match type');
        }
      }

      if (animalBatchKey === 'batch') {
        const { count, sex_detail } = animalOrBatch;

        if (sex_detail?.length) {
          let sexCount = 0;
          const sexIdSet = new Set();
          sex_detail.forEach((detail) => {
            sexCount += detail.count;
            sexIdSet.add(detail.sex_id);
          });
          if (sexCount > count) {
            return res
              .status(400)
              .send('Batch count must be greater than or equal to sex detail count');
          }
          if (sex_detail.length != sexIdSet.size) {
            return res.status(400).send('Duplicate sex ids in detail');
          }
        }
      }

      if (animalOrBatch['animal_batch_use_relationships']) {
        const otherUse = await animalQueries.getAnimalOtherUse();

        for (const relationship of animalOrBatch['animal_batch_use_relationships']) {
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
          return res.status(400).send('Cannot create a new type associated with an existing breed');
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
      const record = await animalQueries.getTypesByFarmAndTypes(farmId, [...newTypesSet]);

      if (record.length) {
        return res.status(409).send('Animal type already exists');
      }
    }

    if (newBreedsSet.size) {
      const typeBreedPairs = [...newBreedsSet].map((breed) => {
        const [typeColumn, typeId, breedName] = breed.split('/');

        // narrow the return type to avoid typecasting
        if (
          (typeColumn === 'custom_type_id' || typeColumn === 'default_type_id') &&
          !isNaN(Number(typeId)) &&
          typeof breedName === 'string'
        ) {
          return [typeColumn, Number(typeId), breedName] as const;
        }
        throw new Error(`Invalid typeColumn, typeId, or breed name: '${breed}'`);
      });

      const rows = await animalQueries.getBreedsByFarmAndTypeBreedPairs(farmId, typeBreedPairs);

      if (rows.length) {
        return res.status(409).send('Animal breed already exists');
      }
    }

    next();
  };
}
