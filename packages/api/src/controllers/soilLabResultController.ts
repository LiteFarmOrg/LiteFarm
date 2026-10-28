/*
 *  Copyright 2026 LiteFarm.org
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

import { Response } from 'express';
import knex from '../util/knex.js';
import SoilLabResultModel from '../models/soilLabResultModel.js';
import { LiteFarmRequest } from '../types.js';

const soilLabResultController = {
  getSoilLabResults() {
    return async (req: LiteFarmRequest, res: Response) => {
      try {
        const { farm_id } = req.headers;

        /* @ts-expect-error known issue with models */
        const results = await SoilLabResultModel.query()
          .whereNotDeleted()
          .where({ farm_id })
          .select(
            'id',
            'farm_id',
            'submission_id',
            'row',
            'location_id',
            'match_method',
            'sample_label',
            knex.raw(`to_char(sampled_on, 'YYYY-MM-DD') as sampled_on`),
            'depth_top_cm',
            'depth_bottom_cm',
            'depth_assumed',
            'lat',
            'lng',
            'values',
            'lab_name',
            'source_filename',
            'source_sha256',
          )
          .orderBy([{ column: 'submission_id' }, { column: 'row' }]);

        return res.status(200).json(results);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },
};

export default soilLabResultController;
