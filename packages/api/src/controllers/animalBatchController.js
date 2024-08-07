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
import CustomAnimalBreedModel from '../models/customAnimalBreedModel.js';
import CustomAnimalTypeModel from '../models/customAnimalTypeModel.js';
import { handleObjectionError } from '../util/errorCodes.js';
import { assignInternalIdentifiers } from '../util/animal.js';
import { uploadPublicImage } from '../util/imageUpload.js';

const animalBatchController = {
  getFarmAnimalBatches() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const rows = await AnimalBatchModel.query()
          .where({ farm_id })
          .whereNotDeleted()
          .withGraphFetched({
            internal_identifier: true,
            group_ids: true,
            sex_detail: true,
            animal_batch_use_relationships: true,
          });
        return res.status(200).send(
          rows.map(({ internal_identifier, group_ids, ...rest }) => ({
            ...rest,
            internal_identifier: internal_identifier.internal_identifier,
            group_ids: group_ids.map(({ animal_group_id }) => animal_group_id),
          })),
        );
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

        // avoid attempts to add an already created type or breed to the DB
        // where multiple batches have the same type_name or breed_name
        const typeIdsMap = {};
        const typeBreedIdsMap = {};

        for (const animalBatch of req.body) {
          if (animalBatch.type_name) {
            let typeId = typeIdsMap[animalBatch.type_name];

            if (!typeId) {
              const newType = await baseController.postWithResponse(
                CustomAnimalTypeModel,
                { type: animalBatch.type_name, farm_id },
                req,
                { trx },
              );
              typeId = newType.id;
              typeIdsMap[animalBatch.type_name] = typeId;
            }
            animalBatch.custom_type_id = typeId;
            delete animalBatch.type_name;
          }

          if (animalBatch.breed_name) {
            const typeColumn = animalBatch.default_type_id ? 'default_type_id' : 'custom_type_id';
            const typeId = animalBatch.type_name
              ? typeIdsMap[animalBatch.type_name]
              : animalBatch.default_type_id || animalBatch.custom_type_id;
            const typeBreedKey = `${typeColumn}_${typeId}_${animalBatch.breed_name}`;
            let breedId = typeBreedIdsMap[typeBreedKey];

            if (!breedId) {
              const newBreed = await baseController.postWithResponse(
                CustomAnimalBreedModel,
                { farm_id, [typeColumn]: typeId, breed: animalBatch.breed_name },
                req,
                { trx },
              );
              breedId = newBreed.id;
              typeBreedIdsMap[typeBreedKey] = breedId;
            }
            animalBatch.custom_breed_id = breedId;
            delete animalBatch.breed_name;
          }

          // Remove farm_id if it happens to be set in animal object since it should be obtained from header
          delete animalBatch.farm_id;

          const individualAnimalBatchResult = await baseController.insertGraphWithResponse(
            AnimalBatchModel,
            { ...animalBatch, farm_id },
            req,
            { trx },
          );

          result.push(individualAnimalBatchResult);
        }

        await trx.commit();

        await assignInternalIdentifiers(result, 'batch');
        return res.status(201).send(result);
      } catch (error) {
        await handleObjectionError(error, res, trx);
      }
    };
  },

  editAnimalBatches() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());

      try {
        const { farm_id } = req.headers;

        if (!Array.isArray(req.body)) {
          await trx.rollback();
          return res.status(400).send('Request body should be an array');
        }

        // Check that all animal batches exist and belong to the farm
        // Done in its own loop to provide a list of all invalid ids
        const invalidAnimalBatchIds = [];

        for (const animalBatch of req.body) {
          if (!animalBatch.id) {
            await trx.rollback();
            return res.status(400).send('Must send animal batch id');
          }

          const farmBatchRecord = await AnimalBatchModel.query(trx)
            .findById(animalBatch.id)
            .where({ farm_id })
            .whereNotDeleted();

          if (!farmBatchRecord) {
            invalidAnimalBatchIds.push(animalBatch.id);
          }
        }

        if (invalidAnimalBatchIds.length) {
          await trx.rollback();
          return res.status(400).json({
            error: 'Invalid ids',
            invalidAnimalBatchIds,
            message: 'Some animal batches do not exist or are not associated with the given farm.',
          });
        }

        // Update animal batches
        // NOTE: this is only scoped for removal. To make this a general update controller would require restating all of the checks on breed, type, etc. in addAnimalBatches() above.
        for (const animalBatch of req.body) {
          const { id, animal_removal_reason_id, removal_explanation, removal_date } = animalBatch;

          await baseController.patch(
            AnimalBatchModel,
            id,
            {
              animal_removal_reason_id,
              removal_explanation,
              removal_date,
            },
            req,
            { trx },
          );
        }
        await trx.commit();
        return res.status(204).send();
      } catch (error) {
        handleObjectionError(error, res, trx);
      }
    };
  },

  deleteAnimalBatches() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());

      try {
        const { ids } = req.query;
        const idsSet = new Set(ids.split(','));

        for (const batchId of idsSet) {
          await baseController.delete(AnimalBatchModel, batchId, req, { trx });
        }
        await trx.commit();
        return res.status(204).send();
      } catch (error) {
        handleObjectionError(error, res, trx);
      }
    };
  },
  uploadAnimalBatchImage() {
    return async (req, res, next) => {
      await uploadPublicImage('animal_batch')(req, res, next);
    };
  },
};

export default animalBatchController;
