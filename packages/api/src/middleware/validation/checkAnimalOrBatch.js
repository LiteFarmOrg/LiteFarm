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

import AnimalModel from '../../models/animalModel.js';
import AnimalBatchModel from '../../models/animalBatchModel.js';

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
