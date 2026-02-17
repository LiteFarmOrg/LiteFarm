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

export interface OfflineEventPayload {
  auth: string;
  farmId?: string;
  wentOnlineAt: number;
  logs: {
    eventName: string;
    eventAt: number;
    statusCode?: number;
  }[];
}

export const recordOfflineEvent = async ({
  auth,
  farmId,
  wentOnlineAt,
  logs,
}: OfflineEventPayload) => {
  return fetch(offlineEventLogUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    // https://developer.mozilla.org/en-US/docs/Web/API/Request/keepalive
    keepalive: true, // Attempt to send even when the page is unloading
    body: JSON.stringify({
      app_version: APP_VERSION,
      farm_id: farmId,
      went_online_at: wentOnlineAt,
      logs: logs.map(({ eventName, eventAt, statusCode }) => ({
        event_name: eventName,
        event_at: eventAt,
        status_code: statusCode,
      })),
    }),
  }).catch(() => {}); // Fire and forget
};
