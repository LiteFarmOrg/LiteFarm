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
import MarketProductCategory from '../models/marketProductCategoryModel.js';
import { HttpError, LiteFarmRequest } from '../types.js';

const marketProductCategoryController = {
  getMarketProductCategories() {
    return async (_req: LiteFarmRequest, res: Response) => {
      try {
        // @ts-expect-error: TS doesn't see query() through HOC; safe at runtime
        const categories = await MarketProductCategory.query();
        return res.status(200).send(categories);
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

export default marketProductCategoryController;
