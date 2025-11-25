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
import type { HttpError } from '../types.js';
import FarmMarketDirectoryPartner from '../models/farmMarketDirectoryPartnerModel.js';
import type { FarmMarketDirectoryPartner as FarmMarketDirectoryPartnerType } from '../models/types.js';

const dataFoodConsortiumController = {
  getDfcEnterprise() {
    return async (req: Request, res: Response) => {
      const { id } = req.params;

      try {
        const marketDirectoryInfo = await MarketDirectoryInfo
          /* @ts-expect-error known issue with models */
          .query()
          .findById(id);

        const dfcFormattedListingData = await formatFarmDataToDfcStandard(marketDirectoryInfo);

        return res.status(200).json(dfcFormattedListingData);
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

  getAllClientEnterprises() {
    return async (_req: Request, res: Response) => {
      const { marketDirectoryPartnerId } = res.locals;

      try {
        const authorizedFarms: FarmMarketDirectoryPartnerType[] = await FarmMarketDirectoryPartner
          /* @ts-expect-error known issue with models */
          .query()
          .where({ market_directory_partner_id: marketDirectoryPartnerId })
          .select('farm_id')
          .whereNotDeleted();

        const authorizedFarmsDirectoryInfo = await MarketDirectoryInfo
          /* @ts-expect-errors known issue with models */
          .query()
          .whereIn(
            'farm_id',
            authorizedFarms.map(({ farm_id }) => farm_id),
          );

        const dfcFormattedListingData = [];

        for (const marketDirectoryInfo of authorizedFarmsDirectoryInfo) {
          const formattedData = await formatFarmDataToDfcStandard(marketDirectoryInfo);
          dfcFormattedListingData.push(formattedData);
        }

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
