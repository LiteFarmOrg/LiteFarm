/*
 *  Copyright 2025 LiteFarm.org
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
import { LiteFarmRequest } from '../types.js';
import { getMarketListingData } from '../services/marketData.js';
import { formatFarmDataToDfcStandard } from '../services/dfcStandard.js';

interface HttpError extends Error {
  status?: number;
  code?: number;
}

const dataFoodConsortiumController = {
  getFarmData() {
    return async (req: LiteFarmRequest, res: Response) => {
      const { farm_id } = req.headers;

      try {
        // service file to get farm data
        const marketListingData = await getMarketListingData(farm_id!);

        // service file for DFC standard export
        const dfcFormattedListingData = await formatFarmDataToDfcStandard(marketListingData);

        return res.status(200).send(dfcFormattedListingData);
      } catch (error: unknown) {
        console.error(error);

        const err = error as HttpError;
        const status = err.status || err.code || 500;
        return res.status(status).json({
          error: err.message || err,
        });
      }
    };
  },
};

export default dataFoodConsortiumController;
