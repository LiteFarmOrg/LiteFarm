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
 * Resolve specific kinds of task patch operations from the URL
 */
function resolveAreaFromUrl(area: string, url: string): SyncArea {
  if (area !== 'tasks.update') {
    return area as SyncArea;
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
        refresh: getTasks,
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
        refresh: getTasks,
      },
      'tasks.abandon': {
        successMessage: t('message:TASK.ABANDON.SYNC.SUCCESS'),
        errors: {
          404: t('message:TASK.SYNC.NOT_FOUND'),
        },
        refresh: getTasks,
      },
      'tasks.update': {
        successMessage: t('message:TASK.UPDATE.SYNC.SUCCESS'),
        errors: {
          403: t('message:TASK.SYNC.UNAUTHORIZED'),
          404: t('message:TASK.SYNC.NOT_FOUND'),
        },
        refresh: getTasks,
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
        refresh: getTasks,
      },
    }),
    [t],
  );

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (!event.data || !event.data.type) return;

      const { type, payload } = event.data;

      const { area: rawArea, status, url } = payload || {};

      if (type === 'SYNC_ITEM_SUCCESS') {
        const area = resolveAreaFromUrl(rawArea, url);

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
        dispatch(refresh());
      } else if (type === 'SYNC_ITEM_FAILURE') {
        /* This indicates a failure to reach the server at all (e.g. our API going down). It should be rare. In the case of a sync failure, the service worker retries automatically after some time that the browser defines, see https://developer.chrome.com/docs/workbox/modules/workbox-background-sync. In my testing on Chrome, it was exactly 5 minutes */
        dispatch(enqueueErrorSnackbar(t('message:TASK.SYNC.NETWORK_ERROR')));
      }
    };

    const swContainer = navigator.serviceWorker;

    // It's possible for navigator.serviceWorker to be undefined in some environments (e.g. non-secure contexts or older browsers)
    if (swContainer) {
      swContainer.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if (swContainer) {
        swContainer.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [dispatch, t, syncConfig]);
}
