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
import { serviceWorkerMessageReceived } from './serviceWorkerSlice';
import { enqueueSuccessSnackbar, enqueueErrorSnackbar } from '../Snackbar/snackbarSlice';
import { getTasks } from '../Task/saga';

/**
 * Global listener for messages sent from the Service Worker (sw.js).
 * Handles background sync events, cache updates, etc.
 */
export function ServiceWorkerListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      // Ensure we only dispatch valid messages.
      // event.data is the payload sent from sw.js (e.g. { type: 'SYNC_ITEM_SUCCESS', payload: ... })
      if (!event.data || !event.data.type) return;

      const { type, payload } = event.data;
      dispatch(serviceWorkerMessageReceived(event.data));

      const { area, error, response } = payload || {};

      if (type === 'SYNC_ITEM_SUCCESS') {
        switch (area) {
          case 'tasks.create':
            // Note: Responses can succeed in the queue sense, but still return an error from the API
            if (response?.error) {
              dispatch(
                enqueueErrorSnackbar(
                  `Failed to sync new task: ${response.error.message ?? 'Unknown error'}`,
                ),
              );
              break;
            }
            dispatch(enqueueSuccessSnackbar('New task synced'));
            dispatch(getTasks());
            break;

          default:
            // Generic “success” for unknown areas
            dispatch(enqueueSuccessSnackbar(`Sync succeeded for “${area}”`));
        }
      } else if (type === 'SYNC_ITEM_FAILURE') {
        switch (area) {
          case 'tasks.create':
            dispatch(enqueueErrorSnackbar('Failed to sync new task'));
            break;

          default:
            // Generic “failure” for unknown areas
            dispatch(enqueueErrorSnackbar(`Sync failed for “${area}”${error ? `: ${error}` : ''}`));
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
