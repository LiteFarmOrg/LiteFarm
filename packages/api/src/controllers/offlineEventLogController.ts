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
import parser from 'ua-parser-js';
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
        const { logs, went_online_at, app_version, network, session_id } = req.body;

        const wentOnlineAt = went_online_at && new Date(went_online_at).toISOString();
        const ua = parser(req.headers['user-agent']);

        let indexToIncludeCommonInfo = 0;

        const records: Record<string, unknown>[] = logs.map(
          ({ event_name, event_at, status_code, url }, index) => {
            if (event_name === 'session_start') {
              indexToIncludeCommonInfo = index;
            }

            return {
              session_id,
              event_name,
              status_code,
              url,
              event_at: event_at && new Date(event_at).toISOString(),
            };
          },
        );

        records[indexToIncludeCommonInfo] = {
          ...records[indexToIncludeCommonInfo],
          country_id: res.locals.country_id,
          network,
          browser: ua.browser.name,
          browser_version: ua.browser.version,
          device_vendor: ua.device.vendor,
          os: ua.os.name,
          device_model: ua.device.model,
          log_status: res.locals.log_status,
          app_version,
          went_online_at: wentOnlineAt,
          user_id: res.locals.user_id,
          role_id: res.locals.role_id,
        };

        await offlineEventLogModel.query().insert(records).onConflict().ignore();

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
