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

import CustomAnimalBreedModel from '../models/customAnimalBreedModel.js';
import CustomAnimalTypeModel from '../models/customAnimalTypeModel.js';
import { transaction, Model } from 'objection';
import baseController from './baseController.js';
import { checkAndTrimString } from '../util/util.js';
import { handleObjectionError } from '../util/errorCodes.js';

const customAnimalBreedController = {
  getCustomAnimalBreeds() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const { default_type_id, custom_type_id } = req.query;

        if (default_type_id && custom_type_id) {
          return res.status(400).send('Only default_type_id or custom_type_id should be specified');
        }

        const rows = await CustomAnimalBreedModel.query()
          .where({ farm_id })
          .modify((queryBuilder) => {
            if (default_type_id) {
              queryBuilder.where('default_type_id', default_type_id);
            } else if (custom_type_id) {
              queryBuilder.where('custom_type_id', custom_type_id);
            }
          });
        return res.status(200).send(rows);
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          error,
        });
      }
    };
  },

  addCustomAnimalBreed() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const { farm_id } = req.headers;
        let { breed } = req.body;
        const { default_type_id, custom_type_id } = req.body;
        breed = checkAndTrimString(breed);

        // if (default_type_id && custom_type_id) {
        //   await trx.rollback();
        //   return res.status(400).send('Only default_type_id or custom_type_id should be specified');
        // }

        // if (!default_type_id && !custom_type_id) {
        //   await trx.rollback();
        //   return res
        //     .status(400)
        //     .send('One of default_type_id or custom_type_id should be specified');
        // }

        const breedDetails = { breed };

        if (custom_type_id) {
          const customType = await CustomAnimalTypeModel.query().findById(custom_type_id);
          if (customType && customType.farm_id !== farm_id) {
            await trx.rollback();
            return res.status(400).send('custom_type_id has invalid value');
          }
          breedDetails.custom_type_id = custom_type_id;
        }
        if (default_type_id) {
          breedDetails.default_type_id = default_type_id;
        }

        const record = await baseController.existsInTable(trx, CustomAnimalBreedModel, {
          ...breedDetails,
          farm_id,
          deleted: false,
        });

        if (record) {
          await trx.rollback();
          return res.status(409).send();
        } else {
          const result = await baseController.postWithResponse(
            CustomAnimalBreedModel,
            {
              ...breedDetails,
              farm_id,
            },
            req,
            {
              trx,
            },
          );

          await trx.commit();
          return res.status(201).send(result);
        }
      } catch (error) {
        await handleObjectionError(error, res, trx);
      }
    };
  },
};

export default customAnimalBreedController;
