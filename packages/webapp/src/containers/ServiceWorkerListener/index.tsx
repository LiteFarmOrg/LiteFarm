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
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { enqueueSuccessSnackbar, enqueueErrorSnackbar } from '../Snackbar/snackbarSlice';
import { getTasks } from '../Task/saga';

type SyncArea =
  | 'tasks.create'
  | 'tasks.assign'
  | 'tasks.complete'
  | 'tasks.abandon'
  | 'tasks.update'; // Generic fallback; use for dates as well

type SyncConfig = {
  operation: string;
  errors: Record<number, string>;
  refresh: () => any;
};

const SYNC_HANDLERS: Record<SyncArea, SyncConfig> = {
  'tasks.create': {
    operation: 'TASK.CREATE.SYNC',
    errors: {
      409: 'LOCATION_DELETED',
    },
    refresh: getTasks,
  },
  'tasks.assign': {
    operation: 'TASK.ASSIGN.SYNC',
    errors: {
      404: 'NOT_FOUND',
    },
    refresh: getTasks,
  },
  'tasks.complete': {
    operation: 'TASK.COMPLETE.SYNC',
    errors: {
      403: 'UNAUTHORIZED',
      404: 'NOT_FOUND',
      409: 'LOCATION_DELETED',
    },
    refresh: getTasks,
  },
  'tasks.abandon': {
    operation: 'TASK.ABANDON.SYNC',
    errors: {
      404: 'NOT_FOUND',
    },
    refresh: getTasks,
  },
  'tasks.update': {
    operation: 'TASK.UPDATE.SYNC',
    errors: {
      403: 'UNAUTHORIZED',
      404: 'NOT_FOUND',
    },
    refresh: getTasks,
  },
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

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      // Ensure we only dispatch valid messages.
      // event.data is the payload sent from sw.js (e.g. { type: 'SYNC_ITEM_SUCCESS', payload: ... })
      if (!event.data || !event.data.type) return;

      const { type, payload } = event.data;

      const { area: rawArea, status, ok, url } = payload || {};

      if (type === 'SYNC_ITEM_SUCCESS') {
        const area = resolveAreaFromUrl(rawArea, url);

        const handler = SYNC_HANDLERS[area as SyncArea];
        if (!handler) return;

        const { operation, errors, refresh } = handler;
        const isSuccess = ok !== false && status >= 200 && status < 400;

        if (isSuccess) {
          dispatch(enqueueSuccessSnackbar(t(`message:${operation}.SUCCESS`)));
        } else {
          // Look up specific error message or use default
          const errorType = errors[status] || 'FAILED';
          dispatch(enqueueErrorSnackbar(t(`message:${operation}.${errorType}`)));
        }

        // Refresh data regardless of success/failure
        dispatch(refresh());
      } else if (type === 'SYNC_ITEM_FAILURE') {
        // I don't think we need to show snackbars here; the item remains in the queue for retrying later. I also don't think we get here in practice.
        switch (rawArea) {
          case 'tasks.create':
            dispatch(enqueueErrorSnackbar('Unreachable branch: Failed to sync new task'));
            break;

          case 'tasks.update':
            dispatch(enqueueErrorSnackbar('Unreachable branch: Failed to sync task update'));
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
  }, [dispatch]);

  // This component renders nothing; it is purely for side effects.
  return null;
}
