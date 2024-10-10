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
  checkAndAddGroup,
  checkAndAddCustomTypeAndBreed,
} from '../util/animal.js';
import { handleObjectionError } from '../util/errorCodes.js';
import { uploadPublicImage } from '../util/imageUpload.js';

const animalController = {
  getFarmAnimals() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const rows = await AnimalModel.query()
          .where({ farm_id })
          .whereNotDeleted()
          .withGraphFetched({
            internal_identifier: true,
            group_ids: true,
            animal_use_relationships: true,
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

  addAnimals() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const { farm_id } = req.headers;
        const result = [];

        // Create utility object used in type and breed
        req.body.typeIdsMap = {};
        req.body.typeBreedIdsMap = {};

        for (const animal of req.body) {
          await checkAndAddCustomTypeAndBreed(req, animal, farm_id, trx);
          // TODO: Comment out for animals v1?
          await checkAndAddGroup(req, animal, farm_id, trx);

          // Remove farm_id if it happens to be set in animal object since it should be obtained from header
          delete animal.farm_id;

          const individualAnimalResult = await baseController.insertGraphWithResponse(
            AnimalModel,
            { ...animal, farm_id },
            req,
            { trx },
          );

          // TODO: Comment out for animals v1?
          // Format group_ids
          const groupIdMap =
            individualAnimalResult.group_ids?.map((group) => group.animal_group_id) || [];
          individualAnimalResult.group_ids = groupIdMap;

          result.push(individualAnimalResult);
        }

        // delete utility objects
        delete req.body.typeIdsMap;
        delete req.body.typeBreedIdsMap;

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
        req.body.typeIdsMap = {};
        req.body.typeBreedIdsMap = {};

        // select only allowed properties to edit
        for (const animal of req.body) {
          await checkAndAddCustomTypeAndBreed(req, animal, farm_id, trx);
          // TODO: Comment out for animals v1?
          await checkAndAddGroup(req, animal, farm_id, trx);
          const {
            id,
            default_type_id,
            custom_type_id,
            default_breed_id,
            custom_breed_id,
            sex_id,
            name,
            birth_date,
            identifier,
            identifier_color_id,
            identifier_placement_id,
            origin_id,
            dam,
            sire,
            brought_in_date,
            weaning_date,
            notes,
            photo_url,
            identifier_type_id,
            identifier_type_other,
            organic_status,
            supplier,
            price,
            group_ids,
            animal_use_relationships,
          } = animal;

          await baseController.upsertGraph(
            AnimalModel,
            {
              id,
              default_type_id,
              custom_type_id,
              default_breed_id,
              custom_breed_id,
              sex_id,
              name,
              birth_date,
              identifier,
              identifier_color_id,
              identifier_placement_id,
              origin_id,
              dam,
              sire,
              brought_in_date,
              weaning_date,
              notes,
              photo_url,
              identifier_type_id,
              identifier_type_other,
              organic_status,
              supplier,
              price,
              group_ids,
              animal_use_relationships,
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
  removeAnimals() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());

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
        }
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
        const { ids } = req.query;
        const idsSet = new Set(ids.split(','));

        for (const animalId of idsSet) {
          await baseController.delete(AnimalModel, animalId, req, { trx });
        }
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
