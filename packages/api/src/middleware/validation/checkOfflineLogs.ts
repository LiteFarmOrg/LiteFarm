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
import jwt from 'jsonwebtoken';
import { tokenType } from '../../util/jwt.js';
import userModel from '../../models/userModel.js';
import farmModel from '../../models/farmModel.js';
import userFarmModel from '../../models/userFarmModel.js';
import { HttpError, LiteFarmRequest } from '../../types.js';

export interface OfflineEventLogReqBody {
  logs: {
    event_name?: string;
    event_at?: Date | number;
    status_code?: number;
  }[];
  went_online_at?: Date | number;
  farm_id?: string;
  app_version?: string;
  network?: string;
  session_id?: string;
}

export function checkAuthForOfflineLogs() {
  return async (
    req: LiteFarmRequest<unknown, unknown, unknown, OfflineEventLogReqBody>,
    res: Response,
    next: NextFunction,
  ) => {
    const token = req.headers.authorization?.split(' ')[1];

    try {
      if (!token) {
        throw new Error('token is missing');
      }

      const decoded = jwt.verify(token, tokenType.access!, { ignoreExpiration: true });

      if (typeof decoded === 'string' || typeof decoded.exp !== 'number' || !decoded.user_id) {
        throw new Error('invalid token');
      }

      const now = Math.floor(Date.now() / 1000); // JWT exp is in seconds

      const tokenExpired = decoded.exp < now;

      res.locals.authenticated = !tokenExpired;
      res.locals.user_id = decoded.user_id;

      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

export function checkOfflineLogs() {
  return async (
    req: LiteFarmRequest<unknown, unknown, unknown, OfflineEventLogReqBody>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!Array.isArray(req.body.logs) || req.body.logs.length === 0) {
        throw new Error('logs must be a non-empty array');
      }

      const user = await userModel.query().findOne({ user_id: res.locals.user_id });

      if (!user) {
        throw new Error('User not found');
      }

      const { farm_id } = req.body;

      if (farm_id) {
        /* @ts-expect-error known issue with models */
        const farm = await farmModel.query().findOne({ farm_id });

        if (!farm) {
          throw new Error('Invalid farm_id');
        }

        const userFarm = await userFarmModel
          .query()
          .findOne({ user_id: res.locals.user_id, farm_id });

        if (!userFarm) {
          throw new Error('user_id and farm_id do not match');
        }

        res.locals.country_id = farm.country_id;
      }

      next();
    } catch (error: unknown) {
      console.error(error);

      const err = error as HttpError;
      const status = err.status || err.code || 500;
      return res.status(status).json({
        error: err.message || err,
      });
    }
  };
}
