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
import { HttpError, LiteFarmRequest } from '../types.js';
import MarketDirectoryPartnerModel from '../models/marketDirectoryPartnerModel.js';
import FarmModel from '../models/farmModel.js';

const marketDirectoryPartnerController = {
  getMarketDirectoryPartnersByFarmCountry() {
    return async (req: LiteFarmRequest, res: Response) => {
      try {
        const { farm_id } = req.headers;

        // @ts-expect-error: TS doesn't see query() through softDelete HOC; safe at runtime
        const farm = await FarmModel.query().select('country_id').where({ farm_id }).first();
        const result = await MarketDirectoryPartnerModel.getMarketDirectoryPartnersByCountryId(
          farm.country_id,
        );

        return res.status(200).json(result);
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

export default marketDirectoryPartnerController;
