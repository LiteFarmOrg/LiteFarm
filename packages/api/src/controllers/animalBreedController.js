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

import DefaultAnimalBreedModel from '../models/defaultAnimalBreedModel.js';
import CustomAnimalBreedModel from '../models/customAnimalBreedModel.js';

const animalBreedController = {
  getDefaultAnimalBreeds() {
    return async (req, res) => {
      try {
        const { default_type_id } = req.query;
        const rows = await DefaultAnimalBreedModel.query().modify((queryBuilder) => {
          if (default_type_id) {
            queryBuilder.where('default_type_id', default_type_id);
          }
        });
        console.log(req);
        return res.status(200).send(rows);
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          error,
        });
      }
    };
  },

  getCustomAnimalBreeds() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const { default_type_id, custom_type_id } = req.query;
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
};

export default animalBreedController;
