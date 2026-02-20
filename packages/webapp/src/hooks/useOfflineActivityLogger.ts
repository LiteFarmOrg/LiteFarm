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
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  clearActivities,
  getActivities,
  recordOfflineEvent,
  startOfflineSession,
  storeActivity,
  updateOfflineSessionOnline,
} from '../util/offlineEventLogger';
import { userFarmSelector } from '../containers/userFarmSlice';
import { useIsOffline } from '../containers/hooks/useOfflineDetector/useIsOffline';

const useOfflineActivityLogger = () => {
  const isOffline = useIsOffline();
  const location = useLocation();

  const farm: { farm_id?: string } = useSelector(userFarmSelector);
  const farmIdRef = useRef(farm?.farm_id);

  const flushLogs = async () => {
    const activities = getActivities();
    if (activities.length === 0) {
      return;
    }

    const token = localStorage.getItem('id_token');

    await recordOfflineEvent({
      auth: token ? 'Bearer ' + token : undefined,
      farmId: farmIdRef.current,
      logs: activities.map(([timestamp, url, event]) => ({
        eventName: event || 'page_view',
        eventAt: timestamp,
        url,
      })),
    });

    clearActivities();
  };

  useEffect(() => {
    if (farm.farm_id) {
      farmIdRef.current = farm.farm_id;
    }
  }, [farm?.farm_id]);

  useEffect(() => {
    if (isOffline) {
      storeActivity(location.pathname);
    }
  }, [isOffline, location.pathname]);

  useEffect(() => {
    const LOG_TIMEOUT_MS = 3000;
    let logTimeout: NodeJS.Timeout | undefined;

    const handleOnline = () => {
      updateOfflineSessionOnline();
      logTimeout = setTimeout(flushLogs, LOG_TIMEOUT_MS);
    };

    if (window.navigator.onLine) {
      handleOnline();
    } else {
      const activities = getActivities();
      if (!activities || activities.length === 0) {
        startOfflineSession();
      }
    }

    window.addEventListener('offline', startOfflineSession);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', startOfflineSession);
      if (logTimeout) {
        clearTimeout(logTimeout);
      }
    };
  }, []);
};

export default useOfflineActivityLogger;
