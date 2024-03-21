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
import AnimalBatchModel from '../models/animalBatchModel.js';
import { checkAndTrimString } from '../util/util.js';
import { handleObjectionError } from '../util/errorCodes.js';

const animalGroupController = {
  getFarmAnimalGroups() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const rows = await AnimalGroupModel.query()
          .where({ farm_id })
          .whereNotDeleted()
          .withGraphFetched({ animal_relationships: true, batch_relationships: true });
        return res.status(200).json(
          rows.map(({ animal_relationships, batch_relationships, ...rest }) => ({
            ...rest,
            related_animal_ids: animal_relationships.map(({ animal_id }) => animal_id),
            related_batch_ids: batch_relationships.map(({ animal_batch_id }) => animal_batch_id),
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

  addAnimalGroup() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const { farm_id } = req.headers;
        const { related_animal_ids, related_batch_ids } = req.body;
        let { name, notes } = req.body;
        name = checkAndTrimString(name);
        notes = checkAndTrimString(notes);

        const relatedAnimalIdSet = new Set(related_animal_ids);
        const relatedBatchIdSet = new Set(related_batch_ids);

        // Check ownership of animals
        const invalidAnimalIds = [];
        for (const animalId of relatedAnimalIdSet) {
          const animal = await AnimalModel.query(trx)
            .findById(animalId)
            .where({ farm_id })
            .whereNotDeleted();

          if (!animal) {
            invalidAnimalIds.push(animalId);
          }
        }

        // Check ownership of batches
        const invalidBatchIds = [];
        for (const batchId of relatedBatchIdSet) {
          const animalBatch = await AnimalBatchModel.query(trx)
            .findById(batchId)
            .where({ farm_id })
            .whereNotDeleted();

          if (!animalBatch) {
            invalidBatchIds.push(batchId);
          }
        }

        if (invalidAnimalIds.length || invalidBatchIds.length) {
          await trx.rollback();
          return res.status(400).json({
            error: 'Invalid ids',
            invalidAnimalIds,
            invalidBatchIds,
            message:
              'Some animal IDs or animal batch IDs do not exist or are not associated with the given farm.',
          });
        }

        const record = await baseController.existsInTable(trx, AnimalGroupModel, {
          name,
          farm_id,
          deleted: false,
        });

        if (record) {
          await trx.rollback();
          return res.status(409).send(); // Enforcing uniqueness on group name
        }

        const result = await baseController.postWithResponse(
          AnimalGroupModel,
          { name, notes, farm_id },
          req,
          {
            trx,
          },
        );

        const groupId = result.id;

        // Insert into join tables
        for (const animalId of relatedAnimalIdSet) {
          await AnimalGroupRelationshipModel.query(trx).insert({
            animal_id: animalId,
            animal_group_id: groupId,
          });
        }

        for (const batchId of relatedBatchIdSet) {
          await AnimalBatchGroupRelationshipModel.query(trx).insert({
            animal_batch_id: batchId,
            animal_group_id: groupId,
          });
        }

        await trx.commit();
        return res.status(201).send(result);
      } catch (error) {
        await handleObjectionError(error, res, trx);
      }
    };
  },
};

export default animalGroupController;
