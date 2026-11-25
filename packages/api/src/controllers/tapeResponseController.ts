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
import type { ParsedQs } from 'qs';
import SurveyResponseModel from '../models/surveyResponseModel.js';
import { LiteFarmRequest } from '../types.js';

const tapeResponseController = {
  getTapeResponses() {
    return async (req: LiteFarmRequest<ParsedQs>, res: Response) => {
      try {
        const { date_from, date_to } = req.query;
        const { farmIds } = res.locals;

        const results = await SurveyResponseModel.query()
          .modify('filterTapeSurveys')
          .whereIn('farm_id', farmIds)
          .andWhere((builder) => {
            if (date_from) {
              builder.where('created_at', '>=', `${date_from}T00:00:00Z`);
            }
            if (date_to) {
              const dateTo = new Date(`${date_to}T00:00:00Z`);
              dateTo.setUTCDate(dateTo.getUTCDate() + 1);
              builder.where('created_at', '<', dateTo.toISOString());
            }
          })
          .orderBy('created_at');

        return res.status(200).json(results);
      } catch (error: unknown) {
        console.error(error);
        const err = error as Error;

        return res.status(500).json({ error: err.message });
      }
    };
  },
};

export default tapeResponseController;
