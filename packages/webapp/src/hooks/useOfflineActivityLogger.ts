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
import { useEffect } from 'react';
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

  const farm = useSelector(userFarmSelector);
  const farmId = 'farm_id' in farm ? (farm?.farm_id as string) : undefined;

  const flushLogs = async () => {
    const activities = getActivities();
    if (activities.length === 0) {
      return;
    }

    const token = localStorage.getItem('id_token');

    await recordOfflineEvent({
      auth: token ? 'Bearer ' + token : undefined,
      farmId,
      logs: activities.map(([timestamp, url, event]) => ({
        eventName: event || 'navigate',
        eventAt: timestamp,
        url,
      })),
    });

    clearActivities();
  };

  useEffect(() => {
    if (isOffline) {
      storeActivity(location.pathname);
    }
  }, [isOffline, location.pathname]);

  useEffect(() => {
    const handleOnline = () => {
      updateOfflineSessionOnline();
      flushLogs();
    };

    const handleOffline = () => {
      startOfflineSession();
      storeActivity('', 'session_start');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Flush any pending logs when the user navigates away or closes the tab
        // This ensures we capture as much activity as possible, even if the user goes offline before we can send the logs
        flushLogs();
      }
    };

    handleOnline(); // Check immediately in case we start online

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
};

export default useOfflineActivityLogger;
