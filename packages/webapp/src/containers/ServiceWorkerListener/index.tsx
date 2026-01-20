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
import { enqueueSuccessSnackbar, enqueueErrorSnackbar } from '../Snackbar/snackbarSlice';
import { getTasks } from '../Task/saga';
import { invalidateTags } from '../../store/api/apiSlice';

type SyncArea =
  | 'tasks.create'
  | 'tasks.assign'
  | 'tasks.complete'
  | 'tasks.abandon'
  | 'tasks.update'; // Generic fallback; use for patching date as well

type SyncConfig = {
  successMessage: string;
  errors: Record<number, string>;
  onSuccess?: (response: any) => any;
  refresh: () => any;
};

/**
 * Resolve the specific kind of task patch operation from the URL
 */
function resolveAreaFromUrl(area: string, url: string): SyncArea {
  if (area !== 'tasks.update') {
    return area as SyncArea;
  }

  if (url.includes('/task/assign')) {
    return 'tasks.assign';
  }
  if (url.includes('/task/complete/')) {
    return 'tasks.complete';
  }
  if (url.includes('/task/abandon/')) {
    return 'tasks.abandon';
  }

  // Default: generic update for PATCH endpoints
  return 'tasks.update';
}

/**
 * Global listener for messages sent from the Service Worker (sw.js).
 * Handles background sync events, cache updates, etc.
 */
export function ServiceWorkerListener() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const SYNC_CONFIG = useMemo(
    (): Record<SyncArea, SyncConfig> => ({
      'tasks.create': {
        successMessage: t('message:TASK.CREATE.SYNC.SUCCESS'),
        errors: {
          409: t('message:TASK.CREATE.SYNC.LOCATION_DELETED'),
        },
        onSuccess: (response) => {
          if (response?.task_translation_key === 'IRRIGATION_TASK') {
            return invalidateTags(['IrrigationPrescriptions']);
          }
        },
        refresh: getTasks,
      },
      'tasks.assign': {
        successMessage: t('message:TASK.ASSIGN.SYNC.SUCCESS'),
        errors: {
          404: t('message:TASK.ASSIGN.SYNC.NOT_FOUND'),
        },
        refresh: getTasks,
      },
      'tasks.complete': {
        successMessage: t('message:TASK.COMPLETE.SYNC.SUCCESS'),
        errors: {
          403: t('message:TASK.COMPLETE.SYNC.UNAUTHORIZED'),
          404: t('message:TASK.COMPLETE.SYNC.NOT_FOUND'),
          409: t('message:TASK.COMPLETE.SYNC.LOCATION_DELETED'),
        },
        onSuccess: (response) => {
          if (response?.task_translation_key === 'MOVEMENT_TASK') {
            return invalidateTags(['Animals', 'AnimalBatches']);
          }
        },
        refresh: getTasks,
      },
      'tasks.abandon': {
        successMessage: t('message:TASK.ABANDON.SYNC.SUCCESS'),
        errors: {
          404: t('message:TASK.ABANDON.SYNC.NOT_FOUND'),
        },
        refresh: getTasks,
      },
      'tasks.update': {
        successMessage: t('message:TASK.UPDATE.SYNC.SUCCESS'),
        errors: {
          403: t('message:TASK.UPDATE.SYNC.UNAUTHORIZED'),
          404: t('message:TASK.UPDATE.SYNC.NOT_FOUND'),
        },
        refresh: getTasks,
      },
    }),
    [t],
  );

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      // Ensure we only dispatch valid messages.
      // event.data is the payload sent from sw.js (e.g. { type: 'SYNC_ITEM_SUCCESS', payload: ... })
      if (!event.data || !event.data.type) return;

      const { type, payload } = event.data;

      const { area: rawArea, status, ok, url } = payload || {};

      if (type === 'SYNC_ITEM_SUCCESS') {
        const area = resolveAreaFromUrl(rawArea, url);

        const handler = SYNC_CONFIG[area as SyncArea];
        if (!handler) return;

        const { successMessage, errors, refresh, onSuccess } = handler;
        const isSuccess = ok !== false && status >= 200 && status < 400;

        if (isSuccess) {
          dispatch(enqueueSuccessSnackbar(successMessage));

          // Call optional onSuccess handler for additional side effects
          const onSuccessAction = onSuccess?.(payload.response);
          if (onSuccessAction) {
            dispatch(onSuccessAction);
          }
        } else {
          // Look up specific error message or use generic fallback
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
        /* This indicates a failure to reach the server at all (e.g. our API going down). It should be rare.

        In the case of a sync failure, the service worker retries automatically after some time that the browser defines, see https://developer.chrome.com/docs/workbox/modules/workbox-background-sync
        
        "Browsers that support the BackgroundSync API will automatically replay failed requests on your behalf at an interval managed by the browser, likely using exponential backoff between replay attempts."

        I couldn't find it in the Chrome docs, but in my local testing it was exactly 5 minutes */
        switch (rawArea) {
          case 'tasks.create':
            dispatch(enqueueErrorSnackbar(t('message:TASK.CREATE.SYNC.NETWORK_ERROR')));
            break;

          case 'tasks.update':
            dispatch(enqueueErrorSnackbar(t('message:TASK.UPDATE.SYNC.NETWORK_ERROR')));
            break;
        }
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
  }, [dispatch, t, SYNC_CONFIG]);

  // This component renders nothing; it is purely for side effects.
  return null;
}
