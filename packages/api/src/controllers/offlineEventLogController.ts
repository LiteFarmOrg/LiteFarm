/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (yieldController.js) is part of LiteFarm.
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
import jwt from 'jsonwebtoken';
import { tokenType } from '../util/jwt.js';
import farmModel from '../models/farmModel.js';
import offlineEventLogModel from '../models/offlineEventLogModel.js';
import { HttpError, LiteFarmRequest } from '../types.js';

export interface OfflineEventLogReqBody {
  logs: {
    event_name?: string;
    event_at?: Date | number;
    status_code?: number;
  }[];
  went_offline_at?: Date | number;
  farm_id?: string;
  app_version?: string;
}

const offlineEventLogController = {
  addOfflineEventLog() {
    return async (
      req: LiteFarmRequest<unknown, unknown, unknown, OfflineEventLogReqBody>,
      res: Response,
    ) => {
      if (!Array.isArray(req.body.logs) || req.body.logs.length === 0) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      const token = req.headers.authorization?.split(' ')[1];
      let authenticated = false;

      try {
        if (!token) {
          throw new Error('token is missing');
        }

        const decoded = jwt.verify(token, tokenType.access!, { ignoreExpiration: true });

        if (typeof decoded === 'string' || typeof decoded.exp !== 'number') {
          throw new Error('invalid token');
        }

        const now = Math.floor(Date.now() / 1000); // JWT exp is in seconds

        const tokenExpired = decoded.exp < now;
        authenticated = !tokenExpired;
      } catch (err) {
        console.error(err);
        return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
        const { logs, went_offline_at, farm_id, app_version } = req.body;
        let farm: { country_id?: number } | undefined;

        if (farm_id) {
          /* @ts-expect-error known issue with models */
          farm = await farmModel.query().findOne({ farm_id });
        }

        const wentOfflineAt = went_offline_at && new Date(went_offline_at).toISOString();

        const records = logs.map(({ event_name, event_at, status_code }) => ({
          event_name,
          event_at: event_at && new Date(event_at).toISOString(),
          went_offline_at: wentOfflineAt,
          status_code,
          app_version,
          country_id: farm?.country_id,
          authenticated,
        }));

        await offlineEventLogModel.query().insert(records);

        return res.status(201).send();
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

export default offlineEventLogController;
