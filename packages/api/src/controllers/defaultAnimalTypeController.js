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

import knex from '../util/knex.js';
import DefaultAnimalTypeModel from '../models/defaultAnimalTypeModel.js';

const defaultAnimalTypeController = {
  getDefaultAnimalTypes() {
    return async (req, res) => {
      try {
        let rows = [];

        if (req.query.count === 'true') {
          const { farm_id } = req.headers;
          const data = await knex.raw(
            `SELECT
              dat.*,
              COALESCE(SUM(abu.count), 0) AS count
            FROM
              default_animal_type AS dat
            LEFT JOIN (
              SELECT default_type_id, COUNT(*) AS count
              FROM animal
              WHERE farm_id = ? AND deleted is FALSE
              GROUP BY default_type_id
              UNION ALL
              SELECT default_type_id, SUM(count) AS count
              FROM animal_batch
              WHERE farm_id = ? AND deleted is FALSE
              GROUP BY default_type_id
            ) AS abu ON dat.id = abu.default_type_id
            GROUP BY dat.id;`,
            [farm_id, farm_id],
          );
          rows = data.rows;
        } else {
          rows = await DefaultAnimalTypeModel.query();
        }

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
