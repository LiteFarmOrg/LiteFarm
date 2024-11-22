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
import AnimalModel from '../models/animalModel.js';
import baseController from './baseController.js';
import {
  assignInternalIdentifiers,
  upsertGroup,
  checkAndAddCustomTypeAndBreed,
  handleIncompleteTasksForAnimalsAndBatches,
} from '../util/animal.js';
import { handleObjectionError } from '../util/errorCodes.js';
import { uploadPublicImage } from '../util/imageUpload.js';
import _pick from 'lodash/pick.js';

const animalController = {
  getFarmAnimals() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const rows = await AnimalModel.query()
          .where({ farm_id })
          .whereNotDeleted()
          .withGraphFetched({
            animal_union_batch: true,
            group_ids: true,
            animal_use_relationships: true,
          });
        return res.status(200).send(
          rows.map(({ animal_union_batch, group_ids, ...rest }) => ({
            ...rest,
            internal_identifier: animal_union_batch.internal_identifier,
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

  addAnimals() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const { farm_id } = req.headers;
        const result = [];

        // Create utility object used in type and breed
        const typeIdsMap = {};
        const typeBreedIdsMap = {};

        for (const animal of req.body) {
          await checkAndAddCustomTypeAndBreed(
            req,
            typeIdsMap,
            typeBreedIdsMap,
            animal,
            farm_id,
            trx,
          );

          await upsertGroup(req, animal, farm_id, trx);

          // Remove farm_id if it happens to be set in animal object since it should be obtained from header
          delete animal.farm_id;

          const individualAnimalResult = await baseController.insertGraphWithResponse(
            AnimalModel,
            { ...animal, farm_id },
            req,
            { trx },
          );

          // Format group_ids
          individualAnimalResult.group_ids =
            individualAnimalResult.group_ids?.map((group) => group.animal_group_id) || [];

          result.push(individualAnimalResult);
        }

        await trx.commit();

        await assignInternalIdentifiers(result, 'animal');

        return res.status(201).send(result);
      } catch (error) {
        await handleObjectionError(error, res, trx);
      }
    };
  },
  editAnimals() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());

      try {
        const { farm_id } = req.headers;
        // Create utility object used in type and breed
        const typeIdsMap = {};
        const typeBreedIdsMap = {};

        const desiredKeys = [
          'id',
          'custom_breed_id',
          'custom_type_id',
          'default_breed_id',
          'default_type_id',
          'sex_id',
          'name',
          'birth_date',
          'identifier',
          'identifier_color_id',
          'identifier_placement_id',
          'identifier_type_id',
          'identifier_type_other',
          'origin_id',
          'dam',
          'sire',
          'brought_in_date',
          'weaning_date',
          'notes',
          'photo_url',
          'organic_status',
          'supplier',
          'price',
          'sex_detail',
          'origin_id',
          'group_ids',
          'animal_use_relationships',
        ];

        // select only allowed properties to edit
        for (const animal of req.body) {
          await checkAndAddCustomTypeAndBreed(
            req,
            typeIdsMap,
            typeBreedIdsMap,
            animal,
            farm_id,
            trx,
          );

          await upsertGroup(req, animal, farm_id, trx);

          const keysExisting = desiredKeys.filter((key) => key in animal);
          const data = _pick(animal, keysExisting);

          await baseController.upsertGraph(AnimalModel, data, req, { trx });
        }

        await trx.commit();
        // Do not send result revalidate using tags on frontend
        return res.status(204).send();
      } catch (error) {
        handleObjectionError(error, res, trx);
      }
    };
  },
  removeAnimals() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      const ids = [];

      try {
        for (const animal of req.body) {
          const { id, animal_removal_reason_id, removal_explanation, removal_date } = animal;

          await baseController.patch(
            AnimalModel,
            id,
            {
              animal_removal_reason_id,
              removal_explanation,
              removal_date,
            },
            req,
            { trx },
          );

          ids.push(id);
        }

        // assume removal_date is the same for all animals
        const { removal_date } = req.body[0];
        await handleIncompleteTasksForAnimalsAndBatches(req, trx, 'animal', ids, removal_date);
        await trx.commit();
        return res.status(204).send();
      } catch (error) {
        handleObjectionError(error, res, trx);
      }
    };
  },

  deleteAnimals() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());

      try {
        const { ids, date } = req.query;
        const idsSet = new Set(ids.split(','));

        for (const animalId of idsSet) {
          await baseController.delete(AnimalModel, animalId, req, { trx });
        }

        await handleIncompleteTasksForAnimalsAndBatches(req, trx, 'animal', [...idsSet], date);
        await trx.commit();
        return res.status(204).send();
      } catch (error) {
        handleObjectionError(error, res, trx);
      }
    };
  },
  uploadAnimalImage() {
    return async (req, res, next) => {
      await uploadPublicImage('animal')(req, res, next);
    };
  },
};

export default animalController;
