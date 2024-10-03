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
import { checkAndTrimString, omitBaseProperties } from '../util/util.js';
import AnimalUseRelationshipModel from '../models/animalUseRelationshipModel.js';
import { uploadPublicImage } from '../util/imageUpload.js';
import animalQueries from '../queries/animalQueries.js';
import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../types.js';

const animalController = {
  getFarmAnimals() {
    return async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { farm_id } = req.headers;
        const rows = await animalQueries.getFarmAnimals(farm_id);
        return res.status(200).json(
          rows.map(({ group_ids, internal_identifier, ...row }) => ({
            ...omitBaseProperties(row),
            internal_identifier: internal_identifier[0].internal_identifier,
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
    return async (req: Request, res: Response) => {
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
            //@ts-expect-error To be fixed
            let typeId = typeIdsMap[animal.type_name];

            if (!typeId) {
              const newType = await baseController.postWithResponse(
                CustomAnimalTypeModel,
                { type: animal.type_name, farm_id },
                req,
                //@ts-expect-error To be fixed
                { trx },
              );
              typeId = newType.id;
              //@ts-expect-error To be fixed
              typeIdsMap[animal.type_name] = typeId;
            }
            animal.custom_type_id = typeId;
            delete animal.type_name;
          }

          if (animal.breed_name) {
            const typeColumn = animal.default_type_id ? 'default_type_id' : 'custom_type_id';
            const typeId = animal.type_name
              ? //@ts-expect-error To be fixed
                typeIdsMap[animal.type_name]
              : animal.default_type_id || animal.custom_type_id;
            const typeBreedKey = `${typeColumn}_${typeId}_${animal.breed_name}`;
            //@ts-expect-error To be fixed
            let breedId = typeBreedIdsMap[typeBreedKey];

            if (!breedId) {
              const newBreed = await baseController.postWithResponse(
                CustomAnimalBreedModel,
                { farm_id, [typeColumn]: typeId, breed: animal.breed_name },
                req,
                //@ts-expect-error To be fixed
                { trx },
              );
              breedId = newBreed.id;
              //@ts-expect-error To be fixed
              typeBreedIdsMap[typeBreedKey] = breedId;
            }
            animal.custom_breed_id = breedId;
            delete animal.breed_name;
          }

          // Remove farm_id if it happens to be set in animal object since it should be obtained from header
          delete animal.farm_id;

          const groupName = checkAndTrimString(animal.group_name);
          delete animal.group_name;

          const individualAnimalResult = await baseController.postWithResponse(
            AnimalModel,
            { ...animal, farm_id },
            req,
            //@ts-expect-error To be fixed
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
                //@ts-expect-error To be fixed
                { trx },
              );
            }

            groupIds.push(group.id);

            // Insert into join table
            await AnimalGroupRelationshipModel.query(trx).insert({
              animal_id: individualAnimalResult.id,
              animal_group_id: group.id,
            });
          }

          individualAnimalResult.group_ids = groupIds;

          const animalUseRelationships = [];
          if (animal.animal_use_relationships?.length) {
            for (const relationship of animal.animal_use_relationships) {
              animalUseRelationships.push(
                await baseController.postWithResponse(
                  AnimalUseRelationshipModel,
                  { ...relationship, animal_id: individualAnimalResult.id },
                  req,
                  //@ts-expect-error To be fixed
                  { trx },
                ),
              );
            }
          }

          individualAnimalResult.animal_use_relationships = animalUseRelationships;

          result.push(individualAnimalResult);
        }

        await trx.commit();

        await assignInternalIdentifiers(result, 'animal');
        return res.status(201).send(result);
      } catch (error) {
        //@ts-expect-error To be fixed
        await handleObjectionError(error, res, trx);
      }
    };
  },

  removeAnimals() {
    return async (req: Request, res: Response) => {
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
            //@ts-expect-error To be fixed
            { trx },
          );
        }
        await trx.commit();
        return res.status(204).send();
      } catch (error) {
        //@ts-expect-error To be fixed
        handleObjectionError(error, res, trx);
      }
    };
  },

  deleteAnimals() {
    return async (req: Request, res: Response) => {
      const trx = await transaction.start(Model.knex());

      try {
        const { ids } = req.query;
        //@ts-expect-error To be fixed
        const idsSet = new Set(ids.split(','));

        for (const animalId of idsSet) {
          //@ts-expect-error To be fixed
          await baseController.delete(AnimalModel, animalId, req, { trx });
        }
        await trx.commit();
        return res.status(204).send();
      } catch (error) {
        //@ts-expect-error To be fixed
        handleObjectionError(error, res, trx);
      }
    };
  },
  uploadAnimalImage() {
    return async (req: Request, res: Response, next: NextFunction) => {
      await uploadPublicImage('animal')(req, res, next);
    };
  },
};

export default animalController;
