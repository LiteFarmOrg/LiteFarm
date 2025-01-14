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

import DefaultAnimalTypeModel from '../models/defaultAnimalTypeModel.js';

const defaultAnimalTypeController = {
  getDefaultAnimalTypes() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const rows =
          req.query.count === 'true'
            ? await DefaultAnimalTypeModel.getDefaultAnimalTypesWithCountsByFarmId(farm_id)
            : await DefaultAnimalTypeModel.query();

        if (!rows.length) {
          return res.sendStatus(404);
        }

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

export default defaultAnimalTypeController;
