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

import { v4 as uuidv4 } from 'uuid';
import { offlineEventLogUrl } from '../apiConfig';
import { APP_VERSION } from './constants';

const OFFLINE_SESSION_KEY = 'offline_session';
const ACTIVITY_LOGS_KEY = 'offline_activity_logs';

export const startOfflineSession = () => {
  const session = {
    id_token: localStorage.getItem('id_token'),
    session_id: uuidv4(),
    went_online_at: undefined,
  };
  localStorage.setItem(OFFLINE_SESSION_KEY, JSON.stringify(session));
  return session;
};

export const updateOfflineSessionOnline = () => {
  const session = getOfflineSession();
  if (!session) {
    return;
  }
  localStorage.setItem(
    OFFLINE_SESSION_KEY,
    JSON.stringify({ ...session, went_online_at: Date.now() }),
  );
};

export const getOfflineSession = () => {
  return JSON.parse(localStorage.getItem(OFFLINE_SESSION_KEY) ?? 'null');
};

export const storeActivity = (url: string = '', event?: string) => {
  const existing = JSON.parse(localStorage.getItem(ACTIVITY_LOGS_KEY) ?? '[]');
  existing.push([Date.now(), url, event]);
  localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(existing));
};

export const getActivities = (): [number, string, string][] => {
  return JSON.parse(localStorage.getItem(ACTIVITY_LOGS_KEY) ?? '[]');
};

export const clearActivities = () => {
  localStorage.removeItem(ACTIVITY_LOGS_KEY);
};

export interface OfflineEventPayload {
  auth?: string;
  farmId?: string;
  logs: {
    eventName: string;
    eventAt: number;
    statusCode?: number;
    url?: string;
  }[];
}

export const recordOfflineEvent = async ({ auth, farmId, logs }: OfflineEventPayload) => {
  const { id_token, session_id, went_online_at = Date.now() } = getOfflineSession();

  return fetch(offlineEventLogUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth || id_token,
    },
    // https://developer.mozilla.org/en-US/docs/Web/API/Request/keepalive
    keepalive: true, // Attempt to send even when the page is unloading
    body: JSON.stringify({
      app_version: APP_VERSION,
      farm_id: farmId,
      went_online_at,
      // @ts-expect-error -- connection exists
      network: navigator?.connection?.effectiveType,
      session_id,
      logs: logs.map(({ eventName, eventAt, statusCode, url }) => ({
        event_name: eventName,
        event_at: eventAt,
        status_code: statusCode,
        url: url || undefined,
      })),
    }),
  }).catch(() => {}); // Fire and forget
};
