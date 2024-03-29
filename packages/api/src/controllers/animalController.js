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
import CustomAnimalBreedModel from '../models/customAnimalBreedModel.js';
import CustomAnimalTypeModel from '../models/customAnimalTypeModel.js';
import AnimalGroupModel from '../models/animalGroupModel.js';
import AnimalGroupRelationshipModel from '../models/animalGroupRelationshipModel.js';
import { assignInternalIdentifiers } from '../util/animal.js';
import { handleObjectionError } from '../util/errorCodes.js';
import { checkAndTrimString } from '../util/util.js';

const animalController = {
  getFarmAnimals() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const rows = await AnimalModel.query()
          .where({ farm_id })
          .whereNotDeleted()
          .withGraphFetched({ internal_identifier: true, group_ids: true });
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

        // avoid attempts to add an already created type or breed to the DB
        // where multiple animals have the same type_name or breed_name
        const typeIdsMap = {};
        const typeBreedIdsMap = {};

        for (const animal of req.body) {
          if (animal.type_name) {
            let typeId = typeIdsMap[animal.type_name];

            if (!typeId) {
              const newType = await baseController.postWithResponse(
                CustomAnimalTypeModel,
                { type: animal.type_name, farm_id },
                req,
                { trx },
              );
              typeId = newType.id;
              typeIdsMap[animal.type_name] = typeId;
            }
            animal.custom_type_id = typeId;
          }

          if (animal.breed_name) {
            const typeColumn = animal.default_type_id ? 'default_type_id' : 'custom_type_id';
            const typeId = animal.type_name
              ? typeIdsMap[animal.type_name]
              : animal.default_type_id || animal.custom_type_id;
            const typeBreedKey = `${typeColumn}_${typeId}_${animal.breed_name}`;
            let breedId = typeBreedIdsMap[typeBreedKey];

            if (!breedId) {
              const newBreed = await baseController.postWithResponse(
                CustomAnimalBreedModel,
                { farm_id, [typeColumn]: typeId, breed: animal.breed_name },
                req,
                { trx },
              );
              breedId = newBreed.id;
              typeBreedIdsMap[typeBreedKey] = breedId;
            }
            animal.custom_breed_id = breedId;
          }

          delete animal.type_name;
          delete animal.breed_name;

          // Remove farm_id if it happens to be set in animal object since it should be obtained from header
          delete animal.farm_id;

          const groupName = checkAndTrimString(animal.group_name);
          delete animal.group_name;

          const individualAnimalResult = await baseController.postWithResponse(
            AnimalModel,
            { ...animal, farm_id },
            req,
            { trx },
          );

          const groupIds = [];
          if (groupName) {
            let group = await baseController.existsInTable(trx, AnimalGroupModel, {
              name: groupName,
              farm_id,
              deleted: false,
            });

            if (!group) {
              group = await baseController.postWithResponse(
                AnimalGroupModel,
                { name: groupName, farm_id },
                req,
                { trx },
              );
            }

            groupIds.push(group.id);

            // Insert into join tables
            await AnimalGroupRelationshipModel.query(trx).insert({
              animal_id: individualAnimalResult.id,
              animal_group_id: group.id,
            });
          }

          individualAnimalResult.group_ids = groupIds;
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

        if (!Array.isArray(req.body)) {
          await trx.rollback();
          return res.status(400).send('Request body should be an array');
        }

        // Check that all animals exist and belong to the farm
        // Done in its own loop to provide a list of all invalid ids
        const invalidAnimalIds = [];

        for (const animal of req.body) {
          if (!animal.id) {
            await trx.rollback();
            return res.status(400).send('Must send animal id');
          }

          const farmAnimalRecord = await AnimalModel.query(trx)
            .findById(animal.id)
            .where({ farm_id })
            .whereNotDeleted();

          if (!farmAnimalRecord) {
            invalidAnimalIds.push(animal.id);
          }
        }

        if (invalidAnimalIds.length) {
          await trx.rollback();
          return res.status(400).json({
            error: 'Invalid ids',
            invalidAnimalIds,
            message: 'Some animals do not exist or are not associated with the given farm.',
          });
        }

        // Update animals
        // NOTE: this is only scoped for removal. To make this a general update controller would require restating all of the checks on breed, type, etc. in addAnimals() above.
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
};

export default animalController;
