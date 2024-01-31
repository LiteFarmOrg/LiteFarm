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
import baseController from './baseController.js';
import AnimalGroupModel from '../models/animalGroupModel.js';
import AnimalGroupRelationshipModel from '../models/animalGroupRelationshipModel.js';
import AnimalBatchGroupRelationshipModel from '../models/animalBatchGroupRelationshipModel.js';
import AnimalModel from '../models/animalModel.js';

const animalGroupController = {
  getFarmAnimalGroups() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const groups = await AnimalGroupModel.query().where({ farm_id }).whereNotDeleted();
        const groupsWithRelatedIds = await Promise.all(
          groups.map(async (group) => {
            const animalRelationships = await AnimalGroupRelationshipModel.query().where({
              animal_group_id: group.id,
            });
            const batchRelationships = await AnimalBatchGroupRelationshipModel.query().where({
              animal_group_id: group.id,
            });
            return {
              ...group,
              related_animal_ids: animalRelationships.map((relationship) => relationship.animal_id),
              related_batch_ids: batchRelationships.map(
                (relationship) => relationship.animal_batch_id,
              ),
            };
          }),
        );
        return res.status(200).json(groupsWithRelatedIds);
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          error,
        });
      }
    };
  },

  addAnimalGroup() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const { farm_id } = req.headers;
        const { related_animal_ids, related_batch_ids } = req.body;
        let { name } = req.body;
        name = baseController.checkAndTrimString(name);

        if (!name) {
          await trx.rollback();
          return res.status(400).send('Group name is required');
        }

        if (!Array.isArray(related_animal_ids) || !Array.isArray(related_batch_ids)) {
          await trx.rollback();
          return res.status(400).send('Animal ids and batch ids must be arrays');
        }

        if (!related_animal_ids.length && !related_batch_ids.length) {
          await trx.rollback();
          return res.status(400).send('Either animal ids or batch ids are required');
        }

        // Check ownership of animals
        for (const animalId of related_animal_ids) {
          const animal = await AnimalModel.query(trx)
            .findById(animalId)
            .where({ farm_id })
            .whereNotDeleted();

          // QUESTION: do we prefer the whole transaction to fail and an error response if any of the animals in the provided array are invalid (as written here)? Or should they be skipped and the others still inserted?
          if (!animal) {
            await trx.rollback();
            return res.status(400).send(`Invalid animal id: ${animalId}`);
          }
        }

        // TODO: ownership of batches needs to be checked once a Model exists

        const record = await baseController.existsInTable(trx, AnimalGroupModel, {
          name,
          farm_id,
        });

        if (record) {
          await trx.rollback();

          return res.status(409).send(); // Enforcing uniqueness on group name
        } else {
          const result = await baseController.postWithResponse(
            AnimalGroupModel,
            { name, farm_id },
            req,
            {
              trx,
            },
          );

          const groupId = result.id;

          // Insert into join tables
          for (const animalId of related_animal_ids) {
            await AnimalGroupRelationshipModel.query(trx).insert({
              animal_id: animalId,
              animal_group_id: groupId,
            });
          }

          for (const batchId of related_batch_ids) {
            await AnimalBatchGroupRelationshipModel.query(trx).insert({
              animal_batch_id: batchId,
              animal_group_id: groupId,
            });
          }

          await trx.commit();
          return res.status(201).send(result);
        }
      } catch (error) {
        await trx.rollback();
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },
};

export default animalGroupController;
