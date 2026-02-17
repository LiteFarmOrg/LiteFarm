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

import { offlineEventLogUrl } from '../apiConfig';
import { APP_VERSION } from './constants';

export const recordOfflineEvent = async ({
  auth,
  farm_id,
  went_offline_at,
  logs,
}: {
  auth: string;
  went_offline_at: number;
  farm_id?: string;
  logs: {
    eventName: string;
    eventAt: number;
    statusCode?: number;
  }[];
}) => {
  return fetch(offlineEventLogUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify({
      app_version: APP_VERSION,
      farm_id,
      went_offline_at,
      logs: logs.map(({ eventName, eventAt, statusCode }) => ({
        event_name: eventName,
        event_at: eventAt,
        status_code: statusCode,
      })),
    }),
  }).catch(() => {}); // Fire and forget
};
