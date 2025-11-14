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

import { Request, Response } from 'express';
import { formatFarmDataToDfcStandard } from '../services/dfcAdapter.js';
import MarketDirectoryInfo from '../models/marketDirectoryInfoModel.js';

interface HttpError extends Error {
  status?: number;
  code?: number;
}

interface DfcFarmDataRouteParams {
  market_directory_info_id: string;
}

const dataFoodConsortiumController = {
  getFarmData() {
    return async (req: Request<DfcFarmDataRouteParams>, res: Response) => {
      const { market_directory_info_id } = req.params;

      try {
        const marketDirectoryInfo = await MarketDirectoryInfo
          /* @ts-expect-error known issue with models */
          .query()
          .findById(market_directory_info_id);

        if (!marketDirectoryInfo) {
          return res.status(404).json({ error: 'Market directory info not found' });
        }

        const dfcFormattedListingData = await formatFarmDataToDfcStandard(marketDirectoryInfo);

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
