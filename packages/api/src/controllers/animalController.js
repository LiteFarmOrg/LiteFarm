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
import DefaultAnimalTypeModel from '../models/defaultAnimalTypeModel.js';
import CustomAnimalTypeModel from '../models/customAnimalTypeModel.js';
import { handleObjectionError } from '../util/errorCodes.js';

const animalController = {
  getFarmAnimals() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const rows = await AnimalModel.query().where({ farm_id }).whereNotDeleted();
        return res.status(200).send(rows);
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

        if (!Array.isArray(req.body)) {
          await trx.rollback();
          return res.status(400).send('Request body should be an array');
        }

        for (const animal of req.body) {
          if (!animal.identifier && !animal.name) {
            await trx.rollback();
            return res.status(400).send('Should send either animal name or identifier');
          }

          if (!animal.default_type_id && !animal.custom_type_id) {
            await trx.rollback();
            return res.status(400).send('Should send either default_type_id or custom_type_id');
          }

          if (animal.default_type_id && animal.custom_type_id) {
            await trx.rollback();
            return res
              .status(400)
              .send('Should only send either default_type_id or custom_type_id');
          }

          if (animal.default_breed_id && animal.custom_breed_id) {
            await trx.rollback();
            return res
              .status(400)
              .send('Should only send either default_breed_id or custom_breed_id');
          }

          if (animal.default_type_id) {
            const defaultType = await DefaultAnimalTypeModel.query().findById(
              animal.default_type_id,
            );

            if (!defaultType) {
              await trx.rollback();
              return res.status(400).send('default_type_id has invalid value');
            }
          }

          if (animal.custom_type_id) {
            const customType = await CustomAnimalTypeModel.query().findById(animal.custom_type_id);

            if (!customType || customType.farm_id !== farm_id) {
              await trx.rollback();
              return res.status(400).send('custom_type_id has invalid value');
            }
          }

          if (animal.default_breed_id) {
            const defaultBreed = await DefaultAnimalBreedModel.query().findById(
              animal.default_breed_id,
            );

            if (!defaultBreed || defaultBreed.default_type_id !== animal.default_type_id) {
              await trx.rollback();
              return res.status(400).send('default_breed_id has invalid value');
            }
          }

          if (animal.custom_breed_id) {
            const customBreed = await CustomAnimalBreedModel.query()
              .whereNotDeleted()
              .findById(animal.custom_breed_id);

            if (!customBreed || customBreed.farm_id !== farm_id) {
              await trx.rollback();
              return res.status(400).send('custom_breed_id has invalid value');
            }

            if (
              customBreed.default_type_id &&
              customBreed.default_type_id !== animal.default_type_id
            ) {
              await trx.rollback();
              return res.status(400).send('custom_breed_id has invalid value');
            }

            if (
              customBreed.custom_type_id &&
              customBreed.custom_type_id !== animal.custom_type_id
            ) {
              await trx.rollback();
              return res.status(400).send('custom_breed_id has invalid value');
            }
          }

          // Remove farm_id if it happens to be set in animal object since it should be obtained from header
          delete animal.farm_id;

          const individualAnimalResult = await baseController.postWithResponse(
            AnimalModel,
            { ...animal, farm_id },
            req,
            { trx },
          );

          result.push(individualAnimalResult);
        }

        await trx.commit();
        return res.status(201).send(result);
      } catch (error) {
        console.error(error);
        await trx.rollback();
        return res.status(500).json({
          error,
        });
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
        const sentAnimalIds = req.body.map(({ id }) => id);
        const invalidAnimalIds = [];

        for (const id of sentAnimalIds) {
          if (!id) {
            await trx.rollback();
            return res.status(400).send('Must send animal id');
          }

          const animal = await AnimalModel.query(trx)
            .findById(id)
            .where({ farm_id })
            .whereNotDeleted();

          if (!animal) {
            invalidAnimalIds.push(id);
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
        // NOTE: this is only scoped for removal right now. To make this a general update controller would require reinstating all of the checks on breed, type, etc. in addAnimals() above. We would probably want to take a different approach to that such as a extracting the validation to somewhere common to both controllers.
        for (const animal of req.body) {
          const { id, removed, animal_removal_reason_id, removal_explanation } = animal;

          if (removed && !animal_removal_reason_id) {
            await trx.rollback();
            return res.status(400).send('Must send animal_removal_reason_id');
          }

          await baseController.patch(
            AnimalModel,
            id,
            {
              removed,
              animal_removal_reason_id,
              removal_explanation,
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
};

export default animalController;
