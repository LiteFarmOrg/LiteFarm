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
import { handleObjectionError } from '../util/errorCodes.js';
import { assignInternalIdentifiers, checkAndAddCustomTypeAndBreed } from '../util/animal.js';
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

        // Create utility object used in type and breed
        req.body.typeIdsMap = {};
        req.body.typeBreedIdsMap = {};

        for (const animalBatch of req.body) {
          await checkAndAddCustomTypeAndBreed(req, animalBatch, farm_id, trx);
          // TODO: allow animal group addition on creation like animals
          // await checkAndAddGroup(req, animal, farm_id, trx);

          // Remove farm_id if it happens to be set in animal object since it should be obtained from header
          delete animalBatch.farm_id;

          const individualAnimalBatchResult = await baseController.insertGraphWithResponse(
            AnimalBatchModel,
            { ...animalBatch, farm_id },
            req,
            { trx },
          );

          // TODO: allow animal group addition on creation like animals
          // Format group_ids
          // const groupIdMap =
          //   individualAnimalBatchResult.group_ids?.map((group) => group.animal_group_id) || [];
          // individualAnimalBatchResult.group_ids = groupIdMap;

          result.push(individualAnimalBatchResult);
        }
        // delete utility objects
        delete req.body.typeIdsMap;
        delete req.body.typeBreedIdsMap;

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

        // Create utility object used in type and breed
        req.body.typeIdsMap = {};
        req.body.typeBreedIdsMap = {};

        // select only allowed properties to edit
        for (const animalBatch of req.body) {
          await checkAndAddCustomTypeAndBreed(req, animalBatch, farm_id, trx);
          // TODO: allow animal group editing
          // await checkAndAddGroup(req, animal, farm_id, trx);

          const {
            id,
            count,
            custom_breed_id,
            custom_type_id,
            default_breed_id,
            default_type_id,
            name,
            notes,
            photo_url,
            organic_status,
            supplier,
            price,
            sex_detail,
            origin_id,
            group_ids,
            animal_batch_use_relationships,
          } = animalBatch;

          await baseController.upsertGraph(
            AnimalBatchModel,
            {
              id,
              count,
              custom_breed_id,
              custom_type_id,
              default_breed_id,
              default_type_id,
              name,
              notes,
              photo_url,
              organic_status,
              supplier,
              price,
              sex_detail,
              origin_id,
              group_ids,
              animal_batch_use_relationships,
            },
            req,
            { trx },
          );
        }

        // delete utility objects
        delete req.body.typeIdsMap;
        delete req.body.typeBreedIdsMap;

        await trx.commit();
        // Do not send result revalidate using tags on frontend
        return res.status(204).send();
      } catch (error) {
        handleObjectionError(error, res, trx);
      }
    };
  },

  removeAnimalBatches() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());

      try {
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
