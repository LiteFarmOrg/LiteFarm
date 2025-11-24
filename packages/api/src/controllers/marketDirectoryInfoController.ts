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

import { NextFunction, Request, Response } from 'express';
import baseController from './baseController.js';
import MarketDirectoryInfoModel from '../models/marketDirectoryInfoModel.js';
import {
  MarketDirectoryInfoReqBody,
  MarketDirectoryInfoRouteParams,
} from '../middleware/validation/checkMarketDirectoryInfo.js';
import { HttpError, LiteFarmRequest } from '../types.js';
import { uploadPublicImage } from '../util/imageUpload.js';
import { Model, transaction } from 'objection';

const marketDirectoryInfoController = {
  getMarketDirectoryInfoByFarm() {
    return async (req: LiteFarmRequest, res: Response) => {
      try {
        // @ts-expect-error: TS doesn't see query() through softDelete HOC; safe at runtime
        const data = await MarketDirectoryInfoModel.query()
          .where({ farm_id: req.headers.farm_id })
          .whereNotDeleted()
          .withGraphFetched({
            market_product_categories: true,
          })
          .first();

        return res.status(200).json(data || null);
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
  addMarketDirectoryInfo() {
    return async (
      req: LiteFarmRequest<unknown, unknown, unknown, MarketDirectoryInfoReqBody>,
      res: Response,
    ) => {
      const { farm_id } = req.headers;

      try {
        const result = await baseController.insertGraphWithResponse(
          MarketDirectoryInfoModel,
          { ...req.body, farm_id },
          req,
        );

        return res.status(201).send(result);
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
  updateMarketDirectoryInfo() {
    return async (
      req: LiteFarmRequest<
        unknown,
        MarketDirectoryInfoRouteParams,
        unknown,
        MarketDirectoryInfoReqBody
      >,
      res: Response,
    ) => {
      const { farm_id, ...data } = req.body;
      const { id } = req.params;
      const trx = await transaction.start(Model.knex());
      try {
        // @ts-expect-error: TS doesn't see through softDelete HOC; safe at runtime
        await baseController.upsertGraph(MarketDirectoryInfoModel, { ...data, id }, req, { trx });
        await trx.commit();
        res.status(204).send();
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
  uploadFarmLogo() {
    return async (req: Request, res: Response, next: NextFunction) => {
      await uploadPublicImage('farm_logo')(req, res, next);
    };
  },
};

export default marketDirectoryInfoController;
