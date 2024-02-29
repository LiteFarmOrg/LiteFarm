import { Model, transaction } from 'objection';
import { handleObjectionError } from '../util/errorCodes';

/**
 * Middleware function to check if the provided animal entities exist and belong to the farm.
 * The IDs must be passed as a comma-separated request query string.
 *
 * @param {Object} model - The database model for the correct animal.
 * @returns {Function} - Express middleware function.
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

      next();
    } catch (error) {
      handleObjectionError(error, res, trx);
    }
  };
}
