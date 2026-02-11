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

import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  enqueueSuccessSnackbar,
  enqueueErrorSnackbar,
} from '../../containers/Snackbar/snackbarSlice';
import { getTasks } from '../../containers/Task/saga';
import { getManagementPlans } from '../../containers/saga';
import { invalidateTags } from '../../store/api/apiSlice';

type SyncArea =
  | 'tasks.create'
  | 'tasks.complete'
  | 'tasks.abandon'
  | 'tasks.update' // Generic fallback; use for patching date and assignee as well
  | 'tasks.delete';

type SyncConfig = {
  successMessage: string;
  errors: Record<number, string>;
  onSuccess?: (response: any) => any;
  refresh: () => any;
};

/**
 * Resolve specific kinds of task operations from the URL and HTTP method.
 */
function resolveAreaFromUrl(method: string, url: string): SyncArea {
  if (method === 'POST') {
    return 'tasks.create';
  }

  if (method === 'DELETE') {
    return 'tasks.delete';
  }

  if (url.includes('/task/complete/')) {
    return 'tasks.complete';
  }
  if (url.includes('/task/abandon/')) {
    return 'tasks.abandon';
  }

  return 'tasks.update';
}

/**
 * Global listener for messages sent from the Service Worker (sw.js).
 */
export function useServiceWorkerListener() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const syncConfig = useMemo(
    (): Record<SyncArea, SyncConfig> => ({
      'tasks.create': {
        successMessage: t('message:TASK.CREATE.SYNC.SUCCESS'),
        errors: {
          409: t('message:TASK.SYNC.LOCATION_DELETED'),
        },
        onSuccess: (response) => {
          if (response?.taskType?.task_translation_key === 'IRRIGATION_TASK') {
            return invalidateTags(['IrrigationPrescriptions']);
          }
        },
        refresh: () => {
          dispatch(getManagementPlans());
          dispatch(getTasks());
        },
      },
      'tasks.complete': {
        successMessage: t('message:TASK.COMPLETE.SYNC.SUCCESS'),
        errors: {
          403: t('message:TASK.SYNC.UNAUTHORIZED'),
          404: t('message:TASK.SYNC.NOT_FOUND'),
          409: t('message:TASK.SYNC.LOCATION_DELETED'),
        },
        onSuccess: (response) => {
          // taskType not returned in the completion API response
          if (response?.animal_movement_task) {
            return invalidateTags(['Animals', 'AnimalBatches']);
          }
        },
        refresh: () => dispatch(getTasks()),
      },
      'tasks.abandon': {
        successMessage: t('message:TASK.ABANDON.SYNC.SUCCESS'),
        errors: {
          404: t('message:TASK.SYNC.NOT_FOUND'),
        },
        refresh: () => dispatch(getTasks()),
      },
      'tasks.update': {
        successMessage: t('message:TASK.UPDATE.SYNC.SUCCESS'),
        errors: {
          403: t('message:TASK.SYNC.UNAUTHORIZED'),
          404: t('message:TASK.SYNC.NOT_FOUND'),
        },
        refresh: () => dispatch(getTasks()),
      },
      'tasks.delete': {
        successMessage: t('message:TASK.DELETE.SYNC.SUCCESS'),
        errors: {
          404: t('message:TASK.SYNC.NOT_FOUND'),
        },
        onSuccess: (response) => {
          if (response?.taskType?.task_translation_key === 'IRRIGATION_TASK') {
            return invalidateTags(['IrrigationPrescriptions']);
          }
        },
        refresh: () => dispatch(getTasks()),
      },
    }),
    [t, dispatch],
  );

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (!event.data || !event.data.type) return;

      const { type, payload } = event.data;

      const { method, status, url } = payload || {};
      const area = resolveAreaFromUrl(method, url);

      if (type === 'SYNC_ITEM_SUCCESS') {
        const handler = syncConfig[area as SyncArea];
        if (!handler) return;

        const { successMessage, errors, refresh, onSuccess } = handler;
        const isSuccess = status >= 200 && status < 400;

        if (isSuccess) {
          dispatch(enqueueSuccessSnackbar(successMessage));

          const onSuccessAction = onSuccess?.(payload.response);
          if (onSuccessAction) {
            dispatch(onSuccessAction);
          }
        } else {
          const errorMessage = errors[status];
          if (errorMessage) {
            dispatch(enqueueErrorSnackbar(errorMessage));
          } else {
            dispatch(enqueueErrorSnackbar(t('message:TASK.SYNC.FAILED')));
          }
        }

        // Refresh data regardless of success/failure
        refresh();
      } else if (type === 'SYNC_ITEM_FAILURE') {
        /*
         * This indicates a failure to reach the server (e.g. API down). It should be rare.
         * The background-sync-api retries automatically with exponential backoff (approx. 5 min on Chrome).
         * See: https://developer.chrome.com/docs/workbox/modules/workbox-background-sync
         */
        // We will also manually replay when the app comes back online.
        switch (area) {
          case 'tasks.create':
            dispatch(enqueueErrorSnackbar(t('message:TASK.CREATE.SYNC.NETWORK_ERROR')));
            break;
          case 'tasks.delete':
            dispatch(enqueueErrorSnackbar(t('message:TASK.DELETE.SYNC.NETWORK_ERROR')));
            break;
          case 'tasks.complete':
          case 'tasks.abandon':
          case 'tasks.update':
            dispatch(enqueueErrorSnackbar(t('message:TASK.UPDATE.SYNC.NETWORK_ERROR')));
            break;
          default:
            dispatch(enqueueErrorSnackbar(t('message:TASK.SYNC.NETWORK_ERROR')));
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

    // It's possible for navigator.serviceWorker to be undefined in some environments (e.g. non-secure contexts or older browsers)
    if (swContainer) {
      swContainer.addEventListener('message', handleServiceWorkerMessage);
      window.addEventListener('online', replayQueue);

      // Also replay queue on startup
      replayQueue();
    }

    return () => {
      if (swContainer) {
        swContainer.removeEventListener('message', handleServiceWorkerMessage);
        window.removeEventListener('online', replayQueue);
      }
    };
  }, [dispatch, t, syncConfig]);
}
