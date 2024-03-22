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
import DefaultAnimalBreedModel from '../models/defaultAnimalBreedModel.js';
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

        for (const animal of req.body) {
          if (animal.custom_type_id) {
            const customType = await CustomAnimalTypeModel.query().findById(animal.custom_type_id);

            if (customType && customType.farm_id !== farm_id) {
              await trx.rollback();
              return res.status(403).send('Forbidden custom type does not belong to this farm');
            }
          }

          if (animal.default_breed_id && animal.default_type_id) {
            const defaultBreed = await DefaultAnimalBreedModel.query().findById(
              animal.default_breed_id,
            );

            if (defaultBreed && defaultBreed.default_type_id !== animal.default_type_id) {
              await trx.rollback();
              return res.status(400).send('Breed does not match type');
            }
          }

          if (animal.default_breed_id && animal.custom_type_id) {
            await trx.rollback();
            return res.status(400).send('Default breed does not use custom type');
          }

          if (animal.custom_breed_id) {
            const customBreed = await CustomAnimalBreedModel.query()
              .whereNotDeleted()
              .findById(animal.custom_breed_id);

            if (customBreed && customBreed.farm_id !== farm_id) {
              await trx.rollback();
              return res.status(403).send('Forbidden custom breed does not belong to this farm');
            }

            if (
              customBreed.default_type_id &&
              customBreed.default_type_id !== animal.default_type_id
            ) {
              await trx.rollback();
              return res.status(400).send('Breed does not match type');
            }

            if (
              customBreed.custom_type_id &&
              customBreed.custom_type_id !== animal.custom_type_id
            ) {
              await trx.rollback();
              return res.status(400).send('Breed does not match type');
            }
          }

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
