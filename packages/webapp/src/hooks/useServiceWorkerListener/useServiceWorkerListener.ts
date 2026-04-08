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

import { useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  enqueueSuccessSnackbar,
  enqueueErrorSnackbar,
} from '../../containers/Snackbar/snackbarSlice';
import { getProducts, getTasks } from '../../containers/Task/saga';
import { getManagementPlans } from '../../containers/saga';
import { invalidateTags } from '../../store/api/apiSlice';
import { OfflineEventPayload, recordOfflineEvent } from '../../util/offlineEventLogger';
import { feedbackMessages, resolveAreaFromUrl, SyncArea } from './utils';

type SyncConfig = {
  onSuccess?: (response: any) => any;
  refresh: () => any;
};

const LOG_BATCH_SIZE = 10;
const LOG_BATCH_TIMEOUT_MS = 2000;

type OfflineEventBuffer = Partial<OfflineEventPayload> & {
  logs: OfflineEventPayload['logs'];
};

/**
 * Global listener for messages sent from the Service Worker (sw.js).
 */
export function useServiceWorkerListener() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const logTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logBufferRef = useRef<OfflineEventBuffer>({
    logs: [],
    auth: '',
    farmId: '',
  });

  const flushLogs = () => {
    const { auth, farmId, logs } = logBufferRef.current;

    logBufferRef.current = { logs: [], auth: '', farmId: '' };

    if (logTimeoutRef.current) {
      clearTimeout(logTimeoutRef.current);
      logTimeoutRef.current = null;
    }

    if (logs.length === 0 || !auth || !farmId) {
      return;
    }

    recordOfflineEvent({ auth, farmId, logs });
  };

  const syncConfig = useMemo(
    (): Record<SyncArea, SyncConfig> => ({
      'tasks.create': {
        onSuccess: (response) => {
          if (response?.taskType?.task_translation_key === 'IRRIGATION_TASK') {
            return invalidateTags(['IrrigationPrescriptions']);
          }
        },
        refresh: () => {
          dispatch(getManagementPlans());
          dispatch(getProducts()); // cleaning and pest control task creation
          dispatch(getTasks());
        },
      },
      'tasks.complete': {
        onSuccess: (response) => {
          // taskType not returned in the completion API response
          if (response?.animal_movement_task) {
            return invalidateTags(['Animals', 'AnimalBatches']);
          }
        },
        refresh: () => {
          dispatch(getProducts());
          dispatch(getTasks());
        },
      },
      'tasks.abandon': { refresh: () => dispatch(getTasks()) },
      'tasks.update': { refresh: () => dispatch(getTasks()) },
      'tasks.delete': {
        onSuccess: (response) => {
          if (response?.taskType?.task_translation_key === 'IRRIGATION_TASK') {
            return invalidateTags(['IrrigationPrescriptions']);
          }
        },
        refresh: () => dispatch(getTasks()),
      },
      'farm_notes.create': { refresh: () => dispatch(invalidateTags(['FarmNote'])) },
      'farm_notes.edit': { refresh: () => dispatch(invalidateTags(['FarmNote'])) },
      'farm_notes.delete': { refresh: () => dispatch(invalidateTags(['FarmNote'])) },
      'farm_notes.patch': { refresh: () => dispatch(invalidateTags(['FarmNotesRead'])) },
    }),
    [dispatch],
  );

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (!event.data || !event.data.type) return;

      const { type, payload } = event.data;

      const { method, status, url, queuedAt, auth, farm_id } = payload || {};
      const area = resolveAreaFromUrl(method, url);
      const { successMessage, errors, syncErrorMessage } = feedbackMessages[area];

      if (type === 'SYNC_ITEM_SUCCESS') {
        const handler = syncConfig[area as SyncArea];
        if (!handler) return;

        const { refresh, onSuccess } = handler;
        const isSuccess = status >= 200 && status < 400;

        if (isSuccess) {
          if (successMessage) {
            dispatch(enqueueSuccessSnackbar(successMessage));
          }

          const onSuccessAction = onSuccess?.(payload.response);
          if (onSuccessAction) {
            dispatch(onSuccessAction);
          }
        } else if (errors !== null) {
          const errorMessage = errors?.[status] || t('message:TASK.SYNC.FAILED');
          dispatch(errorMessage);
        }

        // Refresh data regardless of success/failure
        refresh();

        logBufferRef.current.logs.push({ eventName: area, eventAt: queuedAt, statusCode: status });

        if (!logBufferRef.current.auth) {
          logBufferRef.current.auth = auth;
          logBufferRef.current.farmId = farm_id;
        }

        // Flush if batch size reached
        if (logBufferRef.current.logs.length >= LOG_BATCH_SIZE) {
          flushLogs();
        } else if (!logTimeoutRef.current) {
          logTimeoutRef.current = setTimeout(flushLogs, LOG_BATCH_TIMEOUT_MS);
        }
      } else if (type === 'SYNC_ITEM_FAILURE') {
        /*
         * This indicates a failure to reach the server (e.g. API down). It should be rare.
         * We will manually replay when the app is re-rendered.
         */
        if (syncErrorMessage !== null) {
          const message = syncErrorMessage || t('message:TASK.SYNC.NETWORK_ERROR');
          dispatch(enqueueErrorSnackbar(message));
        }
      }
    };

    const swContainer = navigator.serviceWorker;

    const replayQueue = async () => {
      if (swContainer) {
        const registration = await swContainer.ready;
        if (registration.active) {
          registration.active.postMessage('replay_queue');
        }
      }
    };

    const handleOffline = () => {
      // Clear any pending logs when going offline, since they will likely fail to send
      if (logTimeoutRef.current) {
        clearTimeout(logTimeoutRef.current);
        logTimeoutRef.current = null;
      }
      logBufferRef.current.logs = [];
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushLogs();
      }
    };

    // It's possible for navigator.serviceWorker to be undefined in some environments (e.g. non-secure contexts or older browsers)
    if (swContainer) {
      swContainer.addEventListener('message', handleServiceWorkerMessage);
      window.addEventListener('online', replayQueue);
      window.addEventListener('offline', handleOffline);
      // https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
      window.addEventListener('visibilitychange', handleVisibilityChange);

      // Also replay queue on startup
      // Do not use Redux isOnline state here - it may not reflect the actual network status on initial render
      if (window.navigator.onLine) {
        replayQueue();
      }
    }

    return () => {
      if (swContainer) {
        swContainer.removeEventListener('message', handleServiceWorkerMessage);
        window.removeEventListener('online', replayQueue);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('visibilitychange', handleVisibilityChange);
        if (logTimeoutRef.current) {
          clearTimeout(logTimeoutRef.current);
        }

        flushLogs();
      }
    };
  }, [dispatch, t, syncConfig]);
}
