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

      const { area, response } = payload || {};

      if (type === 'SYNC_ITEM_SUCCESS') {
        switch (area) {
          case 'tasks.create':
            if (response?.error) {
              // Ideally we'll need to add translations for each error case
              dispatch(enqueueErrorSnackbar(t('message:TASK.CREATE.SYNC_FAILED')));
            } else {
              dispatch(enqueueSuccessSnackbar(t('message:TASK.CREATE.SYNC_SUCCESS')));
            }

            // Regardless of success or failure, refresh to get the actual state from the server
            dispatch(getTasks());

            break;
          case 'tasks.update':
            // parse url to get the exact kind of update (date, assignee); for now generic
            if (response?.error) {
              dispatch(enqueueErrorSnackbar(t('message:TASK.UPDATE.SYNC_FAILED')));
            } else {
              dispatch(enqueueSuccessSnackbar(t('message:TASK.UPDATE.SYNC_SUCCESS')));
            }

            dispatch(getTasks());
            break;
        }
      } else if (type === 'SYNC_ITEM_FAILURE') {
        // I don't think we need to show snackbars here; the item remains in the queue for retrying later. I also don't think we get here in practice.
        switch (area) {
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
