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

import { NextFunction, Response } from 'express';
import { validate as isUuid } from 'uuid';
import type { ParsedQs } from 'qs';
import { LiteFarmRequest } from '../../types.js';
import { isSimpleDateFormat } from '../../util/validation.js';
import UserFarmModel from '../../models/userFarmModel.js';

export function checkDashboardTapeRequest() {
  return async (req: LiteFarmRequest<ParsedQs>, res: Response, next: NextFunction) => {
    const { user_id } = req.auth!;
    const { farm_ids, date_from, date_to } = req.query;

    try {
      if (typeof farm_ids !== 'string') {
        return res
          .status(400)
          .json({ error: 'farm_ids must be a comma-separated list of farm ids' });
      }

      if (date_from && !isSimpleDateFormat(date_from)) {
        return res.status(400).json({ error: 'Please provide date_from in YYYY-MM-DD format' });
      }

      if (date_to && !isSimpleDateFormat(date_to)) {
        return res.status(400).json({ error: 'Please provide date_to in YYYY-MM-DD format' });
      }

      const farmIds = [...new Set(farm_ids.split(','))];

      if (farmIds.some((id) => !isUuid(id))) {
        return res.status(400).json({ error: 'farm_ids must contain only farm ids (uuids)' });
      }

      const userFarms = await UserFarmModel.getActiveFarmsByUserId(user_id!, farmIds);

      if (userFarms.length !== farmIds.length) {
        return res.status(403).json({ error: 'User does not have access to all requested farms' });
      }

      res.locals.farmIds = farmIds;

      next();
    } catch (error: unknown) {
      console.error(error);
      const err = error as Error;
      return res.status(500).json({ error: err.message });
    }
  };
}
