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

import { Model, transaction } from 'objection';
import AnimalBatchModel from '../models/animalBatchModel.js';
import baseController from './baseController.js';
import DefaultAnimalBreedModel from '../models/defaultAnimalBreedModel.js';
import CustomAnimalBreedModel from '../models/customAnimalBreedModel.js';
import CustomAnimalTypeModel from '../models/customAnimalTypeModel.js';
import { arrayIsUnique } from '../util/util.js';
import { handleObjectionError } from '../util/errorCodes.js';

const animalBatchController = {
  getFarmAnimalBatches() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const rows = await AnimalBatchModel.query()
          .where({ farm_id })
          .whereNotDeleted()
          .withGraphFetched('sex_detail');
        return res.status(200).send(rows);
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          error,
        });
      }
    };
  },

  addAnimalBatches() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());

      try {
        const { farm_id } = req.headers;
        const result = [];

        if (!Array.isArray(req.body)) {
          await trx.rollback();
          return res.status(400).send('Request body should be an array');
        }

        for (const animalBatch of req.body) {
          if (animalBatch.custom_type_id) {
            const customType = await CustomAnimalTypeModel.query().findById(
              animalBatch.custom_type_id,
            );
            if (customType && customType.farm_id !== farm_id) {
              await trx.rollback();
              return res.status(403).send('Forbidden custom type does not belong to this farm');
            }
          }

          if (animalBatch.default_breed_id && animalBatch.default_type_id) {
            const defaultBreed = await DefaultAnimalBreedModel.query().findById(
              animalBatch.default_breed_id,
            );

            if (defaultBreed && defaultBreed.default_type_id !== animalBatch.default_type_id) {
              await trx.rollback();
              return res.status(400).send('Breed does not match type');
            }
          }

          if (animalBatch.custom_breed_id) {
            const customBreed = await CustomAnimalBreedModel.query()
              .whereNotDeleted()
              .findById(animalBatch.custom_breed_id);

            if (customBreed && customBreed.farm_id !== farm_id) {
              await trx.rollback();
              return res.status(403).send('Forbidden custom breed does not belong to this farm');
            }

            if (
              customBreed.default_type_id &&
              customBreed.default_type_id !== animalBatch.default_type_id
            ) {
              await trx.rollback();
              return res.status(400).send('Breed does not match type');
            }

            if (
              customBreed.custom_type_id &&
              customBreed.custom_type_id !== animalBatch.custom_type_id
            ) {
              await trx.rollback();
              return res.status(400).send('Breed does not match type');
            }
          }

          if (animalBatch.count < 2) {
            await trx.rollback();
            return res.status(400).send('Batch count must be greater than 1');
          }

          if (animalBatch.sex_detail?.length) {
            let sexCount = 0;
            const sexIds = [];
            animalBatch.sex_detail.forEach((detail) => {
              sexCount += detail.count;
              sexIds.push(detail.sex_id);
            });
            if (sexCount != animalBatch.count) {
              await trx.rollback();
              return res.status(400).send('Batch count does not match sex detail count');
            }
            if (!arrayIsUnique(sexIds)) {
              await trx.rollback();
              return res.status(400).send('Duplicate sex ids in detail');
            }
          }

          // Remove farm_id if it happens to be set in animal object since it should be obtained from header
          delete animalBatch.farm_id;

          const individualAnimalBatchResult = await baseController.insertGraph(
            AnimalBatchModel,
            { ...animalBatch, farm_id },
            req,
            { trx },
          );

          result.push(individualAnimalBatchResult);
        }

        await trx.commit();
        return res.status(201).send(result);
      } catch (error) {
        await handleObjectionError(error, res, trx);
      }
    };
  },
};

export default animalBatchController;
