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
import MarketDirectoryPartnerPermissionsModel from '../models/marketDirectoryPartnerPermissions.js';
import { MarketDirectoryPartnerPermissions } from '../models/types.js';
import { notifyMarketDirectoryPartners } from '../services/notifyMarketDirectoryPartners.js';

const marketDirectoryInfoController = {
  getMarketDirectoryInfoByFarm() {
    return async (req: LiteFarmRequest, res: Response) => {
      try {
        // @ts-expect-error: TS doesn't see query() through softDelete HOC; safe at runtime
        const data = await MarketDirectoryInfoModel.query()
          .where({ farm_id: req.headers.farm_id })
          .whereNotDeleted()
          .modify('withProductCategories')
          .modify('withPartnerPermissions')
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
        // Capture previous partner state before update
        const previousPartners: MarketDirectoryPartnerPermissions[] =
          await MarketDirectoryPartnerPermissionsModel
            // @ts-expect-error: TS doesn't see query() through softDelete HOC; safe at runtime
            .query(trx)
            .where({ market_directory_info_id: id })
            .whereNotDeleted();

        const previousPartnerIds = previousPartners.map(
          (partner) => partner.market_directory_partner_id,
        );

        // @ts-expect-error: TS doesn't see through softDelete HOC; safe at runtime
        await baseController.upsertGraph(MarketDirectoryInfoModel, { ...data, id }, req, {
          trx,
          relate: true,
          unrelate: false,
          noDelete: false,
        });
        await trx.commit();
        res.status(204).send();

        // Post-response: notify partners about changes and pass previous state so service can determine who was added/removed
        notifyMarketDirectoryPartners(id, previousPartnerIds);
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
