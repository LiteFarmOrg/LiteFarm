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

import { Response } from 'express';
import offlineEventLogModel from '../models/offlineEventLogModel.js';
import { HttpError, LiteFarmRequest } from '../types.js';
import { OfflineEventLogReqBody } from '../middleware/validation/checkOfflineLogs.js';

const offlineEventLogController = {
  addOfflineEventLog() {
    return async (
      req: LiteFarmRequest<unknown, unknown, unknown, OfflineEventLogReqBody>,
      res: Response,
    ) => {
      try {
        const { logs, went_online_at, app_version } = req.body;

        const wentOnlineAt = went_online_at && new Date(went_online_at).toISOString();

        const records = logs.map(({ event_name, event_at, status_code }) => ({
          event_name,
          event_at: event_at && new Date(event_at).toISOString(),
          went_online_at: wentOnlineAt,
          status_code,
          app_version,
          country_id: res.locals.country_id,
          authenticated: res.locals.authenticated,
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
