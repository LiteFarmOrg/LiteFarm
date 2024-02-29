import { Model, transaction } from 'objection';
import baseController from '../controllers/baseController';
import { handleObjectionError } from '../util/errorCodes';

export function deleteAnimalEntity(model) {
  return async (req, res) => {
    const trx = await transaction.start(Model.knex());

    try {
      const { farm_id } = req.headers;
      const { ids } = req.query;

      if (!ids || !ids.length) {
        await trx.rollback();
        return res.status(400).send('Must send ids');
      }

      const idsSet = new Set(ids.split(','));

      // Check that all batches exist and belong to the farm
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

      // Delete animal batches
      for (const id of idsSet) {
        await baseController.delete(model, id, req, { trx });
      }
      await trx.commit();
      return res.status(204).send();
    } catch (error) {
      handleObjectionError(error, res, trx);
    }
  };
}
